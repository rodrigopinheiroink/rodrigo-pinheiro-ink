import './App.css'
import InteractiveDotField from './InteractiveDotField.jsx'
import tattooFirst from './assets/optimized/Tatuagem.webp'
import tattooGeometry from './assets/optimized/Tatuagem-geo.webp'
import tattooGeometric from './assets/optimized/Tatuagem-geometric.webp'
import tattooGeometricC from './assets/optimized/Tatuagem-geometricc.webp'
import tattooGeometricCC from './assets/optimized/Tatuagem-geometriccc.webp'
import tattooGeometricCCC from './assets/optimized/Tatuagem-geometricccc.webp'
import artistPortrait from './assets/perfil.webp'
import profileFirst from './assets/perfill.webp'
import profileSecond from './assets/perfilll.webp'
import profileThird from './assets/perfillll.webp'
import { useEffect, useRef } from 'react'

// Esta classe reúne os dados públicos do tatuador em um único objeto.
// Ela é um exemplo pequeno de POO: a classe possui dados e métodos.
class TattooArtist {
  constructor(name, instagram, phone, address) {
    this.name = name
    this.instagram = instagram
    this.phone = phone
    this.address = address
  }

  // Este método transforma o telefone em um link direto para o WhatsApp.
  getWhatsAppLink() {
    const cleanPhone = this.phone.replace(/\D/g, '')
    return `https://wa.me/55${cleanPhone}`
  }
}

// Instância com os dados reais do portfólio.
const artist = new TattooArtist(
  'Rodrigo Pinheiro Ink',
  '@rodrigopinheiroink',
  '51 989261858',
  'Juca Batista, 770',
)

// Cada objeto deste array representa um item da galeria.
const tattooWorks = [
  { image: tattooFirst },
  { image: tattooGeometry },
  { image: tattooGeometric },
  { image: tattooGeometricC },
  { image: tattooGeometricCC },
  { image: tattooGeometricCCC },
]

const profileWorks = [
  { image: artistPortrait },
  { image: profileFirst },
  { image: profileSecond },
  { image: profileThird },
]

function wrapCarouselOffset(offset, period) {
  const normalized = ((offset % period) + period) % period
  return normalized === 0 ? -period : normalized - period
}

