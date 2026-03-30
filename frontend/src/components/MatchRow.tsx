

export interface MatchData {
  match_id: string
  win: boolean
  kills: number
  deaths: number
  assists: number
  champion_name: string
  game_duration: number
  game_creation: number
  queue_id: number
}

interface MatchRowProps {
  match: MatchData
  ddragonVersion: string
}

const QUEUE_MAP: Record<number, string> = {
  420: 'Ranked Solo/Duo',
  440: 'Ranked Flex',
  400: 'Draft Pick',
  430: 'Blind Pick',
  450: 'ARAM'
}

export function MatchRow({ match, ddragonVersion }: MatchRowProps) {
  const isWin = match.win
  // OP.GG style color tokens
  const bgColor = isWin ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'
  const indicatorColor = isWin ? 'bg-blue-500' : 'bg-red-500'
  const textColor = isWin ? 'text-blue-400' : 'text-red-400'
  
  const minutes = Math.floor(match.game_duration / 60)
  const seconds = match.game_duration % 60
  
  // E.g 'Talon' to 'Talon_0.jpg' wrapper implicitly handled by champion splash, but for small icons OP.GG uses square. 
  // DDragon format for squares: http://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{name}.png
  const champIcon = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${match.champion_name}.png`
  
  const queueName = QUEUE_MAP[match.queue_id] || 'Normal'
  const kda = match.deaths > 0 ? ((match.kills + match.assists) / match.deaths).toFixed(2) : 'Perfect'

  // Time Ago
  const diffMs = Date.now() - match.game_creation;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const timeAgo = diffDays > 0 ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago` : (diffHours > 0 ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` : 'Just now');

  // Porofessor Style Tags
  const tags: Array<{label: string, color: string}> = []
  const kdaNum = match.deaths > 0 ? (match.kills + match.assists) / match.deaths : 10
  
  if (isWin && kdaNum >= 3.0) {
    tags.push({ label: 'MVP', color: 'bg-amber-500 text-[#090b14]' })
  } else if (!isWin && kdaNum >= 3.0) {
    tags.push({ label: 'ACE', color: 'bg-purple-500 text-white' })
  }
  
  if (match.kills + match.assists >= 25) {
    tags.push({ label: 'Bloodbath', color: 'bg-rose-500 text-white' })
  }
  
  if (match.game_duration < 15 * 60) {
    tags.push({ label: 'Fast Paced', color: 'bg-emerald-500 text-[#090b14]' })
  }

  // Fallback
  if (tags.length === 0) {
    tags.push({ label: 'Parsed', color: 'bg-black/20 ' + textColor })
  }

  return (
    <div className={`relative flex items-center justify-between p-3 rounded-xl border ${bgColor} overflow-hidden shadow-sm transition-transform hover:scale-[1.01] duration-300 group`}>
      {/* Left state indicator */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${indicatorColor}`} />

      {/* Basic Match Description */}
      <div className="flex flex-col w-32 pl-4 pr-2">
        <span className={`text-xs font-black ${textColor}`}>{queueName}</span>
        <span className="text-xs text-slate-500 font-medium">{timeAgo}</span>
        <div className={`w-8 h-[1px] my-1 ${isWin ? 'bg-blue-500/30' : 'bg-red-500/30'}`}></div>
        <span className={`text-xs font-bold ${textColor}`}>{isWin ? 'Victory' : 'Defeat'}</span>
        <span className="text-xs text-slate-400 font-medium">{minutes}m {seconds}s</span>
      </div>

      {/* Champion Picture & Spells */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            src={champIcon} 
            alt={match.champion_name}
            className="w-14 h-14 rounded-full border-2 border-[#1e2336] shadow-xl group-hover:scale-110 transition-transform origin-center bg-[#090b14]" 
            onError={(e) => {
              // Fallback to placeholder or splash mechanism
              // Some champions need formatting (e.g., Wukong -> MonkeyKing)
              (e.target as HTMLImageElement).src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/0.jpg'
            }}
          />
        </div>
      </div>

      {/* KDA Column */}
      <div className="flex flex-col items-center justify-center w-32">
        <div className="text-sm font-black text-white tracking-widest">
          {match.kills} <span className="text-slate-500 font-medium">/</span> <span className="text-rose-500">{match.deaths}</span> <span className="text-slate-500 font-medium">/</span> {match.assists}
        </div>
        <span className="text-xs text-slate-400 font-bold mt-1">{kda}:1 KDA</span>
      </div>
      
      {/* Dynamic Placeholder for UI weight */}
      <div className="flex-1 hidden md:flex items-center justify-end px-4 gap-2">
         {tags.map((t, idx) => (
            <span key={idx} className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded ${t.color}`}>
              {t.label}
            </span>
         ))}
      </div>
    </div>
  )
}
