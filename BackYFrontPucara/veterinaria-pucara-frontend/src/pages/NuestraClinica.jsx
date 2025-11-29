import './NuestraClinica.css'

export default function NuestraClinica() {
  return (
    <div className="nuestra-clinica-page">
      {/* Sección Hero con imagen de la clínica */}
      <section className="clinica-hero">
        <div className="clinica-hero-overlay">
          <div className="clinica-hero-text">
            <p className="clinica-hero-label">CLÍNICA VETERINARIA PUCARÁ</p>
            <h1 className="clinica-hero-title">Nuestra Clínica</h1>
            <p className="clinica-hero-subtitle">Desde 1990</p>
          </div>
        </div>
      </section>

      {/* Sección de iconos y características */}
      <section className="clinica-caracteristicas">
        <div className="caracteristicas-grid">
          <div className="caracteristica-item">
            <div className="caracteristica-icon">
              📚
            </div>
            <h3 className="caracteristica-titulo">Más de 30 años de historia</h3>
          </div>

          <div className="caracteristica-item">
            <div className="caracteristica-icon">
              🏥
            </div>
            <h3 className="caracteristica-titulo">Especialistas en cada área</h3>
          </div>

          <div className="caracteristica-item">
            <div className="caracteristica-icon">
              🤝
            </div>
            <h3 className="caracteristica-titulo">Confianza y profesionalismo</h3>
          </div>

          <div className="caracteristica-item">
            <div className="caracteristica-icon">
              ❤️
            </div>
            <h3 className="caracteristica-titulo">Atención con vocación y cariño</h3>
          </div>
        </div>
      </section>

      {/* Sección de información descriptiva */}
      <section className="clinica-info">
        <div className="clinica-info-container">
          <p className="clinica-parrafo">
            <strong>Clínica Veterinaria Pucará</strong> fue fundada en 1990 con el objetivo de 
            proporcionar una atención veterinaria de excelencia, fundamentada en el cariño, el 
            respeto, el conocimiento y la tecnología, gracias a un grupo comprometido de profesionales 
            que día a día trabajan por el bienestar de las mascotas en San Bernardo y sus alrededores.
          </p>

          <p className="clinica-parrafo">
            Nuestra clínica ha crecido desde sus inicios en Esmeralda 97, San Bernardo, hasta 
            consolidarse como un referente en la atención veterinaria de la Región Metropolitana. 
            Contamos con una infraestructura moderna de más de 500 m², dedicada completamente a la 
            prevención, cuidado y atención de especies menores. Nuestras instalaciones están equipadas 
            con instrumentos de última generación y un laboratorio clínico propio que nos permite 
            realizar diagnósticos precisos y oportunos.
          </p>

          <p className="clinica-parrafo">
            Con más de 30 años de actividad continua, nuestra clínica se ha mantenido fiel a los 
            más altos estándares médicos y éticos. Contamos con un equipo de profesionales 
            especializados en diversas áreas, incluyendo medicina general, cirugía, cardiología, 
            oncología veterinaria, traumatología, imagenología, etología, neurología y oftalmología. 
            Nuestra vocación es brindar la mejor atención, cuidado y cariño a nuestros pacientes, 
            priorizando siempre su bienestar e integridad, y apoyando a sus familias en cada etapa 
            de la vida de sus mascotas.
          </p>
        </div>
      </section>
    </div>
  )
}
