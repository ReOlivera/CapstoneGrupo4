import './styles/Hero.css'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>Clínica Veterinaria Pucará</h1>
          <p>
            Brindamos atención veterinaria de alta calidad con más de 35 años de experiencia.
            ¡Agenda tu cita y da a tu consentido el cuidado que merece!
          </p>
          <div className="hero-buttons">
            {/* Navega a /reserva */}
            <button className="btn btn-green" onClick={() => navigate('/reserva')}>
              RESERVA TU HORA
            </button>

            {/* Llamada telefónica (mantener si tienes número) */}
            <button
              className="btn btn-outline"
              onClick={() => { window.location.href = 'tel:+56912345678' }}
            >
              LLÁMANOS
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
