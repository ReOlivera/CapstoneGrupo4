import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { servicioService } from '../services/api'
import './ServicioDetalle.css'

// Información detallada por defecto para cada servicio
const serviciosInfoDetalle = {
  'urgencia': {
    nombre: 'Urgencia',
    descripcion: 'Nuestro servicio de urgencias veterinarias está disponible 24 horas al día, 7 días a la semana, para atender situaciones críticas que requieren atención inmediata. Contamos con equipamiento de última generación y un equipo médico altamente capacitado para manejar emergencias.',
    detalle: 'Ofrecemos atención inmediata para casos de intoxicación, accidentes, dificultades respiratorias, convulsiones, y cualquier otra emergencia médica que ponga en riesgo la vida de tu mascota.',
    imagen: '/assets/servicios/urgencia.jpg'
  },
  'cirugias-procedimientos': {
    nombre: 'Cirugías y Procedimientos',
    descripcion: 'Realizamos cirugías especializadas con los más altos estándares de calidad y seguridad. Nuestro quirófano cuenta con equipamiento moderno y seguimos protocolos de esterilización rigurosos.',
    detalle: 'Incluimos cirugías de esterilización, castración, cirugías de tejidos blandos, cirugías ortopédicas, extracciones dentales, y procedimientos quirúrgicos especializados según las necesidades de cada caso.',
    imagen: '/assets/servicios/cirugia.jpg'
  },
  'peluqueria': {
    nombre: 'Peluquería',
    descripcion: 'Servicio profesional de peluquería y estética canina y felina. Nuestros peluqueros están certificados y utilizan productos de alta calidad.',
    detalle: 'Ofrecemos baños terapéuticos, cortes de pelo según raza, corte de uñas, limpieza de oídos, cepillado dental, y tratamientos de belleza para mantener a tu mascota saludable y con buena apariencia.',
    imagen: '/assets/servicios/peluqueria.jpg'
  },
  'hospitalizacion': {
    nombre: 'Hospitalización',
    descripcion: 'Contamos con instalaciones de hospitalización con monitoreo constante las 24 horas. Nuestro equipo médico supervisa y cuida a tu mascota durante todo el tiempo que requiera internación.',
    detalle: 'Proporcionamos cuidados intensivos post-operatorios, tratamiento de enfermedades graves, administración de medicamentos intravenosos, y seguimiento médico continuo con equipos de monitoreo avanzados.',
    imagen: '/assets/servicios/hospitalizacion.jpg'
  },
  'atencion-medica-general': {
    nombre: 'Atención Médica General',
    descripcion: 'Consultas veterinarias generales para el cuidado integral de tu mascota. Realizamos chequeos de rutina, vacunaciones, desparasitaciones y tratamientos preventivos.',
    detalle: 'Incluimos exámenes físicos completos, programas de vacunación, planes de desparasitación, medicina preventiva, tratamiento de enfermedades comunes, y seguimiento de la salud general de tu mascota.',
    imagen: '/assets/servicios/atencion.jpg'
  },
  'diagnostico-laboratorio': {
    nombre: 'Diagnóstico y Laboratorio',
    descripcion: 'Laboratorio clínico equipado con tecnología avanzada para realizar análisis completos que nos permiten un diagnóstico preciso y oportuno.',
    detalle: 'Ofrecemos análisis de sangre completos, radiografías digitales, ecografías, análisis de orina y heces, pruebas de función hepática y renal, estudios de tiroides, y otros exámenes diagnósticos especializados.',
    imagen: '/assets/servicios/laboratorio.jpg'
  },
  'cuidados-paliativos-eticos': {
    nombre: 'Cuidados Paliativos y Éticos',
    descripcion: 'Servicio especializado que brinda atención compasiva y apoyo a mascotas en etapa terminal, enfocándonos en la calidad de vida y el bienestar.',
    detalle: 'Ofrecemos manejo del dolor, cuidados paliativos, asesoramiento sobre calidad de vida, apoyo emocional para las familias, y servicios de eutanasia humanitaria cuando es necesario, siempre con respeto y dignidad.',
    imagen: '/assets/servicios/cuidadospaliativos.jpg'
  }
}

