# Orbit — Personal AI Desktop Agent

A real AI-powered personal workspace running locally on Windows, with voice, screen vision, desktop control, and Google Antigravity prompt generation.

**Repository:** https://github.com/varun5812/Fit_Tracker

---

## What's in this version

| Feature | Status |
|---------|--------|
| Real AI chat (OpenAI GPT-4o / Google Gemini) | ✅ Backend required |
| Voice input + smart female voice output | ✅ Browser-based |
| Desktop screenshot capture | ✅ Backend required |
| AI screen vision analysis | ✅ Backend required |
| Google Antigravity prompt generator | ✅ Backend required |
| Code file inspector | ✅ Backend required |
| Desktop agent (open URL/file, click, type) | ✅ Opt-in, backend required |
| Tasks, notes, focus timer | ✅ Always available |
| Dark UI, responsive, keyboard nav | ✅ Always available |

---

## Quick start (Windows)

### Option A — Double-click launcher
```
run_orbit.bat
```

### Option B — PowerShell step by step

```powershell
# 1. Install Python dependencies
cd "C:\New folder\Fit_Tracker\Fit_Tracker"
py -m pip install -r requirements.txt

# 2. Configure API keys
copy .env.example .env
notepad .env      # Fill in your OPENAI_API_KEY and/or GOOGLE_API_KEY

# 3. Start the backend server
py server.py

# 4. Open in browser
# Visit: http://127.0.0.1:8000
```

### Option C — Frontend only (no AI)
```powershell
npx serve "C:\New folder\Fit_Tracker\Fit_Tracker"
# Visit: http://localhost:3000
# Chat works in demo mode (rule-based) — no backend required
```

---

## Configuration

Edit `.env` (never commit this file):

```env
AI_PROVIDER=openai           # openai | gemini
OPENAI_API_KEY=sk-...        # Get from platform.openai.com/api-keys
AI_MODEL=gpt-4o              # gpt-4o, gpt-4o-mini, gpt-4-turbo

GOOGLE_API_KEY=...           # Get from aistudio.google.com/app/apikey
# (if using Gemini, set AI_PROVIDER=gemini and AI_MODEL=gemini-1.5-pro)

PROJECT_ROOT=C:\New folder\Fit_Tracker\Fit_Tracker

# DESKTOP_CONTROL_ENABLED=false   # uncomment and set true to enable desktop agent
```

---

## Features

### AI Chat
- Connected to real OpenAI GPT-4o or Google Gemini
- Context-aware multi-turn conversations
- Markdown rendering with code blocks
- Voice input (browser speech recognition)
- Smart female voice output (browser TTS with voice picker)

### Screen Vision & Analysis
- Backend captures full Windows desktop (no browser permission needed)
- AI analyzes screenshot + project code together
- Identifies visible UI bugs, CSS issues, JS errors
- Generates precise Google Antigravity correction prompts

### Antigravity Prompt Generator
- Describe any issue — get a complete, copy-ready prompt
- Each prompt includes: affected files, root cause, implementation steps, acceptance criteria
- Copy button for one-click paste into Google Antigravity
- History of generated prompts

### Desktop Agent (opt-in)
- Enable with `DESKTOP_CONTROL_ENABLED=true` in `.env`
- Supported actions: screenshot, open URL, open file, click, type
- All actions require session token authentication
- Sensitive actions require explicit confirmation
- Actions are confined to the project folder by default

### Voice Assistant
- Female voice preferred automatically (Samantha, Zira, Karen, etc.)
- Voice selector to choose from all installed browser voices
- Stop Speaking / Cancel Listening controls
- Voice input routes through real AI backend when connected

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Backend status, provider, model, config |
| `/api/chat` | POST | AI chat with optional image/vision |
| `/api/screenshot` | POST | Capture desktop screenshot |
| `/api/analyze-screen` | POST | Analyze screenshot with AI vision |
| `/api/smart-analyze` | POST | Full pipeline: screenshot + code + AI + prompt |
| `/api/generate-antigravity-prompt` | POST | Generate Antigravity correction prompt |
| `/api/inspect-code` | POST | Index and search project files |
| `/api/project-files` | GET | List all indexed project files |
| `/api/desktop/screenshot` | POST | Desktop screenshot (token required) |
| `/api/desktop/open-url` | POST | Open URL in browser (token + desktop enabled) |
| `/api/desktop/open-file` | POST | Open file (token + desktop enabled) |
| `/api/desktop/click` | POST | Click at coordinates (token + desktop enabled) |
| `/api/desktop/type` | POST | Type text (token + desktop enabled) |

---

## Security

- API keys stored only in local `.env` file — never in JS, HTML, or Git
- `.env` is excluded by `.gitignore`
- Backend binds to `127.0.0.1` (loopback) only
- Desktop control disabled by default, requires opt-in and session token
- Screenshots disclosed to user before AI analysis
- Error messages never reveal secrets or stack traces to the UI
- Desktop actions confined to project folder by default

---

## Privacy

- Microphone: only when you start voice input
- Screen: only after browser permission prompt (browser share) or explicit backend capture
- Tasks, notes, chat: stored in browser localStorage only
- Screenshots: sent to AI provider only when you trigger analysis
- API keys: stay in your local `.env`, never committed to Git

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend won't start | Run `py -m pip install -r requirements.txt` |
| `OPENAI_API_KEY not set` | Edit `.env` and add your key |
| Screenshot fails | Ensure `mss` and `Pillow` are installed |
| Voice not working | Use Chrome or Edge; check microphone permission |
| Desktop control disabled | Set `DESKTOP_CONTROL_ENABLED=true` in `.env` |
| Chat says "demo mode" | Start the backend: `py server.py` |

---

## Next implementation phases

1. **Email integration** — Gmail OAuth, read-only drafts, send with confirmation
2. **Streaming responses** — real-time token-by-token output
3. **Action plan UI** — review/approve desktop agent steps before execution
4. **Neural TTS** — optional premium voice provider (ElevenLabs, Azure)
5. **Multi-monitor** — select which monitor to capture
6. **Tests** — automated backend/frontend integration tests

---

## License

No license specified yet.
