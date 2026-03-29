
import { Home, User, List, Shield, Settings } from 'lucide-react';

/**
 * Functional compact sidebar spanning main application categories.
 */
export function Sidebar() {
  return (
    <aside className="w-16 lg:w-20 bg-[#090b14] border-r border-[#1e2336] flex flex-col items-center py-6 h-screen sticky top-0 shrink-0 z-50">
      <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-xl mb-8 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
         <span className="text-white font-bold text-lg">K</span>
      </div>
      
      <nav className="flex flex-col gap-6 w-full items-center">
        <button className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-colors">
          <Home size={22} />
        </button>
        <button className="p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors">
          <User size={22} />
        </button>
        <button className="p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors">
          <List size={22} />
        </button>
        <button className="p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors">
          <Shield size={22} />
        </button>
      </nav>
      
      <div className="mt-auto flex flex-col gap-6">
        <button className="p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors">
          <Settings size={22} />
        </button>
      </div>
    </aside>
  );
}
