"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for creating a new project
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  
  // --- 1. NEW STATE FOR EDITING A PROJECT ---
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingProjectTitle, setEditingProjectTitle] = useState("");
  const [editingProjectDesc, setEditingProjectDesc] = useState("");

  const router = useRouter();
  const { user, getAuthHeader, logout, loading: authLoading } = useAuth();

  // Effect: Protect the route
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProjects();
      }
    }
  }, [authLoading, user, router]);

  // Fetch projects
  const fetchProjects = async () => {
    if (!user) return; 
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/projects/", {
        headers: { ...getAuthHeader() },
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data: Project[] = await res.json();
      setProjects(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // Create project
  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDesc,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const createdProject: Project = await res.json();
      setProjects((currentProjects) => [...currentProjects, createdProject]);
      setNewProjectTitle("");
      setNewProjectDesc("");
    } catch (error) { console.error("Error creating project:", error); }
  };

  // Delete project
  const handleDeleteProject = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm("Are you sure? This will delete all associated tasks.")) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/projects/${projectId}/`,
        { method: "DELETE", headers: { ...getAuthHeader() } }
      );
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete project");
      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      );
    } catch (error) { console.error("Error deleting project:", error); }
  };

  // --- 2. NEW FUNCTIONS FOR EDITING A PROJECT ---
  const handleStartEdit = (e: React.MouseEvent, project: Project) => {
    e.preventDefault(); e.stopPropagation(); // Stop link navigation
    setEditingProjectId(project.id);
    setEditingProjectTitle(project.title);
    setEditingProjectDesc(project.description);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setEditingProjectId(null);
    setEditingProjectTitle("");
    setEditingProjectDesc("");
  };

  const handleSaveEdit = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!editingProjectTitle.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/projects/${projectId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({
            title: editingProjectTitle,
            description: editingProjectDesc,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update project");
      const updatedProject: Project = await res.json();
      setProjects((currentProjects) =>
        currentProjects.map((p) => (p.id === projectId ? updatedProject : p))
      );
      setEditingProjectId(null); // Exit edit mode
    } catch (error) { console.error("Error updating project:", error); }
  };

  // --- RENDER LOGIC ---
  if (authLoading || loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );
  }

  const canManageProjects = user.role === 'ADMIN' || user.role === 'MANAGER';

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Projects</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user.username} ({user.role})</span>
            <button
              onClick={logout}
              className="p-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Create Project Form */}
        {canManageProjects && (
          <form
            onSubmit={handleCreateProject}
            className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200"
          >
            {/* ... form content ... */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Create New Project
            </h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Project Title"
                className="w-full p-2 border border-gray-300 rounded text-gray-800"
              />
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Project Description (Optional)"
                className="w-full p-2 border border-gray-300 rounded text-gray-800"
                rows={3}
              />
              <button
                type="submit"
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          </form>
        )}

        {/* --- 3. UPDATED PROJECT LIST --- */}
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              {editingProjectId === project.id && canManageProjects ? (
                // --- EDITING STATE ---
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={editingProjectTitle}
                    onChange={(e) => setEditingProjectTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 text-2xl font-semibold"
                  />
                  <textarea
                    value={editingProjectDesc}
                    onChange={(e) => setEditingProjectDesc(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleSaveEdit(e, project.id)}
                      className="flex-1 p-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 p-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // --- NORMAL STATE ---
                <Link
                  href={`/project/${project.id}`}
                  className="block"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {project.title}
                      </h2>
                      <p className="text-gray-600 mt-2">{project.description}</p>
                    </div>
                    {canManageProjects && (
                      <div className="flex gap-2 ml-4" style={{ minWidth: "170px" }}>
                        <button
                          onClick={(e) => handleStartEdit(e, project)}
                          className="p-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          style={{ minWidth: "80px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="p-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          style={{ minWidth: "80px" }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}