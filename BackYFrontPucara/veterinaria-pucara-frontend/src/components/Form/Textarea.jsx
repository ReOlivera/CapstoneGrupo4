import './Form.css'

export default function Textarea({ 
  label, 
  name, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  rows = 4,
  ...props 
}) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className={`form-textarea ${error ? 'form-textarea-error' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

