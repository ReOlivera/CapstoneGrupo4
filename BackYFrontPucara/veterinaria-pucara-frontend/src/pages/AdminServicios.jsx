import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, servicioService } from '../services/api'
import './AdminDashboard.css'

export default function AdminServicios() {
  const [user, setUser] = useState(null)
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingServicio, setEditingServicio] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [servicioToDelete, setServicioToDelete] = useState(null)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    activo: true,
    imagenUrl: ''
  })
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    loadServicios()
  }, [navigate])

  const loadServicios = async () => {
    try {
      setLoading(true)
      const data = await servicioService.getAll()
      setServicios(data)
    } catch (error) {
      console.error('Error al cargar servicios:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para construir la URL completa de la imagen
  const getImagenUrl = (imagenUrl) => {
    if (!imagenUrl) return null
    
    // Si ya es una URL completa, usarla directamente
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl
    }
    
    // Si es una ruta relativa que empieza con /assets/, construir la URL del backend
    if (imagenUrl.startsWith('/assets/')) {
      return `http://localhost:8082${imagenUrl}`
    }
    
    // Si es una ruta relativa sin /assets/, también construir la URL del backend
    if (imagenUrl.startsWith('/')) {
      return `http://localhost:8082${imagenUrl}`
    }
    
    // Si no empieza con /, asumir que es relativa y agregar el prefijo del backend
    return `http://localhost:8082/${imagenUrl}`
  }

  const handleNuevoServicio = () => {
    setEditingServicio(null)
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      activo: true,
      imagenUrl: ''
    })
    setImagenFile(null)
    setImagenPreview(null)
    setShowModal(true)
  }

  const handleEdit = (servicio) => {
    setEditingServicio(servicio)
    setFormData({
      nombre: servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      precio: servicio.precio ? servicio.precio.toString() : '',
      duracion: servicio.duracion ? servicio.duracion.toString() : '',
      activo: servicio.activo !== undefined ? servicio.activo : true,
      imagenUrl: servicio.imagenUrl || ''
    })
    setImagenFile(null)
    // Usar la URL completa del backend para el preview
    setImagenPreview(servicio.imagenUrl ? getImagenUrl(servicio.imagenUrl) : null)
    setShowModal(true)
  }

  const handleDelete = (servicio) => {
    setServicioToDelete(servicio)
    setShowDeleteModal(true)
  }

  const confirmarEliminar = async () => {
    if (!servicioToDelete) return

    try {
      await servicioService.delete(servicioToDelete.id)
      setShowDeleteModal(false)
      setServicioToDelete(null)
      await loadServicios()
      // Mostrar mensaje de éxito
      alert('Servicio eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      
      // Extraer mensaje de error del backend
      let mensajeError = 'Error al eliminar el servicio.'
      
      if (error.response?.data) {
        // Si el backend devuelve un string directamente
        if (typeof error.response.data === 'string') {
          mensajeError = error.response.data
        } 
        // Si el backend devuelve un objeto con mensaje
        else if (error.response.data.message) {
          mensajeError = error.response.data.message
        }
        // Si el backend devuelve un objeto con error
        else if (error.response.data.error) {
          mensajeError = error.response.data.error
        }
      } else if (error.message) {
        mensajeError = error.message
      }
      
      alert(mensajeError)
    }
  }

  const handleToggleEstado = async (servicio) => {
    try {
      const nuevoEstado = !servicio.activo
      await servicioService.updateEstado(servicio.id, nuevoEstado)
      await loadServicios()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar el estado del servicio')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Tamaño máximo: 5MB')
        e.target.value = ''
        return
      }
      
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP')
        e.target.value = ''
        return
      }
      
      setImagenFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const servicioData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: formData.precio ? parseFloat(formData.precio) : null,
        duracion: formData.duracion ? parseInt(formData.duracion) : null,
        activo: formData.activo,
        imagenUrl: formData.imagenUrl.trim() || null
      }

      if (editingServicio) {
        await servicioService.update(editingServicio.id, servicioData, imagenFile)
      } else {
        await servicioService.create(servicioData, imagenFile)
      }

      setShowModal(false)
      setEditingServicio(null)
      setImagenFile(null)
      setImagenPreview(null)
      await loadServicios()
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      alert('Error al guardar el servicio: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const formatPrecio = (precio) => {
    if (!precio) return 'N/A'
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const formatDuracion = (duracion) => {
    if (!duracion) return 'N/A'
    if (duracion < 60) {
      return `${duracion} min`
    }
    const horas = Math.floor(duracion / 60)
    const minutos = duracion % 60
    if (minutos === 0) {
      return `${horas} ${horas === 1 ? 'hora' : 'horas'}`
    }
    return `${horas}h ${minutos}min`
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="profile-avatar">
              {user?.nombre?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="profile-info">
              <h3>{user?.nombre || 'Administrador'}</h3>
              <p>{user?.rol || 'ADMIN'}</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '×' : '☰'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </a>
          <a href="/admin/citas" className="nav-item">
            <span className="nav-icon">📅</span>
            <span className="nav-text">Citas</span>
          </a>
          <a href="/admin/pacientes" className="nav-item">
            <span className="nav-icon">🐾</span>
            <span className="nav-text">Pacientes</span>
          </a>
          <a href="/admin/propietarios" className="nav-item">
            <span className="nav-icon">👤</span>
            <span className="nav-text">Propietarios</span>
          </a>
          <a href="/admin/servicios" className="nav-item active">
            <span className="nav-icon">⚕️</span>
            <span className="nav-text">Servicios</span>
          </a>
          <a href="/admin/inventario" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-text">Inventario</span>
          </a>
          <a href="/admin/reportes" className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reportes</span>
          </a>
          <a href="#configuracion" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Configuración</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>GESTIÓN DE SERVICIOS</h1>
          <p>Administra los servicios veterinarios ofrecidos por la clínica</p>
        </div>

        {/* Tabla de Servicios */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Servicios ({servicios.length})</h2>
            <button
              onClick={handleNuevoServicio}
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span> Nuevo Servicio
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.length > 0 ? (
                  servicios.map((servicio) => (
                    <tr key={servicio.id}>
                      <td>
                        {servicio.imagenUrl ? (
                          <img 
                            src={getImagenUrl(servicio.imagenUrl)} 
                            alt={servicio.nombre}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #e0e0e0'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#f0f0f0',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: '12px'
                          }}>
                            Sin imagen
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: '600' }}>{servicio.nombre || 'N/A'}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {servicio.descripcion || 'N/A'}
                      </td>
                      <td>{formatPrecio(servicio.precio)}</td>
                      <td>{formatDuracion(servicio.duracion)}</td>
                      <td>
                        <button
                          onClick={() => handleToggleEstado(servicio)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: servicio.activo ? '#d4edda' : '#f8d7da',
                            color: servicio.activo ? '#155724' : '#721c24',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                          }}
                        >
                          {servicio.activo ? '✓ Activo' : '✗ Inactivo'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(servicio)}
                            style={{
                              padding: '5px 10px',
                              background: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(servicio)}
                            style={{
                              padding: '5px 10px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay servicios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Crear/Editar Servicio */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Imagen del Servicio
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB
                </small>
                {(imagenPreview || formData.imagenUrl) && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', marginBottom: '5px', fontWeight: '600' }}>Vista previa:</p>
                    <img 
                      src={imagenPreview || getImagenUrl(formData.imagenUrl)} 
                      alt="Vista previa" 
                      style={{ 
                        maxWidth: '300px', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    {imagenFile && (
                      <p style={{ color: '#27ae60', fontSize: '12px', marginTop: '5px' }}>
                        ✓ Nueva imagen seleccionada: {imagenFile.name} ({(imagenFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Precio (CLP)
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontWeight: '600' }}>Servicio activo</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingServicio(null)
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {editingServicio ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && servicioToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#e74c3c' }}>
              Confirmar Eliminación
            </h2>
            <p style={{ marginBottom: '20px' }}>
              ¿Está seguro de eliminar el servicio <strong>{servicioToDelete.nombre}</strong>?
            </p>
            <p style={{ marginBottom: '20px', color: '#e74c3c', fontSize: '14px' }}>
              ⚠️ Esta acción no se puede deshacer. Si el servicio tiene citas asociadas, la eliminación puede fallar.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setServicioToDelete(null)
                }}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                style={{
                  padding: '10px 20px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

