import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { inventarioService } from '../services/api'
import './Productos.css'

export default function Productos() {
  const { tipo } = useParams()
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const productosPorPagina = 6


  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setIsLoading(true)
        // Obtener solo productos activos con stock > 0
        const inventariosData = await inventarioService.getAll({ activo: true })
        
        // Filtrar solo productos activos con stock > 0 y mapear a formato de producto
        const productosActivos = (inventariosData || [])
          .filter(item => 
            item.estado === 'Activo' && 
            item.cantidad != null && 
            item.cantidad > 0
          )
          .map(item => ({
            id: item.id,
            nombre: item.nombreProducto,
            descripcion: item.descripcion,
            precio: item.precio,
            categoria: item.categoria, // Mantener la categoría original del inventario
            imagen: item.imagenUrl,
            cantidad: item.cantidad,
            unidad: item.unidad
          }))
        
        setProductos(productosActivos)
        setError(null)
      } catch (err) {
        console.error('Error al cargar productos:', err)
        setError('No se pudieron cargar los productos. Por favor, intenta más tarde.')
        setProductos([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarProductos()
  }, [])

  useEffect(() => {
    let productosFiltrados = [...productos]

    // Filtrar por tipo si existe
    if (tipo) {
      productosFiltrados = productosFiltrados.filter(p => {
        // Normalizar categoría a minúsculas para comparación
        const categoriaNormalizada = p.categoria ? p.categoria.toLowerCase().trim() : ''
        
        if (tipo === 'alimentos') {
          // Filtrar por categoría "Alimento" del inventario
          return categoriaNormalizada === 'alimento'
        }
        
        if (tipo === 'medicamentos') {
          // Filtrar por categorías "Medicamento" o "Vacuna" del inventario
          return categoriaNormalizada === 'medicamento' || 
                 categoriaNormalizada === 'vacuna'
        }
        
        if (tipo === 'insumos') {
          // Filtrar por categoría "Insumo" del inventario
          return categoriaNormalizada === 'insumo'
        }
        
        // Si no hay tipo específico, mostrar todos
        return true
      })
    }

    // Filtrar por búsqueda
    if (busqueda) {
      productosFiltrados = productosFiltrados.filter(p => {
        const nombreDesc = `${p.nombre || ''} ${p.descripcion || ''}`.toLowerCase()
        return nombreDesc.includes(busqueda.toLowerCase())
      })
    }

    setProductosFiltrados(productosFiltrados)
    setPaginaActual(1) // Resetear a página 1 cuando cambia el filtro
  }, [tipo, busqueda, productos])

  const tipoActual = tipo || 'todos'

  // Calcular paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina)
  const inicio = (paginaActual - 1) * productosPorPagina
  const fin = inicio + productosPorPagina
  const productosPagina = productosFiltrados.slice(inicio, fin)

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatearPrecio = (precio) => {
    if (!precio) return 'Consultar precio'
    if (typeof precio === 'number') {
      return `$${precio.toLocaleString('es-CL')}`
    }
    if (typeof precio === 'string') {
      const numPrecio = parseFloat(precio)
      if (!isNaN(numPrecio)) {
        return `$${numPrecio.toLocaleString('es-CL')}`
      }
    }
    return 'Consultar precio'
  }

  const inferirTipo = (producto) => {
    // Usar la categoría del inventario directamente
    if (producto.categoria) {
      const categoriaNormalizada = producto.categoria.toLowerCase().trim()
      
      if (categoriaNormalizada === 'alimento') {
        return 'alimento'
      }
      
      if (categoriaNormalizada === 'medicamento' || categoriaNormalizada === 'vacuna') {
        return 'medicamento'
      }
      
      if (categoriaNormalizada === 'insumo') {
        return 'insumo'
      }
    }
    
    // Fallback solo si no hay categoría definida
    return 'producto'
  }

  // Función para construir la URL completa de la imagen
  const getImagenUrl = (imagenUrl) => {
    if (!imagenUrl) return '/assets/logo-pucara.png'
    
    // Si ya es una URL completa, usarla directamente
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl
    }
    
    // Si es una ruta relativa que empieza con /assets/, construir la URL del backend
    if (imagenUrl.startsWith('/assets/')) {
      return `http://localhost:8082${imagenUrl}`
    }
    
    return imagenUrl
  }

  if (isLoading) {
    return (
      <div className="page productos-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page productos-page">
      <h1 className="productos-title">Productos</h1>
      
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

      {/* Barra de búsqueda */}
      <div className="productos-busqueda">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
      </div>

      <div className="productos-filters">
        <a 
          href="/productos" 
          className={`filter-btn ${tipoActual === 'todos' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            navigate('/productos')
          }}
        >
          Todos
        </a>
        <a 
          href="/productos/alimentos" 
          className={`filter-btn ${tipoActual === 'alimentos' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            navigate('/productos/alimentos')
          }}
        >
          Alimentos
        </a>
        <a 
          href="/productos/medicamentos" 
          className={`filter-btn ${tipoActual === 'medicamentos' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            navigate('/productos/medicamentos')
          }}
        >
          Medicamentos
        </a>
        <a 
          href="/productos/insumos" 
          className={`filter-btn ${tipoActual === 'insumos' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            navigate('/productos/insumos')
          }}
        >
          Insumos
        </a>
      </div>

      {/* Mostrar cantidad de resultados */}
      {productosFiltrados.length > 0 && (
        <p className="resultados-count">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {productosPagina.length === 0 ? (
        <p className="no-products">
          {busqueda 
            ? `No se encontraron productos que coincidan con "${busqueda}"`
            : productos.length === 0
            ? 'No hay productos disponibles en este momento.'
            : tipo === 'alimentos'
            ? 'No hay alimentos disponibles en este momento.'
            : tipo === 'medicamentos'
            ? 'No hay medicamentos disponibles en este momento.'
            : tipo === 'insumos'
            ? 'No hay insumos disponibles en este momento.'
            : 'No hay productos disponibles en esta categoría.'}
        </p>
      ) : (
        <>
          <div className="productos-grid">
            {productosPagina.map(producto => {
              const tipoProducto = inferirTipo(producto)
              return (
                <div key={producto.id} className="producto-card">
                  <div className="producto-imagen">
                    <img 
                      src={getImagenUrl(producto.imagen)} 
                      alt={producto.nombre || 'Producto'}
                      onError={(e) => {
                        e.target.src = '/assets/logo-pucara.png'
                      }}
                    />
                  </div>
                  <div className="producto-info">
                    <span className="producto-tipo">
                      {tipoProducto === 'alimento' ? '🍖 Alimento' : 
                       tipoProducto === 'medicamento' ? '💊 Medicamento' : 
                       tipoProducto === 'insumo' ? '🔧 Insumo' :
                       '📦 Producto'}
                    </span>
                    <h3 className="producto-nombre">{producto.nombre || 'Producto sin nombre'}</h3>
                    <p className="producto-descripcion">
                      {producto.descripcion || 'Descripción no disponible'}
                    </p>
                    <div className="producto-footer">
                      <span className="producto-precio">
                        {formatearPrecio(producto.precio)}
                      </span>
                      <button className="producto-btn">Ver detalles</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button 
                className="pag-btn"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              
              <div className="pag-numeros">
                {[...Array(totalPaginas)].map((_, index) => {
                  const numero = index + 1
                  // Mostrar primera, última, actual y adyacentes
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numero}
                        className={`pag-num ${paginaActual === numero ? 'active' : ''}`}
                        onClick={() => cambiarPagina(numero)}
                      >
                        {numero}
                      </button>
                    )
                  } else if (
                    numero === paginaActual - 2 ||
                    numero === paginaActual + 2
                  ) {
                    return <span key={numero} className="pag-ellipsis">...</span>
                  }
                  return null
                })}
              </div>

              <button 
                className="pag-btn"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
