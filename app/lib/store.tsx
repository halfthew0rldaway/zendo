"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "../../utils/supabase/client";
import { Project, Task, TaskStatus, TeamMember } from "../types";

interface ProjectStore {
  projects: Project[];
  members: TeamMember[];
  unlockedProjectIds: Set<string>;
  currentUserId: string | null;
  loading: boolean;
  addProject: (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "memberCount">) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  unlockProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<Task, "id" | "updatedAt">) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  moveTask: (projectId: string, taskId: string, newStatus: TaskStatus) => Promise<void>;
  addMember: (member: Omit<TeamMember, "id" | "joinedAt">) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  resetData: () => void;
  signOut: () => Promise<void>;
}

const ProjectContext = createContext<ProjectStore | null>(null);

function dbRowToProject(row: Record<string, unknown>, tasks: Task[] = []): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    pin: (row.pin_hash as string) ?? null,
    icon: (row.icon as string) ?? "apartment",
    iconBg: ((row.icon_bg as string) ?? "primary") as Project["iconBg"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    memberCount: (row.member_count as number) ?? 1,
    tasks,
  };
}

function dbRowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: (row.status as TaskStatus) ?? "todo",
    priority: (row.priority as Task["priority"]) ?? "medium",
    labels: (row.labels as Task["labels"]) ?? [],
    checklist: (row.checklist as Task["checklist"]) ?? [],
    attachments: (row.attachments as Task["attachments"]) ?? [],
    testingNotes: (row.testing_notes as string) ?? "",
    assigneeInitials: (row.assignee_initials as string) ?? "?",
    assigneeName: (row.assignee_name as string) ?? "Unassigned",
    updatedAt: row.updated_at as string,
  };
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Load current user and their projects
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);

      // Fetch projects the user is a member of
      const { data: memberRows } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      const projectIds = memberRows?.map((r) => r.project_id) ?? [];

      if (projectIds.length === 0) { setProjects([]); setLoading(false); return; }

      const { data: projectRows } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("created_at", { ascending: false });

      if (!projectRows) { setLoading(false); return; }

      // Fetch all tasks for these projects
      const { data: taskRows } = await supabase
        .from("tasks")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: true });

      const tasksByProject: Record<string, Task[]> = {};
      for (const row of taskRows ?? []) {
        const r = row as Record<string, unknown>;
        const pid = row.project_id as string;
        if (!tasksByProject[pid]) tasksByProject[pid] = [];
        tasksByProject[pid].push(dbRowToTask(r));
      }

      setProjects(projectRows.map((r) => dbRowToProject(r as Record<string, unknown>, tasksByProject[r.id] ?? [])));
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: task changes
  useEffect(() => {
    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        setProjects((prev) => {
          if (payload.eventType === "INSERT") {
            const t = dbRowToTask(payload.new as Record<string, unknown>);
            return prev.map((p) =>
              p.id === t.id ? p : p.id === (payload.new as Record<string, unknown>).project_id as string
                ? { ...p, tasks: [...p.tasks, t] } : p
            );
          }
          if (payload.eventType === "UPDATE") {
            const t = dbRowToTask(payload.new as Record<string, unknown>);
            const pid = (payload.new as Record<string, unknown>).project_id as string;
            return prev.map((p) =>
              p.id === pid ? { ...p, tasks: p.tasks.map((task) => task.id === t.id ? t : task) } : p
            );
          }
          if (payload.eventType === "DELETE") {
            const pid = (payload.old as Record<string, unknown>).project_id as string;
            const tid = (payload.old as Record<string, unknown>).id as string;
            return prev.map((p) =>
              p.id === pid ? { ...p, tasks: p.tasks.filter((t) => t.id !== tid) } : p
            );
          }
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProject = useCallback(async (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "memberCount">) => {
    if (!currentUserId) {
      console.error("Cannot create project: No current user ID");
      return null;
    }

    const { data: row, error } = await supabase
      .from("projects")
      .insert({
        name: data.name,
        description: data.description,
        pin: data.pin ?? null,
        icon: data.icon,
        icon_bg: data.iconBg,
        owner_id: currentUserId,
      })
      .select()
      .single();

    if (error || !row) {
      const msg = error?.message || "Unknown error";
      console.error("Project creation error:", error);
      alert("Project Create Failed: " + msg + "\nDetails: " + (error as any)?.details);
      return null;
    }

    // Add creator as owner member
    const { error: memberError } = await supabase.from("project_members").insert({
      project_id: row.id,
      user_id: currentUserId,
      role: "owner",
    });

    if (memberError) {
      console.error("Add member error:", memberError.message);
    }

    const project = dbRowToProject(row as Record<string, unknown>);
    setProjects((prev) => [project, ...prev]);
    return project;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.pin !== undefined) dbUpdates.pin_hash = updates.pin;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.iconBg !== undefined) dbUpdates.icon_bg = updates.iconBg;
    dbUpdates.updated_at = new Date().toISOString();

    await supabase.from("projects").update(dbUpdates).eq("id", id);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: dbUpdates.updated_at as string } : p));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlockProject = useCallback((id: string) => {
    setUnlockedProjectIds((prev) => new Set([...prev, id]));
  }, []);

  const addTask = useCallback(async (projectId: string, taskData: Omit<Task, "id" | "updatedAt">) => {
    const { data: row, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        labels: taskData.labels,
        checklist: taskData.checklist,
        attachments: taskData.attachments,
        testing_notes: taskData.testingNotes,
        assignee_name: taskData.assigneeName,
        assignee_initials: taskData.assigneeInitials,
      })
      .select()
      .single();

    if (error || !row) return;
    const newTask = dbRowToTask(row as Record<string, unknown>);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, tasks: [...p.tasks, newTask], updatedAt: new Date().toISOString() } : p
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTask = useCallback(async (projectId: string, taskId: string, updates: Partial<Task>) => {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.labels !== undefined) dbUpdates.labels = updates.labels;
    if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
    if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
    if (updates.testingNotes !== undefined) dbUpdates.testing_notes = updates.testingNotes;
    if (updates.assigneeName !== undefined) dbUpdates.assignee_name = updates.assigneeName;
    if (updates.assigneeInitials !== undefined) dbUpdates.assignee_initials = updates.assigneeInitials;

    await supabase.from("tasks").update(dbUpdates).eq("id", taskId);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: dbUpdates.updated_at as string } : t), updatedAt: new Date().toISOString() }
        : p
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTask = useCallback(async (projectId: string, taskId: string, newStatus: TaskStatus) => {
    await supabase.from("tasks").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", taskId);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t) }
        : p
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Members — still managed locally for now (team page uses project_members join from DB)
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
    setProjects([]);
    setMembers([]);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProjects([]);
    setMembers([]);
    setCurrentUserId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects, members, unlockedProjectIds, currentUserId, loading,
      addProject, updateProject, deleteProject, unlockProject,
      addTask, updateTask, deleteTask, moveTask,
      addMember, removeMember, updateMember, resetData, signOut,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
