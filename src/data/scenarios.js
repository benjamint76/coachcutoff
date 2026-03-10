// Baseball field SVG coordinate system: 300x290 viewBox
// Home: (150, 260)  1B: (215, 195)  2B: (150, 130)  3B: (85, 195)
// Pitcher mound: (150, 190)

export const FIELD = {
  home:    { x: 150, y: 260 },
  first:   { x: 215, y: 195 },
  second:  { x: 150, y: 130 },
  third:   { x: 85,  y: 195 },
  pitcher: { x: 150, y: 190 },
}

// Role definitions — color and display label
export const ROLES = {
  fielder:  { label: 'Fields the Ball',  fill: '#16a34a', text: 'white'   },
  cutoff:   { label: 'Cutoff Man',        fill: '#f5a623', text: '#1a2744' },
  covering: { label: 'Covers a Base',     fill: '#0d9488', text: 'white'   },
  trail:    { label: 'Trail Relay',        fill: '#6366f1', text: 'white'   },
  backup:   { label: 'Backs Up',           fill: '#374151', text: 'white'   },
}

export const BALL_POSITIONS = [
  { id: 'lf', label: 'Left Field',    icon: '⬅️', ballPos: { x: 45,  y: 75 } },
  { id: 'cf', label: 'Center / Gap',  icon: '⬆️', ballPos: { x: 150, y: 30 } },
  { id: 'rf', label: 'Right Field',   icon: '➡️', ballPos: { x: 255, y: 75 } },
]

export const RUNNER_CONFIGS = [
  { id: 'none',   label: 'Nobody On',           runners: [] },
  { id: 'r1',     label: 'Runner on 1st',        runners: [1] },
  { id: 'r2',     label: 'Runner on 2nd',        runners: [2] },
  { id: 'r12',    label: 'Runners on 1st & 2nd', runners: [1, 2] },
  { id: 'loaded', label: 'Bases Loaded',         runners: [1, 2, 3] },
]

// Determine ideal target base given ball location + runners
function getDecision(ballId, runners) {
  const has1 = runners.includes(1)
  const has2 = runners.includes(2)
  const has3 = runners.includes(3)

  if (ballId === 'lf') {
    if (has2 || has3) return { target: 'home',   label: 'Fire home — runner is scoring!',          base: FIELD.home }
    if (has1)         return { target: 'third',  label: 'Cut to 3rd — hold the lead runner!',       base: FIELD.third }
                      return { target: 'second', label: 'Throw to 2nd — stop the batter!',          base: FIELD.second }
  }
  if (ballId === 'cf') {
    if (has2 || has3) return { target: 'home',   label: 'Fire home — runner is scoring!',          base: FIELD.home }
    if (has1)         return { target: 'third',  label: 'Cut to 3rd — stop the lead runner!',      base: FIELD.third }
                      return { target: 'second', label: 'Throw to 2nd — stop the batter!',         base: FIELD.second }
  }
  if (ballId === 'rf') {
    if (has3)         return { target: 'home',   label: 'Fire home — runner is scoring!',          base: FIELD.home }
    if (has2)         return { target: 'third',  label: 'Cut to 3rd — lead runner tagging!',       base: FIELD.third }
    if (has1)         return { target: 'third',  label: 'Cut to 3rd — runner advancing!',          base: FIELD.third }
                      return { target: 'second', label: 'Throw to 2nd — stop the batter!',         base: FIELD.second }
  }
}

// Linear interpolation: returns the point fraction f of the way from a to b.
// f=0.5 → midpoint (cutoff man), f=0.33 → 1/3 from ball (trail relay behind cutoff)
function lerp(a, b, f) {
  return {
    x: Math.round(a.x + f * (b.x - a.x)),
    y: Math.round(a.y + f * (b.y - a.y)),
  }
}

// Backup man stands in the throw line, on the FAR side of the target base.
// Extends the ball→target direction by `offset` SVG units past the base.
function getBackupPosition(ballPos, targetPos, offset = 22) {
  const dx = targetPos.x - ballPos.x
  const dy = targetPos.y - ballPos.y
  const len = Math.sqrt(dx * dx + dy * dy)
  return {
    x: Math.round(targetPos.x + (dx / len) * offset),
    y: Math.round(targetPos.y + (dy / len) * offset),
  }
}

