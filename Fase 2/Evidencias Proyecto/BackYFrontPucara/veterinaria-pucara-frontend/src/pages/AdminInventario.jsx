import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, inventarioService } from '../services/api'
import './AdminDashboard.css'

export default function AdminInventario() {
  const [user, setUser] = useState(null)
  const [inventarios, setInventarios] = useState([])
  const [inventariosFiltrados, setInventariosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingInventario, setEditingInventario] = useState(null)
  const [inventarioStock, setInventarioStock] = useState(null)
  const [inventarioToDelete, setInventarioToDelete] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStockBajo, setFiltroStockBajo] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombreProducto: '',
    descripcion: '',
    categoria: 'Insumo',
    cantidad: '',
    unidad: 'unidades',
    precio: '',
    stockMinimo: '',
    fechaIngreso: '',
    fechaVencimiento: '',
    estado: 'Activo',
    imagenUrl: ''
  })

  const [stockData, setStockData] = useState({
    cantidad: ''
  })

  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)

  const categorias = ['Vacuna', 'Medicamento', 'Alimento', 'Insumo']
  const unidades = ['unidades', 'ml', 'kg', 'g', 'l', 'tabletas', 'ampollas']

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    loadInventarios()
  }, [navigate])

  useEffect(() => {
    filtrarInventarios()
  }, [filtroCategoria, filtroStockBajo, inventarios])

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

  const loadInventarios = async () => {
    try {
      setLoading(true)
      const data = await inventarioService.getAll()
      // Actualizar estados automáticamente según fechas de vencimiento
      const inventariosActualizados = data.map(item => {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        let estado = item.estado || 'Activo'
        
        if (item.cantidad <= 0) {
          estado = 'Agotado'
        } else if (item.fechaVencimiento) {
          const fechaVenc = new Date(item.fechaVencimiento)
          fechaVenc.setHours(0, 0, 0, 0)
          if (fechaVenc < hoy) {
            estado = 'Vencido'
          } else if (item.cantidad <= (item.stockMinimo || 0)) {
            estado = 'Activo'
          }
        } else if (item.cantidad <= (item.stockMinimo || 0)) {
          estado = 'Activo' // Stock bajo pero no agotado
        }
        
        return { ...item, estado }
      })
      setInventarios(inventariosActualizados)
      setInventariosFiltrados(inventariosActualizados)
    } catch (error) {
      console.error('Error al cargar inventarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarInventarios = () => {
    let filtrados = [...inventarios]

    // Filtro por categoría
    if (filtroCategoria) {
      filtrados = filtrados.filter(item =>
        item.categoria?.toLowerCase() === filtroCategoria.toLowerCase()
      )
    }

    // Filtro por stock bajo
    if (filtroStockBajo) {
      filtrados = filtrados.filter(item =>
        item.cantidad <= (item.stockMinimo || 0) || item.cantidad === 0
      )
    }

    setInventariosFiltrados(filtrados)
  }

  const handleNuevoProducto = () => {
    setEditingInventario(null)
    const hoy = new Date().toISOString().split('T')[0]
    setFormData({
      nombreProducto: '',
      descripcion: '',
      categoria: 'Insumo',
      cantidad: '',
      unidad: 'unidades',
      precio: '',
      stockMinimo: '',
      fechaIngreso: hoy,
      fechaVencimiento: '',
      estado: 'Activo',
      imagenUrl: ''
    })
    setImagenFile(null)
    setImagenPreview(null)
    setShowModal(true)
  }

  const handleEdit = (inventario) => {
    setEditingInventario(inventario)
    setFormData({
      nombreProducto: inventario.nombreProducto || '',
      descripcion: inventario.descripcion || '',
      categoria: inventario.categoria || 'Insumo',
      cantidad: inventario.cantidad?.toString() || '',
      unidad: inventario.unidad || 'unidades',
      precio: inventario.precio ? inventario.precio.toString() : '',
      stockMinimo: inventario.stockMinimo?.toString() || '',
      fechaIngreso: inventario.fechaIngreso ? inventario.fechaIngreso.split('T')[0] : '',
      fechaVencimiento: inventario.fechaVencimiento ? inventario.fechaVencimiento.split('T')[0] : '',
      estado: inventario.estado || 'Activo',
      imagenUrl: inventario.imagenUrl || ''
    })
    setImagenFile(null)
    setImagenPreview(inventario.imagenUrl ? getImagenUrl(inventario.imagenUrl) : null)
    setShowModal(true)
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

  const handleUpdateStock = (inventario) => {
    setInventarioStock(inventario)
    setStockData({ cantidad: inventario.cantidad?.toString() || '0' })
    setShowStockModal(true)
  }

  const handleDelete = (inventario) => {
    setInventarioToDelete(inventario)
    setShowDeleteModal(true)
  }

  const confirmarEliminar = async () => {
    if (!inventarioToDelete) return

    try {
      await inventarioService.delete(inventarioToDelete.id)
      setShowDeleteModal(false)
      setInventarioToDelete(null)
      await loadInventarios()
      alert('Producto eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar inventario:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
      alert(`Error al eliminar el producto: ${errorMessage}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.nombreProducto || !formData.nombreProducto.trim()) {
      alert('El nombre del producto es requerido')
      return
    }
    
    if (!formData.cantidad || parseInt(formData.cantidad) < 0) {
      alert('La cantidad debe ser un número mayor o igual a 0')
      return
    }

    try {
      // Preparar los datos asegurando que las fechas vacías sean null
      const fechaIngreso = formData.fechaIngreso && formData.fechaIngreso.trim() !== '' 
        ? formData.fechaIngreso 
        : null
      const fechaVencimiento = formData.fechaVencimiento && formData.fechaVencimiento.trim() !== '' 
        ? formData.fechaVencimiento 
        : null

      const inventarioData = {
        nombreProducto: formData.nombreProducto.trim(),
        descripcion: formData.descripcion && formData.descripcion.trim() !== '' ? formData.descripcion.trim() : null,
        categoria: formData.categoria,
        cantidad: formData.cantidad && formData.cantidad.trim() !== '' ? parseInt(formData.cantidad) : 0,
        unidad: formData.unidad,
        precio: formData.precio && formData.precio.trim() !== '' ? parseFloat(formData.precio) : null,
        stockMinimo: formData.stockMinimo && formData.stockMinimo.trim() !== '' ? parseInt(formData.stockMinimo) : null,
        fechaIngreso: fechaIngreso,
        fechaVencimiento: fechaVencimiento,
        estado: formData.estado || 'Activo'
      }

      if (editingInventario) {
        await inventarioService.update(editingInventario.id, inventarioData, imagenFile, formData.imagenUrl)
        alert('Producto actualizado correctamente')
      } else {
        await inventarioService.create(inventarioData, imagenFile)
        alert('Producto creado correctamente')
      }

      setShowModal(false)
      setEditingInventario(null)
      setImagenFile(null)
      setImagenPreview(null)
      await loadInventarios()
    } catch (error) {
      console.error('Error al guardar inventario:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido'
      alert(`Error al guardar el producto: ${errorMessage}`)
    }
  }

  const handleSubmitStock = async (e) => {
    e.preventDefault()
    if (!inventarioStock) return

    // Validación
    const cantidad = parseInt(stockData.cantidad)
    if (isNaN(cantidad) || cantidad < 0) {
      alert('La cantidad debe ser un número mayor o igual a 0')
      return
    }

    try {
      // Usar el método update completo como lo hace el botón Editar
      // Preparar las fechas asegurando que las fechas vacías sean null
      const fechaIngreso = inventarioStock.fechaIngreso 
        ? (inventarioStock.fechaIngreso.includes('T') ? inventarioStock.fechaIngreso.split('T')[0] : inventarioStock.fechaIngreso)
        : null
      const fechaVencimiento = inventarioStock.fechaVencimiento 
        ? (inventarioStock.fechaVencimiento.includes('T') ? inventarioStock.fechaVencimiento.split('T')[0] : inventarioStock.fechaVencimiento)
        : null

      // Determinar el estado según la cantidad
      // Si cantidad <= 0 -> Agotado
      // Si cantidad > 0 -> Activo (el backend verificará si está vencido)
      let nuevoEstado = cantidad <= 0 ? 'Agotado' : 'Activo'
      
      const inventarioData = {
        nombreProducto: inventarioStock.nombreProducto || '',
        descripcion: inventarioStock.descripcion && inventarioStock.descripcion.trim() !== '' ? inventarioStock.descripcion.trim() : null,
        categoria: inventarioStock.categoria || 'Insumo',
        cantidad: cantidad,
        unidad: inventarioStock.unidad || 'unidades',
        precio: inventarioStock.precio || null,
        stockMinimo: inventarioStock.stockMinimo || null,
        fechaIngreso: fechaIngreso,
        fechaVencimiento: fechaVencimiento,
        estado: nuevoEstado
      }
      
      await inventarioService.update(inventarioStock.id, inventarioData)
      setShowStockModal(false)
      setInventarioStock(null)
      await loadInventarios()
      alert('Stock actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar stock:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido'
      alert(`Error al actualizar el stock: ${errorMessage}`)
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const dateOnly = String(dateString).split('T')[0]
    const parts = dateOnly.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  const formatPrecio = (precio) => {
    if (!precio) return 'N/A'
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const getEstadoBadgeStyle = (estado) => {
    switch (estado) {
      case 'Activo':
        return { background: '#d4edda', color: '#155724' }
      case 'Inactivo':
        return { background: '#f8d7da', color: '#721c24' }
      case 'Agotado':
        return { background: '#f8d7da', color: '#721c24' }
      case 'Vencido':
        return { background: '#fff3cd', color: '#856404' }
      default:
        return { background: '#e2e3e5', color: '#383d41' }
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
          <a href="/admin/servicios" className="nav-item">
            <span className="nav-icon">⚕️</span>
            <span className="nav-text">Servicios</span>
          </a>
          <a href="/admin/inventario" className="nav-item active">
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
          <h1>GESTIÓN DE INVENTARIO</h1>
          <p>Administra los productos veterinarios (vacunas, medicamentos, alimentos, insumos)</p>
        </div>

        {/* Filtros */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Inventario ({inventariosFiltrados.length})</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="search-input"
                style={{ width: '180px' }}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filtroStockBajo}
                  onChange={(e) => setFiltroStockBajo(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px' }}>Stock bajo</span>
              </label>
              <button
                onClick={handleNuevoProducto}
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
                <span>+</span> Nuevo Producto
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Inventario */}
        <div className="dashboard-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Unidad</th>
                  <th>Fecha Ingreso</th>
                  <th>Fecha Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventariosFiltrados.length > 0 ? (
                  inventariosFiltrados.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.imagenUrl ? (
                          <img 
                            src={getImagenUrl(item.imagenUrl)} 
                            alt={item.nombreProducto}
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
                      <td style={{ fontWeight: '600' }}>{item.nombreProducto || 'N/A'}</td>
                      <td>{item.categoria || 'N/A'}</td>
                      <td>
                        <span style={{
                          color: item.cantidad <= (item.stockMinimo || 0) ? '#e74c3c' : '#2c3e50',
                          fontWeight: '600'
                        }}>
                          {item.cantidad || 0}
                        </span>
                        {item.stockMinimo && (
                          <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '5px' }}>
                            (mín: {item.stockMinimo})
                          </span>
                        )}
                      </td>
                      <td>{item.unidad || 'unidades'}</td>
                      <td>{formatDate(item.fechaIngreso)}</td>
                      <td>{formatDate(item.fechaVencimiento)}</td>
                      <td>
                        <span style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          ...getEstadoBadgeStyle(item.estado)
                        }}>
                          {item.estado || 'Activo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleUpdateStock(item)}
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
                            Stock
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            style={{
                              padding: '5px 10px',
                              background: '#f39c12',
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
                            onClick={() => handleDelete(item)}
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
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay productos en el inventario
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Crear/Editar Producto */}
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
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingInventario ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombreProducto}
                  onChange={(e) => setFormData({ ...formData, nombreProducto: e.target.value })}
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
                  Imagen del Producto
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
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Unidad *
                  </label>
                  <select
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {unidades.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    min="0"
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
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                    min="0"
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Fecha Ingreso *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaIngreso}
                    onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
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
                    Fecha Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaVencimiento}
                    onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
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
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Agotado">Agotado</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingInventario(null)
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
                  {editingInventario ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Actualizar Stock */}
      {showStockModal && inventarioStock && (
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
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              Actualizar Stock: {inventarioStock.nombreProducto}
            </h2>
            <form onSubmit={handleSubmitStock}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Cantidad Actual: {inventarioStock.cantidad} {inventarioStock.unidad}
                </label>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', marginTop: '15px' }}>
                  Nueva Cantidad *
                </label>
                <input
                  type="number"
                  value={stockData.cantidad}
                  onChange={(e) => setStockData({ cantidad: e.target.value })}
                  min="0"
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
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowStockModal(false)
                    setInventarioStock(null)
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
      {showDeleteModal && inventarioToDelete && (
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
              ¿Está seguro de eliminar el producto <strong>{inventarioToDelete.nombreProducto}</strong>?
            </p>
            <p style={{ marginBottom: '20px', color: '#e74c3c', fontSize: '14px' }}>
              ⚠️ Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setInventarioToDelete(null)
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

