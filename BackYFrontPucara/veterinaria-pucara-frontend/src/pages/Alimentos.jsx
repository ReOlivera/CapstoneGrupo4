import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { productoService } from '../services/api'
import './Productos.css'

export default function Alimentos() {
  const navigate = useNavigate()
  const [alimentos, setAlimentos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarAlimentos = async () => {
      try {
        setIsLoading(true)
        const productos = await productoService.getAll()
        // Filtrar alimentos
        const alimentosData = productos.filter(p => {
          const nombreDesc = `${p.nombre || ''} ${p.descripcion || ''}`.toLowerCase()
          return nombreDesc.includes('alimento') || nombreDesc.includes('comida') || 
                 nombreDesc.includes('royal') || nombreDesc.includes('hills') || 
                 nombreDesc.includes('pro plan') || nombreDesc.includes('nutrición')
        })
        setAlimentos(alimentosData)
        setError(null)
      } catch (err) {
        console.error('Error al cargar alimentos:', err)
        setError('No se pudieron cargar los alimentos. Por favor, intenta más tarde.')
        setAlimentos([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarAlimentos()
  }, [])

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

  if (isLoading) {
    return (
      <div className="page productos-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando alimentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page productos-page">
      <h1 className="productos-title">Alimentos</h1>
      
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

      {alimentos.length === 0 ? (
        <p className="no-products">
          No hay alimentos disponibles en este momento.
        </p>
      ) : (
        <>
          <p className="resultados-count">
            {alimentos.length} alimento{alimentos.length !== 1 ? 's' : ''} encontrado{alimentos.length !== 1 ? 's' : ''}
          </p>
          <div className="productos-grid">
            {alimentos.map(alimento => (
              <div key={alimento.id} className="producto-card">
                <div className="producto-imagen">
                  <img 
                    src={alimento.imagen || '/assets/logo-pucara.png'} 
                    alt={alimento.nombre || 'Alimento'} 
                  />
                </div>
                <div className="producto-info">
                  <span className="producto-tipo">🍖 Alimento</span>
                  <h3 className="producto-nombre">{alimento.nombre || 'Alimento sin nombre'}</h3>
                  <p className="producto-descripcion">
                    {alimento.descripcion || 'Descripción no disponible'}
                  </p>
                  <div className="producto-footer">
                    <span className="producto-precio">
                      {formatearPrecio(alimento.precio)}
                    </span>
                    <button className="producto-btn">Ver detalles</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
