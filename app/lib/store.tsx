"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Project, Task, TaskStatus, TeamMember } from "../types";

const SEED_MEMBERS: TeamMember[] = [
  { id: "m1", name: "Alex Rivera", role: "Lead Developer", email: "alex@studio.com", initials: "AR", color: "#0c56d0", joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m2", name: "Jordan S.", role: "Project Manager", email: "jordan@studio.com", initials: "JS", color: "#615b77", joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m3", name: "Casey L.", role: "QA Engineer", email: "casey@studio.com", initials: "CL", color: "#4d626c", joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m4", name: "Morgan W.", role: "UI Designer", email: "morgan@studio.com", initials: "MW", color: "#9f403d", joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m5", name: "Jordan R.", role: "Backend Engineer", email: "jreed@studio.com", initials: "JR", color: "#004aba", joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

const SEED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Horizon Towers",
    description:
      "Master plan for a twin-tower commercial complex with integrated green spaces and smart city features.",
    pin: "1234",
    icon: "apartment",
    iconBg: "primary",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    memberCount: 5,
    tasks: [
      { id: "task-1", title: "Implement Auth Flow", description: "Connect Firebase authentication with the main login screen and handle session persistence.", status: "todo", priority: "urgent", labels: [{ id: "l1", name: "frontend", color: "secondary" }], checklist: [{ id: "c1", text: "Set up Firebase config", done: true }, { id: "c2", text: "Create login screen", done: false }, { id: "c3", text: "Handle session persistence", done: false }], attachments: [], testingNotes: "", assigneeInitials: "AR", assigneeName: "Alex Rivera", updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: "task-2", title: "Typography Audit", description: "Review all components for font weight consistency across the design system.", status: "todo", priority: "low", labels: [{ id: "l2", name: "design", color: "tertiary" }], checklist: [], attachments: [], testingNotes: "", assigneeInitials: "JR", assigneeName: "Jordan R.", updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { id: "task-3", title: "API Gateway Migration", description: "Transfer all legacy endpoints from the internal Express monolith to the new cloud-native AWS API Gateway infrastructure.", status: "in_progress", priority: "urgent", labels: [{ id: "l3", name: "backend", color: "secondary" }, { id: "l4", name: "urgent", color: "error" }], checklist: [{ id: "c4", text: "Define CloudFormation template", done: true }, { id: "c5", text: "Configure VPC Link for Auth Service", done: false }, { id: "c6", text: "Test Lambda Authorizer latency", done: false }], attachments: [{ id: "a1", name: "GitHub Repository", url: "#", type: "link", icon: "code", subtitle: "infra-main/gateway-configs" }, { id: "a2", name: "Pull Request #412", url: "#", type: "link", icon: "merge", subtitle: "PR for migration draft" }], testingNotes: "", assigneeInitials: "AR", assigneeName: "Alex Rivera", updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { id: "task-4", title: "Code Refactor: Sidebar", description: "Removing unnecessary div nesting and optimizing Tailwind class strings.", status: "review", priority: "medium", labels: [{ id: "l5", name: "QA", color: "secondary" }], checklist: [], attachments: [], testingNotes: "", assigneeInitials: "CL", assigneeName: "Casey L.", updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: "task-5", title: "Safari Border Rendering", description: "The 'No-Line' rule isn't being respected in Safari mobile browsers.", status: "testing", priority: "urgent", labels: [{ id: "l6", name: "Bug", color: "error" }], checklist: [], attachments: [], testingNotes: "Failed on Safari 16.x mobile.", assigneeInitials: "MW", assigneeName: "Morgan W.", updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { id: "task-6", title: "Architecture Map V1", description: "Created the initial architecture documentation.", status: "done", priority: "low", labels: [{ id: "l7", name: "docs", color: "secondary" }], checklist: [], attachments: [], testingNotes: "", assigneeInitials: "JS", assigneeName: "Jordan S.", updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "proj-2",
    name: "Nexus Eco-Hub",
    description: "Sustainable residential development focused on net-zero carbon emissions and modular timber construction.",
    pin: null,
    icon: "eco",
    iconBg: "tertiary",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    memberCount: 2,
    tasks: [],
  },
  {
    id: "proj-3",
    name: "Metropolis Gallery",
    description: "Expansion project for the downtown contemporary arts center, featuring cantilevered galleries and skylights.",
    pin: "5678",
    icon: "museum",
    iconBg: "secondary",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    memberCount: 1,
    tasks: [],
  },
];

interface ProjectStore {
  projects: Project[];
  members: TeamMember[];
  unlockedProjectIds: Set<string>;
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "memberCount">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  unlockProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<Task, "id" | "updatedAt">) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  moveTask: (projectId: string, taskId: string, newStatus: TaskStatus) => void;
  addMember: (member: Omit<TeamMember, "id" | "joinedAt">) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  resetData: () => void;
}

const ProjectContext = createContext<ProjectStore | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [members, setMembers] = useState<TeamMember[]>(SEED_MEMBERS);
  const [hydrated, setHydrated] = useState(false);
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("architect_projects");
      if (storedProjects) setProjects(JSON.parse(storedProjects));
      const storedMembers = localStorage.getItem("architect_members");
      if (storedMembers) setMembers(JSON.parse(storedMembers));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("architect_projects", JSON.stringify(projects));
    } catch {}
  }, [projects, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("architect_members", JSON.stringify(members));
    } catch {}
  }, [members, hydrated]);

  const addProject = useCallback(
    (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "memberCount">) => {
      const newProject: Project = {
        ...data,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: [],
        memberCount: 1,
      };
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    }, []
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const unlockProject = useCallback((id: string) => {
    setUnlockedProjectIds((prev) => new Set([...prev, id]));
  }, []);

  const addTask = useCallback((projectId: string, taskData: Omit<Task, "id" | "updatedAt">) => {
    const newTask: Task = { ...taskData, id: `task-${Date.now()}`, updatedAt: new Date().toISOString() };
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask], updatedAt: new Date().toISOString() } : p));
  }, []);

  const updateTask = useCallback((projectId: string, taskId: string, updates: Partial<Task>) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t), updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId), updatedAt: new Date().toISOString() } : p));
  }, []);

  const moveTask = useCallback((projectId: string, taskId: string, newStatus: TaskStatus) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t), updatedAt: new Date().toISOString() } : p));
  }, []);

  const addMember = useCallback((data: Omit<TeamMember, "id" | "joinedAt">) => {
    setMembers((prev) => [...prev, { ...data, id: `m-${Date.now()}`, joinedAt: new Date().toISOString() }]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const resetData = useCallback(() => {
    setProjects(SEED_PROJECTS);
    setMembers(SEED_MEMBERS);
    try {
      localStorage.removeItem("architect_projects");
      localStorage.removeItem("architect_members");
    } catch {}
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, members, unlockedProjectIds, addProject, updateProject, deleteProject, unlockProject, addTask, updateTask, deleteTask, moveTask, addMember, removeMember, updateMember, resetData }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
