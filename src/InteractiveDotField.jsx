import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const spacing = 38
const influenceRadius = 132
const maxDisplacement = 24
const dotRadius = 2
const wavePath = new Path2D(
  'M-120 255C10 135 130 160 275 248S460 362 595 274 823 148 950 250s193 125 278 7 189-121 312-1v182c-122-91-202-90-321 1s-187 102-294 4-207-111-333-12-201 117-326 5S76 319-120 440Z',
)

function InteractiveDotField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const waveMaskContext = document.createElement('canvas').getContext('2d')

    if (!canvas || !context || !waveMaskContext) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let pixelRatio = 1
    let pointer = null
    let strength = 0
    let drawFrame = 0
    let waveFrame = 0
    let fadeFrame = 0
    let lastWaveDraw = 0
    const hero = document.querySelector('.hero-section')

    const draw = () => {
      context.clearRect(0, 0, width, height)

      const heroRect = hero?.getBoundingClientRect()
      const waveTransform = hero
        ? new DOMMatrix(getComputedStyle(hero, '::before').transform)
        : null
      const waveScale = heroRect
        ? Math.max(heroRect.width / 1440, heroRect.height / 900)
        : 0
      const backgroundOffsetX = heroRect
        ? (heroRect.width - 1440 * waveScale) / 2
        : 0
      const originX = heroRect ? heroRect.width / 2 : 0
      const originY = heroRect ? heroRect.height / 2 : 0
      const determinant = waveTransform
        ? waveTransform.a * waveTransform.d - waveTransform.b * waveTransform.c
        : 0

      const isInsideWave = (x, y) => {
        if (!heroRect || !waveTransform || !determinant || !waveScale) {
          return false
        }

        const transformedX = x - heroRect.left - originX - waveTransform.e
        const transformedY = y - heroRect.top - originY - waveTransform.f
        const localX =
          (waveTransform.d * transformedX - waveTransform.c * transformedY) / determinant +
          originX
        const localY =
          (-waveTransform.b * transformedX + waveTransform.a * transformedY) / determinant +
          originY

        return waveMaskContext.isPointInPath(
          wavePath,
          (localX - backgroundOffsetX) / waveScale,
          localY / waveScale,
        )
      }

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

          if (isInsideWave(x + offsetX, y + offsetY)) {
            continue
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

    const redrawWave = (time) => {
      if (time - lastWaveDraw >= 33) {
        draw()
        lastWaveDraw = time
      }

      waveFrame = window.requestAnimationFrame(redrawWave)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerLeave)
    window.addEventListener('blur', handleWindowBlur)

    if (!reducedMotion) {
      waveFrame = window.requestAnimationFrame(redrawWave)
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerLeave)
      window.removeEventListener('blur', handleWindowBlur)

      if (drawFrame) {
        window.cancelAnimationFrame(drawFrame)
      }

      if (waveFrame) {
        window.cancelAnimationFrame(waveFrame)
      }

      if (fadeFrame) {
        window.cancelAnimationFrame(fadeFrame)
      }
    }
  }, [])

  const root = document.getElementById('root')

  return createPortal(
    <canvas ref={canvasRef} className="interactive-dot-field" aria-hidden="true" />,
    root,
  )
}

export default InteractiveDotField
