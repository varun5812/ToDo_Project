// Clean initial data with zero dummy records
export const initialProjects = [
  {
    id: "proj-1",
    name: "General",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    icon: "Folder",
    isPinned: false,
    isArchived: false,
    createdDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    dueDate: "",
    notesCount: 0,
    description: "Your main project space."
  }
];

export const initialTasks = [];

export const initialFiles = [];

export const initialNotes = [];

export const initialMindMap = {
  id: "node-root",
  label: "My Project",
  color: "#2563eb",
  children: []
};

// Generates real 7-day data dynamically based on actual tasks
export function getFinishedLastSevenDays(tasks) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = days[d.getDay()];
    const dateDisplay = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    const count = tasks.filter(t => t.status === 'Done' && t.completedDate === dateStr).length;

    result.push({
      day: dayLabel,
      date: dateDisplay,
      count
    });
  }
  return result;
}
