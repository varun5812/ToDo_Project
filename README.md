# ToDo Planner — Project & Task Planner

A high-performance, Windows desktop-inspired Project & Task Management application built to faithfully replicate the design language, layout, and functionality showcased in the ToDo Planner design specification.

---

## 🌟 Visuals & Features Replicated from Screenshots

### 1. Dashboard (`DashboardView.jsx`)
- **6 Key Performance Indicators (KPIs)**: Projects (3), Open Tasks (38), Due Today (4), Late (3), Done this week (11), Notes (5).
- **Overall Progress Tracker**: Visual progress bar showing 22% overall completion (11 / 49 tasks).
- **Active Project Hero Card**: Real-time stats for *Production Line Optimization* (22 open, 3 late, 5 notes, 9 files) with quick navigation.
- **Finished This Week (W35–W36)**: 7-day interactive bar chart showing daily task velocity from Sun 30 Aug to Sat 5 Sep.
- **Tri-Panel Bottom Grid**:
  - **Project Progress**: Real-time completion bars for *Production Line Optimization*, *Product Launch — Q4 2026*, and *Website Redesign*.
  - **Next Up**: Imminent tasks with blue indicators and deadline tags.
  - **Late**: Overdue tasks flagged with red urgency dots and due dates.

### 2. Projects View (`ProjectsView.jsx`)
- **Project Cards Grid**: Custom gradient-themed cards (Royal Blue, Crimson Red, Emerald Teal).
- **Header Controls**: Open & archived counters (`3 open`, `0 archived`), real-time search, archive view toggle, and `+ New project` modal.
- **Tip Alert Banner**: Cyan notification banner explaining project card interactions and archiving.
- **Card Controls**: Pin, Edit, Archive, and Delete actions with task counts, open counts, note counts, and progress bars.

### 3. Tasks View (`TasksView.jsx`)
- **Blue Hero Banner**: Project title, progress bar, counters (28 total, 7 to do, 12 in progress, 9 done).
- **Action Toolbar**: `Export as PDF`, `Export as Excel`, `AI Assist`, and `+ New task`.
- **Comprehensive Filtering**: Multi-dropdown filter by Status, Priority, Tags, Favorite Star ⭐, and Reset.
- **Interactive Task Rows**:
  - One-click status cycle with confetti celebrations and audio chimes on completion!
  - Priority pills (Urgent, High, Medium, Low).
  - Subtask accordions with nested checklists.
  - Inline due date formatting with red alerts for overdue tasks.
- **Bottom Quick Add Bar**: Pinned quick task creator (`Add a task and press Enter...`).

### 4. Files Manager (`FilesView.jsx`)
- **File Grid**: Project attachments matching the exact showcase (PDFs, IMG1.png).
- **File Previews & Downloads**: Modal previewer and simulated file downloader.
- **Drag & Drop Uploader**: Drag and drop file upload modal with file category categorization.

### 5. Notes (`NotesView.jsx`)
- Sticky notes board with color-coded cards (Soft yellow, sky blue, light green, peach, lavender).
- Search, pinning, markdown notes editor, and timestamp tracking.

### 6. Calendar Planner (`CalendarView.jsx`)
- Full monthly grid with colored deadline chips on scheduled dates.
- Day Agenda side panel with one-click task scheduling.

### 7. Timeline & Gantt (`TimelineView.jsx`)
- Visual Gantt chart showing task duration bars across dates with milestones and status colors.

### 8. Mind Map Canvas (`MindMapView.jsx`)
- Interactive mind map diagram with branching nodes, zoom controls, and custom idea insertion.

### 9. PDF & Excel Export (`PdfExportModal.jsx`)
- Printable executive project report matching the showcase PDF export format.
- CSV/Excel data export.

---

## 🚀 NEW Productivity Superchargers

1. **AI Productivity Copilot (`AiAssistantModal.jsx`)**:
   - Deconstructs broad goals (e.g. *"Automate pneumatic pick-and-place station"*) into 5 actionable, prioritized subtasks with time estimates in 1 click.
2. **"My Day" & Deep Work Focus (`MyDayView.jsx`)**:
   - Integrated Pomodoro timer (25m Deep Work, 5m Short Break, 15m Long Break).
   - **Offline Web Audio Ambient Soundscapes**: Real-time synthesized Rain Drops, White Noise, and 40Hz Gamma Concentration tone (binaural beats).
   - Daily focus streak and deep work hour logging.
   - Eisenhower urgent catch-up prioritization for overdue items.
3. **Global Command Palette (`Ctrl + K`)**:
   - Lightning-fast fuzzy search and keyboard shortcuts to navigate anywhere in 1 keystroke.
4. **Instant Audio Feedback & Celebration**:
   - Built-in Web Audio chimes and particle confetti when crossing off deliverables.
5. **Data Persistence & Portability**:
   - Full LocalStorage caching with JSON export/import backup and a 1-click restore to sample screenshot data.

---

## 💻 Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
The application runs on `http://127.0.0.1:3000/`.
