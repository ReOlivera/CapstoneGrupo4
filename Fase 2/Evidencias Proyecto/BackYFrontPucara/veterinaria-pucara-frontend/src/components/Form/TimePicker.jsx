import './Form.css'

export default function TimePicker({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  availableTimes = [],
  ...props 
}) {
  // Horarios por defecto si no se proporcionan
  const defaultTimes = [
    '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30',
    '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ]
  
  const times = availableTimes.length > 0 ? availableTimes : defaultTimes

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className={`form-select ${error ? 'form-select-error' : ''}`}
        {...props}
      >
        <option value="">Selecciona una hora</option>
        {times.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

