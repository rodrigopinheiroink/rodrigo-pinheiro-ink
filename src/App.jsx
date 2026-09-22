import './App.css'

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
  { title: 'Geometria sagrada', category: 'Pontilhismo · Blackwork', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc47?auto=format&fit=crop&w=900&q=85' },
  { title: 'Natureza em pontos', category: 'Pontilhismo · Fine line', image: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=900&q=85' },
  { title: 'Símbolo autoral', category: 'Criação personalizada', image: 'https://images.unsplash.com/photo-1542727365-19732a80dcfd?auto=format&fit=crop&w=900&q=85' },
]

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
          <a className="button button-dark" href={artist.getWhatsAppLink()} target="_blank" rel="noreferrer">Agendar conversa <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-art" aria-label="Composição abstrata de pontos" role="img">
          <span className="ink-circle ink-circle-large"></span>
          <span className="ink-circle ink-circle-small"></span>
          <span className="hero-caption">DOT<br />WORK</span>
        </div>
      </section>
      <section className="works-section section-width" id="trabalhos">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 · PORTFÓLIO</p>
            <h2>Trabalhos recentes</h2>
          </div>
          <p>Desenhos que encontram equilíbrio entre precisão, textura e personalidade.</p>
        </div>
        <div className="work-grid">
          {tattooWorks.map((work) => (
            <article className="work-card" key={work.title}>
              <img src={work.image} alt={`Exemplo de ${work.title}`} />
              <div className="work-info">
                <h3>{work.title}</h3>
                <p>{work.category}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="about-section section-width" id="sobre">
        <div className="about-number">02</div>
        <div className="about-content">
          <p className="eyebrow">SOBRE O PROCESSO</p>
          <h2>Cada ponto tem um propósito.</h2>
          <p>O pontilhismo constrói imagens por meio de pequenos pontos, criando sombras, volume e movimento. Meu trabalho começa na conversa: entendo sua ideia, estudo o espaço do corpo e desenho algo que faça sentido para você.</p>
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
          <div>
            <p className="eyebrow">03 · VAMOS CONVERSAR</p>
            <h2>Sua próxima marca começa aqui.</h2>
          </div>
          <div className="contact-details">
            <a className="contact-link" href={artist.getWhatsAppLink()} target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
            <a className="contact-link" href="https://instagram.com/rodrigopinheiroink" target="_blank" rel="noreferrer">Instagram <span>↗</span></a>
            <p className="address">Estúdio Rodrigo Pinheiro Ink<br />{artist.address} · Porto Alegre, RS</p>
          </div>
        </div>
      </section>
      <footer className="site-footer section-width">
        <span>© 2026 {artist.name}</span>
        <span>Feito com intenção.</span>
      </footer>
    </main>
  )
}

export default App
