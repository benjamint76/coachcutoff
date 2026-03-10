const TABS = [
  { id: 'learn',     label: '📖 Learn',     short: 'Learn' },
  { id: 'positions', label: '🗺️ Positions',  short: 'Positions' },
  { id: 'technique', label: '🤾 Technique',  short: 'Technique' },
  { id: 'quiz',      label: '🧠 Quiz',       short: 'Quiz' },
]

export default function NavBar({ active, onChange }) {
  return (
    <nav className="bg-white border-b-2 border-field shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 px-2 text-sm sm:text-base font-semibold transition-colors
              ${active === tab.id
                ? 'bg-field text-white border-b-4 border-gold'
                : 'text-navy hover:bg-field-light hover:text-white'
              }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
