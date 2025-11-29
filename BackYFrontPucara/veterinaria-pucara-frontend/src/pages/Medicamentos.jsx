import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { medicamentoService, productoService } from '../services/api'
import './Productos.css'

export default function Medicamentos() {
  const navigate = useNavigate()
  const [medicamentos, setMedicamentos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarMedicamentos = async () => {
      try {
        setIsLoading(true)
        // Intentar obtener de medicamentos primero
        let medicamentosData = []
        try {
          medicamentosData = await medicamentoService.getAll()
        } catch (err) {
          // Si falla, intentar desde productos
          const productos = await productoService.getAll()
          medicamentosData = productos.filter(p => {
            const nombreDesc = `${p.nombre || ''} ${p.descripcion || ''}`.toLowerCase()
            return nombreDesc.includes('medicamento') || nombreDesc.includes('antiparasitario') || 
                   nombreDesc.includes('vacuna') || nombreDesc.includes('tratamiento') ||
                   nombreDesc.includes('bravecto') || nombreDesc.includes('nexgard') ||
                   nombreDesc.includes('revolution')
          })
        }
        setMedicamentos(medicamentosData)
        setError(null)
      } catch (err) {
        console.error('Error al cargar medicamentos:', err)
        setError('No se pudieron cargar los medicamentos. Por favor, intenta más tarde.')
        setMedicamentos([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarMedicamentos()
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
          <p>Cargando medicamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page productos-page">
      <h1 className="productos-title">Medicamentos</h1>
      
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

      {medicamentos.length === 0 ? (
        <p className="no-products">
          No hay medicamentos disponibles en este momento.
        </p>
      ) : (
        <>
          <p className="resultados-count">
            {medicamentos.length} medicamento{medicamentos.length !== 1 ? 's' : ''} encontrado{medicamentos.length !== 1 ? 's' : ''}
          </p>
          <div className="productos-grid">
            {medicamentos.map(medicamento => (
              <div key={medicamento.id} className="producto-card">
                <div className="producto-imagen">
                  <img 
                    src={medicamento.imagen || '/assets/logo-pucara.png'} 
                    alt={medicamento.nombre || 'Medicamento'} 
                  />
                </div>
                <div className="producto-info">
                  <span className="producto-tipo">💊 Medicamento</span>
                  <h3 className="producto-nombre">{medicamento.nombre || 'Medicamento sin nombre'}</h3>
                  <p className="producto-descripcion">
                    {medicamento.descripcion || 'Descripción no disponible'}
                  </p>
                  <div className="producto-footer">
                    <span className="producto-precio">
                      {formatearPrecio(medicamento.precio)}
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
