import BoardSelectorClient from "./BoardSelectorClient";

export const metadata = {
  title: "Kanban Boards | Zendo",
  description: "Select a project to view and manage its Kanban board.",
};

export default function BoardSelectorPage() {
  return <BoardSelectorClient />;
}