// All 9 player positions for each ball location.
// ballPos and targetPos are SVG {x,y} coordinates used to place the cutoff/trail
// inline between the outfielder and the target base.
function getPlayerPositions(ballId, target, ballPos, targetPos) {
  // Pitcher backup: in the throw line, behind the target base on the far side
  const pPos = getBackupPosition(ballPos, targetPos)
  const pitcherDesc =
    target === 'home'   ? 'Sprint behind Home plate — get in the throw line to back up the catcher!'   :
    target === 'third'  ? 'Sprint behind 3rd base — get in the throw line to back up the play!'        :
                          'Move behind 2nd base — get in the throw line to back up the play!'

  // Cutoff man is exactly halfway between the outfielder and the target base,
  // in a straight line — this is the correct real-baseball positioning.
  const cutoff = lerp(ballPos, targetPos, 0.5)

  // Trail relay (for CF and RF) is 1/3 of the way from ball to target,
  // so they stand behind the cutoff man toward the outfield — ready to
  // back up if the throw sails past the primary cutoff.
  const trail = lerp(ballPos, targetPos, 0.33)

  // isCallMan  = second call man (covers target base, calls "CUT" or "LET IT GO")
  // isFirstCallMan = nearest outfielder who calls the base number to the fielder

  if (ballId === 'lf') {
    // Catcher: backs up 1B (in throw line) when nobody on, covers home otherwise
    const cIsBackup = target === 'second'
    const cPos = cIsBackup ? getBackupPosition(ballPos, FIELD.first, 20) : { x: 150, y: 265 }

    return [
      {
        pos: 'LF', x: ballPos.x, y: ballPos.y, role: 'fielder',
        desc: target === 'home'
          ? 'Get to the ball fast — throw chest-high to the 3B (cutoff man)'
          : 'Get to the ball fast — throw chest-high to the SS (cutoff man)',
        note: null,
      },
      {
        pos: 'CF', x: 98, y: 47, role: 'backup',
        desc: 'Sprint hard to back up LF — be ready if the ball gets past',
        note: '📣 1st Call Man',
        isFirstCallMan: true,
      },
      {
        pos: 'RF', x: 218, y: 62, role: 'backup',
        desc: 'Rotate toward center field in case of overthrow',
        note: null,
      },
      {
        // When throwing home, 3B is the cutoff — SS drops back to cover 3rd
        pos: 'SS',
        x:    target === 'home' ? 85        : cutoff.x,
        y:    target === 'home' ? 192       : cutoff.y,
        role: target === 'home' ? 'covering' : 'cutoff',
        desc: target === 'home'
          ? 'Cover 3rd base — hold the bag while 3B steps up as cutoff!'
          : 'CUTOFF MAN — sprint into line between LF and the target base, raise both hands high!',
        note: target === 'home' ? null : '⭐ Cutoff',
        isCallMan: false,
      },
      {
        pos: '2B', x: 150, y: 125, role: 'covering',
        desc: 'Cover 2nd base' + (target === 'second' ? ' — call "CUT [base]" or "LET IT GO!" to SS' : ''),
        note: target === 'second' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'second',
      },
      {
        pos: '1B', x: 215, y: 192, role: 'covering',
        desc: 'Hold 1st base — keep the batter honest',
        note: null,
      },
      {
        // When throwing home, 3B becomes the cutoff inline between LF and home
        pos: '3B',
        x:    target === 'home' ? cutoff.x  : 85,
        y:    target === 'home' ? cutoff.y  : 192,
        role: target === 'home' ? 'cutoff'  : 'covering',
        desc: target === 'home'
          ? 'CUTOFF MAN — step into the throw line between LF and Home, raise both hands high!'
          : 'Cover 3rd base' + (target === 'third' ? ' — call "CUT [base]" or "LET IT GO!" to SS' : ''),
        note: target === 'home' ? '⭐ Cutoff' : (target === 'third' ? '📣 2nd Call Man' : null),
        isCallMan: target === 'third',
      },
      {
        pos: 'P', x: pPos.x, y: pPos.y, role: 'backup',
        desc: pitcherDesc,
        note: null,
      },
      {
        pos: 'C', x: cPos.x, y: cPos.y,
        role: cIsBackup ? 'backup' : 'covering',
        desc: cIsBackup
          ? 'Sprint to back up 1st base — get in line with the throw behind the bag!'
          : 'Cover Home plate' + (target === 'home' ? ' — call "CUT" or "LET IT GO!" to SS, then make the tag!' : ''),
        note: target === 'home' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'home',
      },
    ]
  }

  if (ballId === 'cf') {
    return [
      {
        pos: 'CF', x: ballPos.x, y: ballPos.y, role: 'fielder',
        desc: 'Get to the ball fast — throw chest-high to SS (the cutoff man)',
        note: null,
      },
      {
        pos: 'LF', x: 84, y: 48, role: 'backup',
        desc: 'Sprint to back up CF from the left side',
        note: '📣 1st Call Man',
        isFirstCallMan: true,
      },
      {
        pos: 'RF', x: 216, y: 48, role: 'backup',
        desc: 'Sprint to back up CF from the right side',
        note: null,
      },
      {
        pos: 'SS', x: cutoff.x, y: cutoff.y, role: 'cutoff',
        desc: 'PRIMARY CUTOFF — line up exactly halfway between CF and the target base, raise both hands high!',
        note: '⭐ Cutoff',
      },
      {
        // Trail relay lines up on the same throw line, behind the primary cutoff
        pos: '2B', x: trail.x, y: trail.y, role: 'trail',
        desc: 'TRAIL RELAY — line up on the SAME line behind SS, back up the play, relay if needed',
        note: '🔁 Trail',
      },
      {
        pos: '1B', x: 215, y: 192, role: 'covering',
        desc: 'Hold 1st base — keep the batter honest',
        note: null,
      },
      {
        pos: '3B', x: 85, y: 192, role: 'covering',
        desc: 'Cover 3rd base' + (target === 'third' ? ' — call "CUT" or "LET IT GO!" to SS' : ''),
        note: target === 'third' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'third',
      },
      {
        pos: 'P', x: pPos.x, y: pPos.y, role: 'backup',
        desc: pitcherDesc,
        note: null,
      },
      {
        pos: 'C', x: 150, y: 265, role: 'covering',
        desc: 'Cover Home plate' + (target === 'home' ? ' — call "CUT" or "LET IT GO!" to SS, then make the tag!' : ''),
        note: target === 'home' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'home',
      },
    ]
  }

  if (ballId === 'rf') {
    return [
      {
        pos: 'RF', x: ballPos.x, y: ballPos.y, role: 'fielder',
        desc: 'Get to the ball fast — throw chest-high to the 2B (cutoff man)',
        note: null,
      },
      {
        pos: 'CF', x: 205, y: 47, role: 'backup',
        desc: 'Sprint hard to back up RF — be ready if the ball gets past',
        note: '📣 1st Call Man',
        isFirstCallMan: true,
      },
      {
        pos: 'LF', x: 84, y: 65, role: 'backup',
        desc: 'Rotate toward center field in case of overthrow',
        note: null,
      },
      {
        pos: '2B', x: cutoff.x, y: cutoff.y, role: 'cutoff',
        desc: 'CUTOFF MAN — sprint into line exactly halfway between RF and the target base, raise both hands high!',
        note: '⭐ Cutoff',
      },
      {
        // Trail relay lines up on the same throw line, behind the primary cutoff
        pos: '1B', x: trail.x, y: trail.y, role: 'trail',
        desc: 'TRAIL / SECONDARY CUTOFF — line up on the SAME line behind 2B toward RF, cut off if 2B misses',
        note: '🔁 Trail',
      },
      {
        pos: 'SS', x: 140, y: 133, role: 'covering',
        desc: 'Cover 2nd base' + (target === 'second' ? ' — call "CUT" or "LET IT GO!" to 2B' : ''),
        note: target === 'second' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'second',
      },
      {
        pos: '3B', x: 85, y: 192, role: 'covering',
        desc: 'Cover 3rd base' + (target === 'third' ? ' — call "CUT [base]" or "LET IT GO!" to 2B' : ''),
        note: target === 'third' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'third',
      },
      {
        pos: 'P', x: pPos.x, y: pPos.y, role: 'backup',
        desc: pitcherDesc,
        note: null,
      },
      {
        pos: 'C', x: 150, y: 265, role: 'covering',
        desc: 'Cover Home plate' + (target === 'home' ? ' — call "CUT" or "LET IT GO!" to 2B, then make the tag!' : ''),
        note: target === 'home' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'home',
      },
    ]
  }
}

export function buildScenario(ballId, runnerConfig) {
  const ballConfig = BALL_POSITIONS.find(b => b.id === ballId)
  const runners    = runnerConfig.runners
  const decision   = getDecision(ballId, runners)
  const ballPos    = ballConfig.ballPos
  const targetPos  = decision.base
  const players    = getPlayerPositions(ballId, decision.target, ballPos, targetPos)
  const cutoff     = players.find(p => p.role === 'cutoff')

  return {
    ballPos,
    cutoffPos:   { x: cutoff.x, y: cutoff.y },
    cutoffLabel: cutoff.pos,
    players,
    runners,
    decision,
  }
}
