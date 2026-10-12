"""
Orbit Personal AI Desktop Agent — FastAPI Backend
Provides: real AI chat, vision analysis, code inspection, desktop control,
          Google Antigravity prompt generation, and project file indexing.
"""

import os, sys, json, base64, subprocess, time, asyncio, logging, hashlib, secrets
from pathlib import Path
from datetime import datetime
from typing import Optional, List
import mss, mss.tools
from PIL import Image
import io

from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# ── Env ────────────────────────────────────────────────────────────────────────
load_dotenv()
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY", "")
GOOGLE_API_KEY   = os.getenv("GOOGLE_API_KEY", "")
AI_PROVIDER      = os.getenv("AI_PROVIDER", "openai").lower()
AI_MODEL         = os.getenv("AI_MODEL", "gpt-4o")
PROJECT_ROOT     = Path(os.getenv("PROJECT_ROOT", Path(__file__).parent)).resolve()
SESSION_TOKEN    = os.getenv("SESSION_TOKEN", secrets.token_urlsafe(32))
DESKTOP_ENABLED  = os.getenv("DESKTOP_CONTROL_ENABLED", "false").lower() == "true"
LOG_LEVEL        = os.getenv("LOG_LEVEL", "INFO")

logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO),
                    format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("orbit")

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Orbit AI Backend", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5500",
                   "http://127.0.0.1:3000", "http://127.0.0.1:5500",
                   "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    image_b64: Optional[str] = None
    system: Optional[str] = None
    stream: bool = False

class AnalyzeScreenRequest(BaseModel):
    image_b64: str
    prompt: Optional[str] = "Describe what you see on the screen and identify any issues."

class GeneratePromptRequest(BaseModel):
    issue_description: str
    screenshot_b64: Optional[str] = None
    relevant_files: Optional[List[str]] = None

class DesktopActionRequest(BaseModel):
    action: str
    params: dict = {}
    session_token: str

class CodeInspectRequest(BaseModel):
    query: str
    max_files: int = 8

# ── Utility functions ──────────────────────────────────────────────────────────
EXCLUDED_DIRS  = {".git", "node_modules", "__pycache__", ".env", "venv", "dist", "build", ".idea"}
INCLUDED_EXTS  = {".html", ".css", ".js", ".py", ".ts", ".json", ".md", ".txt", ".yaml", ".yml", ".toml"}
SECRET_FILES   = {".env", "*.key", "*.pem", "*.pfx"}

def index_project(root: Path, max_files: int = 60):
    files = []
    for p in root.rglob("*"):
        if any(ex in p.parts for ex in EXCLUDED_DIRS):
            continue
        if p.name.startswith(".") and p.suffix not in INCLUDED_EXTS:
            continue
        if p.suffix in INCLUDED_EXTS and p.is_file():
            try:
                size = p.stat().st_size
                if size < 200_000:
                    files.append({"path": str(p.relative_to(root)), "size": size})
            except Exception:
                pass
    return files[:max_files]

def read_file_safe(path: Path) -> str:
    if path.name == ".env" or path.suffix in {".pem", ".key"}:
        return "[REDACTED - secrets file]"
    try:
        return path.read_text(encoding="utf-8", errors="replace")[:12000]
    except Exception as e:
        return f"[Could not read: {e}]"

