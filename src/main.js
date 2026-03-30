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
  stroke: '#9BC2E2', 'stroke-width': '1', opacity: '0.5', fill: 'none' }, gO)
mk('line', { ...extLine(ocx + sinA, ocy + cosA, ocx - sinA, ocy - cosA),
  stroke: '#9BC2E2', 'stroke-width': '1', opacity: '0.5', fill: 'none' }, gO)


// ── Yellow tangent ────────────────────────────────────────
const dt = 0.012, T1 = 5.6
const [tx0, ty0] = pt1(T1), [tx1, ty1] = pt1(T1 + dt)
mk('line', { ...extLine(tx0, ty0, tx1, ty1),
  stroke: '#FFD968', 'stroke-width': '1', opacity: '0.65', fill: 'none' }, gF)

// ── Spiral strands ────────────────────────────────────────
const OFF = 0.12
function strand(fn, d, color) {
  mk('polyline', {
    points: pts(fn, d), stroke: color,
    'stroke-width': '1', 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', opacity: '0.85', fill: 'none'
  }, gS)
}
strand(pt1, 0,   '#FF666A')
strand(pt1, OFF, '#9BC2E2')
strand(pt2, 0,   '#FF666A')
strand(pt2, OFF, '#9BC2E2')

// ── Eye ───────────────────────────────────────────────────
mk('circle', { cx: CX, cy: CY, r: 1.5, fill: GREY, opacity: '0.4' }, gF)

// ── Hover interaction ─────────────────────────────────────
;(function initHover() {
  const allV  = []
  const MAX_R = 2000

  /* ── collect eligible elements ──────────────────────────── */
  const eligible = []
  // large outer rects only (first rect in each set = indices 0 and 8)
  const rChildren = [...document.getElementById('g-rects').children]
  eligible.push(rChildren[0], rChildren[8])
  // main diagonals from rect A (first two in g-diags)
  const dChildren = [...document.getElementById('g-diags').children]
  eligible.push(dChildren[0], dChildren[1])
  // windmill crossbars (both lines in g-cross)
  eligible.push(...document.getElementById('g-cross').children)
  // blue ornamental cross
  eligible.push(...document.getElementById('g-ornament').children)
  // red + blue spirals
  eligible.push(...document.getElementById('g-spirals').children)
  // yellow tangent only (first child of g-flourish, skip eye circle)
  eligible.push(document.getElementById('g-flourish').children[0])

  /* ── wrap each eligible element ───────────────────────── */
  for (const el of eligible) {
    const parent = el.parentNode
    const sw = parseFloat(el.getAttribute('stroke-width') || '0')
    const op = el.getAttribute('opacity') || '1'

    const w = document.createElementNS(NS, 'g')
    w.classList.add('v')
    w.setAttribute('opacity', op)

    // hit area — generous on mobile (20px each side), 6px on desktop
    const hitPad = window.innerWidth <= 744 ? 40 : 12
    const h = el.cloneNode(true)
    h.classList.add('hit')
    h.setAttribute('stroke', 'transparent')
    h.setAttribute('stroke-width', String(sw + hitPad))
    h.setAttribute('fill', 'none')
    h.removeAttribute('opacity')

    // wide copy (3px stroke, behind vis, hidden until hover)
    const wide = el.cloneNode(true)
    wide.classList.add('wide')
    if (!el.getAttribute('stroke') || el.getAttribute('stroke') === 'none') {
      wide.setAttribute('stroke', el.getAttribute('fill') || '#000')
      wide.setAttribute('fill', 'none')
    }
    wide.setAttribute('stroke-width', '3')
    wide.removeAttribute('opacity')

    el.classList.add('vis')
    el.removeAttribute('opacity')

    w.appendChild(h)
    w.appendChild(wide)
    w.appendChild(el)
    parent.appendChild(w)
    allV.push({ g: w, vis: el, wide, busy: false })
  }

  /* ── activate / lifecycle (CSS clip-path, no JS loop) ── */
  function activate(idx, cx, cy) {
    const v = allV[idx]
    if (v.busy) return
    v.busy = true

    // convert screen → element local coords, then to fill-box coords
    const ctm = v.wide.getScreenCTM()
    if (!ctm) { v.busy = false; return }
    const lp  = new DOMPoint(cx, cy).matrixTransform(ctm.inverse())
    const bb  = v.wide.getBBox()
    const at  = `at ${lp.x - bb.x}px ${lp.y - bb.y}px`

    const s = v.wide.style
    s.visibility = 'visible'
    s.transition = 'none'
    s.clipPath   = `circle(0px ${at})`
    v.wide.getBoundingClientRect()            // force reflow

    // 2s expand
    s.transition = 'clip-path 2s linear'
    s.clipPath   = `circle(${MAX_R}px ${at})`

    v.wide.addEventListener('transitionend', function onExpand() {
      // expand done → linger 0.5s (remove clip so it's fully visible)
      s.transition = 'none'
      s.clipPath   = 'none'

      setTimeout(() => {
        // linger done → 1s retract
        s.clipPath = `circle(${MAX_R}px ${at})`
        v.wide.getBoundingClientRect()
        s.transition = 'clip-path 1s linear'
        s.clipPath   = `circle(0px ${at})`

        v.wide.addEventListener('transitionend', function onRetract() {
          s.visibility = ''
          s.clipPath   = ''
          s.transition = ''
          v.busy = false
        }, { once: true })
      }, 500)
    }, { once: true })
  }

  /* ── event listeners ──────────────────────────────────── */
  allV.forEach((v, i) => {
    v.g.addEventListener('mouseenter', (e) => activate(i, e.clientX, e.clientY))
    v.g.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const t = e.touches[0]
      activate(i, t.clientX, t.clientY)
    }, { passive: false })
  })
})()

// ── Poem line rotator (<= 744px) ─────────────────────────
;(function initPoemLine() {
  const el   = document.querySelector('.poem-line')
  const body = document.querySelector('.poem-body')
  if (!el || !body) return

  const lines = body.textContent.split('\n').map(l => l.trim()).filter(Boolean)
  let i = 0, busy = false, shown = false

  function color(idx) { return idx % 2 === 0 ? 'red' : 'blue' }

  function show() {
    if (shown) return
    shown = true
    el.textContent = lines[0]
    el.classList.remove('red', 'blue')
    el.classList.add(color(0), 'visible')
  }

  function advance() {
    if (busy) return
    busy = true

    // fade out
    el.classList.remove('visible')

    setTimeout(() => {
      // swap text and color
      i = (i + 1) % lines.length
      el.textContent = lines[i]
      el.classList.remove('red', 'blue')
      el.classList.add(color(i))

      // fade in
      el.classList.add('visible')
      setTimeout(() => { busy = false }, 550)
    }, 550)
  }

  el.addEventListener('click', advance)
  el.addEventListener('touchstart', advance, { passive: true })

  // show first line on load or resize into mobile
  function check() {
    if (window.innerWidth <= 744) show()
  }
  window.addEventListener('resize', check)
  setTimeout(check, 1500)
})()
