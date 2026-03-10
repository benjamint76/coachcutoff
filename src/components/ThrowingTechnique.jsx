import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    number: 1,
    title: 'Get to Your Spot',
    icon: '🏃',
    color: 'bg-field',
    details: [
      'Sprint to your cutoff position the moment the ball is hit',
      'Face the outfielder — you want to be between them and your target',
      'Raise both hands high so the outfielder can see you',
      'Yell "HIT IT! HIT IT!" so they know where to throw',
    ],
    tip: 'You should already be moving before the outfielder picks up the ball!',
    svgScene: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        {/* Field */}
        <rect width="200" height="160" fill="#40916c" rx="8" />
        {/* Runner (moving) */}
        <motion.g animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          <circle cx="80" cy="90" r="16" fill="#f5a623" stroke="white" strokeWidth="2" />
          <text x="80" y="95" textAnchor="middle" fontSize="11" fill="#1a2744" fontWeight="bold">SS</text>
        </motion.g>
        {/* Outfielder */}
        <circle cx="160" cy="40" r="14" fill="#2d6a4f" stroke="white" strokeWidth="1.5" />
        <text x="160" y="45" textAnchor="middle" fontSize="10" fill="white">OF</text>
        {/* Ball */}
        <circle cx="158" cy="38" r="6" fill="white" stroke="#c2a06e" strokeWidth="1" />
        {/* Arms raised */}
        <text x="80" y="72" textAnchor="middle" fontSize="18">🙌</text>
        <text x="80" y="125" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Hands Up!</text>
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Catch the Ball',
    icon: '🧤',
    color: 'bg-navy',
    details: [
      'Watch the ball all the way into your glove — eyes on it!',
      'Use two hands: glove to catch, throwing hand ready',
      'Squeeze the glove firmly when the ball hits it',
      'Your feet should be moving toward your target as you catch',
    ],
    tip: 'A dropped cutoff is worse than no cutoff — secure the ball first!',
    svgScene: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        <rect width="200" height="160" fill="#40916c" rx="8" />
        {/* Cutoff man */}
        <circle cx="100" cy="95" r="18" fill="#f5a623" stroke="white" strokeWidth="2" />
        <text x="100" y="100" textAnchor="middle" fontSize="12" fill="#1a2744" fontWeight="bold">SS</text>
        {/* Animated incoming ball */}
        <motion.circle
          cx="160" cy="45" r="8" fill="white" stroke="#c2a06e" strokeWidth="1.5"
          animate={{ cx: 115, cy: 82 }}
          transition={{ duration: 1.0, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        {/* Glove icon */}
        <text x="100" y="80" textAnchor="middle" fontSize="20">🧤</text>
        <text x="100" y="128" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Eyes on the ball!</text>
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Turn and Set Your Feet',
    icon: '🔄',
    color: 'bg-dirt',
    details: [
      'Pivot quickly toward your target as you catch',
      'Square your hips and shoulders to where you\'re throwing',
      'Step toward the target with your front foot',
      'This is called "getting lined up" — it makes your throw more accurate',
    ],
    tip: 'A good pivot is as important as a strong arm. Slow down to speed up!',
    svgScene: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        <rect width="200" height="160" fill="#40916c" rx="8" />
        {/* Home plate */}
        <polygon points="30,140 22,148 22,158 38,158 38,148" fill="white" />
        <text x="30" y="175" textAnchor="middle" fontSize="9" fill="white">HOME</text>
        {/* Cutoff man turning */}
        <motion.g
          animate={{ rotate: [30, 0] }}
          style={{ transformOrigin: '100px 90px' }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          <circle cx="100" cy="90" r="18" fill="#f5a623" stroke="white" strokeWidth="2" />
          <text x="100" y="95" textAnchor="middle" fontSize="12" fill="#1a2744" fontWeight="bold">SS</text>
        </motion.g>
        {/* Arrow showing direction */}
        <motion.path
          d="M 82 100 Q 55 120 35 140"
          stroke="white" strokeWidth="2.5" fill="none" strokeDasharray="5 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
        />
        <text x="100" y="135" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Face the target!</text>
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Fire to the Base',
    icon: '💪',
    color: 'bg-red-600',
    details: [
      'Throw hard and on a line — chest-high to the target',
      'Your arm follows through across your body after the release',
      'Aim for the glove of the player at the base, not the base itself',
      'A chest-high throw is easiest to catch AND tag with!',
    ],
    tip: '"Low and away" loses the runner — throw chest high so they can catch and tag!',
    svgScene: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        <rect width="200" height="160" fill="#40916c" rx="8" />
        {/* Catcher at home */}
        <circle cx="30" cy="130" r="14" fill="#2d6a4f" stroke="white" strokeWidth="1.5" />
        <text x="30" y="135" textAnchor="middle" fontSize="9" fill="white">C</text>
        {/* Cutoff throwing */}
        <circle cx="140" cy="80" r="18" fill="#f5a623" stroke="white" strokeWidth="2" />
        <text x="140" y="85" textAnchor="middle" fontSize="12" fill="#1a2744" fontWeight="bold">SS</text>
        <text x="140" y="62" textAnchor="middle" fontSize="22">💪</text>
        {/* Thrown ball animation */}
        <motion.circle
          cx="140" cy="80" r="7" fill="white" stroke="#c2a06e" strokeWidth="1.5"
          animate={{ cx: 44, cy: 130 }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.5, ease: 'easeIn' }}
        />
        <text x="85" y="148" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Chest high!</text>
      </svg>
    ),
  },
]

export default function ThrowingTechnique() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-navy mb-2">Throwing Technique</h2>
        <p className="text-gray-600">Follow these 4 steps every time you're the cutoff man</p>
      </div>

      {/* Step progress bar */}
      <div className="flex gap-2 mb-6 max-w-lg mx-auto">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-gold' : 'bg-gray-200'}`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      {/* Step indicator dots */}
      <div className="flex justify-center gap-3 mb-6">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-10 h-10 rounded-full font-bold text-sm transition-all
              ${i === step ? `${s.color} text-white scale-110 shadow-lg` : 'bg-gray-200 text-gray-500'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          {/* Header */}
          <div className={`${current.color} text-white p-5 flex items-center gap-4`}>
            <div className="text-5xl">{current.icon}</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Step {current.number} of 4</p>
              <h3 className="text-2xl font-bold">{current.title}</h3>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Animation panel */}
            <div className="md:w-2/5 bg-field-light bg-opacity-10 p-4 flex items-center justify-center min-h-40">
              <div className="w-full max-w-xs h-44">
                {current.svgScene}
              </div>
            </div>

            {/* Details */}
            <div className="md:w-3/5 p-6">
              <ul className="space-y-3 mb-4">
                {current.details.map((d, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-gold font-bold mt-0.5">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-gold bg-opacity-20 border border-gold rounded-xl p-3">
                <p className="text-sm font-bold text-navy mb-0.5">Coach Says:</p>
                <p className="text-gray-700 text-sm italic">"{current.tip}"</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <div className="flex justify-between mt-5">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2 rounded-xl font-semibold bg-gray-200 text-navy disabled:opacity-30 hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="px-5 py-2 rounded-xl font-semibold bg-field text-white disabled:opacity-30 hover:bg-field-light transition-colors"
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
