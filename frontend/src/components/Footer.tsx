/**
 * Global application footer with required compliance boilerplate.
 */
export function Footer() {
  return (
    <footer className="w-full bg-[#090b14] border-t border-[#1e2336] py-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto text-center mb-6">
          Korena is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
        </p>
        <div className="w-24 h-px bg-[#1e2336] mb-6"></div>
        <p className="text-xs font-bold text-slate-600 tracking-wider">
          © KORENA 2026. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
