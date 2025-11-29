import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService, citaService, mascotaService, servicioService, veterinarioService } from '../services/api'
import AdminSidebar from '../components/AdminSidebar'
import './AdminDashboard.css'

export default function AdminCitas() {
  const [searchParams] = useSearchParams()
  const isHistorial = searchParams.get('historial') === 'true'
  const [user, setUser] = useState(null)
  const [citas, setCitas] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [servicios, setServicios] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCita, setEditingCita] = useState(null)
  const [filtros, setFiltros] = useState({
    fecha: '',
    servicioId: '',
    estado: ''
  })
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    mascotaId: '',
    servicioId: '',
    veterinarioId: '',
    fecha: '',
    hora: '',
    motivo: '',
    estado: 'Activa'
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Si estamos en modo historial, no aplicar filtro de estado (se manejará en loadCitas)
    // Si estamos en vista normal, aplicar filtro "Activa" automáticamente
    if (!isHistorial) {
      setFiltros(prev => ({ ...prev, estado: 'Activa' }))
    } else {
      setFiltros(prev => ({ ...prev, estado: '' }))
    }

    loadData()
  }, [navigate, isHistorial])

  useEffect(() => {
    loadCitas()
  }, [filtros, isHistorial])

  const loadData = async () => {
    try {
      setLoading(true)
      const [mascotasData, serviciosData, veterinariosData] = await Promise.all([
        mascotaService.getAll(),
        servicioService.getAll(),
        veterinarioService.getAll()
      ])
      setMascotas(mascotasData)
      setServicios(serviciosData)
      setVeterinarios(veterinariosData)
      await loadCitas()
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCitas = async () => {
    try {
      let citasData = []
      
      if (isHistorial) {
        // En historial: obtener citas completadas y canceladas
        const filtrosCompletadas = { estado: 'Completada' }
        const filtrosCanceladas = { estado: 'Cancelada' }
        
        if (filtros.fecha) {
          filtrosCompletadas.fecha = filtros.fecha
          filtrosCanceladas.fecha = filtros.fecha
        }
        if (filtros.servicioId) {
          filtrosCompletadas.servicioId = parseInt(filtros.servicioId)
          filtrosCanceladas.servicioId = parseInt(filtros.servicioId)
        }
        
        const [completadas, canceladas] = await Promise.all([
          citaService.getAll(filtrosCompletadas),
          citaService.getAll(filtrosCanceladas)
        ])
        
        // Ordenar: Completadas primero, luego Canceladas
        citasData = [...completadas, ...canceladas]
      } else {
        // En vista normal: solo citas activas
        const filtrosAplicados = { estado: 'Activa' }
        if (filtros.fecha) filtrosAplicados.fecha = filtros.fecha
        if (filtros.servicioId) filtrosAplicados.servicioId = parseInt(filtros.servicioId)

        citasData = await citaService.getAll(filtrosAplicados)
      }
      
      setCitas(citasData)
    } catch (error) {
      console.error('Error al cargar citas:', error)
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const handleNuevaCita = () => {
    setEditingCita(null)
    setFormData({
      mascotaId: '',
      servicioId: '',
      veterinarioId: '',
      fecha: '',
      hora: '',
      motivo: '',
      estado: 'Activa'
    })
    setShowModal(true)
  }

  const handleEdit = (cita) => {
    setEditingCita(cita)
    // Formatear fecha correctamente para evitar problemas de zona horaria
    let fechaFormateada = ''
    if (cita.fecha) {
      // Si la fecha viene como string YYYY-MM-DD, usarla directamente
      if (typeof cita.fecha === 'string' && cita.fecha.includes('-')) {
        fechaFormateada = cita.fecha.split('T')[0] // Tomar solo la parte de la fecha si viene con hora
      } else if (cita.fecha instanceof Date) {
        // Si viene como Date, convertir a YYYY-MM-DD
        const year = cita.fecha.getFullYear()
        const month = String(cita.fecha.getMonth() + 1).padStart(2, '0')
        const day = String(cita.fecha.getDate()).padStart(2, '0')
        fechaFormateada = `${year}-${month}-${day}`
      } else {
        // Intentar parsear como string
        fechaFormateada = String(cita.fecha).split('T')[0]
      }
    }
    
    setFormData({
      mascotaId: cita.mascota?.id || '',
      servicioId: cita.servicio?.id || '',
      veterinarioId: cita.veterinario?.id || '',
      fecha: fechaFormateada,
      hora: cita.hora ? cita.hora.substring(0, 5) : '',
      motivo: cita.motivo || '',
      estado: cita.estado || 'Activa'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita?')) {
      return
    }

    try {
      await citaService.delete(id)
      await loadCitas()
    } catch (error) {
      console.error('Error al eliminar cita:', error)
      alert('Error al eliminar la cita')
    }
  }

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      // Obtener la cita actual para mostrar información en el mensaje
      const citaActual = citas.find(c => c.id === id)
      const estadoAnterior = citaActual?.estado || 'Activa'
      
      await citaService.updateEstado(id, nuevoEstado)
      
      // Recargar las citas después de actualizar el estado
      await loadCitas()
      
      // Mostrar mensaje apropiado según el nuevo estado
      if (nuevoEstado === 'Completada' || nuevoEstado === 'Cancelada') {
        if (!isHistorial) {
          alert(`Cita ${nuevoEstado.toLowerCase()} exitosamente. La cita se ha movido al historial de citas.`)
        } else {
          alert(`Estado actualizado a "${nuevoEstado}" exitosamente.`)
        }
      } else if (nuevoEstado === 'Activa' && (estadoAnterior === 'Completada' || estadoAnterior === 'Cancelada')) {
        if (isHistorial) {
          alert(`Estado actualizado a "${nuevoEstado}". La cita volverá a aparecer en la vista de citas activas.`)
        } else {
          alert(`Estado actualizado a "${nuevoEstado}" exitosamente.`)
        }
      } else {
        alert(`Estado actualizado a "${nuevoEstado}" exitosamente.`)
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido'
      alert(`Error al cambiar el estado: ${errorMessage}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Asegurar que la fecha esté en formato YYYY-MM-DD sin conversiones de zona horaria
      let fechaNormalizada = formData.fecha
      if (fechaNormalizada) {
        // Si viene como string, asegurarse de que solo tenga la parte de la fecha
        if (typeof fechaNormalizada === 'string') {
          fechaNormalizada = fechaNormalizada.split('T')[0]
        } else if (fechaNormalizada instanceof Date) {
          // Si viene como Date, convertir a YYYY-MM-DD sin usar toISOString (que usa UTC)
          const year = fechaNormalizada.getFullYear()
          const month = String(fechaNormalizada.getMonth() + 1).padStart(2, '0')
          const day = String(fechaNormalizada.getDate()).padStart(2, '0')
          fechaNormalizada = `${year}-${month}-${day}`
        }
      }
      
      // Normalizar la hora al formato HH:mm:ss que espera el backend
      let horaNormalizada = formData.hora || ''
      if (horaNormalizada) {
        // Si viene en formato HH:mm, agregar los segundos :00
        if (horaNormalizada.length === 5 && horaNormalizada.includes(':')) {
          horaNormalizada = horaNormalizada + ':00'
        } else if (horaNormalizada.length === 8 && horaNormalizada.includes(':')) {
          // Ya está en formato HH:mm:ss, dejarlo así
          horaNormalizada = horaNormalizada
        }
      }
      
      const citaData = {
        mascota: { id: parseInt(formData.mascotaId) },
        servicio: { id: parseInt(formData.servicioId) },
        veterinario: formData.veterinarioId ? { id: parseInt(formData.veterinarioId) } : null,
        fecha: fechaNormalizada,
        hora: horaNormalizada,
        motivo: formData.motivo,
        estado: formData.estado
      }

      if (editingCita) {
        await citaService.update(editingCita.id, citaData)
        alert('Cita actualizada correctamente')
      } else {
        await citaService.create(citaData)
        alert('Cita creada correctamente')
      }

      setShowModal(false)
      await loadCitas()
    } catch (error) {
      console.error('Error al guardar cita:', error)
      const errorMessage = error.response?.data || error.response?.data?.message || error.message || 'Error desconocido'
      const errorText = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      alert('Error al guardar la cita: ' + errorText)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    // Si ya viene en formato YYYY-MM-DD, formatearlo directamente sin conversión de zona horaria
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const parts = dateString.split('T')[0].split('-')
      if (parts.length === 3) {
        // Formato: YYYY-MM-DD -> DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    }
    
    // Si viene como Date o string ISO, parsearlo cuidadosamente
    try {
      // Si es string ISO, extraer solo la parte de fecha
      const dateOnly = String(dateString).split('T')[0]
      const parts = dateOnly.split('-')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    } catch (e) {
      console.error('Error al formatear fecha:', e)
    }
    
    return dateString
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // HH:MM
  }

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Activa':
        return 'status-pending'
      case 'Completada':
        return 'status-completed'
      case 'Cancelada':
        return 'status-cancelled'
      default:
        return 'status-pending'
    }
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
          <h1>{isHistorial ? 'HISTORIAL DE CITAS' : 'GESTIÓN DE CITAS'}</h1>
          <p>{isHistorial ? 'Citas completadas y canceladas del sistema' : 'Administra las citas activas del sistema'}</p>
        </div>

        {/* Filtros */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Filtros</h2>
          </div>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#7f8c8d' }}>Fecha</label>
              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                className="search-input"
                style={{ width: '180px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#7f8c8d' }}>Servicio</label>
              <select
                value={filtros.servicioId}
                onChange={(e) => setFiltros({ ...filtros, servicioId: e.target.value })}
                className="search-input"
                style={{ width: '200px' }}
              >
                <option value="">Todos</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                ))}
              </select>
            </div>
            {!isHistorial && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#7f8c8d' }}>Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="search-input"
                  style={{ width: '150px' }}
                >
                  <option value="Activa">Activa</option>
                </select>
              </div>
            )}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => {
                  const nuevosFiltros = { fecha: '', servicioId: '', estado: isHistorial ? '' : 'Activa' }
                  setFiltros(nuevosFiltros)
                }}
                style={{
                  padding: '8px 16px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Citas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>{isHistorial ? 'Historial de Citas' : 'Citas'} ({citas.length})</h2>
            {!isHistorial && (
              <button
                onClick={handleNuevaCita}
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
                <span>+</span> Nueva Cita
              </button>
            )}
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Mascota</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Veterinario</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.length > 0 ? (
                  citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.mascota?.propietario?.nombre || 'N/A'}</td>
                      <td>{cita.mascota?.nombre || 'N/A'}</td>
                      <td>{cita.servicio?.nombre || 'N/A'}</td>
                      <td>{formatDate(cita.fecha)}</td>
                      <td>{formatTime(cita.hora)}</td>
                      <td>
                        <select
                          value={cita.estado || 'Activa'}
                          onChange={(e) => handleChangeEstado(cita.id, e.target.value)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: cita.estado === 'Completada' ? '#d4edda' : 
                                       cita.estado === 'Cancelada' ? '#f8d7da' : '#fff3cd',
                            color: cita.estado === 'Completada' ? '#155724' : 
                                   cita.estado === 'Cancelada' ? '#721c24' : '#856404'
                          }}
                        >
                          <option value="Activa">Activa</option>
                          <option value="Completada">Completada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td>{cita.veterinario?.nombre || 'No asignado'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cita.motivo || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(cita)}
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
                            onClick={() => handleDelete(cita.id)}
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
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay citas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón Historial de Citas */}
        {!isHistorial && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '30px',
            marginBottom: '30px'
          }}>
            <button
              onClick={() => navigate('/admin/citas?historial=true')}
              style={{
                padding: '12px 30px',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span>📋</span>
              Historial de Citas
            </button>
          </div>
        )}

        {/* Botón Volver si estamos en historial */}
        {isHistorial && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '30px',
            marginBottom: '30px'
          }}>
            <button
              onClick={() => navigate('/admin/citas')}
              style={{
                padding: '12px 30px',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span>←</span>
              Volver a Citas
            </button>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar Cita */}
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
              {editingCita ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Mascota *
                </label>
                <select
                  value={formData.mascotaId}
                  onChange={(e) => setFormData({ ...formData, mascotaId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccione una mascota</option>
                  {mascotas.map(mascota => (
                    <option key={mascota.id} value={mascota.id}>
                      {mascota.nombre} - {mascota.propietario?.nombre || 'Sin propietario'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Servicio *
                </label>
                <select
                  value={formData.servicioId}
                  onChange={(e) => setFormData({ ...formData, servicioId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccione un servicio</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Veterinario
                </label>
                <select
                  value={formData.veterinarioId}
                  onChange={(e) => setFormData({ ...formData, veterinarioId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">No asignado</option>
                  {veterinarios.map(veterinario => (
                    <option key={veterinario.id} value={veterinario.id}>{veterinario.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Activa">Activa</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Motivo *
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {editingCita ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

