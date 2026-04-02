import type { Metadata } from "next";
import CreateProjectClient from "./CreateProjectClient";

export const metadata: Metadata = {
  title: "Create Project | Zendo",
  description: "Establish the structural foundation for your new workspace.",
};

export default function CreateProjectPage() {
  return <CreateProjectClient />;
}
