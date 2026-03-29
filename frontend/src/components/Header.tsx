
import { Bell } from 'lucide-react';

/**
 * Main application navigation header with quick links.
 */
export function Header() {
  return (
    <header className="h-20 border-b border-[#1e2336] bg-[#0d101b]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-black tracking-wider text-white">Korena<span className="text-cyan-400">.gg</span></h1>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="text-white border-b-2 border-cyan-400 pb-1">Home</a>
          <a href="#" className="hover:text-white transition-colors pb-1 border-b-2 border-transparent">Profile</a>
          <a href="#" className="hover:text-white transition-colors pb-1 border-b-2 border-transparent">Tierlist</a>
          <a href="#" className="hover:text-white transition-colors pb-1 border-b-2 border-transparent">Skins</a>
        </nav>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        
        <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:opacity-90 transition-opacity">
          Sign Up
        </button>
      </div>
    </header>
  );
}
