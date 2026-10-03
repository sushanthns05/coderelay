import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-neon-green/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-mono font-bold tracking-tighter text-white">
            <span className="text-neon-green">CODE</span>_RELAY
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="#rounds" className="hover:text-white transition-colors">Rounds</Link>
            <Link href="#schedule" className="hover:text-white transition-colors">Schedule</Link>
            <Link href="#rules" className="hover:text-white transition-colors">Rules</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">Log in</Link>
            <Link href="/login" className="bg-white text-black px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-200 transition-colors">
              Register Team
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-green/10 via-black to-black -z-10"></div>
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-mono font-bold mb-6 tracking-tight leading-tight">
            The Ultimate Live <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
              Coding Arena
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            [EVENT DESCRIPTION - TBD] Form a team, write fast code, outbid your rivals, and pass the baton. 
            Four intense rounds to prove your mettle.
          </p>
          
          {/* TBD Countdown Widget */}
          <div className="flex justify-center gap-4 mb-12 font-mono">
            {[ {label: 'DAYS', val: '00'}, {label: 'HOURS', val: '00'}, {label: 'MINS', val: '00'}, {label: 'SECS', val: '00'} ].map(item => (
              <div key={item.label} className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-lg min-w-[80px]">
                <span className="text-3xl font-bold">{item.val}</span>
                <span className="text-xs text-gray-500 mt-1">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-3 bg-neon-green text-black font-bold rounded-md hover:bg-neon-green/90 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]">
              Join the Arena
            </Link>
            <Link href="#rounds" className="w-full sm:w-auto px-8 py-3 bg-white/5 text-white font-medium rounded-md hover:bg-white/10 transition-colors border border-white/10">
              Explore Rounds
            </Link>
          </div>
        </div>
      </section>

      {/* Rounds Overview */}
      <section id="rounds" className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">The 4 Stages</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Prepare for four distinct challenges designed to test different aspects of your engineering skills.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RoundCard 
              num="01" 
              title="CODE IQ" 
              desc="[ROUND 1 DETAILS - TBD] Timed aptitude and code output questions. Predict, debug, and answer fast."
              color="border-blue-500/30" 
            />
            <RoundCard 
              num="02" 
              title="TRIPLE STRIKE" 
              desc="[ROUND 2 DETAILS - TBD] Three attempts, three problems. Strike out and you're locked out."
              color="border-red-500/30" 
            />
            <RoundCard 
              num="03" 
              title="CODE AUCTION" 
              desc="[ROUND 3 DETAILS - TBD] Bid virtual points on problems. Highest valid bid wins the rights to solve."
              color="border-yellow-500/30" 
            />
            <RoundCard 
              num="04" 
              title="RELAY FINALE" 
              desc="[ROUND 4 DETAILS - TBD] Teammates take turns coding the same solution. Pass the baton before time runs out."
              color="border-neon-green/30" 
            />
          </div>
        </div>
      </section>
      
      {/* More sections (Schedule, Rules, FAQ) can be built dynamically from config later */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-mono font-bold mb-6">[MORE EVENT INFO - TBD]</h2>
          <p className="text-gray-500">
            Schedule, Rules, Venue, and Prizes will be announced soon. 
            Check back later for updates managed by the event administrators.
          </p>
        </div>
      </section>

    </main>
  );
}

function RoundCard({ num, title, desc, color }: { num: string, title: string, desc: string, color: string }) {
  return (
    <div className={`p-8 bg-black border ${color} rounded-xl relative overflow-hidden group hover:bg-white/[0.02] transition-colors`}>
      <div className="text-5xl font-mono font-bold text-white/5 absolute -right-2 -top-4 select-none group-hover:text-white/10 transition-colors">
        {num}
      </div>
      <h3 className="text-xl font-mono font-bold mb-3 flex items-center gap-3">
        <span className="text-xs bg-white/10 px-2 py-1 rounded">ROUND {num}</span>
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed relative z-10">
        {desc}
      </p>
    </div>
  )
}
