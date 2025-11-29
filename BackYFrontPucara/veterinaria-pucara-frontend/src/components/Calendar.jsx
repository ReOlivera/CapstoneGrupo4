import { useState } from 'react'
import './styles/Calendar.css'

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const availableTimes = ['09:00', '10:00', '11:00', '15:00', '16:00']

  return (
    <div className="calendar-section">
      <label>
        Selecciona fecha:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />
      </label>

      {selectedDate && (
        <label>
          Horario disponible:
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          >
            <option value="">-- Selecciona una hora --</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
