import './styles/Navbar.css'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <nav className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/') }} className="brand">
            <img className="brand-logo" src="/assets/logo-pucara-transparent.png" alt="Veterinaria Pucará" />
          </a>
          {/* Si quieres navegar a rutas internas, usa navigate en onClick.
              Por ahora dejamos anchors para secciones o páginas externas. */}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/') }}>Inicio</a>


          <div className="dropdown">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios') }}>Servicios ▾</a>
            <div className="dropdown-content">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/urgencia') }}>Urgencia</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/cirugias-procedimientos') }}>Cirugías y Procedimientos</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/peluqueria') }}>Peluqueria</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/hospitalizacion') }}>Hospitalizacion</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/atencion-medica-general') }}>Atención Médica General</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/diagnostico-laboratorio') }}>Diagnóstico y Laboratorio</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/servicios/cuidados-paliativos-eticos') }}>Cuidados Paliativos y Éticos</a>
            </div>
          </div>

          <div className="dropdown">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos') }}>Productos ▾</a>
            <div className="dropdown-content">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos/alimentos') }}>Alimentos</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos/medicamentos') }}>Medicamentos</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos/insumos') }}>Insumos</a>
            </div>
          </div>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/nuestra-clinica') }}>Nuestra Clínica</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/nuestros-profesionales') }}>Nuestros profesionales</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contacto') }}>Contacto</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/blog-veterinario') }}>Blog Veterinario</a>
        </nav>

        <div className="right-section">
          {/* Enlaces externos se mantienen con <a> */}
          <a href="https://wa.me/123456789" target="_blank" rel="noopener noreferrer">
            {/* Usa ruta desde public sin "public/" */}
            <img className="whatsapp-icon" src="public/assets/icons/whatsapp.svg.webp" alt="WhatsApp" />
          </a>

          {/* Botón que navega a /reserva */}
          <button
            className="cta"
            onClick={() => navigate('/reserva')}
            aria-label="Reservar hora"
          >
            RESERVA TU HORA
          </button>
        </div>
      </div>
    </header>
  )
}