export default function ServicioDetalle() {
  const { servicioId } = useParams()
  const navigate = useNavigate()
  const [servicio, setServicio] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarServicio = async () => {
      try {
        setIsLoading(true)
        
        // Intentar obtener del backend usando slug
        const servicioBackend = await servicioService.findBySlug(servicioId)
        
        if (servicioBackend) {
          // Usar datos del backend y complementar con información detallada si existe
          const infoDetalle = serviciosInfoDetalle[servicioId] || {}
          
          // Construir URL de imagen
          let imagenUrl = infoDetalle.imagen || '/assets/servicios/atencion.jpg'
          if (servicioBackend.imagenUrl) {
            // Si el servicio tiene imagenUrl, construir la URL completa
            if (servicioBackend.imagenUrl.startsWith('http://') || servicioBackend.imagenUrl.startsWith('https://')) {
              imagenUrl = servicioBackend.imagenUrl
            } else if (servicioBackend.imagenUrl.startsWith('/assets/')) {
              imagenUrl = `http://localhost:8082${servicioBackend.imagenUrl}`
            } else {
              imagenUrl = servicioBackend.imagenUrl
            }
          }
          
          setServicio({
            ...servicioBackend,
            nombre: servicioBackend.nombre || infoDetalle.nombre,
            descripcion: servicioBackend.descripcion || infoDetalle.descripcion || 'Servicio veterinario profesional',
            detalle: infoDetalle.detalle || servicioBackend.descripcion || 'Información detallada del servicio disponible.',
            imagen: imagenUrl
          })
        } else {
          // Si no se encuentra en el backend, intentar usar información por defecto
          const infoDetalle = serviciosInfoDetalle[servicioId]
          if (infoDetalle) {
            setServicio(infoDetalle)
          } else {
            // Último intento: buscar todos los servicios y buscar por nombre que coincida con el slug
            const todosServicios = await servicioService.getAll()
            const servicioPorNombre = todosServicios.find(s => {
              if (!s.nombre) return false
              const slugGenerado = s.nombre.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
              return slugGenerado === servicioId
            })
            
            if (servicioPorNombre) {
              let imagenUrl = '/assets/servicios/atencion.jpg'
              if (servicioPorNombre.imagenUrl) {
                if (servicioPorNombre.imagenUrl.startsWith('http://') || servicioPorNombre.imagenUrl.startsWith('https://')) {
                  imagenUrl = servicioPorNombre.imagenUrl
                } else if (servicioPorNombre.imagenUrl.startsWith('/assets/')) {
                  imagenUrl = `http://localhost:8082${servicioPorNombre.imagenUrl}`
                } else {
                  imagenUrl = servicioPorNombre.imagenUrl
                }
              }
              
              setServicio({
                ...servicioPorNombre,
                descripcion: servicioPorNombre.descripcion || 'Servicio veterinario profesional',
                detalle: servicioPorNombre.descripcion || 'Información detallada del servicio disponible.',
                imagen: imagenUrl
              })
            } else {
              setServicio(null)
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar servicio:', error)
        // Usar información por defecto en caso de error
        const infoDetalle = serviciosInfoDetalle[servicioId]
        setServicio(infoDetalle || null)
      } finally {
        setIsLoading(false)
      }
    }

    cargarServicio()
  }, [servicioId])

  if (isLoading) {
    return (
      <div className="page servicio-detalle-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando información del servicio...</p>
        </div>
      </div>
    )
  }

  if (!servicio) {
    return (
      <div className="page servicio-detalle-page">
        <h1>Servicio no encontrado</h1>
        <button onClick={() => navigate('/servicios')}>Volver a servicios</button>
      </div>
    )
  }

  const handleAgendar = () => {
    navigate(`/reserva?servicio=${servicioId}`)
  }

  return (
    <div className="page servicio-detalle-page">
      <button className="back-btn" onClick={() => navigate('/servicios')}>
        ← Volver a servicios
      </button>

      <div className="servicio-detalle-container">
        <div className="servicio-detalle-imagen">
          <img src={servicio.imagen} alt={servicio.nombre} />
        </div>

        <div className="servicio-detalle-info">
          <h1 className="servicio-detalle-titulo">{servicio.nombre}</h1>
          
          {servicio.precio && (
            <div className="servicio-precio">
              <strong>Precio: ${typeof servicio.precio === 'number' 
                ? servicio.precio.toLocaleString('es-CL') 
                : servicio.precio}</strong>
            </div>
          )}
          
          <div className="servicio-detalle-section">
            <h2>Descripción</h2>
            <p>{servicio.descripcion}</p>
          </div>

          {servicio.detalle && (
            <div className="servicio-detalle-section">
              <h2>Detalles del Servicio</h2>
              <p>{servicio.detalle}</p>
            </div>
          )}

          <button className="servicio-agendar-btn" onClick={handleAgendar}>
            Agenda tu hora
          </button>
        </div>
      </div>
    </div>
  )
}
