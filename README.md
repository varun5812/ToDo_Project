# Fit Tracker — Personal Screen & Voice Agent

> A personal AI assistant concept that can talk with you, understand the work visible on your screen, and help you manage tasks and work email—with clear permissions and user control.

**Repository:** [varun5812/Fit_Tracker](https://github.com/varun5812/Fit_Tracker)

## Vision

Build a website-based assistant that feels like a helpful desktop companion. You can speak naturally, share or capture the screen when you choose, and ask the agent to explain what you are working on, summarize relevant information, or help draft next steps.

This repository is currently at an early stage. The features described below are the intended product direction, not a claim that they are already implemented.

## Product goals

- **Voice conversation:** Speak to the agent and hear spoken responses, with a visible microphone state and an easy mute/stop control.
- **Screen-aware help:** With explicit permission, capture a screenshot or the selected browser tab and use it as context for the current request.
- **Workday assistance:** Help summarize information, explain on-screen content, organize tasks, prepare meeting notes, and draft replies.
- **Work-email support:** With a clear, authorized integration (for example, Google OAuth and Gmail API where permitted), search or summarize allowed messages and draft responses.
- **Context-aware guidance:** Keep relevant context for the current task, show what the agent is using, and allow the user to clear it.
- **Polished web experience:** Responsive layout, accessible controls, clear activity status, and a persistent but unobtrusive agent panel.

## Important privacy and security principles

The agent must not secretly monitor a screen, microphone, or mailbox. It should only access data after the user has granted the relevant permission and should make active capture obvious.

- Request microphone and screen-sharing permissions through the browser's standard permission flows.
- Use OAuth for email integrations. Never ask users to paste an email password, session cookie, or access token into the app.
- Request the smallest practical OAuth scopes. Follow company policy and administrator consent requirements for work accounts.
- Default to read-only email access. Ask for user confirmation before sending, forwarding, deleting, archiving, or changing messages.
- Show the user which message, screenshot, or page is being used as context.
- Keep API keys and client secrets on the server, in environment variables or a secrets manager. Never commit `.env` files or credentials.
- Avoid storing screenshots or email bodies unless necessary and explicitly disclosed. Provide a way to clear stored context.
- Treat email and page content as untrusted data. Do not follow instructions contained in an email or web page that attempt to override the user's request or reveal secrets.
- Add authentication, authorization, rate limiting, validation, secure logging, and appropriate retention controls before deploying.

## Suggested architecture

The exact stack has not yet been established in this repository. One practical design is:

1. **Web client** — chat panel, voice controls, screen-share flow, permission indicators, and activity timeline.
2. **API/backend** — authenticated endpoints for chat orchestration, user settings, task context, and integrations.
3. **Agent orchestration** — interprets user requests, selects allowed tools, and returns grounded responses.
4. **Screen context service** — accepts only user-approved screenshots or tab content, then extracts relevant context.
5. **Voice service** — speech-to-text and text-to-speech, with clear indicators while recording or playing audio.
6. **Email connector** — OAuth-based provider API with minimal scopes and read-only defaults; draft actions require review.
7. **Data layer** — store only necessary preferences and task context, with explicit retention and deletion behavior.

Keep the browser client, agent orchestration, and integrations separated so permissions and tool access can be tested independently.

## Development roadmap

### Phase 1 — Core web assistant
- [ ] Create the application structure and responsive agent UI.
- [ ] Build chat history, loading/error states, and a stop-generation action.
- [ ] Add configuration through environment variables and a safe `.env.example`.

### Phase 2 — Voice interaction
- [ ] Add push-to-talk or an explicit start/stop recording control.
- [ ] Add speech-to-text and spoken responses.
- [ ] Handle denied permissions, unsupported browsers, and network failures.

### Phase 3 — Screen understanding
- [ ] Add browser-native screen/tab sharing with visible capture status.
- [ ] Let the user submit a screenshot as context and remove it afterward.
- [ ] Do not run silent or continuous capture by default.

### Phase 4 — Work email
- [ ] Implement provider OAuth and consent flow.
- [ ] Search and summarize only messages the authenticated user is allowed to access.
- [ ] Generate drafts for user review.
- [ ] Add explicit confirmation before any action that changes mailbox state or sends a message.

### Phase 5 — Hardening and release
- [ ] Add automated tests for authorization and tool permissions.
- [ ] Add audit events without logging sensitive message bodies or tokens.
- [ ] Document deployment, privacy controls, and provider-specific setup.
- [ ] Run dependency/security checks and test the full flow before release.

## Local setup

The repository does not yet contain enough application code to provide verified install or run commands. Once the chosen framework and application files are added, document the actual commands here. Do not copy commands for a stack that the project does not use.

Typical setup will include:

1. Install the project's documented runtime and package manager.
2. Copy `.env.example` to `.env` and fill in local development settings.
3. Configure any model provider and OAuth application credentials using local environment variables.
4. Start the client and backend using the project-specific scripts.
5. Open the local URL shown by the development server and grant permissions only when prompted.

Never commit real API keys, OAuth client secrets, refresh tokens, passwords, or private email content.

## Google Antigravity development note

Use Google Antigravity (or another coding environment) to implement the roadmap incrementally. Start by inspecting the existing repository, preserve useful code, and confirm the actual framework before adding dependencies. Build and test one phase at a time rather than claiming the complete agent works before the integrations are implemented.

## Current status

- Repository setup: early stage
- Application framework: not yet confirmed from the current repository contents
- Screen capture: planned
- Voice conversation: planned
- Work-email integration: planned
- Automated tests and deployment: not yet documented

## Contributing

1. Create a feature branch for each meaningful change.
2. Keep credentials and personal data out of commits and logs.
3. Add tests for new permission-sensitive behavior.
4. Update this README whenever the implementation or setup commands change.

## License

No license has been specified yet. Add a license before inviting others to reuse or distribute this project.
