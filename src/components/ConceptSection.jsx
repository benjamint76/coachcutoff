import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function BallAnimation() {
  return (
    <svg viewBox="0 0 400 100" className="w-full max-w-lg mx-auto my-6" aria-label="relay throw animation">
      {/* Ground line */}
      <line x1="0" y1="80" x2="400" y2="80" stroke="#c2a06e" strokeWidth="3" />

      {/* Outfielder */}
      <circle cx="30" cy="60" r="14" fill="#2d6a4f" />
      <text x="30" y="65" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">OF</text>
      <text x="30" y="95" textAnchor="middle" fontSize="10" fill="#1a2744">Outfielder</text>

      {/* Cutoff man */}
      <circle cx="200" cy="60" r="14" fill="#f5a623" />
      <text x="200" y="65" textAnchor="middle" fontSize="11" fill="#1a2744" fontWeight="bold">CUT</text>
      <text x="200" y="95" textAnchor="middle" fontSize="10" fill="#1a2744">Cutoff Man</text>

      {/* Home plate */}
      <polygon points="370,50 385,60 385,80 355,80 355,60" fill="#f8f0e3" stroke="#1a2744" strokeWidth="2" />
      <text x="370" y="95" textAnchor="middle" fontSize="10" fill="#1a2744">Home</text>

      {/* First throw: OF → Cutoff */}
      <motion.line
        x1="44" y1="60" x2="186" y2="60"
        stroke="#e63946" strokeWidth="3" strokeDasharray="8 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* Arrow head for first throw */}
      <motion.polygon
        points="186,56 198,60 186,64"
        fill="#e63946"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      />

      {/* Second throw: Cutoff → Home */}
      <motion.line
        x1="214" y1="60" x2="354" y2="65"
        stroke="#1a2744" strokeWidth="3" strokeDasharray="8 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.4 }}
      />
      <motion.polygon
        points="354,61 366,65 354,69"
        fill="#1a2744"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
      />
    </svg>
  )
}

const KEY_POINTS = [
  {
    icon: '🏃',
    title: 'Shorter Throws = Faster Ball',
    body: 'A ball thrown 60 feet twice gets to home plate faster than one long 120-foot throw. The cutoff man shortens the distance!'
  },
  {
    icon: '🎯',
    title: 'Accurate Throws Matter',
    body: 'Long throws are harder to keep straight. The cutoff man catches and re-throws at the perfect angle to nail the runner.'
  },
  {
    icon: '🧠',
    title: 'The Cutoff Man Thinks Fast',
    body: 'The cutoff man has to decide quickly: "Should I throw home, or cut it off and get a different runner?" That\'s smart baseball!'
  },
  {
    icon: '📣',
    title: 'Communication is Key',
    body: 'Other infielders and coaches yell "CUT!" to tell the cutoff man to redirect the throw, or "LET IT GO!" to let it pass through.'
  },
]

export default function ConceptSection() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy mb-2">What is a Cutoff?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A <strong className="text-field">cutoff</strong> (also called a <strong className="text-field">relay</strong>) is when an infielder
            stands between the outfielder and home plate to catch the ball and quickly redirect it — like a middleman in a relay race!
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-navy text-center mb-2">Watch How It Works</h3>
          <BallAnimation />
          <p className="text-center text-gray-500 text-sm">
            The cutoff man (in gold) catches the outfielder's throw and fires it home in one quick motion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KEY_POINTS.map((pt, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-field"
            >
              <div className="text-3xl mb-2">{pt.icon}</div>
              <h3 className="text-lg font-bold text-navy mb-1">{pt.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{pt.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-8 bg-gold rounded-2xl p-6 text-center shadow-md">
          <p className="text-navy font-bold text-xl mb-1">Remember the Golden Rule:</p>
          <p className="text-navy text-lg">
            "Every time the ball goes to the outfield, <strong>someone</strong> must be the cutoff man!"
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
