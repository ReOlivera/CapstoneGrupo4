# Plantillas de Documentos

Coloca aquí los archivos de plantilla (.docx o .pdf) para los documentos clínicos.

## Estructura

```
templates/documentos/
├── certificado-parvovirus.docx  (pendiente)
├── [otros documentos].docx
└── README.md
```

## Formato de Placeholders

Cuando uses plantillas Word, puedes usar placeholders como:
- `{NOMBRE_MASCOTA}` - Se reemplazará con el nombre de la mascota
- `{FECHA_VACUNACION}` - Se reemplazará con la fecha de vacunación
- `{LOTE_VACUNA}` - Se reemplazará con el lote de la vacuna
- etc.

El servicio `DocumentoService` buscará y reemplazará estos placeholders con los datos reales.

