<template>
    <div class="xestion-citas">
        <h4>📅 Xestión de Citas 🩺</h4>
        <form @submit.prevent="guardarCita">
            <!-- Fila 1 -->
            <div class="fila">
                <div class="campo">
                    <label>ID cita:</label>
                    <input v-model="novaCita.idCita" type="text" required />
                </div>
                <div class="campo">
                    <label>Data:</label>
                    <input v-model="novaCita.data" type="date" required />
                </div>
                <button type="button" @click="limpiarFormulario" title="Limpar">🧹</button>
            </div>

            <!-- Fila 2 -->
            <div class="fila">
                <div class="campo">
                    <label>ID Paciente:</label>
                    <input v-model="novaCita.idPaciente" type="text" required />
                </div>
                <div class="campo">
                    <label>ID Doctor:</label>
                    <input v-model="novaCita.idDoctor" type="text" required />
                </div>
            </div>

            <!-- Fila 3 -->
            <div class="fila">
                <div class="campo">
                    <label>Hora Cita:</label>
                    <input v-model="novaCita.hora" type="time" required />
                </div>
                <div class="campo">
                    <label>Motivo:</label>
                    <input v-model="novaCita.motivo" type="text" required />
                </div>
                <div class="campo">
                    <label>Estado:</label>
                    <select v-model="novaCita.estado" required>
                        <option value="Pendente">Pendente</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>
                </div>
            </div>

            <!-- Fila 4 -->
            <div class="campo-textarea">
                <label>Observacións adicionais:</label>
                <textarea v-model="novaCita.observacions"></textarea>
            </div>

            <button type="submit" class="btn-guardar">Gardar</button>
        </form>

        <div class="listaxe-header">
            <h4>📑 Listaxe de Citas <button @click="recargarCitas" class="btn-recarga">↻</button></h4>
        </div>

        <p v-if="citas.length === 0" class="estado-vacio">
            Non hai citas cargadas ou falla a conexión coa BBDD.
        </p>
        <table v-else>
            <!-- Tabla de citas iría aquí -->
        </table>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const citas = ref([])

const novaCita = reactive({
    idCita: '',
    data: '',
    idPaciente: '',
    idDoctor: '',
    hora: '',
    motivo: '',
    estado: 'Pendente',
    observacions: ''
})

const guardarCita = () => {
    console.log("Gardando cita:", novaCita)
    // Aquí iría la lógica de guardado
}

const limpiarFormulario = () => {
    Object.assign(novaCita, {
        idCita: '', data: '', idPaciente: '', idDoctor: '',
        hora: '', motivo: '', estado: 'Pendente', observacions: ''
    })
}

const recargarCitas = () => {
    console.log("Recargando citas...")
}
</script>

<style scoped>
.xestion-citas {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    background: #ffffff;
    color: #333333;
    padding: 2rem;
}

h4 {
    width: 100%;
    text-align: center;
    background-color: #17b473;
    color: white;
    padding: 1rem;
    margin-bottom: 1rem;
}

.fila {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.campo {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.campo-textarea {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

textarea {
    width: 100%;
    height: 100px;
    padding: 0.5rem;
}

.btn-guardar {
    display: block;
    margin: 0 auto;
    padding: 0.5rem 2rem;
    background-color: #17b473;
    color: white;
    border: none;
    cursor: pointer;
}

.listaxe-header h4 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.btn-recarga {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
}
</style>