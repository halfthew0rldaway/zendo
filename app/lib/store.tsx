"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "../../utils/supabase/client";
import { Project, Task, TaskStatus, ProjectMember } from "../types";

export interface UserProfile {
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface ProjectStore {
  projects: Project[];
  unlockedProjectIds: Set<string>;
  currentUserId: string | null;
  currentProfile: UserProfile | null;
  loading: boolean;
  notifications: any[];
  addProject: (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "memberCount" | "members">) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  unlockProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  moveTask: (projectId: string, taskId: string, newStatus: TaskStatus) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  inviteUserToProject: (projectId: string, username: string, role: string) => Promise<{ success: boolean; error?: string }>;
  resetData: () => void;
  signOut: () => Promise<void>;
}

const ProjectContext = createContext<ProjectStore | null>(null);

function dbRowToProject(row: Record<string, unknown>, tasks: Task[] = [], members: ProjectMember[] = []): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    pin: (row.pin_hash as string) ?? null,
    icon: (row.icon as string) ?? "apartment",
    iconBg: ((row.icon_bg as string) ?? "primary") as Project["iconBg"],
    dueDate: (row.due_date as string) ?? null,
    sprintGoal: (row.sprint_goal as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    memberCount: (row.member_count !== null && row.member_count !== undefined) ? (row.member_count as number) : (members.length || 1),
    tasks,
    members,
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
    testingStatus: (row.testing_status as Task["testingStatus"]) ?? "not_tested",
    testingNotes: (row.testing_notes as string) ?? "",
    githubLink: (row.github_link as string) ?? "",
    assigneeId: (row.assignee_id as string) ?? null,
    assigneeInitials: (row.assignee_initials as string) ?? "?",
    assigneeName: (row.assignee_name as string) ?? "Unassigned",
    dueDate: (row.due_date as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [supabase] = useState(() => createClient());

  // Load current user and their projects
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);

      // Fetch user profile
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .single();
        
      if (profileRow) {
        setCurrentProfile({
          username: profileRow.username,
          fullName: profileRow.full_name,
          avatarUrl: profileRow.avatar_url,
        });
      }

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

      // Fetch persistent notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(notifData ?? []);

      const tasksByProject: Record<string, Task[]> = {};
      for (const row of taskRows ?? []) {
        const r = row as Record<string, unknown>;
        const pid = row.project_id as string;
        if (!tasksByProject[pid]) tasksByProject[pid] = [];
        tasksByProject[pid].push(dbRowToTask(r));
      }

      // Fetch all members for these projects
      const { data: allMembersRow } = await supabase
        .from("project_members")
        .select(`
          project_id,
          role,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .in("project_id", projectIds);
      
      const membersByProject: Record<string, ProjectMember[]> = {};
      for (const row of allMembersRow ?? []) {
        const pid = row.project_id as string;
        if (!membersByProject[pid]) membersByProject[pid] = [];
        const profilesData = row.profiles;
        const profile = Array.isArray(profilesData) ? profilesData[0] : profilesData;
        if (profile) {
          membersByProject[pid].push({
            id: profile.id,
            projectId: pid,
            username: profile.username,
            role: row.role as string,
            avatarUrl: profile.avatar_url,
          });
        }
      }

      setProjects(projectRows.map((r) => dbRowToProject(r as Record<string, unknown>, tasksByProject[r.id] ?? [], membersByProject[r.id] ?? [])));
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: task changes & Notifications
  useEffect(() => {
    const channel = supabase
      .channel("changes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        setProjects((prev) => {
          if (payload.eventType === "INSERT") {
            const t = dbRowToTask(payload.new as Record<string, unknown>);
            const pid = (payload.new as Record<string, unknown>).project_id as string;
            return prev.map((p) => p.id === pid 
              ? { ...p, tasks: p.tasks.find(tk => tk.id === t.id) ? p.tasks : [...p.tasks, t] } 
              : p
            );
          }
          if (payload.eventType === "UPDATE") {
            const t = dbRowToTask(payload.new as Record<string, unknown>);
            const pid = (payload.new as Record<string, unknown>).project_id as string;
            return prev.map((p) => p.id === pid ? { ...p, tasks: p.tasks.map((task) => task.id === t.id ? t : task) } : p);
          }
          if (payload.eventType === "DELETE") {
            const pid = (payload.old as Record<string, unknown>).project_id as string;
            const tid = (payload.old as Record<string, unknown>).id as string;
            return prev.map((p) => p.id === pid ? { ...p, tasks: p.tasks.filter((t) => t.id !== tid) } : p);
          }
          return prev;
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev.slice(0, 19)]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const addProject = useCallback(async (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks" | "memberCount" | "members">) => {
    if (!currentUserId) {
      console.error("Cannot create project: No current user ID");
      return null;
    }

    const { data: row, error } = await supabase
      .from("projects")
      .insert({
        name: data.name,
        description: data.description,
        pin_hash: data.pin ?? null,
        icon: data.icon,
        icon_bg: data.iconBg,
        due_date: data.dueDate ?? null,
        sprint_goal: data.sprintGoal ?? null,
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

    // Create owner member entity locally
    const ownerMember = {
      id: currentUserId,
      projectId: row.id,
      username: currentProfile?.username ?? "You",
      role: "owner",
      avatarUrl: currentProfile?.avatarUrl ?? null
    };

    const project = dbRowToProject(row as Record<string, unknown>, [], [ownerMember]);
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
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.sprintGoal !== undefined) dbUpdates.sprint_goal = updates.sprintGoal;
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

  const addTask = useCallback(async (projectId: string, taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
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
        github_link: taskData.githubLink,
        assignee_id: taskData.assigneeId,
        assignee_name: taskData.assigneeName,
        assignee_initials: taskData.assigneeInitials,
        due_date: taskData.dueDate ?? null,
      })
      .select()
      .single();

    // Create persistent notification
    await supabase.from("notifications").insert({
      user_id: currentUserId,
      actor_id: currentUserId,
      project_id: projectId,
      type: "task_added",
      content: `${currentProfile?.username ?? "Anonymous"} added task "${row.title}"`
    });

    const newTask = dbRowToTask(row as Record<string, unknown>);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, tasks: [...p.tasks, newTask], updatedAt: new Date().toISOString() } : p
    ));
  }, [currentUserId, currentProfile]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updates: Partial<Task>) => {
    const dbUpdates: Record<string, unknown> = { 
      updated_at: new Date().toISOString()
    };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.labels !== undefined) dbUpdates.labels = updates.labels;
    if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
    if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
    if (updates.testingNotes !== undefined) dbUpdates.testing_notes = updates.testingNotes;
    if (updates.testingStatus !== undefined) dbUpdates.testing_status = updates.testingStatus;
    if (updates.githubLink !== undefined) dbUpdates.github_link = updates.githubLink;
    // Don't auto-override assignee on every update unless explicitly requested. 
    // The instructions say "Update updated_at on every edit" but doesn't mention auto-assigning. 
    // Let's only update if explicitly provided
    if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId;
    if (updates.assigneeName !== undefined) dbUpdates.assignee_name = updates.assigneeName;
    if (updates.assigneeInitials !== undefined) dbUpdates.assignee_initials = updates.assigneeInitials;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

    // Create persistent notification for real-time feed
    let notifType = "task_updated";
    let content = `${currentProfile?.username ?? "Anonymous"} updated task "${updates.title || 'a task'}"`;
    
    if (updates.status) {
      notifType = "task_moved";
      content = `${currentProfile?.username ?? "Anonymous"} moved task to ${updates.status.replace('_', ' ')}`;
    } else if (updates.testingStatus) {
      notifType = "task_tested";
      content = `${currentProfile?.username ?? "Anonymous"} marked task as ${updates.testingStatus.replace('_', ' ')}`;
    }

    await supabase.from("notifications").insert({
      user_id: currentUserId,
      actor_id: currentUserId,
      project_id: projectId,
      type: notifType,
      content: content
    });

    setProjects((prev) => prev.map((p) =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: dbUpdates.updated_at as string } : t), updatedAt: new Date().toISOString() }
        : p
    ));
  }, [currentUserId, currentProfile, supabase]);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTask = useCallback(async (projectId: string, taskId: string, newStatus: TaskStatus) => {
    const ts = new Date().toISOString();
    const actorName = currentProfile?.username ?? "Anonymous";
    const actorInitials = currentProfile?.username ? currentProfile.username.slice(0, 2).toUpperCase() : "??";
    
    await supabase.from("tasks").update({ 
      status: newStatus, 
      updated_at: ts,
      assignee_id: currentUserId,
      assignee_name: actorName,
      assignee_initials: actorInitials
    }).eq("id", taskId);

    // Create persistent notification for move
    await supabase.from("notifications").insert({
      user_id: currentUserId,
      actor_id: currentUserId,
      project_id: projectId,
      type: "task_moved",
      content: `${actorName} moved a task to ${newStatus.replace('_', ' ')}`
    });

    setProjects((prev) => prev.map((p) =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus, updatedAt: ts, assigneeName: actorName, assigneeInitials: actorInitials } : t), updatedAt: new Date().toISOString() }
        : p
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, currentProfile]);

  const inviteUserToProject = useCallback(async (projectId: string, username: string, role: string) => {
    // Lookup user by username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", username)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "User not found" };
    }

    // Map UI role to DB role, assuming DB accepts 'owner', 'member', 'viewer'
    let dbRole = "member";
    if (role === "Admin") dbRole = "owner";
    if (role === "Viewer") dbRole = "viewer";

    // Insert into project_members
    const { error: insertError } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: profile.id,
        role: dbRole
      });

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        return { success: false, error: "User is already a member" };
      }
      return { success: false, error: insertError.message };
    }

    // Increment member count and add member object in local state 
    setProjects((prev) => prev.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          memberCount: p.memberCount + 1,
          members: [...p.members, {
            id: profile.id,
            projectId: projectId,
            username: profile.username,
            role: dbRole,
            avatarUrl: profile.avatar_url
          }]
        };
      }
      return p;
    }));
    
    return { success: true };
  }, []);

  const markNotificationsRead = useCallback(async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const resetData = useCallback(() => {
    setProjects([]);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProjects([]);
    setCurrentUserId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects, unlockedProjectIds, currentUserId, currentProfile, loading, notifications,
      addProject, updateProject, deleteProject, unlockProject,
      addTask, updateTask, deleteTask, moveTask,
      markNotificationsRead, inviteUserToProject, resetData, signOut,
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
