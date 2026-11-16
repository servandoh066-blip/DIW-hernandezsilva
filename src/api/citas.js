import axios from "axios"

//en produccion se usa la url del servidor
//const API_URL = "https://servidor.com/api";

const API_URL = "http://localhost:3000/api";

// Obtener todas las citas (con paciente y doctor ya resueltos)
export async function getCitas() {
    const res = await axios.get(`${API_URL}/citas`);
    return res.data;
}

// Guardar cita
export async function saveCita(cita) {
    const res = await axios.post(`${API_URL}/citas`, cita);
    return res.data;
}

// Actualizar cita
export async function modifyCita(id, cita) {
    const res = await axios.put(`${API_URL}/citas/${id}`, cita);
    return res.data;
}

// Eliminar cita
export async function deleteCita(id) {
    const res = await axios.delete(`${API_URL}/citas/${id}`);
    return res.data;
}
