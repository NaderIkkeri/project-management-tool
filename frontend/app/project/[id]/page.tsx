"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// --- TYPES ---
interface User {
  id: number;
  username: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
}
interface Task {
  id: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignee: number | null;
  deadline: string | null;
  project: number;
}
interface Project {
  id: number;
  title: string;
}

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;
  const router = useRouter();

  // --- STATE ---
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  const { user, getAuthHeader, logout, loading: authLoading } = useAuth();
  const canManageTasks = user?.role === "ADMIN" || user?.role === "MANAGER";

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (projectId) {
        fetchData();
      }
    }
  }, [authLoading, user, projectId, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        fetch(`http://localhost:8000/api/projects/${projectId}/`, { headers: { ...getAuthHeader() } }),
        fetch(`http://localhost:8000/api/tasks/?project=${projectId}`, { headers: { ...getAuthHeader() } }),
        fetch(`http://localhost:8000/api/users/`, { headers: { ...getAuthHeader() } }),
      ]);
      if ([projectRes, tasksRes, usersRes].some((res) => res.status === 401)) {
        logout(); return;
      }
      setProject(await projectRes.json());
      setTasks(await tasksRes.json());
      setUsers(await usersRes.json());
    } catch (error) { console.error("Failed to fetch data", error); } 
    finally { setLoading(false); }
  };

  // --- API HANDLERS ---
  // (All handlers... handleStatusChange, handleAssigneeChange, etc. are identical to the previous step)
  // ... (Omitting for brevity, no changes to these functions)
  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updatedTask: Task = await res.json();
      setTasks((tasks) => tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (error) { console.error("Error updating status:", error); }
  };
  const handleAssigneeChange = async (taskId: number, newAssigneeId: number | null) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ assignee: newAssigneeId }),
      });
      if (!res.ok) throw new Error("Failed to update assignee");
      const updatedTask: Task = await res.json();
      setTasks((tasks) => tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (error) { console.error("Error updating assignee:", error); }
  };
  const handleDeadlineChange = async (taskId: number, newDeadline: string | null) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ deadline: newDeadline || null }),
      });
      if (!res.ok) throw new Error("Failed to update deadline");
      const updatedTask: Task = await res.json();
      setTasks((tasks) => tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (error) { console.error("Error updating deadline:", error); }
  };
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ title: newTaskTitle, project: projectId, status: "TODO" }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const createdTask: Task = await res.json();
      setTasks((tasks) => [...tasks, createdTask]);
      setNewTaskTitle("");
    } catch (error) { console.error("Error creating task:", error); }
  };
  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete task");
      setTasks((tasks) => tasks.filter((t) => t.id !== taskId));
    } catch (error) { console.error("Error deleting task:", error); }
  };
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };
  const handleSaveEdit = async (taskId: number) => {
    if (!editingTaskTitle.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ title: editingTaskTitle }),
      });
      if (!res.ok) throw new Error("Failed to update title");
      const updatedTask: Task = await res.json();
      setTasks((tasks) => tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      handleCancelEdit();
    } catch (error) { console.error("Error updating title:", error); }
  };

  // --- RENDER LOGIC ---
  if (authLoading || loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );
  }

  // --- 1. FILTER TASKS (We need these counts for the report) ---
  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((task) => task.status === "DONE");
  
  // --- 2. NEW: CALCULATE OVERDUE TASKS ---
  const today = new Date().toISOString().split('T')[0]; // Get today as "YYYY-MM-DD"
  const overdueTasks = tasks.filter(task => 
    task.deadline && task.deadline < today && task.status !== 'DONE'
  );

  // --- 3. NEW: REPORTING COMPONENT ---
  const ReportDashboard = () => (
    <div className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-4 bg-blue-100 rounded-lg">
          <div className="text-3xl font-bold text-blue-800">{tasks.length}</div>
          <div className="text-sm font-medium text-blue-700">Total Tasks</div>
        </div>
        {/* Tasks by Status */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="text-3xl font-bold text-gray-800">{todoTasks.length}</div>
          <div className="text-sm font-medium text-gray-700">To Do</div>
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg">
          <div className="text-3xl font-bold text-yellow-800">{inProgressTasks.length}</div>
          <div className="text-sm font-medium text-yellow-700">In Progress</div>
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          <div className="text-3xl font-bold text-green-800">{doneTasks.length}</div>
          <div className="text-sm font-medium text-green-700">Done</div>
        </div>
      </div>
      {/* Overdue Tasks Report */}
      {overdueTasks.length > 0 && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">{overdueTasks.length} Overdue Task(s)</h3>
          <ul className="list-disc list-inside mt-2 text-red-700">
            {overdueTasks.map(task => (
              <li key={task.id}>{task.title} (due {task.deadline})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Reusable TaskCard component (No changes from previous step)
  const TaskCard = ({ task }: { task: Task }) => {
    // ... (identical to previous step)
    const isEditing = editingTaskId === task.id;
    const assigneeName = users.find(u => u.id === task.assignee)?.username || "Unassigned";

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        {isEditing && canManageTasks ? (
          // EDITING STATE
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editingTaskTitle}
              onChange={(e) => setEditingTaskTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-800"
            />
            <div className="flex gap-2">
              <button onClick={() => handleSaveEdit(task.id)} className="flex-1 p-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">Save</button>
              <button onClick={handleCancelEdit} className="flex-1 p-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        ) : (
          // NORMAL STATE
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
              {canManageTasks && (
                <button onClick={() => handleStartEdit(task)} className="p-1 px-2 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
                  Edit
                </button>
              )}
            </div>
            {/* Status Dropdown */}
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value as Task["status"])}
              className="w-full p-2 border border-gray-300 rounded text-gray-800"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            {/* Deadline Input/Text */}
            {canManageTasks ? (
              <div className="text-sm">
                <label htmlFor={`deadline-${task.id}`} className="text-gray-600">Deadline:</label>
                <input
                  type="date"
                  id={`deadline-${task.id}`}
                  value={task.deadline || ""}
                  onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-gray-800"
                />
              </div>
            ) : (
              <div className="text-sm w-full p-2 border border-gray-200 rounded text-gray-600 bg-gray-50">
                Deadline: {task.deadline || "Not set"}
              </div>
            )}
            {/* Assignee Dropdown/Text */}
            {canManageTasks ? (
              <select
                value={task.assignee || 0}
                onChange={(e) => handleAssigneeChange(task.id, e.target.value === "0" ? null : Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded text-gray-800"
              >
                <option value="0">-- Unassigned --</option>
                {users.map((user) => ( <option key={user.id} value={user.id}>{user.username}</option> ))}
              </select>
            ) : (
              <div className="w-full p-2 border border-gray-200 rounded text-gray-600 bg-gray-50 text-sm">
                Assignee: {assigneeName}
              </div>
            )}
            {/* Delete Button */}
            {canManageTasks && (
              <button onClick={() => handleDeleteTask(task.id)} className="w-full p-2 mt-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Delete Task
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- MAIN COMPONENT RENDER ---
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{project?.title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user.username} ({user.role})</span>
            <button onClick={logout} className="p-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
              Logout
            </button>
          </div>
        </div>

        {/* --- 4. RENDER THE NEW REPORTING DASHBOARD --- */}
        <ReportDashboard />

        {/* --- KANBAN BOARD --- */}
        <div className="flex w-full gap-8">
          {/* Column 1: TODO */}
          <div className="w-1/3 rounded-lg bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">To Do ({todoTasks.length})</h2>
            {canManageTasks && (
              <form onSubmit={handleCreateTask} className="mb-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task title"
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                />
                <button type="submit" className="w-full p-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add Task
                </button>
              </form>
            )}
            <div className="flex flex-col gap-4">
              {todoTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              {todoTasks.length === 0 && !canManageTasks && <p className="text-gray-500">No tasks</p>}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="w-1/3 rounded-lg bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">In Progress ({inProgressTasks.length})</h2>
            <div className="flex flex-col gap-4">
              {inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              {inProgressTasks.length === 0 && <p className="text-gray-500">No tasks</p>}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div className="w-1/3 rounded-lg bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Done ({doneTasks.length})</h2>
            <div className="flex flex-col gap-4">
              {doneTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              {doneTasks.length === 0 && <p className="text-gray-500">No tasks</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}