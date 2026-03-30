import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useSearchParams } from 'react-router-dom';

const ROLES = [
  { id: '', label: 'All Roles', icon: '🌍' },
  { id: 'TOP', label: 'Top', icon: '🛡️' },
  { id: 'JUNGLE', label: 'Jungle', icon: '🌲' },
  { id: 'MIDDLE', label: 'Mid', icon: '🌪️' },
  { id: 'BOTTOM', label: 'Bot', icon: '🏹' },
  { id: 'UTILITY', label: 'Support', icon: '🪄' }
];

const REGIONS = [
  { id: 'KR', label: 'Korea' },
  { id: 'NA1', label: 'NA' },
  { id: 'EUW1', label: 'EUW' },
  { id: 'LA2', label: 'LAS' },
  { id: 'LA1', label: 'LAN' },
  { id: 'BR1', label: 'Brazil' },
  { id: 'JP1', label: 'Japan' }
];

/**
 * Main application navigation header housing global search.
 */
export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchPlayer, loading } = usePlayer();
  
  const [gameName, setGameName] = useState(searchParams.get('name') || 'Hide on bush');
  const [tagLine, setTagLine] = useState(searchParams.get('tag') || 'KR1');
  const [region, setRegion] = useState(searchParams.get('region') || 'KR');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');

  useEffect(() => {
    const searchName = searchParams.get('name') || 'Hide on bush';
    const searchTag = searchParams.get('tag') || 'KR1';
    const searchReg = searchParams.get('region') || 'KR';
    const searchRole = searchParams.get('role') || '';
    
    searchPlayer(searchReg, searchName, searchTag, searchRole || undefined);
    
    if (!searchParams.get('name')) {
      const params = new URLSearchParams();
      params.set('region', searchReg);
      params.set('name', searchName);
      params.set('tag', searchTag);
      if (searchRole) params.set('role', searchRole);
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (gameName && tagLine) {
      const params = new URLSearchParams();
      params.set('region', region);
      params.set('name', gameName);
      params.set('tag', tagLine);
      if (selectedRole) params.set('role', selectedRole);
      setSearchParams(params);
      
      searchPlayer(region, gameName, tagLine, selectedRole || undefined);
    }
  };

  return (
    <header className="h-20 border-b border-[#1e2336] bg-[#111424] overflow-hidden flex items-center justify-between px-8 sticky top-0 z-40 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-wider text-white mb-0.5">korena<span className="text-cyan-400">.gg</span></h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Global Multi-Role Intelligent Benchmark Feed</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex bg-[#111424] p-1.5 rounded-full border border-[#1e2336] shadow-inner focus-within:ring-2 ring-cyan-500/50 transition-all items-center">
            <select 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent outline-none text-slate-400 font-bold text-xs px-3 border-r border-[#1e2336] appearance-none cursor-pointer"
            >
              {REGIONS.map(r => <option key={r.id} value={r.id} className="bg-[#111424]">{r.label}</option>)}
            </select>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent outline-none text-slate-300 font-medium text-sm pl-3 pr-2 border-r border-[#1e2336] appearance-none cursor-pointer"
            >
              {ROLES.map(r => <option key={r.id} value={r.id} className="bg-[#111424]">{r.icon} {r.label}</option>)}
            </select>
            <input 
              value={gameName} 
              onChange={e => setGameName(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-40 md:w-48 bg-transparent px-3 py-1.5 outline-none text-white placeholder:text-slate-500 font-medium text-sm" 
              placeholder="Riot ID" 
            />
            <div className="w-[1px] h-4 bg-[#1e2336] mx-1"></div>
            <input 
              value={tagLine} 
              onChange={e => setTagLine(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-16 bg-transparent px-2 py-1.5 outline-none text-slate-300 placeholder:text-slate-500 font-medium text-sm" 
              placeholder="#KR1" 
            />
            <button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-[#090b14] p-2 rounded-full transition-colors disabled:opacity-50 ml-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
            </button>
        </div>
      </div>
    </header>
  );
}
