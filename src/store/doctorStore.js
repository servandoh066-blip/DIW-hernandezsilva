// Importamos defineStore de Pinia para crear un almacén de datos (store)
import { defineStore } from 'pinia'

// Creamos el store de doctor
// 'doctor' es el identificador único de este store.
export const usedoctorStore = defineStore('doctor', {
  // STATE: datos que queremos compartir entre componentes
  state: () => ({
    id: null,
    nombre: null,
    apellido: null,
    especialidad: null,
  }),

  actions: {
    // Recibe un obxecto doctor e garda os seus datos no store
    seleccionarDoctor(doctor) {
      this.id = doctor._id ?? doctor.iddoc ?? null
      this.nombre = doctor.nomedoc ?? null
      this.apellido = doctor.apeldoc ?? null
      this.especialidad = doctor.espedoc ?? null
    },

    limpiarDoctor() {
      this.id = null
      this.nombre = null
      this.apellido = null
      this.especialidad = null
    },
  },
})
