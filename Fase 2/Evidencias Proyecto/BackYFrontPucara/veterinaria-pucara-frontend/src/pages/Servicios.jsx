import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { servicioService } from '../services/api'
import './Servicios.css'

// Mapeo de servicios del backend a slugs para URLs (fallback)
const servicioSlugs = {
  'Urgencia': 'urgencia',
  'Cirugías y Procedimientos': 'cirugias-procedimientos',
  'Peluquería': 'peluqueria',
  'Hospitalización': 'hospitalizacion',
  'Atención Médica General': 'atencion-medica-general',
  'Diagnóstico y Laboratorio': 'diagnostico-laboratorio',
  'Cuidados Paliativos y Éticos': 'cuidados-paliativos-eticos'
}

// Mapeo de slugs a imágenes por defecto (fallback si no hay imagenUrl)
const servicioImagenes = {
  'urgencia': '/assets/servicios/urgencia.jpg',
  'cirugias-procedimientos': '/assets/servicios/cirugia.jpg',
  'peluqueria': '/assets/servicios/peluqueria.jpg',
  'hospitalizacion': '/assets/servicios/hospitalizacion.jpg',
  'atencion-medica-general': '/assets/servicios/atencion.jpg',
  'diagnostico-laboratorio': '/assets/servicios/laboratorio.jpg',
  'cuidados-paliativos-eticos': '/assets/servicios/cuidadospaliativos.jpg'
}

export default function Servicios() {
  const navigate = useNavigate()
  const [servicios, setServicios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setIsLoading(true)
        // Obtener solo servicios activos del backend
        const serviciosData = await servicioService.getAll({ activo: true })
        
        // Si hay servicios del backend, usar los activos
        if (serviciosData && serviciosData.length > 0) {
          setServicios(serviciosData)
        } else {
          // Si no hay servicios activos, mostrar mensaje
          setServicios([])
        }
        setError(null)
      } catch (err) {
        console.error('Error al cargar servicios:', err)
        setError('No se pudieron cargar los servicios. Por favor, intenta más tarde.')
        setServicios([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarServicios()
  }, [])

  const getSlug = (nombre) => {
    // Primero verificar si existe en el mapeo estático
    if (servicioSlugs[nombre]) {
      return servicioSlugs[nombre]
    }
    // Si no, generar slug dinámico normalizando acentos y caracteres especiales
    return nombre.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/[^a-z0-9-]/g, '') // Eliminar caracteres especiales
  }

  const getImagen = (servicio) => {
    // Si el servicio tiene imagenUrl, construir la URL completa
    if (servicio.imagenUrl) {
      // Si ya es una URL completa, usarla directamente
      if (servicio.imagenUrl.startsWith('http://') || servicio.imagenUrl.startsWith('https://')) {
        return servicio.imagenUrl
      }
      // Si es una ruta relativa, construir la URL del backend
      if (servicio.imagenUrl.startsWith('/assets/')) {
        return `http://localhost:8082${servicio.imagenUrl}`
      }
      return servicio.imagenUrl
    }
    // Si no, usar el mapeo por defecto
    const slug = getSlug(servicio.nombre)
    return servicioImagenes[slug] || '/assets/servicios/atencion.jpg'
  }

  if (isLoading) {
    return (
      <div className="page servicios-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page servicios-page">
      <h1 className="servicios-title">Nuestros Servicios</h1>
      <p className="servicios-subtitle">
        Ofrecemos una amplia gama de servicios veterinarios para el cuidado completo de tu mascota
      </p>

      {error && (
        <div style={{ 
          background: '#ffebee', 
          border: '1px solid #f44336', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '2rem',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      {servicios.length > 0 ? (
        <div className="servicios-grid">
          {servicios.map(servicio => {
            const slug = getSlug(servicio.nombre)
            return (
              <div key={servicio.id || servicio.nombre} className="servicio-card">
                <div className="servicio-imagen">
                  <img 
                    src={getImagen(servicio)} 
                    alt={servicio.nombre}
                    onError={(e) => {
                      // Si falla la imagen del servicio, usar imagen por defecto
                      const slug = getSlug(servicio.nombre)
                      e.target.src = servicioImagenes[slug] || '/assets/servicios/atencion.jpg'
                    }}
                  />
                </div>
                <div className="servicio-info">
                  <h3 className="servicio-nombre">{servicio.nombre}</h3>
                  <p className="servicio-descripcion">
                    {servicio.descripcion || 'Servicio veterinario profesional'}
                  </p>
                  {servicio.precio && (
                    <p style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#667eea',
                      margin: '10px 0'
                    }}>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                      }).format(servicio.precio)}
                    </p>
                  )}
                  <button 
                    className="servicio-btn"
                    onClick={() => navigate(`/servicios/${slug}`)}
                  >
                    Ver más información
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginTop: '2rem'
        }}>
          <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>
            No hay servicios disponibles en este momento.
          </p>
        </div>
      )}
    </div>
  )
}
