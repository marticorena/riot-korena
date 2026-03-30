import { Activity, Crosshair, Trophy, Settings, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';

/**
 * Functional compact sidebar spanning main application categories.
 */
export function Sidebar() {
  const getLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `p-3 rounded-xl transition-colors relative group flex items-center justify-center ${
      isActive 
        ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_2px_0_0_#06b6d4]' 
        : 'text-slate-500 hover:text-slate-300 hover:bg-[#1e2336]/50'
    }`

  return (
    <aside className="w-16 lg:w-20 bg-[#090b14] border-r border-[#1e2336] flex flex-col items-center py-6 h-screen sticky top-0 shrink-0 z-50">
      <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-xl mb-8 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
         <span className="text-white font-bold text-lg">K</span>
      </div>
      
      <nav className="flex flex-col gap-4 w-full px-2">
        <NavLink to="/" end className={getLinkClasses} title="Overview Dashboard">
          <Home size={22} className="relative z-10" />
        </NavLink>
        <NavLink to="/moments" className={getLinkClasses} title="Critical Moments">
          <Activity size={22} className="relative z-10" />
        </NavLink>
        <NavLink to="/habits" className={getLinkClasses} title="Core Habits">
          <Crosshair size={22} className="relative z-10" />
        </NavLink>
        <NavLink to="/training" className={getLinkClasses} title="Training Plan">
          <Trophy size={22} className="relative z-10" />
        </NavLink>
      </nav>
      
      <div className="mt-auto flex flex-col gap-6 w-full items-center">
        <button className="p-3 text-slate-500/50 cursor-not-allowed rounded-xl relative group">
          <Settings size={22} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-[10px] font-black tracking-widest uppercase text-slate-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">WIP</span>
        </button>
      </div>
    </aside>
  );
}
