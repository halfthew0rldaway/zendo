import { ProjectProvider } from "../lib/store";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// Force dynamic rendering so Supabase env vars are available at request time, not build time
export const dynamic = "force-dynamic";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TopBar />
          <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
}
