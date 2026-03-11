export default function Header() {
  return (
    <header className="bg-navy text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="North Olmsted Eagles" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain" />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide leading-tight">
            Coach Cutoff
          </h1>
          <p className="text-sm text-gold opacity-90">Baseball Relay Throws for Young Players</p>
        </div>
        <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="North Olmsted Eagles" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain" />
      </div>
    </header>
  )
}
