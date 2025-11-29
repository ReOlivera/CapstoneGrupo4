import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, propietarioService, mascotaService, citaService } from '../services/api'
import AdminSidebar from '../components/AdminSidebar'
import './AdminDashboard.css'

export default function AdminPropietarios() {
  const [user, setUser] = useState(null)
  const [propietarios, setPropietarios] = useState([])
  const [propietariosFiltrados, setPropietariosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showDetallesModal, setShowDetallesModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState(null)
  const [mascotasPropietario, setMascotasPropietario] = useState([])
  const [citasPropietario, setCitasPropietario] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    telefono: '',
    email: ''
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    loadPropietarios()
  }, [navigate])

  useEffect(() => {
    filtrarPropietarios()
  }, [busqueda, propietarios])

  const loadPropietarios = async () => {
    try {
      setLoading(true)
      const data = await propietarioService.getAll()
      setPropietarios(data)
      setPropietariosFiltrados(data)
    } catch (error) {
      console.error('Error al cargar propietarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarPropietarios = () => {
    if (!busqueda.trim()) {
      setPropietariosFiltrados(propietarios)
      return
    }

    const busquedaLower = busqueda.toLowerCase().trim()
    const filtrados = propietarios.filter(propietario => {
      const nombreMatch = propietario.nombre?.toLowerCase().includes(busquedaLower)
      const rutMatch = propietario.rut?.toLowerCase().includes(busquedaLower)
      return nombreMatch || rutMatch
    })
    setPropietariosFiltrados(filtrados)
  }

  const handleVerDetalles = async (propietario) => {
    setPropietarioSeleccionado(propietario)
    setShowDetallesModal(true)
    
    try {
      // Cargar mascotas del propietario
      const todasMascotas = await mascotaService.getAll()
      const mascotas = todasMascotas.filter(m => m.propietario?.id === propietario.id)
      setMascotasPropietario(mascotas)

      // Cargar citas del propietario (a través de sus mascotas)
      const todasCitas = await citaService.getAll()
      const mascotaIds = mascotas.map(m => m.id)
      const citas = todasCitas.filter(cita => mascotaIds.includes(cita.mascota?.id))
      setCitasPropietario(citas)
    } catch (error) {
      console.error('Error al cargar detalles:', error)
      setMascotasPropietario([])
      setCitasPropietario([])
    }
  }

  const handleEdit = (propietario) => {
    setPropietarioSeleccionado(propietario)
    setFormData({
      nombre: propietario.nombre || '',
      rut: propietario.rut || '',
      telefono: propietario.telefono || '',
      email: propietario.email || ''
    })
    setShowEditModal(true)
  }

  const handleDelete = (propietario) => {
    setPropietarioSeleccionado(propietario)
    setShowDeleteModal(true)
  }

  const confirmarEliminar = async () => {
    if (!propietarioSeleccionado) return

    try {
      await propietarioService.delete(propietarioSeleccionado.id)
      setShowDeleteModal(false)
      setPropietarioSeleccionado(null)
      await loadPropietarios()
    } catch (error) {
      console.error('Error al eliminar propietario:', error)
      alert('Error al eliminar el propietario. Puede que tenga mascotas o citas asociadas.')
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    if (!propietarioSeleccionado) return

    try {
      await propietarioService.update(propietarioSeleccionado.id, formData)
      setShowEditModal(false)
      setPropietarioSeleccionado(null)
      await loadPropietarios()
    } catch (error) {
      console.error('Error al actualizar propietario:', error)
      alert('Error al actualizar el propietario: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const dateOnly = String(dateString).split('T')[0]
    const parts = dateOnly.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5)
  }

  const formatRut = (rut) => {
    if (!rut) return ''
    // Formatear RUT: 12345678-9 -> 12.345.678-9
    const rutSinFormato = rut.replace(/[.-\s]/g, '')
    if (rutSinFormato.length < 2) return rut
    const cuerpo = rutSinFormato.slice(0, -1)
    const dv = rutSinFormato.slice(-1)
    return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
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
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>GESTIÓN DE PROPIETARIOS</h1>
          <p>Administra los clientes (dueños de mascotas) del sistema</p>
        </div>

        {/* Buscador */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Propietarios ({propietariosFiltrados.length})</h2>
            <input
              type="text"
              placeholder="Buscar por nombre o RUT..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
              style={{ width: '300px' }}
            />
          </div>
        </div>

        {/* Tabla de Propietarios */}
        <div className="dashboard-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>RUT</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.length > 0 ? (
                  propietariosFiltrados.map((propietario) => (
                    <tr key={propietario.id}>
                      <td>{formatRut(propietario.rut)}</td>
                      <td>{propietario.nombre || 'N/A'}</td>
                      <td>{propietario.telefono || 'N/A'}</td>
                      <td>{propietario.email || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleVerDetalles(propietario)}
                            style={{
                              padding: '5px 10px',
                              background: '#2ecc71',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => handleEdit(propietario)}
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
                            onClick={() => handleDelete(propietario)}
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
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      {busqueda ? 'No se encontraron propietarios con ese criterio' : 'No hay propietarios registrados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ver Detalles */}
      {showDetallesModal && propietarioSeleccionado && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              Detalles del Propietario
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Información Personal</h3>
              <p><strong>Nombre:</strong> {propietarioSeleccionado.nombre}</p>
              <p><strong>RUT:</strong> {formatRut(propietarioSeleccionado.rut)}</p>
              <p><strong>Teléfono:</strong> {propietarioSeleccionado.telefono || 'N/A'}</p>
              <p><strong>Email:</strong> {propietarioSeleccionado.email || 'N/A'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Mascotas ({mascotasPropietario.length})</h3>
              {mascotasPropietario.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Especie</th>
                        <th>Raza</th>
                        <th>Sexo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mascotasPropietario.map(mascota => (
                        <tr key={mascota.id}>
                          <td>{mascota.nombre}</td>
                          <td>{mascota.especie || 'N/A'}</td>
                          <td>{mascota.raza || 'N/A'}</td>
                          <td>{mascota.sexo || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No tiene mascotas registradas</p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Citas ({citasPropietario.length})</h3>
              {citasPropietario.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasPropietario.map(cita => (
                        <tr key={cita.id}>
                          <td>{cita.mascota?.nombre || 'N/A'}</td>
                          <td>{formatDate(cita.fecha)}</td>
                          <td>{formatTime(cita.hora)}</td>
                          <td>{cita.servicio?.nombre || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${
                              cita.estado === 'Completada' ? 'status-completed' :
                              cita.estado === 'Cancelada' ? 'status-cancelled' :
                              'status-pending'
                            }`}>
                              {cita.estado || 'Activa'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No tiene citas registradas</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDetallesModal(false)
                  setPropietarioSeleccionado(null)
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
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && propietarioSeleccionado && (
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
              Editar Propietario
            </h2>
            <form onSubmit={handleSubmitEdit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  RUT *
                </label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
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
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setPropietarioSeleccionado(null)
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
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && propietarioSeleccionado && (
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
              ¿Está seguro de eliminar al propietario <strong>{propietarioSeleccionado.nombre}</strong>?
            </p>
            <p style={{ marginBottom: '20px', color: '#e74c3c', fontSize: '14px' }}>
              ⚠️ Esta acción no se puede deshacer. Si el propietario tiene mascotas o citas asociadas, la eliminación puede fallar.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setPropietarioSeleccionado(null)
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

