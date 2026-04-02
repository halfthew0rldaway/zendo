import type { Metadata } from "next";
import KanbanBoardClient from "./KanbanBoardClient";

export const metadata: Metadata = {
  title: "Kanban Board | Architect",
  description: "Manage tasks with a visual kanban board.",
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KanbanBoardClient projectId={id} />;
}
