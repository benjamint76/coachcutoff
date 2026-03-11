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
    if (has2)         return { target: 'home',   label: 'Fire home — runner on 2nd is scoring!',   base: FIELD.home  }
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
function getPlayerPositions(ballId, target, ballPos, targetPos, runners = []) {
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
        pos: 'RF',
        //if target is second then 210, if third then...else 258
        x: target === 'second' ? 210 : 200,
        y: target === 'second' ? 128 : 100,
        role: 'backup',
        desc: target === 'second'
          ? 'Back up the pitcher behind 2nd base — get in the throw line in case the ball gets through!'
          : 'Rotate toward center field in case of overthrow',
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
    // r1AndHome: runners on 1st & 2nd (or loaded) throwing home —
    // 1B is cutoff, SS is secondary cutoff toward 3rd, 2B covers 2nd.
    // Differs from runner-on-2nd-only (SS covers 2nd, 2B covers 1st).
    const r1AndHome = target === 'home' && runners.includes(1)
    // SS secondary cutoff: on the CF→3B throw line, about 55% of the way (near 2nd base)
    const ssSecondaryPos = r1AndHome ? lerp(ballPos, FIELD.third, 0.55) : null

    return [
      {
        pos: 'CF', x: ballPos.x, y: ballPos.y, role: 'fielder',
        desc: target === 'second'
          ? 'Get to the ball fast — throw chest-high to 2B (the cutoff man)'
          : target === 'home'
            ? 'Get to the ball fast — throw chest-high to 1B (the cutoff man)'
            : 'Get to the ball fast — throw chest-high to SS (the cutoff man)',
        note: null,
      },
      {
        // Runner on 1st or 2nd (target=third/home): LF rotates to back up 3rd base.
        // All other targets: LF backs up CF from the left side.
        pos: 'LF',
        x: (target === 'third' || target === 'home') ? 55 : 84,
        y: (target === 'third' || target === 'home') ? 200 : 48,
        role: 'backup',
        desc: (target === 'third' || target === 'home')
          ? 'Rotate hard toward 3rd base — back up the play behind the bag in the throw line!'
          : 'Sprint to back up CF from the left side',
        note: (target === 'third' || target === 'home') ? null : '📣 1st Call Man',
        isFirstCallMan: target === 'second',
      },
      {
        pos: 'RF', x: 216, y: 48, role: 'backup',
        desc: 'Sprint to back up CF from the right side',
        note: '📣 1st Call Man',
        isFirstCallMan: true,
      },
      {
        // Nobody on: SS covers 2nd.
        // Runner on 2nd only (target=home): SS covers 2nd.
        // Runner on 1st (target=third): SS is the primary cutoff.
        // Runners on 1st & 2nd (r1AndHome): SS is the secondary cutoff toward 3rd.
        pos: 'SS',
        x:    target === 'third' ? cutoff.x
            : r1AndHome          ? ssSecondaryPos.x
            :                      FIELD.second.x,
        y:    target === 'third' ? cutoff.y
            : r1AndHome          ? ssSecondaryPos.y
            :                      FIELD.second.y,
        role: target === 'third' ? 'cutoff'
            : r1AndHome          ? 'trail'
            :                      'covering',
        desc: target === 'third'
          ? 'PRIMARY CUTOFF — line up exactly halfway between CF and the target base, raise both hands high!'
          : r1AndHome
            ? 'SECONDARY CUTOFF — position yourself between 1B and 3rd base, be ready to cut the throw if the runner on 1st tries to advance to 3rd!'
            : 'Cover 2nd base — hold the bag',
        note: target === 'third' ? '⭐ Cutoff' : r1AndHome ? '⭐ 2nd Cutoff' : null,
        isCallMan: false,
      },
      {
        // Nobody on: 2B is the cutoff.
        // Runner on 1st (target=third): 2B covers 2nd base.
        // Runner on 2nd only (target=home): 2B covers 1st base.
        // Runners on 1st & 2nd (r1AndHome): 2B covers 2nd base.
        pos: '2B',
        x:    target === 'second'                ? cutoff.x      : (target === 'third' || r1AndHome) ? FIELD.second.x : FIELD.first.x,
        y:    target === 'second'                ? cutoff.y      : (target === 'third' || r1AndHome) ? FIELD.second.y : FIELD.first.y,
        role: target === 'second'                ? 'cutoff'      : 'covering',
        desc: target === 'second'
          ? 'CUTOFF MAN — sprint into line halfway between CF and 2nd, raise both hands high!'
          : target === 'third'
            ? 'Cover 2nd base — hold the bag and keep the runner honest'
            : r1AndHome
              ? 'Cover 2nd base — hold the bag, the runner on 1st may try to advance!'
              : 'Cover 1st base — hold the bag and keep the batter honest',
        note: target === 'second' ? '⭐ Cutoff' : null,
      },
      {
        // Runner on 2nd (target=home): 1B is the cutoff, positioned 2/3 of the way
        // from CF toward home (closer to the mound than the halfway point).
        // All other targets: 1B holds 1st base.
        pos: '1B',
        x:    target === 'home' ? lerp(ballPos, targetPos, 0.65).x : 215,
        y:    target === 'home' ? lerp(ballPos, targetPos, 0.65).y : 192,
        role: target === 'home' ? 'cutoff'  : 'covering',
        desc: target === 'home'
          ? 'CUTOFF MAN — sprint into line halfway between CF and Home, raise both hands high!'
          : 'Hold 1st base — keep the batter honest',
        note: target === 'home' ? '⭐ Cutoff' : null,
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
        desc: 'Cover Home plate' + (target === 'home' ? ' — call "CUT" or "LET IT GO!" to 1B, then make the tag!' : ''),
        note: target === 'home' ? '📣 2nd Call Man' : null,
        isCallMan: target === 'home',
      },
    ]
  }

  if (ballId === 'rf') {
    // nobodyOn:     target=second — 2B cutoff, SS covers 2nd, P primary backup at 2nd,
    //               LF & 3B secondary backups at 2nd, 1B covers 1st, C backs up 1st.
    // runnerOn1st:  target=third  — SS is cutoff, 2B covers 2nd, 1B covers 1st,
    //               LF backs up 3rd, P backs up 3rd.
    // throwingHome: target=home   — 1B is cutoff, 2B covers 1st, SS covers 2nd, 3B covers 3rd,
    //               LF backs up 3rd, P backs up home (pPos), C covers home.
    const nobodyOn    = target === 'second'
    const runnerOn1st = target === 'third'
    const throwingHome = target === 'home'
    // Catcher backup position: behind 1st base in the 2nd→1st throw line
    const cBackup1B   = getBackupPosition(FIELD.second, FIELD.first, 25)

    return [
      {
        pos: 'RF', x: ballPos.x, y: ballPos.y, role: 'fielder',
        desc: runnerOn1st
          ? 'Get to the ball fast — throw chest-high to SS (the cutoff man)'
          : throwingHome
            ? 'Get to the ball fast — throw chest-high to 1B (the cutoff man)'
            : 'Get to the ball fast — throw chest-high to the 2B (cutoff man)',
        note: null,
      },
      {
        pos: 'CF', x: 205, y: 47, role: 'backup',
        desc: 'Sprint hard to back up RF — be ready if the ball gets past',
        note: '📣 1st Call Man',
        isFirstCallMan: true,
      },
      {
        // Nobody on:    LF secondary backup at 2nd (left side).
        // Runner on 1st or 2nd: LF backs up 3rd base.
        // Other: LF stays in left field.
        pos: 'LF',
        x: nobodyOn ? 78 : (runnerOn1st || throwingHome) ? 60 : 84,
        y: nobodyOn ? 108 : (runnerOn1st || throwingHome) ? 180 : 65,
        role: 'backup',
        desc: nobodyOn
          ? 'Rotate hard toward 2nd base — secondary backup behind SS in case the throw gets through!'
          : (runnerOn1st || throwingHome)
            ? 'Sprint hard behind 3rd base — back up the play in the throw line!'
            : 'Rotate toward center field in case of overthrow',
        note: null,
      },
      {
        // Nobody on / other (home): 2B is the cutoff in the throw line.
        // Runner on 1st: 2B covers 2nd base.
        // Runner on 2nd: 2B covers 1st base.
        pos: '2B',
        x: runnerOn1st ? FIELD.second.x : throwingHome ? FIELD.first.x : cutoff.x,
        y: runnerOn1st ? FIELD.second.y : throwingHome ? FIELD.first.y : cutoff.y,
        role: (runnerOn1st || throwingHome) ? 'covering' : 'cutoff',
        desc: runnerOn1st
          ? 'Cover 2nd base — hold the bag, the batter may try to stretch to 2nd!'
          : throwingHome
            ? 'Cover 1st base — hold the bag and keep the batter honest'
            : 'CUTOFF MAN — sprint into line exactly halfway between RF and the target base, raise both hands high!',
        note: (runnerOn1st || throwingHome) ? null : '⭐ Cutoff',
      },
      {
        // Nobody on / runner on 1st: 1B covers 1st base.
        // Runner on 2nd: 1B is the CUTOFF in the RF→3rd throw line.
        // Other (home): 1B is the trail relay behind 2B.
        pos: '1B',
        x: throwingHome ? lerp(ballPos, targetPos, 0.65).x : (nobodyOn || runnerOn1st) ? 215 : trail.x,
        y: throwingHome ? lerp(ballPos, targetPos, 0.65).y : (nobodyOn || runnerOn1st) ? 192 : trail.y,
        role: throwingHome ? 'cutoff' : (nobodyOn || runnerOn1st) ? 'covering' : 'trail',
        desc: throwingHome
          ? 'CUTOFF MAN — sprint into line between RF and Home, raise both hands high!'
          : (nobodyOn || runnerOn1st)
            ? 'Cover 1st base — hold the bag and keep the batter honest'
            : 'TRAIL / SECONDARY CUTOFF — line up on the SAME line behind 2B toward RF, cut off if 2B misses',
        note: throwingHome ? '⭐ Cutoff' : (nobodyOn || runnerOn1st) ? null : '🔁 Trail',
      },
      {
        // Nobody on / runner on 2nd / other: SS covers 2nd base.
        // Runner on 1st: SS is the cutoff in the RF→3rd throw line.
        pos: 'SS',
        x: runnerOn1st ? cutoff.x : 140,
        y: runnerOn1st ? cutoff.y : 133,
        role: runnerOn1st ? 'cutoff' : 'covering',
        desc: runnerOn1st
          ? 'CUTOFF MAN — sprint into line between RF and 3rd, raise both hands high!'
          : 'Cover 2nd base' + (nobodyOn ? ' — call "CUT" or "LET IT GO!" to 2B' : ''),
        note: runnerOn1st ? '⭐ Cutoff' : (nobodyOn ? '📣 2nd Call Man' : null),
        isCallMan: nobodyOn,
      },
      {
        // Nobody on: 3B rotates toward 2nd as a secondary backup.
        // Runner on 1st or 2nd: 3B covers 3rd (call man to the cutoff).
        pos: '3B',
        x: nobodyOn ? 105 : 85,
        y: nobodyOn ? 148 : 192,
        role: nobodyOn ? 'backup' : 'covering',
        desc: nobodyOn
          ? 'Rotate toward 2nd base — secondary backup behind SS in case the throw gets through!'
          : runnerOn1st
            ? 'Cover 3rd base — call "CUT" or "LET IT GO!" to SS!'
            : 'Cover 3rd base',
        note: runnerOn1st ? '📣 2nd Call Man' : null,
        isCallMan: runnerOn1st,
      },
      {
        // Nobody on: P is primary backup behind 2nd.
        // All other targets: pPos already places P behind the target base in the throw line.
        pos: 'P',
        x: pPos.x,
        y: pPos.y,
        role: 'backup',
        desc: nobodyOn
          ? 'PRIMARY BACKUP — sprint directly behind 2nd base in the throw line, first one there to back up SS!'
          : pitcherDesc,
        note: null,
      },
      {
        // Nobody on: C backs up 1st base.
        // Runners on base: C covers home plate.
        pos: 'C',
        x: nobodyOn ? cBackup1B.x : 150,
        y: nobodyOn ? cBackup1B.y : 265,
        role: nobodyOn ? 'backup' : 'covering',
        desc: nobodyOn
          ? 'Back up 1st base — sprint behind the bag in case of an errant throw or rundown!'
          : 'Cover Home plate' + (target === 'home' ? ' — call "CUT" or "LET IT GO!" to 2B, then make the tag!' : ''),
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
  const players    = getPlayerPositions(ballId, decision.target, ballPos, targetPos, runners)
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
