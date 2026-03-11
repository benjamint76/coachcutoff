export default function Header() {
  return (
    <header className="bg-navy text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <img src="/logo.jpg" alt="North Olmsted Eagles" className="h-16 w-16 rounded-full object-cover" />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide leading-tight">
            Coach Cutoff
          </h1>
          <p className="text-sm text-gold opacity-90">Baseball Relay Throws for Young Players</p>
        </div>
        <img src="/logo.jpg" alt="North Olmsted Eagles" className="h-16 w-16 rounded-full object-cover" />
      </div>
    </header>
  )
}
