import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const spacing = 38
const influenceRadius = 132
const maxDisplacement = 24
const dotRadius = 2

function InteractiveDotField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let pixelRatio = 1
    let pointer = null
    let strength = 0
    let drawFrame = 0
    let fadeFrame = 0

    const draw = () => {
      context.clearRect(0, 0, width, height)

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          let offsetX = 0
          let offsetY = 0
          let proximity = 0

          if (pointer && strength > 0) {
            const deltaX = x - pointer.x
            const deltaY = y - pointer.y
            const distance = Math.hypot(deltaX, deltaY)

            if (distance < influenceRadius) {
              proximity = (1 - distance / influenceRadius) ** 2 * strength
              const directionX = distance > 0 ? deltaX / distance : 1
              const directionY = distance > 0 ? deltaY / distance : 0
              offsetX = directionX * maxDisplacement * proximity
              offsetY = directionY * maxDisplacement * proximity
            }
          }

          context.beginPath()
          context.arc(x + offsetX, y + offsetY, dotRadius + proximity * 0.6, 0, Math.PI * 2)
          context.fillStyle = `rgba(218, 222, 230, ${0.46 + proximity * 0.28})`
          context.fill()
        }
      }
    }

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      draw()
    }

    const scheduleDraw = () => {
      if (!drawFrame) {
        drawFrame = window.requestAnimationFrame(() => {
          drawFrame = 0
          draw()
        })
      }
    }

    const fadeBack = (startTime, startingStrength) => {
      const step = (time) => {
        const progress = Math.min((time - startTime) / 420, 1)
        strength = startingStrength * (1 - progress) ** 2
        draw()

        if (progress < 1) {
          fadeFrame = window.requestAnimationFrame(step)
        } else {
          fadeFrame = 0
          pointer = null
          strength = 0
        }
      }

      fadeFrame = window.requestAnimationFrame(step)
    }

    const handlePointerMove = (event) => {
      if (reducedMotion || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) {
        return
      }

      pointer = { x: event.clientX, y: event.clientY }
      strength = 1

      if (fadeFrame) {
        window.cancelAnimationFrame(fadeFrame)
        fadeFrame = 0
      }

      scheduleDraw()
    }

    const handlePointerLeave = (event) => {
      if (reducedMotion || !pointer || event.relatedTarget) {
        return
      }

      if (fadeFrame) {
        window.cancelAnimationFrame(fadeFrame)
      }

      fadeBack(performance.now(), strength)
    }

    const handleWindowBlur = () => {
      if (!pointer || reducedMotion) {
        return
      }

      if (fadeFrame) {
        window.cancelAnimationFrame(fadeFrame)
      }

      fadeBack(performance.now(), strength)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerLeave)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerLeave)
      window.removeEventListener('blur', handleWindowBlur)

      if (drawFrame) {
        window.cancelAnimationFrame(drawFrame)
      }

      if (fadeFrame) {
        window.cancelAnimationFrame(fadeFrame)
      }
    }
  }, [])

  return createPortal(
    <canvas ref={canvasRef} className="interactive-dot-field" aria-hidden="true" />,
    document.body,
  )
}

export default InteractiveDotField
