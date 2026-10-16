import React from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import TasksView from './components/TasksView';
import FilesView from './components/FilesView';
import NotesView from './components/NotesView';
import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import MindMapView from './components/MindMapView';
import MyDayView from './components/MyDayView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';

import CommandPaletteModal from './components/modals/CommandPaletteModal';
import AiAssistantModal from './components/modals/AiAssistantModal';
import NewProjectModal from './components/modals/NewProjectModal';
import NewTaskModal from './components/modals/NewTaskModal';
import AddFilesModal from './components/modals/AddFilesModal';
import FilePreviewModal from './components/modals/FilePreviewModal';
import PdfExportModal from './components/modals/PdfExportModal';

function MainAppShell() {
  const { activeView } = usePlanner();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView />;
      case 'my-day':
        return <MyDayView />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <TasksView />;
      case 'notes':
        return <NotesView />;
      case 'files':
        return <FilesView />;
      case 'timeline':
        return <TimelineView />;
      case 'mindmap':
        return <MindMapView />;
      case 'statistics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        {renderActiveView()}
      </div>

      {/* Global Modals */}
      <CommandPaletteModal />
      <AiAssistantModal />
      <NewProjectModal />
      <NewTaskModal />
      <AddFilesModal />
      <FilePreviewModal />
      <PdfExportModal />
    </div>
  );
}

export default function App() {
  return (
    <PlannerProvider>
      <MainAppShell />
    </PlannerProvider>
  );
}
