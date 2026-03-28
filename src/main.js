// ── Silver ratio constants ────────────────────────────────
const DELTA = 1 + Math.sqrt(2)             // ≈ 2.4142
const B     = Math.log(DELTA) / (Math.PI / 2)

// ── Layout ───────────────────────────────────────────────
const vw    = window.innerWidth
const scale = Math.max(1, vw / 1100)

const CX    = 580
const CY    = 420
const R0    = 3.5 * scale
const T_MAX = 9.4
const N     = 900
const ROT   = Math.PI * 1.08

// ── Apply 6° rotation to entire composition ──────────────
document.getElementById('g-rotated').setAttribute('transform',
  `rotate(6, ${CX}, ${CY})`)

// ── Spiral functions ──────────────────────────────────────
function pt1(t, d = 0) {
  const r = R0 * Math.exp(B * t)
  const a = ROT + t + d
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)]
}
function pt2(t, d = 0) {
  const [x, y] = pt1(t, d)
  return [2 * CX - x, 2 * CY - y]
}
function pts(fn, d) {
  let s = ''
  for (let i = 0; i <= N; i++) {
    const [x, y] = fn((i / N) * T_MAX, d)
    s += `${x.toFixed(2)},${y.toFixed(2)} `
  }
  return s.trimEnd()
}

// ── Two landscape silver-ratio offset rects ───────────────
const W0    = 480 * scale
const H0    = W0 / DELTA
const OFF_X = H0 * 0.5
const OFF_Y = H0 * 0.5

const AX = CX - OFF_X - W0 / 2
const AY = CY - OFF_Y - H0 / 2
const BX = 2 * CX - AX - W0
const BY = 2 * CY - AY - H0

function buildRects(ox, oy, w, h) {
  const rs = []
  let rx = ox, ry = oy, rw = w, rh = h
  for (let i = 0; i < 8; i++) {
    rs.push([rx, ry, rw, rh])
    const step = Math.min(rw, rh)
    if (rw >= rh) {
      if (i % 4 === 0 || i % 4 === 3) rx += step
      rw -= step
    } else {
      if (i % 4 === 1) ry += step
      rh -= step
    }
    if (rw < 2 || rh < 2) break
  }
  return rs
}

const rectsA = buildRects(AX, AY, W0, H0)
const rectsB = buildRects(BX, BY, W0, H0)

// ── SVG helpers ───────────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg'
function mk(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  if (parent) parent.appendChild(e)
  return e
}
function extLine(x1, y1, x2, y2, reach = 6000) {
  const dx = x2 - x1, dy = y2 - y1
  const d  = Math.sqrt(dx * dx + dy * dy) || 1
  return {
    x1: (x1 - dx / d * reach).toFixed(2),
    y1: (y1 - dy / d * reach).toFixed(2),
    x2: (x2 + dx / d * reach).toFixed(2),
    y2: (y2 + dy / d * reach).toFixed(2)
  }
}

const gR  = document.getElementById('g-rects')
const gD  = document.getElementById('g-diags')
const gX  = document.getElementById('g-cross')
const gO  = document.getElementById('g-ornament')
const gS  = document.getElementById('g-spirals')
const gF  = document.getElementById('g-flourish')
const GREY = '#A9A9A9'

// ── Construction rects ────────────────────────────────────
for (const rs of [rectsA, rectsB]) {
  for (let i = 0; i < rs.length; i++) {
    const [rx, ry, rw, rh] = rs[i]
    const op = Math.max(0.1, 0.48 - i * 0.07).toFixed(2)
    mk('rect', {
      x: rx.toFixed(2), y: ry.toFixed(2),
      width: rw.toFixed(2), height: rh.toFixed(2),
      stroke: GREY, 'stroke-width': '1', opacity: op, fill: 'none'
    }, gR)
  }
  const [rx, ry, rw, rh] = rs[0]
  mk('line', { ...extLine(rx, ry, rx+rw, ry+rh),
    stroke: GREY, 'stroke-width': '1', opacity: '0.2', fill: 'none' }, gD)
  mk('line', { ...extLine(rx+rw, ry, rx, ry+rh),
    stroke: GREY, 'stroke-width': '1', opacity: '0.2', fill: 'none' }, gD)
  for (let i = 1; i < Math.min(rs.length, 4); i++) {
    const [sx, sy, sw, sh] = rs[i]
    const op = Math.max(0.05, 0.14 - i * 0.03).toFixed(2)
    mk('line', { ...extLine(sx, sy, sx+sw, sy+sh),
      stroke: GREY, 'stroke-width': '1', opacity: op, fill: 'none' }, gD)
    mk('line', { ...extLine(sx+sw, sy, sx, sy+sh),
      stroke: GREY, 'stroke-width': '1', opacity: op, fill: 'none' }, gD)
  }
}

// ── Windmill crossbars ────────────────────────────────────
const CROSS_ANG = 30 * Math.PI / 180
const cc = Math.cos(CROSS_ANG), cs = Math.sin(CROSS_ANG)
mk('line', { ...extLine(CX + cc, CY - cs, CX - cc, CY + cs),
  stroke: GREY, 'stroke-width': '1', opacity: '0.38', fill: 'none' }, gX)
mk('line', { ...extLine(CX + cs, CY + cc, CX - cs, CY - cc),
  stroke: GREY, 'stroke-width': '1', opacity: '0.38', fill: 'none' }, gX)

// ── Ornamental blue right-angle cross ─────────────────────
const T_CROSS = 6.1
const [ocx, ocy] = pt1(T_CROSS)
const ANG  = 38 * Math.PI / 180
const cosA = Math.cos(ANG), sinA = Math.sin(ANG)
mk('line', { ...extLine(ocx + cosA, ocy - sinA, ocx - cosA, ocy + sinA),
  stroke: '#4483DB', 'stroke-width': '1', opacity: '0.5', fill: 'none' }, gO)
mk('line', { ...extLine(ocx + sinA, ocy + cosA, ocx - sinA, ocy - cosA),
  stroke: '#4483DB', 'stroke-width': '1', opacity: '0.5', fill: 'none' }, gO)
const sq = 8
const sqPts = [
  [ocx + cosA * sq,             ocy - sinA * sq],
  [ocx + cosA * sq + sinA * sq, ocy - sinA * sq + cosA * sq],
  [ocx +            sinA * sq,  ocy +            cosA * sq],
].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
mk('polyline', { points: sqPts,
  stroke: '#4483DB', 'stroke-width': '1', opacity: '0.4', fill: 'none' }, gO)

// ── Yellow tangent ────────────────────────────────────────
const dt = 0.012, T1 = 5.6
const [tx0, ty0] = pt1(T1), [tx1, ty1] = pt1(T1 + dt)
mk('line', { ...extLine(tx0, ty0, tx1, ty1),
  stroke: '#FFAA00', 'stroke-width': '1', opacity: '0.65', fill: 'none' }, gF)

// ── Spiral strands ────────────────────────────────────────
const OFF = 0.12
function strand(fn, d, color) {
  mk('polyline', {
    points: pts(fn, d), stroke: color,
    'stroke-width': '1', 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', opacity: '0.85', fill: 'none'
  }, gS)
}
strand(pt1, 0,   '#FF4043')
strand(pt1, OFF, '#4483DB')
strand(pt2, 0,   '#FF4043')
strand(pt2, OFF, '#4483DB')

// ── Eye ───────────────────────────────────────────────────
mk('circle', { cx: CX, cy: CY, r: 1.5, fill: GREY, opacity: '0.4' }, gF)
