import Modal from './Modal'
import './styles/ConfirmacionModal.css'

export default function ConfirmacionModal({ isOpen, onClose, citaData }) {
  if (!citaData) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¡Cita Registrada Exitosamente!" size="medium">
      <div className="confirmacion-content">
        <div className="confirmacion-icon">✓</div>
        <p className="confirmacion-message">
          Tu cita ha sido registrada exitosamente. Te contactaremos pronto para confirmar los detalles.
        </p>
        
        <div className="confirmacion-details">
          <h3>Resumen de tu cita:</h3>
          <div className="confirmacion-item">
            <strong>Propietario:</strong> {citaData.propietario?.nombre}
          </div>
          <div className="confirmacion-item">
            <strong>Mascota:</strong> {citaData.mascota?.nombre}
          </div>
          <div className="confirmacion-item">
            <strong>Servicio:</strong> {citaData.servicio}
          </div>
          <div className="confirmacion-item">
            <strong>Fecha:</strong> {(() => {
              if (!citaData.fecha) return ''
              const dateOnly = String(citaData.fecha).split('T')[0]
              const parts = dateOnly.split('-')
              if (parts.length === 3) {
                const [year, month, day] = parts
                const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
                const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                const weekday = weekdays[date.getDay()]
                const monthName = months[parseInt(month) - 1]
                return `${weekday}, ${day} de ${monthName} de ${year}`
              }
              return citaData.fecha
            })()}
          </div>
          <div className="confirmacion-item">
            <strong>Hora:</strong> {citaData.hora}
          </div>
        </div>

        <div className="confirmacion-actions">
          <button className="btn-confirmacion" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </Modal>
  )
}



