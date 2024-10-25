const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5000; // El puerto para el backend

app.use(cors()); 
app.use(express.json());

// Configurar MongoDB sin las opciones deprecadas
mongoose.connect('mongodb://localhost:27017/tuBaseDeDatos')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// **Definir el esquema del historial clínico**
const HistorialSchema = new mongoose.Schema({
    nombrePaciente: { type: String, required: true },
    fecha: { type: Date, required: true },
    archivoECG: { type: String, required: true },
    ssn: { type: String, required: true }, // Número de Seguro Social
    patientId: { type: String, required: true }, // ID del Paciente
    age: { type: Number, required: true }, // Edad del Paciente
    curp: { type: String, required: true }, // CURP del Paciente
    phone: { type: String, required: true }, // Teléfono
    gender: { type: String, required: true } // Género
}, { timestamps: true });

// **Crear el modelo basado en el esquema**
const Historial = mongoose.model('Historial', HistorialSchema);

// **Configurar Multer para subir archivos CSV**
const upload = multer({ dest: 'uploads/' });

// **Ruta para agregar información del paciente (Médico)**
app.post('/subirECG', upload.single('archivoECG'), (req, res) => {
    const { nombrePaciente, fecha, ssn, patientId, age, curp, phone, gender } = req.body;
    const archivoECG = req.file.filename;

    // **Crear una nueva instancia del modelo Historial**
    const nuevoHistorial = new Historial({
        nombrePaciente,
        fecha,
        archivoECG,
        ssn,
        patientId,
        age,
        curp,
        phone,
        gender
    });

    // **Guardar el historial clínico en la base de datos**
    nuevoHistorial.save()
        .then(() => res.status(200).json('Datos subidos con éxito'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// **Ruta para consultar todo el historial clínico (Consulta)**
app.get('/historial', (req, res) => {
    Historial.find()
        .then(historiales => res.json(historiales))
        .catch(err => res.status(400).json('Error: ' + err));
});

// **Ruta para cargar y mostrar datos del archivo CSV de ECG**
app.get('/cargarECG/:id', (req, res) => {
    const id = req.params.id;

    Historial.findById(id)
        .then(historial => {
            const archivo = historial.archivoECG;
            const results = [];

            fs.createReadStream(`uploads/${archivo}`)
                .pipe(csvParser())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    res.json(results);
                });
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
