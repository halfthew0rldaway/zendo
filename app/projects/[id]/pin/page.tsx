import type { Metadata } from "next";
import PinAccessClient from "./PinAccessClient";

export const metadata: Metadata = {
  title: "Unlock Project | Architect",
  description: "Enter your secure access PIN to proceed.",
};

export default async function PinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PinAccessClient projectId={id} />;
}
