import { useEffect, useRef, useState } from 'react'

export function DesktopCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    // Only run on fine-pointer (mouse) devices
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!isPointerFine) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let animId

    function onMouseMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!visible) setVisible(true)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      // Check if hovering over interactive element
      const target = e.target
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.interactive') ||
        target.closest('.transit-card')
      )
      setHovered(Boolean(isInteractive))
    }

    function onMouseLeave() {
      setVisible(false)
    }

    function onMouseEnter() {
      setVisible(true)
    }

    function render() {
      // Smooth lerp for trailing ring
      ringX += (mouseX - ringX) * 0.22
      ringY += (mouseY - ringY) * 0.22

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      }

      animId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(animId)
    }
  }, [visible])

  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return null
  }

  return (
    <>
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${hovered ? 'cursor-hover' : ''}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
    </>
  )
}
