import { useState, useEffect } from 'react'
import './Form.css'

export default function DatePicker({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  minDate,
  max,
  ...props 
}) {
  const [selectedDate, setSelectedDate] = useState(value || '')
  
  useEffect(() => {
    setSelectedDate(value || '')
  }, [value])

  const handleChange = (e) => {
    const newValue = e.target.value
    setSelectedDate(newValue)
    if (onChange) {
      onChange(e)
    }
  }

  // Establecer fecha mínima como hoy si no se proporciona
  const today = new Date().toISOString().split('T')[0]
  const min = minDate || today

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        value={selectedDate}
        onChange={handleChange}
        min={min}
        max={max}
        required={required}
        className={`form-input form-date-input ${error ? 'form-input-error' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