def capture_screenshot() -> str:
    """Capture desktop screenshot, return base64-encoded PNG."""
    with mss.mss() as sct:
        monitor = sct.monitors[0]  # all monitors combined
        sshot = sct.grab(monitor)
        img = Image.frombytes("RGB", sshot.size, sshot.bgra, "raw", "BGRX")
        # Scale down to max 1280px wide to save tokens
        w, h = img.size
        if w > 1280:
            ratio = 1280 / w
            img = img.resize((1280, int(h * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return base64.b64encode(buf.getvalue()).decode()

# ── AI Calls ───────────────────────────────────────────────────────────────────
async def call_openai(messages: list, image_b64: str = None, stream: bool = False):
    try:
        import openai
    except ImportError:
        raise HTTPException(503, "openai package not installed. Run: pip install openai")

    if not OPENAI_API_KEY:
        raise HTTPException(503, "OPENAI_API_KEY not set in .env")

    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    built = []
    for m in messages:
        if m["role"] == "user" and image_b64:
            built.append({"role": "user", "content": [
                {"type": "text", "text": m["content"]},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}", "detail": "high"}}
            ]})
        else:
            built.append({"role": m["role"], "content": m["content"]})

    if stream:
        async def event_gen():
            try:
                resp = await client.chat.completions.create(
                    model=AI_MODEL, messages=built, stream=True,
                    max_tokens=2048, temperature=0.7)
                async for chunk in resp:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        yield f"data: {json.dumps({'text': delta.content})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        return event_gen()
    else:
        resp = await client.chat.completions.create(
            model=AI_MODEL, messages=built, max_tokens=2048, temperature=0.7)
        return resp.choices[0].message.content

async def call_gemini(messages: list, image_b64: str = None):
    try:
        import google.generativeai as genai
    except ImportError:
        raise HTTPException(503, "google-generativeai package not installed. Run: pip install google-generativeai")

    if not GOOGLE_API_KEY:
        raise HTTPException(503, "GOOGLE_API_KEY not set in .env")

    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel(AI_MODEL if "gemini" in AI_MODEL else "gemini-1.5-pro")

    parts = []
    for m in messages:
        if m["role"] == "user":
            parts.append(m["content"])
    if image_b64:
        img_bytes = base64.b64decode(image_b64)
        parts.append({"mime_type": "image/png", "data": img_bytes})

    resp = model.generate_content(parts)
    return resp.text

async def ai_chat(messages: list, image_b64: str = None, system: str = None, stream: bool = False):
    built = []
    if system:
        if AI_PROVIDER == "openai":
            built.append({"role": "system", "content": system})
        else:
            built.append({"role": "user", "content": f"[SYSTEM]: {system}"})
    for m in messages:
        built.append({"role": m.role, "content": m.content})

    if AI_PROVIDER == "gemini":
        return await call_gemini(built, image_b64)
    else:
        return await call_openai(built, image_b64, stream)

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "provider": AI_PROVIDER,
        "model": AI_MODEL,
        "openai_key_set": bool(OPENAI_API_KEY),
        "google_key_set": bool(GOOGLE_API_KEY),
        "desktop_enabled": DESKTOP_ENABLED,
        "project_root": str(PROJECT_ROOT),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/chat")
async def chat(req: ChatRequest):
    system = req.system or (
        "You are Orbit, a highly intelligent personal AI assistant and desktop agent. "
        "You help the user with tasks, code analysis, screen debugging, and productivity. "
        "Be concise, accurate, and helpful. When the user shares a screenshot, analyze it carefully. "
        "When discussing code, reference specific filenames and line numbers. "
        "Never fabricate file contents. Never reveal API keys or secrets. "
        "Clearly distinguish between what you analyzed, what you recommend, and what was actually done."
    )

    if req.stream:
        gen = await ai_chat(req.messages, req.image_b64, system, stream=True)
        return StreamingResponse(gen, media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    try:
        reply = await ai_chat(req.messages, req.image_b64, system)
        return {"reply": reply, "model": AI_MODEL, "provider": AI_PROVIDER}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Chat error: {e}")
        raise HTTPException(500, f"AI request failed: {str(e)[:200]}")

@app.post("/api/screenshot")
async def take_screenshot():
    """Capture the current desktop and return as base64 PNG."""
    try:
        b64 = capture_screenshot()
        return {"image_b64": b64, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        log.error(f"Screenshot error: {e}")
        raise HTTPException(500, f"Screenshot failed: {e}. Ensure mss and Pillow are installed.")

@app.post("/api/analyze-screen")
async def analyze_screen(req: AnalyzeScreenRequest):
    """Analyze a screenshot with vision AI."""
    system = (
        "You are an expert UI/UX debugger and code analyst. Analyze the screenshot carefully. "
        "Identify visible UI issues, errors, layout problems, or bugs. "
        "Reference specific elements, positions, colors, and text you can actually see. "
        "Never claim to see something that is not in the image."
    )
    messages = [ChatMessage(role="user", content=req.prompt or "What do you see?")]
    try:
        reply = await ai_chat(messages, req.image_b64, system)
        return {"analysis": reply}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/generate-antigravity-prompt")
async def generate_antigravity_prompt(req: GeneratePromptRequest):
    """Generate a precise Google Antigravity correction prompt."""
    file_list = "\n".join(f"- {f}" for f in (req.relevant_files or []))
    context = f"Files to inspect:\n{file_list}\n\n" if file_list else ""

    system = (
        "You are an expert at writing Google Antigravity (AI coding assistant) prompts. "
        "Generate a detailed, actionable, copy-ready prompt for Antigravity to fix the described issue. "
        "The prompt must include: exact filenames, specific changes needed, existing behavior to preserve, "
        "acceptance criteria, error handling requirements, and verification steps. "
        "Be specific to this project. Do not write generic boilerplate."
    )

    user_content = f"""{context}Project: Orbit Personal AI Workspace (C:\\New folder\\Fit_Tracker\\Fit_Tracker)
Files: index.html, styles.css, app.js, server.py

Issue to fix:
{req.issue_description}

Generate a complete, copy-ready Antigravity prompt."""

    messages = [ChatMessage(role="user", content=user_content)]
    try:
        img = req.screenshot_b64 if req.screenshot_b64 else None
        prompt_text = await ai_chat(messages, img, system)
        return {"antigravity_prompt": prompt_text}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/inspect-code")
async def inspect_code(req: CodeInspectRequest):
    """Index project files and find relevant ones for the query."""
    files = index_project(PROJECT_ROOT, max_files=80)
    relevant = []

    query_lower = req.query.lower()
    keywords = query_lower.split()

    for f in files:
        score = sum(1 for kw in keywords if kw in f["path"].lower())
        if score > 0:
            relevant.append((score, f))

    relevant.sort(key=lambda x: -x[0])
    top_files = [f for _, f in relevant[:req.max_files]]

    if not top_files:
        top_files = files[:req.max_files]

    result = []
    for f in top_files:
        content = read_file_safe(PROJECT_ROOT / f["path"])
        result.append({"path": f["path"], "size": f["size"], "excerpt": content[:3000]})

    return {"files": result, "total_indexed": len(files), "query": req.query}

@app.post("/api/smart-analyze")
async def smart_analyze(req: Request):
    """Full pipeline: screenshot + code inspect + Antigravity prompt generation."""
    body = await req.json()
    query = body.get("query", "What issues do you see?")
    take_shot = body.get("take_screenshot", True)

    # Step 1: Screenshot
    screenshot_b64 = None
    if take_shot:
        try:
            screenshot_b64 = capture_screenshot()
        except Exception as e:
            log.warning(f"Screenshot failed: {e}")

    # Step 2: Inspect code
    files = index_project(PROJECT_ROOT, max_files=80)
    query_lower = query.lower()
    keywords = query_lower.split()
    scored = sorted(files, key=lambda f: sum(1 for k in keywords if k in f["path"].lower()), reverse=True)
    top_files = scored[:6]
    file_contexts = []
    for f in top_files:
        content = read_file_safe(PROJECT_ROOT / f["path"])
        file_contexts.append(f"=== {f['path']} ===\n{content[:2000]}")
    code_context = "\n\n".join(file_contexts)

    # Step 3: AI analysis
    system = (
        "You are Orbit's smart analysis engine. You receive a screenshot of the user's desktop and code excerpts. "
        "Analyze both together. Identify the most likely files causing the observed issue. "
        "Explain the probable root cause. Then generate a precise Google Antigravity prompt to fix it. "
        "Format your response as:\n"
        "## Visual Analysis\n[what you see on screen]\n\n"
        "## Root Cause\n[what's likely wrong and why]\n\n"
        "## Affected Files\n[specific filenames]\n\n"
        "## Antigravity Prompt\n[copy-ready prompt for Antigravity]\n\n"
        "## Acceptance Criteria\n[how to verify the fix]"
    )

    user_msg = f"User query: {query}\n\nProject code excerpts:\n{code_context}"
    messages = [ChatMessage(role="user", content=user_msg)]

    try:
        analysis = await ai_chat(messages, screenshot_b64, system)
        return {
            "analysis": analysis,
            "screenshot_taken": screenshot_b64 is not None,
            "files_analyzed": [f["path"] for f in top_files],
            "screenshot_b64": screenshot_b64
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/project-files")
async def project_files():
    files = index_project(PROJECT_ROOT)
    return {"files": files, "root": str(PROJECT_ROOT)}

# ── Desktop Control ────────────────────────────────────────────────────────────
def verify_desktop_session(token: str):
    if not DESKTOP_ENABLED:
        raise HTTPException(403, "Desktop control is disabled. Set DESKTOP_CONTROL_ENABLED=true in .env")
    if not secrets.compare_digest(token, SESSION_TOKEN):
        raise HTTPException(401, "Invalid session token for desktop control")

@app.post("/api/desktop/screenshot")
async def desktop_screenshot(req: DesktopActionRequest):
    verify_desktop_session(req.session_token)
    try:
        b64 = capture_screenshot()
        return {"image_b64": b64, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/desktop/open-url")
async def desktop_open_url(req: DesktopActionRequest):
    verify_desktop_session(req.session_token)
    url = req.params.get("url", "")
    if not url.startswith(("http://", "https://")):
        raise HTTPException(400, "Only http/https URLs are allowed")
    try:
        import webbrowser
        webbrowser.open(url)
        return {"status": "opened", "url": url}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/desktop/open-file")
async def desktop_open_file(req: DesktopActionRequest):
    verify_desktop_session(req.session_token)
    file_path = req.params.get("path", "")
    resolved = (PROJECT_ROOT / file_path).resolve()
    if not str(resolved).startswith(str(PROJECT_ROOT)):
        raise HTTPException(403, "Access denied: path outside project root")
    try:
        os.startfile(str(resolved))
        return {"status": "opened", "path": str(resolved)}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/desktop/click")
async def desktop_click(req: DesktopActionRequest):
    verify_desktop_session(req.session_token)
    x = req.params.get("x")
    y = req.params.get("y")
    if x is None or y is None:
        raise HTTPException(400, "x and y coordinates required")
    try:
        import pyautogui
        pyautogui.click(int(x), int(y))
        time.sleep(0.3)
        b64 = capture_screenshot()
        return {"status": "clicked", "x": x, "y": y, "screenshot_after": b64}
    except ImportError:
        raise HTTPException(503, "pyautogui not installed. Run: pip install pyautogui")
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/desktop/type")
async def desktop_type(req: DesktopActionRequest):
    verify_desktop_session(req.session_token)
    text = req.params.get("text", "")
    if len(text) > 2000:
        raise HTTPException(400, "Text too long (max 2000 chars per action)")
    try:
        import pyautogui
        pyautogui.typewrite(text, interval=0.03)
        return {"status": "typed", "length": len(text)}
    except ImportError:
        raise HTTPException(503, "pyautogui not installed. Run: pip install pyautogui")
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/desktop/status")
async def desktop_status():
    return {
        "enabled": DESKTOP_ENABLED,
        "session_token_hint": SESSION_TOKEN[:8] + "...",
        "note": "Desktop control is opt-in. Set DESKTOP_CONTROL_ENABLED=true in .env to enable."
    }

# ── Serve static files (index.html, etc.) ─────────────────────────────────────
if PROJECT_ROOT.exists():
    app.mount("/", StaticFiles(directory=str(PROJECT_ROOT), html=True), name="static")

# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print(f"\n{'='*55}")
    print(f"  Orbit AI Backend  v2.0")
    print(f"  Provider : {AI_PROVIDER}  Model: {AI_MODEL}")
    print(f"  OpenAI key set : {bool(OPENAI_API_KEY)}")
    print(f"  Google key set : {bool(GOOGLE_API_KEY)}")
    print(f"  Desktop control: {DESKTOP_ENABLED}")
    print(f"  Session token  : {SESSION_TOKEN[:12]}...")
    print(f"  Project root   : {PROJECT_ROOT}")
    print(f"  Open           : http://127.0.0.1:8000")
    print(f"{'='*55}\n")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
