import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BALL_POSITIONS, RUNNER_CONFIGS, FIELD, ROLES, buildScenario } from '../data/scenarios'

// Base SVG positions for runner dots on the diamond
const BASE_COORDS = {
  1: FIELD.first,
  2: FIELD.second,
  3: FIELD.third,
}

// Default fielding positions — where each player stands before the play
const DEFAULT_POSITIONS = {
  LF:  { x: 62,  y: 72  },  // left field
  CF:  { x: 150, y: 35  },  // center field
  RF:  { x: 238, y: 72  },  // right field
  SS:  { x: 125, y: 145 },  // shortstop
  '2B':{ x: 177, y: 145 },  // second baseman
  '1B':{ x: 210, y: 195 },  // first baseman
  '3B':{ x: 90,  y: 195 },  // third baseman
  P:   { x: 150, y: 190 },  // pitcher
  C:   { x: 150, y: 262 },  // catcher
}

// Animated dashed throw path between two SVG points
function ThrowPath({ from, to, color, delay = 0 }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const scale = 10 / len
  const ax = to.x - dx * scale
  const ay = to.y - dy * scale
  const nx = (-dy / len) * 6
  const ny = (dx / len) * 6

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <motion.line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={color} strokeWidth="2.5" strokeDasharray="7 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
      <motion.polygon
        points={`${to.x},${to.y} ${ax + nx},${ay + ny} ${ax - nx},${ay - ny}`}
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.75 }}
      />
    </motion.g>
  )
}

function BaseballField({ scenario, animKey, playKey }) {
  const { ballPos, cutoffPos, players, runners, decision } = scenario

  return (
    <svg viewBox="0 0 300 290" className="w-full max-w-sm mx-auto drop-shadow-md" aria-label="baseball field diagram">
      {/* Outfield grass */}
      <ellipse cx="150" cy="140" rx="148" ry="130" fill="#40916c" />
      {/* Infield dirt — 96×96 square rotated 45°, vertices land just outside each base */}
      <rect x="102" y="147" width="96" height="96" transform="rotate(-45 150 195)" fill="#c2a06e" rx="4" />
      {/* Infield grass */}
      <rect x="112" y="157" width="76" height="76" transform="rotate(-45 150 195)" fill="#2d6a4f" rx="2" />

      {/* Foul lines — exactly 90° apart (each 45° from center vertical) */}
      <line x1="150" y1="260" x2="0"   y2="110" stroke="white" strokeWidth="1" opacity="0.35" />
      <line x1="150" y1="260" x2="300" y2="110" stroke="white" strokeWidth="1" opacity="0.35" />

      {/* Bases */}
      <rect x="142" y="122" width="16" height="16" fill="white" transform="rotate(45 150 130)" rx="1" />
      <rect x="207" y="187" width="16" height="16" fill="white" transform="rotate(45 215 195)" rx="1" />
      <rect x="77"  y="187" width="16" height="16" fill="white" transform="rotate(45 85 195)"  rx="1" />
      <polygon points="150,250 143,257 143,268 157,268 157,257" fill="white" />

      {/* Base labels */}
      <text x="150" y="118" textAnchor="middle" fontSize="7" fill="white" opacity="0.6">2B</text>
      <text x="229" y="196" textAnchor="middle" fontSize="7" fill="white" opacity="0.6">1B</text>
      <text x="71"  y="196" textAnchor="middle" fontSize="7" fill="white" opacity="0.6">3B</text>
      <text x="150" y="285" textAnchor="middle" fontSize="7" fill="white" opacity="0.6">HOME</text>

      {/* Runners on base */}
      {[1, 2, 3].map(b => (
        runners.includes(b) ? (
          <g key={b}>
            <circle cx={BASE_COORDS[b].x} cy={BASE_COORDS[b].y} r="6" fill="#e63946" />
            <text x={BASE_COORDS[b].x} y={BASE_COORDS[b].y + 4} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">R</text>
          </g>
        ) : null
      ))}

      {/* Ball in outfield */}
      <AnimatePresence mode="wait">
        <motion.g key={animKey + '-ball'} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.3 }}>
          <circle cx={ballPos.x} cy={ballPos.y} r="7" fill="white" stroke="#c2a06e" strokeWidth="1.5" />
          <text x={ballPos.x} y={ballPos.y + 3} textAnchor="middle" fontSize="8">⚾</text>
        </motion.g>
      </AnimatePresence>

      {/* All 9 players — keyed by ballId so they SPRING to new positions on runner changes,
           and pop in/out when ball location switches */}
      <AnimatePresence>
        {players.map((player, i) => {
          const roleStyle = ROLES[player.role]
          const isCutoff = player.role === 'cutoff'
          const r = isCutoff ? 13 : 10

          const defaultPos = DEFAULT_POSITIONS[player.pos] ?? { x: player.x, y: player.y }

          return (
            <motion.g
              key={playKey + '-' + player.pos}
              // Start at natural fielding position, spring to scenario position
              initial={{ x: defaultPos.x, y: defaultPos.y, scale: 0, opacity: 0 }}
              animate={{ x: player.x, y: player.y, scale: 1, opacity: 1 }}
              exit={{ x: defaultPos.x, y: defaultPos.y, scale: 0, opacity: 0, transition: { duration: 0.25 } }}
              transition={{
                //x:       { type: 'spring', stiffness: 90, damping: 20 },
                x:       { duration: 1.8, ease: 'easeInOut' },
                y:       { duration: 1.8, ease: 'easeInOut' }, 
                //y:       { type: 'spring', stiffness: 90, damping: 20 },
                scale:   { duration: 0.2,  delay: 0.03 * i },
                opacity: { duration: 0.2,  delay: 0.03 * i },
              }}
            >
              {/* Circle — animates fill/stroke/size when role changes */}
              <motion.circle
                cx={0} cy={0}
                animate={{
                  r,
                  fill:        roleStyle.fill,
                  stroke:      isCutoff ? 'white' : 'rgba(255,255,255,0.4)',
                  strokeWidth: isCutoff ? 2.5 : 1,
                }}
                transition={{ duration: 0.35 }}
              />
              {/* Position label — children are at (0,0) relative to the group transform */}
              <text
                x={0} y={4}
                textAnchor="middle"
                fontSize={player.pos.length > 2 ? 7 : 8}
                fill={roleStyle.text}
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {player.pos}
              </text>
              {/* Call man indicator */}
              {(player.isCallMan || player.isFirstCallMan) && (
                <text x={r - 1} y={-r + 3} textAnchor="middle" fontSize="8">📣</text>
              )}
            </motion.g>
          )
        })}
      </AnimatePresence>

      {/* Throw paths — animated after players appear */}
      <AnimatePresence mode="wait">
        <motion.g key={animKey + '-paths'}>
          {/* Outfield → Cutoff */}
          <ThrowPath from={ballPos} to={cutoffPos} color="#e63946" delay={0.6} />
          {/* Cutoff → target base */}
          <ThrowPath from={cutoffPos} to={decision.base} color="#1a2744" delay={1.5} />
        </motion.g>
      </AnimatePresence>

      {/* Target base highlight ring */}
      <AnimatePresence mode="wait">
        <motion.circle
          key={animKey + '-target'}
          cx={decision.base.x} cy={decision.base.y} r="18"
          fill="none" stroke="#f5a623" strokeWidth="2" strokeDasharray="4 3"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.4 }}
        />
      </AnimatePresence>
    </svg>
  )
}