function WorkCarousel({ works, label, imageAlt }) {
  const carouselRef = useRef(null)
  const trackRef = useRef(null)
  const motionRef = useRef({
    offset: 0,
    period: 0,
    lastFrame: null,
    direction: -1,
    userDirected: false,
    dragging: false,
    hovered: false,
    continueAfterDrag: false,
    hasDragged: false,
    pointerId: null,
    pointerX: 0,
    releaseStartedAt: null,
    peakSpeed: 0,
    prefersReducedMotion: false,
    touchHoveredCard: null,
  })

  useEffect(() => {
    const track = trackRef.current
    const motion = motionRef.current
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame

    const measurePeriod = () => {
      const firstGroup = track.firstElementChild
      if (!firstGroup) return

      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
      motion.period = firstGroup.getBoundingClientRect().width + gap
      if (motion.period > 0) {
        motion.offset = wrapCarouselOffset(motion.offset, motion.period)
        track.style.transform = `translate3d(${motion.offset}px, 0, 0)`
      }
    }

    const updateReducedMotion = () => {
      motion.prefersReducedMotion = reducedMotionQuery.matches
    }

    const animate = (timestamp) => {
      if (motion.lastFrame === null) motion.lastFrame = timestamp
      const elapsed = Math.min((timestamp - motion.lastFrame) / 1000, 0.05)
      motion.lastFrame = timestamp

      if (!motion.dragging && (!motion.hovered || motion.releaseStartedAt !== null || motion.continueAfterDrag)) {
        let speed = motion.prefersReducedMotion && !motion.userDirected ? 0 : motion.direction * 42

        if (motion.releaseStartedAt !== null) {
          const progress = Math.min((timestamp - motion.releaseStartedAt) / 1100, 1)
          const easedProgress = 1 - (1 - progress) ** 3
          speed = motion.peakSpeed + (motion.direction * 42 - motion.peakSpeed) * easedProgress

          if (progress === 1) motion.releaseStartedAt = null
        }

        motion.offset += speed * elapsed
        if (motion.period > 0) {
          motion.offset = wrapCarouselOffset(motion.offset, motion.period)
        }
        track.style.transform = `translate3d(${motion.offset}px, 0, 0)`
      }

      animationFrame = requestAnimationFrame(animate)
    }

    updateReducedMotion()
    measurePeriod()
    const resizeObserver = new ResizeObserver(measurePeriod)
    resizeObserver.observe(track.firstElementChild)
    reducedMotionQuery.addEventListener('change', updateReducedMotion)
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      reducedMotionQuery.removeEventListener('change', updateReducedMotion)
    }
  }, [])

  const updateTouchHover = (event) => {
    if (event.pointerType !== 'touch') return

    const carousel = carouselRef.current
    const target = document.elementFromPoint(event.clientX, event.clientY)
    const card = target?.closest('.work-card')
    const nextCard = card && carousel?.contains(card) ? card : null
    const motion = motionRef.current

    if (motion.touchHoveredCard === nextCard) return

    motion.touchHoveredCard?.classList.remove('is-touch-hover')
    nextCard?.classList.add('is-touch-hover')
    motion.touchHoveredCard = nextCard
  }

  const clearTouchHover = () => {
    const motion = motionRef.current
    motion.touchHoveredCard?.classList.remove('is-touch-hover')
    motion.touchHoveredCard = null
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.isPrimary === false) return

    updateTouchHover(event)
    const motion = motionRef.current
    motion.dragging = true
    motion.continueAfterDrag = false
    motion.hasDragged = false
    motion.releaseStartedAt = null
    motion.pointerId = event.pointerId
    motion.pointerX = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    updateTouchHover(event)
    const motion = motionRef.current
    if (!motion.dragging || motion.pointerId !== event.pointerId) return

    const delta = event.clientX - motion.pointerX
    motion.pointerX = event.clientX
    if (delta === 0) return

    motion.hasDragged = true
    motion.direction = Math.sign(delta)
    motion.userDirected = true
    motion.peakSpeed = motion.direction * 260
    motion.offset += delta
    if (motion.period > 0) {
      motion.offset = wrapCarouselOffset(motion.offset, motion.period)
    }
    trackRef.current.style.transform = `translate3d(${motion.offset}px, 0, 0)`
  }

  const handlePointerUp = (event) => {
    const motion = motionRef.current
    clearTouchHover()
    if (!motion.dragging || motion.pointerId !== event.pointerId) return

    motion.dragging = false
    motion.pointerId = null
    motion.continueAfterDrag = motion.hasDragged
    motion.releaseStartedAt = motion.hasDragged ? performance.now() : null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlePointerLeave = () => {
    const motion = motionRef.current
    motion.hovered = false
    motion.continueAfterDrag = false
  }

  return (
    <div
      ref={carouselRef}
      className="work-carousel"
      role="region"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={() => { motionRef.current.hovered = true }}
      onPointerLeave={handlePointerLeave}
    >
      <div className="work-track" ref={trackRef}>
        <div className="work-group">
          {works.map((work) => (
            <article className="work-card" key={work.image}>
              <img src={work.image} alt={imageAlt} loading="lazy" decoding="async" fetchPriority="low" draggable="false" />
            </article>
          ))}
        </div>
        <div className="work-group" aria-hidden="true">
          {works.map((work) => (
            <article className="work-card" key={`duplicate-${work.image}`}>
              <img src={work.image} alt="" loading="lazy" decoding="async" fetchPriority="low" draggable="false" />
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Voltar ao início">
          <span className="brand-mark">RPI</span>
          <span>{artist.name}</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#trabalhos">Trabalhos</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>
      <section className="hero-section" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">TATUAGEM AUTORAL · PORTO ALEGRE</p>
          <h1>O silêncio dos pontos, marcado na pele.</h1>
          <p className="hero-text">Tatuagens de pontilhismo feitas com calma e paciência, projetos pensados para respeitar o seu corpo.</p>
          <a className="button button-dark" href={artist.getWhatsAppLink()} target="_blank" rel="noreferrer">Solicitar orçamento</a>
        </div>
        <div className="hero-art" aria-label="Composição abstrata de pontos" role="img">
          <span className="ink-circle ink-circle-large"></span>
          <span className="ink-circle ink-circle-small"></span>
          <span className="hero-caption">DOT<br />WORKER</span>
        </div>
      </section>
      <section className="works-section section-width" id="trabalhos">
        <div className="section-heading">
          <div>
            
            <h2>Alguns dos meus Trabalhos</h2>
          </div>
          <p>Desenhos que encontram equilíbrio entre precisão, textura e personalidade.</p>
        </div>
        <WorkCarousel
          works={tattooWorks}
          label="Galeria de tatuagens. Arraste para mudar a direção."
          imageAlt="Tatuagem de pontilhismo"
        />
      </section>
      <section className="about-section section-width" id="sobre">
        
        <div className="about-content">
          <p className="eyebrow">SOBRE O PROCESSO</p>
          <h2>Cada ponto tem um propósito.</h2>
          <p>O pontilhismo constrói imagens por meio de pequenos pontos, criando sombras, volume e movimento. Meu trabalho começa na conversa: entendendo sua ideia, estudando o espaço do seu corpo e desenhando algo que faça sentido para você.</p>
          <div className="process-list">
            <div>
              <span>01</span>
              <strong>Conversa</strong>
              <p>Uma troca para entender sua referência e intenção.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Desenho</strong>
              <p>Uma composição autoral pensada para o seu corpo.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Tatuagem</strong>
              <p>Um momento tranquilo, com atenção a cada detalhe.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="contact-section" id="contato">
        <div className="section-width contact-inner">
          <div className="contact-brand">
            <WorkCarousel
              works={profileWorks}
              label="Galeria de fotos de Rodrigo Pinheiro. Arraste para mudar a direção."
              imageAlt="Foto de Rodrigo Pinheiro"
            />
            <h2>Rodrigo Pinheiro INK.</h2>
          </div>
          <div className="contact-details">
            <div className="contact-links">
              <a className="button button-dark contact-link" href={artist.getWhatsAppLink()} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className="button button-dark contact-link" href="https://instagram.com/rodrigopinheiroink" target="_blank" rel="noreferrer">Instagram</a>
            </div>
            <a
              className="address"
              href="https://www.google.com/maps/search/?api=1&query=Av.+Juca+Batista%2C+770+-+Ipanema%2C+Porto+Alegre+-+RS%2C+91770-000"
              target="_blank"
              rel="noreferrer"
            >
              Estúdio Rodrigo Pinheiro Ink<br />{artist.address} · Porto Alegre, RS
            </a>
          </div>
        </div>
      </section>
      <InteractiveDotField />
      <footer className="site-footer section-width">
        <span>© 2026 {artist.name}</span>
      </footer>
    </main>
  )
}

export default App
