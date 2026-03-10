export default function Header() {
  return (
    <header className="bg-navy text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
        <span className="text-4xl" role="img" aria-label="baseball">⚾</span>
        <div>
          <h1 className="text-2xl font-bold tracking-wide leading-tight">
            Coach Cutoff
          </h1>
          <p className="text-sm text-gold opacity-90">Baseball Relay Throws for Young Players</p>
        </div>
      </div>
    </header>
  )
}
