import { ProjectProvider } from "../lib/store";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

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
