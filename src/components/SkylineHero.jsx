import { useEffect, useRef, useState } from 'react'

function getSolarState() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

export function SkylineHero({ eyebrow, title, italic, sub }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [localTimeStr, setLocalTimeStr] = useState('')
  const [solarState] = useState(getSolarState)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setLocalTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    let width = 0
    let height = 0
    let trainX = -120

    // Parallax offsets tracked in refs to avoid React re-renders
    const targetOffset = { x: 0, y: 0 }
    const currentOffset = { x: 0, y: 0 }

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      width = canvas.width = rect.width * window.devicePixelRatio
      height = canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    // Pointer move listener for desktop
    function onMouseMove(e) {
      if (isReduced) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      targetOffset.x = relX * 28
      targetOffset.y = relY * 16
    }

    // Scroll listener for mobile & desktop parallax
    function onScroll() {
      if (isReduced) return
      const scrollY = window.scrollY
      targetOffset.y = Math.min(scrollY * 0.12, 35)
    }

    // Optional tilt for mobile (passive, never blocks)
    function onDeviceOrientation(e) {
      if (isReduced || !e.gamma) return
      targetOffset.x = Math.max(-25, Math.min(25, e.gamma * 0.8))
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', onMouseMove, { passive: true })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true })
    }

    // Skyline Building Data
    const bgBuildings = [
      { x: 0.05, w: 0.12, h: 0.65 },
      { x: 0.18, w: 0.08, h: 0.80 },
      { x: 0.28, w: 0.15, h: 0.55 },
      { x: 0.45, w: 0.10, h: 0.90, antenna: true },
      { x: 0.58, w: 0.14, h: 0.72 },
      { x: 0.74, w: 0.11, h: 0.60 },
      { x: 0.87, w: 0.14, h: 0.75 },
    ]

    const fgBuildings = [
      { x: 0.0, w: 0.15, h: 0.45 },
      { x: 0.14, w: 0.12, h: 0.52 },
      { x: 0.28, w: 0.18, h: 0.38 },
      { x: 0.48, w: 0.13, h: 0.48 },
      { x: 0.63, w: 0.16, h: 0.42 },
      { x: 0.81, w: 0.20, h: 0.50 },
    ]

    // Stars for night time
    const stars = Array.from({ length: 42 }).map(() => ({
      x: Math.random(),
      y: Math.random() * 0.55,
      r: Math.random() * 1.5 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
    }))

    let isVisible = true
    function handleVisibility() {
      isVisible = !document.hidden
      if (isVisible) render()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    function render() {
      if (!isVisible) return

      const w = width / window.devicePixelRatio
      const h = height / window.devicePixelRatio
      ctx.clearRect(0, 0, w, h)

      // Lerp parallax
      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.08
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.08

      // 1. SKY GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
      if (solarState === 'dawn') {
        skyGrad.addColorStop(0, '#3b0764')
        skyGrad.addColorStop(0.4, '#c026d3')
        skyGrad.addColorStop(0.7, '#f97316')
        skyGrad.addColorStop(1, '#fef08a')
      } else if (solarState === 'day') {
        skyGrad.addColorStop(0, '#0284c7')
        skyGrad.addColorStop(0.5, '#38bdf8')
        skyGrad.addColorStop(0.85, '#bae6fd')
        skyGrad.addColorStop(1, '#f1f5f9')
      } else if (solarState === 'dusk') {
        skyGrad.addColorStop(0, '#1e1b4b')
        skyGrad.addColorStop(0.4, '#6b21a8')
        skyGrad.addColorStop(0.7, '#ea580c')
        skyGrad.addColorStop(1, '#fef08a')
      } else {
        // Night
        skyGrad.addColorStop(0, '#090a0f')
        skyGrad.addColorStop(0.5, '#0f172a')
        skyGrad.addColorStop(1, '#1e293b')
      }
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h)

      // Stars in Night or Twilight
      if (solarState === 'night' || solarState === 'dusk') {
        stars.forEach((star) => {
          star.twinkle += 0.03
          const alpha = 0.3 + Math.sin(star.twinkle) * 0.4
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`
          ctx.beginPath()
          ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Moon or Sun
      const sunY = solarState === 'night' ? h * 0.22 : h * 0.25
      const sunX = w * 0.78
      ctx.beginPath()
      ctx.arc(sunX + currentOffset.x * 0.2, sunY + currentOffset.y * 0.2, 28, 0, Math.PI * 2)
      if (solarState === 'night') {
        ctx.fillStyle = '#fef08a'
        ctx.shadowColor = 'rgba(254, 240, 138, 0.4)'
        ctx.shadowBlur = 18
      } else if (solarState === 'dusk' || solarState === 'dawn') {
        ctx.fillStyle = '#f97316'
        ctx.shadowColor = 'rgba(249, 115, 22, 0.6)'
        ctx.shadowBlur = 24
      } else {
        ctx.fillStyle = '#facc15'
        ctx.shadowColor = 'rgba(250, 204, 21, 0.5)'
        ctx.shadowBlur = 28
      }
      ctx.fill()
      ctx.shadowBlur = 0

      // 2. BACKGROUND LAYER (Distant towers, 0.3x parallax)
      const bgOffsetX = currentOffset.x * 0.3
      const bgOffsetY = currentOffset.y * 0.3
      ctx.fillStyle = solarState === 'night' ? '#141824' : 'rgba(30, 41, 59, 0.65)'
      bgBuildings.forEach((b) => {
        const bx = b.x * w + bgOffsetX
        const bw = b.w * w
        const bh = b.h * (h * 0.5)
        const by = h - bh + bgOffsetY
        ctx.fillRect(bx, by, bw, bh)

        if (b.antenna) {
          ctx.strokeStyle = ctx.fillStyle
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(bx + bw / 2, by)
          ctx.lineTo(bx + bw / 2, by - 24)
          ctx.stroke()
          // Blinking red beacon on antenna
          if (Math.sin(Date.now() / 300) > 0) {
            ctx.fillStyle = '#ef4444'
            ctx.beginPath()
            ctx.arc(bx + bw / 2, by - 25, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = solarState === 'night' ? '#141824' : 'rgba(30, 41, 59, 0.65)'
          }
        }
      })

      // 3. ELEVATED METRO TRACK & MOVING TRAIN (0.6x parallax)
      const trackY = h * 0.68 + currentOffset.y * 0.5
      ctx.strokeStyle = solarState === 'night' ? '#334155' : '#0f172a'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(0, trackY)
      ctx.lineTo(w, trackY)
      ctx.stroke()

      // Track Pillars
      ctx.lineWidth = 3
      for (let px = 30; px < w; px += 80) {
        ctx.beginPath()
        ctx.moveTo(px, trackY)
        ctx.lineTo(px, h)
        ctx.stroke()
      }

      // Moving Metro Train
      trainX = (trainX + 1.2) % (w + 240)
      const curTrainX = trainX - 120
      const trainY = trackY - 14
      ctx.fillStyle = '#0057b7' // Line color
      ctx.fillRect(curTrainX, trainY, 80, 12)
      // Headlight
      ctx.fillStyle = '#fef08a'
      ctx.beginPath()
      ctx.arc(curTrainX + 80, trainY + 6, 3, 0, Math.PI * 2)
      ctx.fill()
      // Train windows with yellow glow
      ctx.fillStyle = '#fef08a'
      for (let win = 8; win < 72; win += 14) {
        ctx.fillRect(curTrainX + win, trainY + 3, 8, 5)
      }

      // 4. FOREGROUND ARCHITECTURE (1.0x parallax)
      const fgOffsetX = currentOffset.x * 0.9
      const fgOffsetY = currentOffset.y * 0.8
      ctx.fillStyle = solarState === 'night' ? '#0d1117' : '#090d16'
      fgBuildings.forEach((b) => {
        const bx = b.x * w + fgOffsetX
        const bw = b.w * w
        const bh = b.h * (h * 0.45)
        const by = h - bh + fgOffsetY
        ctx.fillRect(bx, by, bw, bh)

        // Random illuminated windows
        ctx.fillStyle = solarState === 'night' ? 'rgba(254, 240, 138, 0.75)' : 'rgba(255, 255, 255, 0.4)'
        for (let row = by + 12; row < h - 10; row += 16) {
          for (let col = bx + 8; col < bx + bw - 10; col += 14) {
            const seed = Math.sin(col * 77 + row * 93)
            if (seed > 0.15) {
              ctx.fillRect(col, row, 6, 8)
            }
          }
        }
        ctx.fillStyle = solarState === 'night' ? '#0d1117' : '#090d16'
      })

      // Soft vignette bottom fade
      const grad = ctx.createLinearGradient(0, h * 0.5, 0, h)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.85)')
      ctx.fillStyle = grad
      ctx.fillRect(0, h * 0.5, w, h * 0.5)

      if (!isReduced) {
        animId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      if (container) container.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('deviceorientation', onDeviceOrientation)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [solarState])

  return (
    <div
      ref={containerRef}
      className="hero mb-4"
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '2px solid var(--border-strong)',
        boxShadow: 'var(--shadow-riso)',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '24px 20px',
        color: '#ffffff',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span
            className="mono-spec"
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              background: 'rgba(0, 0, 0, 0.65)',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: solarState === 'night' ? '#38bdf8' : '#eab308',
              }}
            />
            {eyebrow}
          </span>
          <span
            className="mono-spec"
            style={{
              fontSize: 11,
              background: 'rgba(0, 0, 0, 0.65)',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#facc15',
            }}
          >
            {localTimeStr || 'LIVE'}
          </span>
        </div>

        <h1
          className="signage-heading riso-misregister"
          style={{
            fontSize: 'clamp(36px, 9vw, 56px)',
            margin: '4px 0 8px',
            color: '#ffffff',
            lineHeight: 0.95,
          }}
        >
          {title} <em style={{ fontStyle: 'italic', color: '#fef08a' }}>{italic}</em>
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            maxWidth: '46ch',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.4,
          }}
        >
          {sub}
        </p>
      </div>
    </div>
  )
}
