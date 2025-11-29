import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, mascotaService, historialService, citaService, propietarioService } from '../services/api'
import AdminSidebar from '../components/AdminSidebar'
import GenerarDocumentoModal from '../components/GenerarDocumentoModal'
import Input from '../components/Form/Input'
import Select from '../components/Form/Select'
import { validarRUT, validarFormatoRUT, formatearRUTInput, normalizarRUT } from '../utils/rutValidator'
import './AdminDashboard.css'

export default function AdminPacientes() {
  const [user, setUser] = useState(null)
  const [mascotas, setMascotas] = useState([])
  const [mascotasFiltradas, setMascotasFiltradas] = useState([])
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showFichaModal, setShowFichaModal] = useState(false)
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null)
  const [historialClinico, setHistorialClinico] = useState([])
  const [citasMascota, setCitasMascota] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [filtroPropietario, setFiltroPropietario] = useState('')
  const [showDocumentoModal, setShowDocumentoModal] = useState(false)
  const [showCrearPacienteModal, setShowCrearPacienteModal] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingPropietario, setIsLoadingPropietario] = useState(false)
  const [pacienteFormData, setPacienteFormData] = useState({
    propietario: {
      nombre: '',
      rut: '',
      telefono: '',
      email: ''
    },
    mascota: {
      nombre: '',
      especie: '',
      raza: '',
      fechaNacimiento: '',
      sexo: ''
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    loadData()
  }, [navigate])

  useEffect(() => {
    filtrarMascotas()
  }, [busqueda, filtroEspecie, filtroPropietario, mascotas])

  const loadData = async () => {
    try {
      setLoading(true)
      const [mascotasData, propietariosData] = await Promise.all([
        mascotaService.getAll(),
        propietarioService.getAll()
      ])
      setMascotas(mascotasData)
      setMascotasFiltradas(mascotasData)
      setPropietarios(propietariosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarMascotas = () => {
    let filtradas = [...mascotas]

    // Filtro por búsqueda (nombre)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase().trim()
      filtradas = filtradas.filter(mascota =>
        mascota.nombre?.toLowerCase().includes(busquedaLower)
      )
    }

    // Filtro por especie
    if (filtroEspecie) {
      filtradas = filtradas.filter(mascota =>
        mascota.especie?.toLowerCase() === filtroEspecie.toLowerCase()
      )
    }

    // Filtro por propietario
    if (filtroPropietario) {
      filtradas = filtradas.filter(mascota =>
        mascota.propietario?.id === parseInt(filtroPropietario)
      )
    }

    setMascotasFiltradas(filtradas)
  }

  const handleVerFicha = async (mascota) => {
    setMascotaSeleccionada(mascota)
    setShowFichaModal(true)
    
    try {
      // Cargar historial clínico de la mascota
      const todosHistoriales = await historialService.getAll()
      const historiales = todosHistoriales.filter(h => h.mascota?.id === mascota.id)
      setHistorialClinico(historiales)

      // Cargar citas de la mascota
      const todasCitas = await citaService.getAll()
      const citas = todasCitas.filter(cita => cita.mascota?.id === mascota.id)
      setCitasMascota(citas)
    } catch (error) {
      console.error('Error al cargar ficha:', error)
      setHistorialClinico([])
      setCitasMascota([])
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A'  
    
    try {
      const fecha = new Date(fechaNacimiento)
      const hoy = new Date()
      let años = hoy.getFullYear() - fecha.getFullYear()
      const mes = hoy.getMonth() - fecha.getMonth()
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        años--
      }
      
      if (años < 1) {
        let meses = (hoy.getMonth() - fecha.getMonth()) + (hoy.getFullYear() - fecha.getFullYear()) * 12
        if (meses < 0) meses += 12
        return meses === 0 ? 'Recién nacido' : `${meses} ${meses === 1 ? 'mes' : 'meses'}`
      }
      
      return `${años} ${años === 1 ? 'año' : 'años'}`
    } catch (e) {
      return 'N/A'
    }
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

  // Funciones para el formulario de crear paciente
  const handlePacienteFormChange = (section, field, value) => {
    setPacienteFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    // Limpiar error del campo
    if (formErrors[`${section}.${field}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`${section}.${field}`]
        return newErrors
      })
    }
  }

  const handleRutChange = async (rut) => {
    const rutFormateado = formatearRUTInput(rut)
    handlePacienteFormChange('propietario', 'rut', rutFormateado)
    
    if (validarRUT(rutFormateado)) {
      setIsLoadingPropietario(true)
      try {
        const propietarioExistente = await propietarioService.findByRut(rutFormateado)
        if (propietarioExistente) {
          setPacienteFormData(prev => ({
            ...prev,
            propietario: {
              nombre: propietarioExistente.nombre || prev.propietario.nombre,
              rut: rutFormateado,
              telefono: propietarioExistente.telefono || prev.propietario.telefono,
              email: propietarioExistente.email || prev.propietario.email
            }
          }))
        }
      } catch (error) {
        console.error('Error al buscar propietario:', error)
      } finally {
        setIsLoadingPropietario(false)
      }
    }
  }

  const validatePacienteForm = () => {
    const errors = {}
    
    // Validar propietario
    if (!pacienteFormData.propietario.nombre.trim()) {
      errors['propietario.nombre'] = 'El nombre es requerido'
    }
    if (!pacienteFormData.propietario.rut.trim()) {
      errors['propietario.rut'] = 'El RUT es requerido'
    } else if (!validarFormatoRUT(pacienteFormData.propietario.rut)) {
      errors['propietario.rut'] = 'El formato del RUT no es válido'
    } else if (!validarRUT(pacienteFormData.propietario.rut)) {
      errors['propietario.rut'] = 'El RUT no es válido'
    }
    if (!pacienteFormData.propietario.telefono.trim()) {
      errors['propietario.telefono'] = 'El teléfono es requerido'
    }
    if (!pacienteFormData.propietario.email.trim()) {
      errors['propietario.email'] = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pacienteFormData.propietario.email)) {
      errors['propietario.email'] = 'El correo no es válido'
    }
    
    // Validar mascota
    if (!pacienteFormData.mascota.nombre.trim()) {
      errors['mascota.nombre'] = 'El nombre de la mascota es requerido'
    }
    if (!pacienteFormData.mascota.especie) {
      errors['mascota.especie'] = 'La especie es requerida'
    }
    if (!pacienteFormData.mascota.raza.trim()) {
      errors['mascota.raza'] = 'La raza es requerida'
    }
    if (!pacienteFormData.mascota.fechaNacimiento) {
      errors['mascota.fechaNacimiento'] = 'La fecha de nacimiento es requerida'
    }
    if (!pacienteFormData.mascota.sexo) {
      errors['mascota.sexo'] = 'El sexo es requerido'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCrearPaciente = async (e) => {
    e.preventDefault()
    
    if (!validatePacienteForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. Crear o actualizar propietario
      const rutNormalizado = normalizarRUT(pacienteFormData.propietario.rut)
      const propietarioExistente = await propietarioService.findByRut(pacienteFormData.propietario.rut)
      
      let propietarioId
      if (propietarioExistente) {
        // Actualizar propietario existente
        await propietarioService.update(propietarioExistente.id, {
          rut: rutNormalizado,
          nombre: pacienteFormData.propietario.nombre.trim(),
          telefono: pacienteFormData.propietario.telefono.trim(),
          email: pacienteFormData.propietario.email.trim()
        })
        propietarioId = propietarioExistente.id
      } else {
        // Crear nuevo propietario
        const nuevoPropietario = await propietarioService.create({
          rut: rutNormalizado,
          nombre: pacienteFormData.propietario.nombre.trim(),
          telefono: pacienteFormData.propietario.telefono.trim(),
          email: pacienteFormData.propietario.email.trim()
        })
        propietarioId = nuevoPropietario.id
      }
      
      // 2. Crear mascota
      await mascotaService.create({
        nombre: pacienteFormData.mascota.nombre.trim(),
        especie: pacienteFormData.mascota.especie,
        raza: pacienteFormData.mascota.raza.trim(),
        fechaNacimiento: pacienteFormData.mascota.fechaNacimiento,
        sexo: pacienteFormData.mascota.sexo,
        propietario: { id: propietarioId }
      })
      
      // Recargar datos
      await loadData()
      
      // Cerrar modal y limpiar formulario
      setShowCrearPacienteModal(false)
      setPacienteFormData({
        propietario: { nombre: '', rut: '', telefono: '', email: '' },
        mascota: { nombre: '', especie: '', raza: '', fechaNacimiento: '', sexo: '' }
      })
      setFormErrors({})
      
      alert('Paciente creado exitosamente')
    } catch (error) {
      console.error('Error al crear paciente:', error)
      alert('Error al crear el paciente. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener especies únicas para el filtro
  const especiesUnicas = [...new Set(mascotas.map(m => m.especie).filter(Boolean))]
  
  // Opciones para el formulario
  const especiesOptions = [
    { value: 'Perro', label: 'Perro' },
    { value: 'Gato', label: 'Gato' }
  ]
  
  const sexosOptions = [
    { value: 'Macho', label: 'Macho' },
    { value: 'Hembra', label: 'Hembra' }
  ]

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
          <h1>GESTIÓN DE PACIENTES</h1>
          <p>Administra las mascotas registradas en la clínica</p>
        </div>

        {/* Buscador y Filtros */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pacientes ({mascotasFiltradas.length})</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setShowCrearPacienteModal(true)
                  setPacienteFormData({
                    propietario: {
                      nombre: '',
                      rut: '',
                      telefono: '',
                      email: ''
                    },
                    mascota: {
                      nombre: '',
                      especie: '',
                      raza: '',
                      fechaNacimiento: '',
                      sexo: ''
                    }
                  })
                  setFormErrors({})
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>➕</span>
                Crear Paciente
              </button>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
                style={{ width: '250px' }}
              />
              <select
                value={filtroEspecie}
                onChange={(e) => setFiltroEspecie(e.target.value)}
                className="search-input"
                style={{ width: '180px' }}
              >
                <option value="">Todas las especies</option>
                {especiesUnicas.map(especie => (
                  <option key={especie} value={especie}>{especie}</option>
                ))}
              </select>
              <select
                value={filtroPropietario}
                onChange={(e) => setFiltroPropietario(e.target.value)}
                className="search-input"
                style={{ width: '200px' }}
              >
                <option value="">Todos los propietarios</option>
                {propietarios.map(propietario => (
                  <option key={propietario.id} value={propietario.id}>
                    {propietario.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tarjetas de Mascotas */}
        <div className="dashboard-section">
          {mascotasFiltradas.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {mascotasFiltradas.map((mascota) => (
                <div
                  key={mascota.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                    border: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)'
                    e.currentTarget.style.borderColor = '#667eea'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                  onClick={() => handleVerFicha(mascota)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {mascota.nombre?.charAt(0).toUpperCase() || '🐾'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#2c3e50', fontWeight: '600' }}>
                        {mascota.nombre || 'Sin nombre'}
                      </h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#7f8c8d' }}>
                        {mascota.especie || 'N/A'} {mascota.raza ? `- ${mascota.raza}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>EDAD</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                        {calcularEdad(mascota.fechaNacimiento)}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>SEXO</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                        {mascota.sexo || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>PROPIETARIO</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                      {mascota.propietario?.nombre || 'N/A'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVerFicha(mascota)
                    }}
                    style={{
                      width: '100%',
                      marginTop: '15px',
                      padding: '10px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#5568d3'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#667eea'
                    }}
                  >
                    Ver Ficha
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '16px', color: '#7f8c8d' }}>
                {busqueda || filtroEspecie || filtroPropietario
                  ? 'No se encontraron mascotas con los filtros aplicados'
                  : 'No hay mascotas registradas'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ficha Clínica Detallada */}
      {showFichaModal && mascotaSeleccionada && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>
                Ficha Clínica: {mascotaSeleccionada.nombre}
              </h2>
              <button
                onClick={() => {
                  setShowFichaModal(false)
                  setMascotaSeleccionada(null)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Datos Generales */}
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#2c3e50' }}>
                Datos Generales
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>NOMBRE</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2c3e50' }}>
                    {mascotaSeleccionada.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>ESPECIE</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2c3e50' }}>
                    {mascotaSeleccionada.especie || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>RAZA</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2c3e50' }}>
                    {mascotaSeleccionada.raza || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>EDAD</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2c3e50' }}>
                    {calcularEdad(mascotaSeleccionada.fechaNacimiento)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>SEXO</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2c3e50' }}>
                    {mascotaSeleccionada.sexo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', fontWeight: '600' }}>PROPIETARIO</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2c3e50' }}>
                    {mascotaSeleccionada.propietario?.nombre || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Historial Médico */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#2c3e50' }}>
                Historial Médico
              </h3>

              {/* Consultas Previas */}
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#34495e' }}>
                  Consultas Previas ({citasMascota.length})
                </h4>
                {citasMascota.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Servicio</th>
                          <th>Motivo</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citasMascota.map(cita => (
                          <tr key={cita.id}>
                            <td>{formatDate(cita.fecha)}</td>
                            <td>{formatTime(cita.hora)}</td>
                            <td>{cita.servicio?.nombre || 'N/A'}</td>
                            <td>{cita.motivo || 'N/A'}</td>
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
                  <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No hay consultas registradas</p>
                )}
              </div>

              {/* Historial Clínico (Notas, Procedimientos, etc.) */}
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#34495e' }}>
                  Notas y Procedimientos ({historialClinico.length})
                </h4>
                {historialClinico.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {historialClinico.map(historial => (
                      <div
                        key={historial.id}
                        style={{
                          padding: '15px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          borderLeft: '4px solid #667eea'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                            {formatDate(historial.fecha)}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#34495e' }}>
                          {historial.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No hay notas o procedimientos registrados</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
              <button
                onClick={() => setShowDocumentoModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>📄</span>
                Generar Documento
              </button>
              <button
                onClick={() => {
                  setShowFichaModal(false)
                  setMascotaSeleccionada(null)
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

      {/* Modal Generar Documento */}
      <GenerarDocumentoModal
        isOpen={showDocumentoModal}
        onClose={() => setShowDocumentoModal(false)}
        mascota={mascotaSeleccionada}
        propietario={mascotaSeleccionada?.propietario}
      />

      {/* Modal Crear Paciente */}
      {showCrearPacienteModal && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>
                Crear Nuevo Paciente
              </h2>
              <button
                onClick={() => {
                  setShowCrearPacienteModal(false)
                  setPacienteFormData({
                    propietario: { nombre: '', rut: '', telefono: '', email: '' },
                    mascota: { nombre: '', especie: '', raza: '', fechaNacimiento: '', sexo: '' }
                  })
                  setFormErrors({})
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {isLoadingPropietario && (
              <div style={{ 
                padding: '15px', 
                background: '#e3f2fd', 
                borderRadius: '8px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#1976d2' }}>Buscando propietario...</p>
              </div>
            )}

            <form onSubmit={handleCrearPaciente}>
              {/* Sección 1: Datos del Propietario */}
              <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>👤</span>
                  Datos del Propietario
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <Input
                    label="Nombre completo"
                    name="propietario.nombre"
                    placeholder="Ej: Juan Pérez"
                    value={pacienteFormData.propietario.nombre}
                    onChange={(e) => handlePacienteFormChange('propietario', 'nombre', e.target.value)}
                    error={formErrors['propietario.nombre']}
                    required
                  />
                  <Input
                    label="RUT"
                    name="propietario.rut"
                    placeholder="Ej: 12.345.678-9"
                    value={pacienteFormData.propietario.rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    error={formErrors['propietario.rut']}
                    required
                    helperText="El RUT se formateará automáticamente"
                  />
                  <Input
                    label="Teléfono"
                    name="propietario.telefono"
                    type="tel"
                    placeholder="Ej: +56912345678"
                    value={pacienteFormData.propietario.telefono}
                    onChange={(e) => handlePacienteFormChange('propietario', 'telefono', e.target.value)}
                    error={formErrors['propietario.telefono']}
                    required
                  />
                  <Input
                    label="Correo electrónico"
                    name="propietario.email"
                    type="email"
                    placeholder="Ej: juanperez@gmail.com"
                    value={pacienteFormData.propietario.email}
                    onChange={(e) => handlePacienteFormChange('propietario', 'email', e.target.value)}
                    error={formErrors['propietario.email']}
                    required
                  />
                </div>
              </div>

              {/* Sección 2: Datos de la Mascota */}
              <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🐾</span>
                  Datos de la Mascota
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <Input
                    label="Nombre de la mascota"
                    name="mascota.nombre"
                    placeholder="Ej: Firulais"
                    value={pacienteFormData.mascota.nombre}
                    onChange={(e) => handlePacienteFormChange('mascota', 'nombre', e.target.value)}
                    error={formErrors['mascota.nombre']}
                    required
                  />
                  <Select
                    label="Especie"
                    name="mascota.especie"
                    value={pacienteFormData.mascota.especie}
                    onChange={(e) => handlePacienteFormChange('mascota', 'especie', e.target.value)}
                    options={especiesOptions}
                    placeholder="Selecciona la especie"
                    error={formErrors['mascota.especie']}
                    required
                  />
                  <Input
                    label="Raza"
                    name="mascota.raza"
                    placeholder="Ej: Labrador"
                    value={pacienteFormData.mascota.raza}
                    onChange={(e) => handlePacienteFormChange('mascota', 'raza', e.target.value)}
                    error={formErrors['mascota.raza']}
                    required
                  />
                  <Input
                    label="Fecha de Nacimiento"
                    name="mascota.fechaNacimiento"
                    type="date"
                    value={pacienteFormData.mascota.fechaNacimiento}
                    onChange={(e) => handlePacienteFormChange('mascota', 'fechaNacimiento', e.target.value)}
                    error={formErrors['mascota.fechaNacimiento']}
                    required
                  />
                  <Select
                    label="Sexo"
                    name="mascota.sexo"
                    value={pacienteFormData.mascota.sexo}
                    onChange={(e) => handlePacienteFormChange('mascota', 'sexo', e.target.value)}
                    options={sexosOptions}
                    placeholder="Selecciona el sexo"
                    error={formErrors['mascota.sexo']}
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCrearPacienteModal(false)
                    setPacienteFormData({
                      propietario: { nombre: '', rut: '', telefono: '', email: '' },
                      mascota: { nombre: '', especie: '', raza: '', fechaNacimiento: '', sexo: '' }
                    })
                    setFormErrors({})
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

