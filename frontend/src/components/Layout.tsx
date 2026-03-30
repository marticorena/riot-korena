import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Base Application Layout wrapping main structural sidebar and header.
 * @param props - React implicit children.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0d101b] text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto bg-[#0d101b] flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
