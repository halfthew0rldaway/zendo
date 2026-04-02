import { ProjectProvider } from "../lib/store";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import MobileNav from "../components/MobileNav";

// Force dynamic rendering so Supabase env vars are available at request time, not build time
export const dynamic = "force-dynamic";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#f8f9fa] pb-[60px] md:pb-0">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <TopBar />
          <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {children}
          </div>
        </div>
        <MobileNav />
      </div>
    </ProjectProvider>
  );
}
