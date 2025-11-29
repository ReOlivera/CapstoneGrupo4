import { useState, useEffect } from 'react'
import { veterinarioService } from '../services/api'
import './NuestrosProfesionales.css'

export default function NuestrosProfesionales() {
  const [veterinarios, setVeterinarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarVeterinarios = async () => {
      try {
        setIsLoading(true)
        const veterinariosData = await veterinarioService.getAll()
        setVeterinarios(veterinariosData || [])
      } catch (error) {
        console.error('Error al cargar veterinarios:', error)
        // Si hay error, usar datos por defecto
        setVeterinarios([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarVeterinarios()
  }, [])

  // Datos por defecto si no hay veterinarios en el backend
  const draPilarZoccola = {
    nombre: 'Dra. Pilar Zoccola',
    cargo: 'DIRECTORA MÉDICA',
    imagen: '/assets/pilar-zoccola.jpeg', // Imagen estática que subirás
    bio: [
      'La Dra. Pilar Zoccola es médica veterinaria con amplia trayectoria clínica y de gestión. Se ha especializado en medicina interna, cirugía de tejidos blandos y manejo del dolor, participando en programas de perfeccionamiento en centros nacionales e internacionales.',
      'Comprometida con la medicina basada en evidencia, la seguridad del paciente y el trato humano hacia las familias, lidera el equipo médico de la clínica.'
    ]
  }

  // Combinar profesionales: primero la Dra. Pilar Zoccola, luego los del backend
  const profesionalesBackend = veterinarios.length > 0 
    ? veterinarios.map((vet, index) => ({
        nombre: vet.nombre || `Veterinario ${index + 1}`,
        cargo: vet.especialidad ? `ESPECIALISTA EN ${vet.especialidad.toUpperCase()}` : 'VETERINARIO',
        imagen: '/assets/logo-pucara.png', // Imagen por defecto para otros profesionales
        bio: [
          vet.descripcion || `Profesional veterinario con experiencia en el cuidado de animales.`,
          vet.email ? `Contacto: ${vet.email}` : ''
        ].filter(Boolean)
      }))
    : []

  // Siempre mostrar primero a la Dra. Pilar Zoccola
  const profesionales = [draPilarZoccola, ...profesionalesBackend]

  if (isLoading) {
    return (
      <div className="page profesionales-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando profesionales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page profesionales-page">
      <h1 className="pros-title">Nuestros profesionales</h1>

      {profesionales.map((profesional, index) => {
        const isReverse = index % 2 === 1
        return (
          <section key={index} className={`pro-row ${isReverse ? 'reverse' : ''}`}>
            <div className="pro-image">
              <img 
                src={profesional.imagen || "/assets/logo-pucara.png"} 
                alt={profesional.nombre} 
              />
            </div>
            <div className="pro-content">
              <span className="pro-badge">{profesional.cargo}</span>
              <h2 className="pro-name">{profesional.nombre}</h2>
              {profesional.bio.map((parrafo, pIndex) => (
                <p key={pIndex} className="pro-bio">{parrafo}</p>
              ))}
              <button 
                className="pros-cta" 
                onClick={() => window.location.href = '/reserva'}
              >
                AGENDAR AHORA
              </button>
            </div>
          </section>
        )
      })}

      {/* Si hay menos de 2 profesionales, mostrar placeholder para el segundo */}
      {profesionales.length < 2 && (
        <section className="pro-row reverse">
          <div className="pro-content">
            <span className="pro-badge">SUBDIRECTOR MÉDICO</span>
            <h2 className="pro-name">Próximamente</h2>
            <p className="pro-bio">
              Actualizaremos esta sección con la información del segundo profesional, su
              trayectoria, especialidades y enfoque de atención.
            </p>
            <button 
              className="pros-cta" 
              onClick={() => window.location.href = '/reserva'}
            >
              AGENDAR AHORA
            </button>
          </div>
          <div className="pro-image">
            <img src="/assets/logo-pucara.png" alt="Profesional próximamente" />
          </div>
        </section>
      )}
    </div>
  )
}
