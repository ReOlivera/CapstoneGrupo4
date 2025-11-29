import './Form.css'

export default function Checkbox({ 
  label, 
  name, 
  checked, 
  onChange, 
  error, 
  required = false,
  description,
  ...props 
}) {
  return (
    <div className="form-field">
      <div className="checkbox-container">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          className={`form-checkbox ${error ? 'form-checkbox-error' : ''}`}
          {...props}
        />
        <label htmlFor={name} className="checkbox-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      </div>
      {description && <p className="checkbox-description">{description}</p>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

