export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "review" | "testing" | "done";

export interface Label {
  id: string;
  name: string;
  color: "primary" | "secondary" | "tertiary" | "error";
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "link" | "file";
  icon: string;
  subtitle: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  labels: Label[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  testingNotes: string;
  assigneeInitials: string;
  assigneeName: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  order: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  pin: string | null;
  icon: string;
  iconBg: "primary" | "secondary" | "tertiary";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  memberCount: number;
  members: ProjectMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
  joinedAt: string;
}