// Role legend items
const LEGEND_ITEMS = [
  { role: 'cutoff',   symbol: '⭐',  label: 'Cutoff Man'       },
  { role: 'fielder',  symbol: '🏃',  label: 'Fields the Ball'  },
  { role: 'covering', symbol: '📣',  label: 'Covers a Base (Call Man)' },
  { role: 'trail',    symbol: '🔁',  label: 'Trail / Secondary Relay'  },
  { role: 'backup',   symbol: '🛡️', label: 'Backs Up the Play' },
]

// Position assignments list
function AssignmentsList({ players }) {
  // Sort order: fielder first, cutoff, trail, covering, backup
  const order = ['fielder', 'cutoff', 'trail', 'covering', 'backup']
  const sorted = [...players].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))

  return (
    <div className="space-y-2">
      {sorted.map(player => {
        const roleStyle = ROLES[player.role]
        return (
          <div
            key={player.pos}
            className="flex gap-3 items-start bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
          >
            {/* Position badge */}
            <div
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mt-0.5"
              style={{ backgroundColor: roleStyle.fill, color: roleStyle.text }}
            >
              {player.pos}
            </div>
            <div className="min-w-0">
              {/* Role label + call-man note */}
              <div className="flex flex-wrap gap-1 items-center mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: roleStyle.fill }}>
                  {ROLES[player.role].label}
                </span>
                {player.note && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                    {player.note}
                  </span>
                )}
              </div>
              {/* Description */}
              <p className="text-gray-700 text-xs leading-snug">{player.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PositioningDiagram() {
  const [ballId,    setBallId]    = useState('lf')
  const [runnerId,  setRunnerId]  = useState('none')
  const [playCount, setPlayCount] = useState(0)
  const [showAssignments, setShowAssignments] = useState(false)

  // animKey includes playCount so throw paths + ball also re-animate on Replay
  const animKey      = `${ballId}-${runnerId}-${playCount}`
  // playKey drives player re-entry: changes on ball switch OR replay, NOT on runner change
  const playKey      = `${ballId}-${playCount}`
  const runnerConfig = RUNNER_CONFIGS.find(r => r.id === runnerId)
  const scenario     = buildScenario(ballId, runnerConfig)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-navy mb-2">Cutoff Positions</h2>
        <p className="text-gray-600">Choose where the ball is hit and who's on base — all 9 players shown!</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
        {/* Ball location selector */}
        <div className="mb-4">
          <p className="font-bold text-navy mb-2 text-xs uppercase tracking-wide">Where was the ball hit?</p>
          <div className="flex gap-2">
            {BALL_POSITIONS.map(bp => (
              <button
                key={bp.id}
                onClick={() => setBallId(bp.id)}
                className={`flex-1 py-2 px-2 rounded-lg font-semibold text-sm transition-all
                  ${ballId === bp.id
                    ? 'bg-field text-white shadow-md scale-105'
                    : 'bg-gray-100 text-navy hover:bg-field-light hover:text-white'}`}
              >
                {bp.icon} {bp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Runner config selector */}
        <div className="mb-5">
          <p className="font-bold text-navy mb-2 text-xs uppercase tracking-wide">Who's on base?</p>
          <div className="flex gap-1.5 flex-wrap">
            {RUNNER_CONFIGS.map(rc => (
              <button
                key={rc.id}
                onClick={() => setRunnerId(rc.id)}
                className={`py-1.5 px-3 rounded-lg font-semibold text-xs transition-all
                  ${runnerId === rc.id
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-gray-100 text-navy hover:bg-navy-light hover:text-white'}`}
              >
                {rc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Field diagram + sidebar */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* SVG Field + Replay button */}
          <div className="w-full md:w-[46%] shrink-0">
            <BaseballField scenario={scenario} animKey={animKey} playKey={playKey} />
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setPlayCount(c => c + 1)}
                className="flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-4 py-1.5 rounded-full shadow hover:bg-navy-light active:scale-95 transition-all"
              >
                <span className="text-sm">▶</span> Replay
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 space-y-3">
            {/* Decision callout */}
            <div className="bg-gold rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-navy uppercase tracking-wide mb-1">Cutoff Decision</p>
              <p className="text-navy font-bold text-base leading-snug">{scenario.decision.label}</p>
              <p className="text-navy text-xs mt-1.5 opacity-80">
                Cutoff man: <strong>{scenario.cutoffLabel}</strong> &nbsp;·&nbsp;
                Throw to: <strong className="capitalize">{scenario.decision.target}</strong>
              </p>
            </div>

            {/* Legend */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="font-bold text-navy mb-2 text-xs uppercase tracking-wide">Legend</p>
              <div className="space-y-1.5">
                {LEGEND_ITEMS.map(item => (
                  <div key={item.role} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs"
                      style={{ backgroundColor: ROLES[item.role].fill }}
                    />
                    <span className="font-semibold" style={{ color: ROLES[item.role].fill }}>{item.symbol}</span>
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs mt-1">
                  <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#e63946" strokeWidth="2" strokeDasharray="4 3" /></svg>
                  <span className="text-gray-700">Outfield throw</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#1a2744" strokeWidth="2" strokeDasharray="4 3" /></svg>
                  <span className="text-gray-700">Cutoff throw</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full shrink-0 border-2 border-dashed border-gold" style={{ background: 'transparent' }} />
                  <span className="text-gray-700">Target base</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full shrink-0 bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="text-gray-700">Runner on base</span>
                </div>
              </div>
            </div>

            {/* Coach tip */}
            <div className="bg-field-light bg-opacity-10 border border-field rounded-xl p-3">
              <p className="text-xs font-bold text-field uppercase tracking-wide mb-1">📣 Calling System</p>
              <p className="text-gray-700 text-xs leading-relaxed">
                <strong>1st Call Man</strong> (nearest outfielder): calls the base number — <em>"TWO!"</em> or <em>"FOUR!"</em><br />
                <strong>2nd Call Man</strong> (player at target base): yells <em>"CUT TWO!"</em> to redirect, or <em>"LET IT GO!"</em> to let it through.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Position Assignments Panel — collapsible */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <button
          onClick={() => setShowAssignments(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="font-bold text-navy text-lg">Position Assignments</h3>
            <p className="text-gray-500 text-sm">Every player's job for this exact situation</p>
          </div>
          <span className="text-2xl text-navy transition-transform" style={{ transform: showAssignments ? 'rotate(180deg)' : 'none' }}>
            ▾
          </span>
        </button>

        <AnimatePresence>
          {showAssignments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">
                <AssignmentsList players={scenario.players} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
