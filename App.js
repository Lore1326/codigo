import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; 
import './styles.css';
import Login from './Login'; // Importa el componente de login

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para manejar si el usuario ha iniciado sesión

    const handleLogin = () => {
        setIsAuthenticated(true); // Cambia el estado cuando se inicia sesión correctamente
    };

    const handleLogout = () => {
        setIsAuthenticated(false); // Cambia el estado cuando se cierra sesión
    };

    const [nombrePaciente, setNombrePaciente] = useState('');
    const [fecha, setFecha] = useState('');
    const [archivoECG, setArchivoECG] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [ecgData, setEcgData] = useState(null);
    const [formData, setFormData] = useState({
        ssn: '',
        patientId: '',
        age: '',
        curp: '',
        phone: '',
        gender: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos del formulario:', { nombrePaciente, fecha, ...formData });
    };

    useEffect(() => {
        cargarHistorial();
    }, []);

    const cargarHistorial = () => {
        axios.get('http://localhost:5000/historial')
            .then(response => {
                setHistorial(response.data);
            })
            .catch(error => {
                console.error('Error cargando el historial:', error);
            });
    };

    const subirECG = (e) => {
        e.preventDefault();
        
        const formDataToSend = new FormData();
        formDataToSend.append('nombrePaciente', nombrePaciente);
        formDataToSend.append('fecha', fecha);
        formDataToSend.append('archivoECG', archivoECG); 
        formDataToSend.append('ssn', formData.ssn);
        formDataToSend.append('patientId', formData.patientId);
        formDataToSend.append('age', formData.age);
        formDataToSend.append('curp', formData.curp);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('gender', formData.gender);

        axios.post('http://localhost:5000/subirECG', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            alert('ECG subido con éxito');
            cargarHistorial();
        })
        .catch(error => {
            console.error('Error subiendo el ECG:', error);
        });
    };

    const cargarECG = (id) => {
        axios.get(`http://localhost:5000/cargarECG/${id}`)
            .then(response => {
                setEcgData(response.data);
            })
            .catch(error => {
                console.error('Error cargando ECG:', error);
                alert('Error al cargar el ECG');
            });
    };

    const exportarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(historial);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Historial de Pacientes');
        XLSX.writeFile(wb, 'HistorialDePacientes.xlsx');
    };

    // Si no está autenticado, mostrar el login
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />; // Componente de login
    }

    // Si ya está autenticado, mostrar el formulario
    return (
        <div className="app-container"> {/* Contenedor principal */}
            <div className="menu-container"> {/* Contenedor del menú */}
                <h2>Menú</h2>
                <ul>
                    <li>Inicio</li>
                    <li>Busqueda</li>
                    <li>Historial de Pacientes</li>
                    <li>Reportes</li>
                    <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'red' }}>Cierre de sesión</li>
                </ul>
            </div>

            <div className="form-container"> {/* Contenedor del formulario */}
                <h1>Historial Clínico Para Electrocardiograma</h1>

                <form onSubmit={handleSubmit}>
                    <div className="field-container">
                        <label>Nombre del Paciente:</label>
                        <input
                            type="text"
                            value={nombrePaciente}
                            onChange={(e) => setNombrePaciente(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>Fecha:</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>Número de Seguro Social:</label>
                        <input
                            type="text"
                            name="ssn"
                            value={formData.ssn}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>ID de Identificación de Paciente:</label>
                        <input
                            type="text"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>Edad:</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>CURP:</label>
                        <input
                            type="text"
                            name="curp"
                            value={formData.curp}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>Teléfono:</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>Sexo:</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <button type="submit">Guardar Datos</button>
                </form>

                <form onSubmit={subirECG}>
                    <div className="field-container">
                        <label>Archivo ECG (CSV):</label>
                        <input
                            type="file"
                            onChange={(e) => setArchivoECG(e.target.files[0])}
                            required
                        />
                    </div>
                    <button type="submit">Subir ECG</button>
                </form>
            </div>

            <div className="historial-container"> {/* Contenedor del historial de pacientes */}
                <h2>Historial de Pacientes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>ID</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.map((entry) => (
                            <tr key={entry._id}>
                                <td>{entry.nombrePaciente}</td>
                                <td>{entry._id}</td>
                                <td>
                                    <button onClick={() => cargarECG(entry._id)}>PDF</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={exportarExcel}>Exportar a Excel</button>
            </div>

            {ecgData && (
                <div>
                    <h3>Datos del ECG:</h3>
                    <pre>{JSON.stringify(ecgData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
