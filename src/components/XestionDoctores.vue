<template>
    <div class="xestion-doctor">
        <h4>🧑‍⚕️ Xestión de doctores</h4>
        <form @submit.prevent="guardarDoctor">
            <div class="fila">
                <div class="campo campo-id">
                    <label>ID:</label>
                    <input v-model.trim="novoDoctor.iddoc" type="text" required style="text-align: center;" />
                </div>
                <button type="button" @click="limpiaFormdoc">Limpar</button>
                <button type="button" @click="buscarDoctor">Buscar</button>
                <div class="campo campo-nome">
                    <label>Nome:</label>
                    <input v-model="novoDoctor.nomedoc" type="text" @keyup.enter="corrixirNome()" @blur="corrixirNome()"
                        required />
                </div>
                <div class="campo campo-apelido">
                    <label>Apelido:</label>
                    <input v-model="novoDoctor.apeldoc" type="text" @keyup.enter="corrixirApelido()"
                        @blur="corrixirApelido()" required />
                </div>
            </div>
            <div class="fila">
                <div class="campo campo-data-nacimiento">
                    <label>Data de nacemento:</label>
                    <input v-model="novoDoctor.coledoc" type="date" required />
                </div>
                <div class="campo campo-correo">
                    <label>Correo:</label>
                    <input v-model="novoDoctor.maildoc" type="email" required />
                </div>
            </div>
            <div class="fila">
                <div class="campo campo-telefono">
                    <label>Telefono:</label>
                    <div class="input-wrap">
                        <input v-model.trim="novoDoctor.movildoc" type="text" required />
                        <span v-if="novoDoctor.movildoc !== '' && !validarTelf()" class="error-inline">
                            O teléfono non é válido
                        </span>
                    </div>
                </div>
                <div class="campo campo-especialidad">
                    <label>Especialidad:</label>
                    <select id="especialidad" v-model="novoDoctor.espedoc" required>
                        <option value="">Selecciona unha especialidad</option>
                        <option v-for="especialidad in especialidades" :key="especialidad.id" :value="especialidad.nm">
                            {{ especialidad.nm }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="campo-condicions">
                <label>
                    <input v-model="novoDoctor.lodpac" type="checkbox" required /> Aceptar a
                    <a :href="$router.resolve({ name: 'PoliticaPrivacidad' }).href" target="_blank"
                        rel="noopener noreferrer">
                        Política de privacidade e confidencialidade
                    </a>
                </label>
            </div>
            <button 
                type="submit" 
                class="btn-guardar" 
                :disabled="novoDoctor.nomedoc === '' ||
                    novoDoctor.apeldoc === '' ||
                    !novoDoctor.espedoc ||
                    !novoDoctor.lodpac
                ">
                {{ editando ? 'Actualizar' : 'Gardar' }}
            </button>
        </form>
        <h4>📋 Listaxe de doctores</h4>
        <div v-if="doctores.length > 0" class="taboa-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Apelidos</th>
                        <th>Nome</th>
                        <th>Móvil</th>
                        <th>Especialidad</th>
                        <th>Accións</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(u, index) in doctores" :key="u._id || u.iddoc">
                        <td style="text-align: center;">{{ index + 1 }}</td>
                        <td style="text-align: center;">{{ u.iddoc }}</td>
                        <td>{{ u.apeldoc }}</td>
                        <td>{{ u.nomedoc }}</td>
                        <td>{{ u.movildoc }}</td>
                        <td style="text-align: center;">{{ u.espedoc }}</td>
                        <td style="text-align: center;">
                            <button @click="editarDoctor(index)" title="Editar">
                                ✏️
                            </button>
                            <button @click="eliminarDoctor(index)" title="Eliminar">
                                🗑️
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p v-else>Non hai doctores cargados.</p>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { obtenerEspecialidades } from "../api/especialidades.js"
    import {
        saveDoctor,
        getDoctores,
        modifyDoctor,
        deleteDoctor
    } from "../api/doctores.js"
    import { alertaConfirmacion, alertaExito, alertaError, alertaInfo } from "../utils/alertas.js"
    
    
const doctores = ref([])  //almacena la lista de doctores e os seus cambios
const especialidades = ref([])
const editando = ref(false)

const novoDoctor = reactive({
  iddoc: "",
  nomedoc: "",
  apeldoc: "",
  maildoc: "",
  movildoc: "",
  coledoc: "",
  espedoc: "",
  lodpac: false,
});



async function guardarDoctor() {
  // Non se pode gardar nin modificar sen aceptar as condicións
  if (!novoDoctor.lodpac) {
    alertaInfo("Debes aceptar a política de privacidade e confidencialidade");
    return;
  }

  try {
    // Os datos que se envían ao backend non deben levar _id nin __v
    const { _id, __v, ...datos } = novoDoctor;

    if (editando.value) {
      // Ao editar usamos o _id de MongoDB (ou o iddoc como alternativa)
      const doctorModificado = await modifyDoctor(
        _id || datos.iddoc,
        datos
      );

      const index = doctores.value.findIndex(
        (d) => (_id && d._id === _id) || d.iddoc === datos.iddoc
      );

      if (index !== -1) {
        // Substituímos o doctor da lista polo que devolve o servidor
        Object.assign(doctores.value[index], doctorModificado);
      }

      await alertaExito("Doctor modificado con éxito");
      await limpiaFormdoc();
    } else {
      const doctorGuardado = await saveDoctor(datos);
      doctores.value.push(doctorGuardado);
      ordearDoctores();

      await alertaExito("Doctor gardado con éxito");
      await limpiaFormdoc();
    }
  } catch (error) {
    console.error("Erro ao gardar o doctor:", error);
    alertaError("Erro ao gardar o doctor. Contacte co administrador.");
  }
}

// Mantén a listaxe ordenada por apelido, igual que getDoctores()
function ordearDoctores() {
  doctores.value.sort((a, b) =>
    String(a.apeldoc).localeCompare(String(b.apeldoc), "es", { sensitivity: "base" })
  );
}

// Funciones auxiliares
function corrixirNome() {
  if (novoDoctor.nomedoc.length > 0) {
    novoDoctor.nomedoc = novoDoctor.nomedoc
    .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

function corrixirApelido() {
  if (novoDoctor.apeldoc.length > 0) {
    novoDoctor.apeldoc = novoDoctor.apeldoc
    .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    }
  }
  
function validarTelf() {
  const telfRegex = /^[6|7]\d{8}$/;
  if (novoDoctor.movildoc != "") {
    return telfRegex.test(novoDoctor.movildoc.trim());
  }
  return true;
}

async function cargarEspecialidades() {
  especialidades.value = await obtenerEspecialidades()
}

async function cargarDoctores() {
  try {
    doctores.value = await getDoctores()
  } catch (error) {
    console.error("Erro ao cargar os doctores:", error)
    doctores.value = []
  }
}

onMounted(async () => {
  await Promise.all([cargarEspecialidades(), cargarDoctores()])
})

async function buscarDoctor() {
  const id = novoDoctor.iddoc.trim();
  if (!id) return;

  const atopado = doctores.value.find(
    (d) => String(d.iddoc).toLowerCase() === id.toLowerCase()
  );

  if (atopado) {
    Object.assign(novoDoctor, atopado);
    editando.value = true;
  } else {
    alertaInfo("Non existe ningún doctor con ese ID");
  }
}

function editarDoctor(index) {
  const doctor = doctores.value[index];
  if (!doctor) return;

  Object.assign(novoDoctor, doctor);
  editando.value = true;
}

async function eliminarDoctor(index) {
  const doctor = doctores.value[index];
  if (!doctor) return;

  try {
    const confirmacion = await alertaConfirmacion(
      "¿Estás seguro de eliminar este doctor?"
    );
    if (!confirmacion.isConfirmed) return;

    await deleteDoctor(doctor._id || doctor.iddoc);
    doctores.value.splice(index, 1);
    alertaExito("Doctor eliminado con éxito");
  } catch (error) {
    console.error("Erro ao eliminar o doctor:", error);
    alertaError("Erro ao eliminar o doctor. Contacte co administrador.");
  }
}

const limpiaFormdoc = () => {
  Object.assign(novoDoctor, {
    iddoc: "",
    nomedoc: "",
    apeldoc: "",
    maildoc: "",
    movildoc: "",
    coledoc: "",
    espedoc: "",
    lodpac: false,
  });
  delete novoDoctor._id;
  delete novoDoctor.__v;
  editando.value = false;
}

</script>


<style scoped>
.error {
    color: red;
    font-size: 0.9rem;
    margin-top: 0.2rem;
}

.xestion-doctor {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    background: #ffffff; /* Corregido: forzado a blanco */
    color: #333333;      /* Corregido: texto visible */
    padding: clamp(1rem, 3vw, 2rem);
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

form {
    display: flex;
    padding: 0;
    width: 100%;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2rem;
    box-sizing: border-box;
}

.fila {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
}

.campo {
    display: flex;
    flex: 1 1 220px;
    min-width: 0;
    flex-direction: row;
    align-items: stretch;
    gap: 0.35rem;
}

.campo label {
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;

}

.campo input,
.campo select {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid #d1d5db;
    border-radius: 15px;
    box-sizing: border-box;
    background: #fff;
    color: #000;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid rgba(5, 117, 89, 0.25);
    border-color: #057559;
}

/* O aviso do teléfono colócase fóra do fluxo para que o campo
   non cambie de tamaño nin de posición ao recibir o foco. */
.input-wrap {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
}

.error-inline {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.15rem;
    color: #dc2626;
    font-size: 0.8rem;
    line-height: 1.2;
    white-space: nowrap;
    pointer-events: none;
}

.fila > button:not(.btn-guardar) {
    min-height: 2.5rem;
    align-self: flex-end;
}

.btn-guardar {
    background-color: #17b473;
    color: white;
    border: 3px solid #17b473;
    border-image: blue;
    /* Define los dos colores y el ángulo */
    padding: 20px;
    padding: 0.4rem 1.5rem;
    border-radius: 0px;
    cursor: pointer;
    margin: 0 auto;
    display: block;
}

.btn-guardar:hover {
    background-color: #637a76;
    border-radius: 0px;
}

.btn-guardar:disabled {
    background-color: #e0e0e0;
    color: #999;
    border-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7
}

.btn-guardar:disabled:hover {
    background-color: #e0e0e0;
}

.button {
    background: none;
    border: 2px solid #ddd;
    cursor: pointer;
    font-size: 1rem;
}

.inline-control {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding-right: 5rem;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
    border: 1px solid #ddd;
}

/* O wrapper ocupa todo o ancho da sección e permíte scroll horizontal
   en pantallas pequenas sen romper o ancho da táboa. */
.taboa-wrapper {
    width: 100%;
    margin-top: 1rem;
    overflow-x: auto;
}

th,
td {
    border: 1px solid #ddd;
    padding: 0.7rem;
    text-align: left;
    white-space: nowrap;
}

th {
    text-align: center;
    background-color: #f8f9fa;
}

h4 {
    width: 100%;
    text-align: center;
    margin-bottom: 1rem;
    font-weight: 600;
    background-color: #17b473;
    color: white;
}

@media (max-width: 768px) {
    .xestion-doctor {
        padding: 1rem;
    }

    .fila {
        flex-direction: column;
        gap: 0.5rem;
        align-items: stretch;
    }

    .campo,
    .fila > button:not(.btn-guardar) {
        width: 100%;
    }
}
</style>