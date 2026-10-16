import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  initialProjects,
  initialTasks,
  initialFiles,
  initialNotes,
  initialMindMap,
  getFinishedLastSevenDays
} from '../data/initialData';
import { playTaskDoneChime, playClickSound, playAmbientSound, stopAmbientSound } from '../utils/audioSynth';

const PlannerContext = createContext();

const DATA_VERSION = 'v3_clean_slate';

export function PlannerProvider({ children }) {
  // Clear any old dummy data from localStorage if on older version
  useEffect(() => {
    const currentVer = localStorage.getItem('todoplanner_data_version');
    if (currentVer !== DATA_VERSION) {
      localStorage.removeItem('todoplanner_projects');
      localStorage.removeItem('todoplanner_tasks');
      localStorage.removeItem('todoplanner_files');
      localStorage.removeItem('todoplanner_notes');
      localStorage.removeItem('todoplanner_mindmap');
      localStorage.setItem('todoplanner_data_version', DATA_VERSION);
    }
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  // --- Persistent State from LocalStorage or Clean Defaults ---
  const [projects, setProjects] = useState(() => {
    if (localStorage.getItem('todoplanner_data_version') !== DATA_VERSION) {
      return initialProjects;
    }
    const saved = localStorage.getItem('todoplanner_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem('todoplanner_active_project') || (initialProjects[0] ? initialProjects[0].id : '');
  });

  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('todoplanner_active_view') || 'dashboard';
  });

  const [tasks, setTasks] = useState(() => {
    if (localStorage.getItem('todoplanner_data_version') !== DATA_VERSION) {
      return initialTasks;
    }
    const saved = localStorage.getItem('todoplanner_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [files, setFiles] = useState(() => {
    if (localStorage.getItem('todoplanner_data_version') !== DATA_VERSION) {
      return initialFiles;
    }
    const saved = localStorage.getItem('todoplanner_files');
    return saved ? JSON.parse(saved) : initialFiles;
  });

  const [notes, setNotes] = useState(() => {
    if (localStorage.getItem('todoplanner_data_version') !== DATA_VERSION) {
      return initialNotes;
    }
    const saved = localStorage.getItem('todoplanner_notes');
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [mindMap, setMindMap] = useState(() => {
    if (localStorage.getItem('todoplanner_data_version') !== DATA_VERSION) {
      return initialMindMap;
    }
    const saved = localStorage.getItem('todoplanner_mindmap');
    return saved ? JSON.parse(saved) : initialMindMap;
  });

  // UI state
  const [isCompactMode, setIsCompactMode] = useState(() => {
    return localStorage.getItem('todoplanner_compact') === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('todoplanner_sound') !== 'false';
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);

  // Modals & Panels
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

  // --- Pomodoro & Productivity Focus State ---
  const [pomodoro, setPomodoro] = useState({
    isRunning: false,
    timeLeft: 25 * 60,
    duration: 25 * 60,
    mode: 'work',
    activeTaskId: null,
    ambientSound: 'none',
    completedSessions: 0
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('todoplanner_data_version', DATA_VERSION);
    localStorage.setItem('todoplanner_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('todoplanner_active_project', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('todoplanner_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('todoplanner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todoplanner_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('todoplanner_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('todoplanner_mindmap', JSON.stringify(mindMap));
  }, [mindMap]);

  useEffect(() => {
    localStorage.setItem('todoplanner_compact', isCompactMode);
  }, [isCompactMode]);

  useEffect(() => {
    localStorage.setItem('todoplanner_sound', soundEnabled);
  }, [soundEnabled]);

  // Pomodoro timer tick
  useEffect(() => {
    let interval = null;
    if (pomodoro.isRunning && pomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoro(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (pomodoro.isRunning && pomodoro.timeLeft === 0) {
      if (soundEnabled) playTaskDoneChime();
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      setPomodoro(prev => ({
        ...prev,
        isRunning: false,
        timeLeft: prev.mode === 'work' ? 5 * 60 : 25 * 60,
        mode: prev.mode === 'work' ? 'shortBreak' : 'work',
        completedSessions: prev.mode === 'work' ? prev.completedSessions + 1 : prev.completedSessions
      }));
    }
    return () => clearInterval(interval);
  }, [pomodoro.isRunning, pomodoro.timeLeft, pomodoro.mode, soundEnabled]);

  // Ambient sound handler
  const setPomodoroAmbient = (soundType) => {
    setPomodoro(prev => ({ ...prev, ambientSound: soundType }));
    if (soundType === 'none') {
      stopAmbientSound();
    } else {
      playAmbientSound(soundType, 0.2);
    }
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Helpers & Computed ---
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || {
    id: 'default',
    name: 'General',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    icon: 'Folder'
  };

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);

  // Dynamic 7 days chart
  const finishedThisWeekData = getFinishedLastSevenDays(tasks);
  const doneThisWeekCount = finishedThisWeekData.reduce((acc, d) => acc + d.count, 0);

  const stats = {
    totalProjects: projects.filter(p => !p.isArchived).length,
    archivedProjects: projects.filter(p => p.isArchived).length,
    totalTasks: tasks.length,
    openTasks: tasks.filter(t => t.status !== 'Done').length,
    doneTasks: tasks.filter(t => t.status === 'Done').length,
    dueToday: tasks.filter(t => t.dueDate === todayStr && t.status !== 'Done').length,
    lateTasks: tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'Done').length,
    doneThisWeek: doneThisWeekCount,
    totalNotes: notes.length
  };

  // Active project task stats
  const activeProjectStats = {
    total: projectTasks.length,
    todo: projectTasks.filter(t => t.status === 'To do').length,
    inProgress: projectTasks.filter(t => t.status === 'In progress').length,
    done: projectTasks.filter(t => t.status === 'Done').length,
    open: projectTasks.filter(t => t.status !== 'Done').length,
    progressPercent: projectTasks.length > 0
      ? Math.round((projectTasks.filter(t => t.status === 'Done').length / projectTasks.length) * 100)
      : 0
  };

  // --- Task Operations ---
  const addTask = (taskData) => {
    if (soundEnabled) playClickSound();
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: taskData.projectId || activeProject.id,
      title: taskData.title.trim(),
      tags: taskData.tags || [],
      priority: taskData.priority || 'Medium',
      dueDate: taskData.dueDate || '',
      formattedDue: taskData.dueDate ? taskData.dueDate.split('-').reverse().join('/') : '—',
      status: taskData.status || 'To do',
      isStarred: !!taskData.isStarred,
      estimatedMinutes: taskData.estimatedMinutes || 60,
      timeSpentMinutes: 0,
      completedDate: null,
      subtasks: taskData.subtasks || []
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  // Dedicated helper to add directly to My Day
  const addTaskToMyDay = (title, priority = 'Medium', projectId = null) => {
    if (!title || !title.trim()) return null;
    return addTask({
      title,
      priority,
      projectId: projectId || activeProject.id,
      dueDate: todayStr,
      status: 'To do',
      tags: ['My Day']
    });
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        let nextStatus = 'In progress';
        let completedDate = null;
        if (t.status === 'To do') nextStatus = 'In progress';
        else if (t.status === 'In progress') {
          nextStatus = 'Done';
          completedDate = todayStr;
        } else {
          nextStatus = 'To do';
          completedDate = null;
        }

        if (nextStatus === 'Done') {
          if (soundEnabled) playTaskDoneChime();
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } catch (e) {}
        } else if (soundEnabled) {
          playClickSound();
        }

        return { ...t, status: nextStatus, completedDate };
      }
      return t;
    }));
  };

  const setTaskStatus = (taskId, status) => {
    const completedDate = status === 'Done' ? todayStr : null;
    if (status === 'Done' && soundEnabled) {
      playTaskDoneChime();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } else if (soundEnabled) {
      playClickSound();
    }
    updateTask(taskId, { status, completedDate });
  };

  const toggleStarTask = (taskId) => {
    if (soundEnabled) playClickSound();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isStarred: !t.isStarred } : t));
  };

  const deleteTask = (taskId) => {
    if (soundEnabled) playClickSound();
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addSubtask = (taskId, title) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSub = { id: `sub-${Date.now()}`, title, completed: false };
        return { ...t, subtasks: [...(t.subtasks || []), newSub] };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subId) => {
    if (soundEnabled) playClickSound();
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubs = (t.subtasks || []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
        return { ...t, subtasks: updatedSubs };
      }
      return t;
    }));
  };

  // --- Project Operations ---
  const addProject = (projectData) => {
    if (soundEnabled) playClickSound();
    const newProj = {
      id: `proj-${Date.now()}`,
      name: projectData.name.trim(),
      color: projectData.color || '#2563eb',
      gradient: `linear-gradient(135deg, ${projectData.color || '#2563eb'} 0%, #1e40af 100%)`,
      icon: projectData.icon || 'Folder',
      isPinned: false,
      isArchived: false,
      createdDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      dueDate: projectData.dueDate || '',
      notesCount: 0,
      description: projectData.description || ''
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    return newProj;
  };

  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const togglePinProject = (projectId) => {
    if (soundEnabled) playClickSound();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isPinned: !p.isPinned } : p));
  };

  const toggleArchiveProject = (projectId) => {
    if (soundEnabled) playClickSound();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isArchived: !p.isArchived } : p));
  };

  const deleteProject = (projectId) => {
    if (soundEnabled) playClickSound();
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    setFiles(prev => prev.filter(f => f.projectId !== projectId));
    setNotes(prev => prev.filter(n => n.projectId !== projectId));
    const remaining = projects.filter(p => p.id !== projectId);
    if (remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    } else {
      setActiveProjectId('');
    }
  };

  // --- File Operations ---
  const addFile = (fileData) => {
    if (soundEnabled) playClickSound();
    const newFile = {
      id: `file-${Date.now()}`,
      projectId: activeProject.id,
      name: fileData.name,
      type: fileData.type || 'pdf',
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: fileData.size || '120 KB',
      sizeBytes: fileData.sizeBytes || 120000,
      category: fileData.category || 'Project',
      tag: (activeProject.name || 'General').slice(0, 16) + '...',
      thumbnail: fileData.thumbnail || null,
      url: '#'
    };
    setFiles(prev => [newFile, ...prev]);
  };

  const deleteFile = (fileId) => {
    if (soundEnabled) playClickSound();
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // --- Note Operations ---
  const addNote = (noteData) => {
    if (soundEnabled) playClickSound();
    const newNote = {
      id: `note-${Date.now()}`,
      projectId: activeProject.id,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      color: noteData.color || '#fef08a',
      isPinned: false,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tags: noteData.tags || ['General']
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (noteId, updates) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : n));
  };

  const deleteNote = (noteId) => {
    if (soundEnabled) playClickSound();
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const togglePinNote = (noteId) => {
    if (soundEnabled) playClickSound();
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
  };

  const updateMindMap = (newMap) => {
    setMindMap(newMap);
  };

  const exportTasksToCSV = () => {
    const headers = ["ID", "Title", "Project", "Status", "Priority", "Due Date", "Tags"];
    const rows = projectTasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${activeProject.name}"`,
      t.status,
      t.priority,
      t.formattedDue,
      `"${t.tags.join(', ')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(activeProject.name || 'project').toLowerCase().replace(/\s+/g, '_')}_tasks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setProjects([]);
      setActiveProjectId('');
      setTasks([]);
      setFiles([]);
      setNotes([]);
      setMindMap(initialMindMap);
      localStorage.clear();
      localStorage.setItem('todoplanner_data_version', DATA_VERSION);
    }
  };

  return (
    <PlannerContext.Provider
      value={{
        // Data
        todayStr,
        projects,
        activeProjectId,
        setActiveProjectId,
        activeProject,
        tasks,
        projectTasks,
        files,
        notes,
        mindMap,
        stats,
        activeProjectStats,
        finishedThisWeekData,

        // Navigation & Views
        activeView,
        setActiveView,
        isCompactMode,
        setIsCompactMode,
        soundEnabled,
        setSoundEnabled,

        // Filters
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        filterPriority,
        setFilterPriority,
        filterTag,
        setFilterTag,
        filterStarredOnly,
        setFilterStarredOnly,

        // Modals
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        isNewTaskModalOpen,
        setIsNewTaskModalOpen,
        isAddFilesModalOpen,
        setIsAddFilesModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isPdfExportOpen,
        setIsPdfExportOpen,
        notificationCount,
        setNotificationCount,
        selectedFileForPreview,
        setSelectedFileForPreview,

        // Pomodoro State
        pomodoro,
        setPomodoro,
        setPomodoroAmbient,

        // Actions
        addTask,
        addTaskToMyDay,
        updateTask,
        toggleTaskStatus,
        setTaskStatus,
        toggleStarTask,
        deleteTask,
        addSubtask,
        toggleSubtask,
        addProject,
        updateProject,
        togglePinProject,
        toggleArchiveProject,
        deleteProject,
        addFile,
        deleteFile,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        updateMindMap,
        exportTasksToCSV,
        clearAllData
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used within PlannerProvider');
  return context;
};
