import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Xeración dos PDF das listaxes. Todo o formato vive aquí para que
// os tres compoñentes saquen documentos iguais.

// Verde da marca da app (#17b473)
const VERDE = [23, 180, 115]
const GRIS = [100, 100, 100]
const MARCA = 'XestiónApp'

function dataDeHoxe() {
  return new Date().toLocaleDateString('gl-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// dd/mm/aaaa a partir dunha data ISO ou dun obxecto Date
function formatarData(data) {
  if (!data) {
    return ''
  }

  const [ano, mes, dia] = String(data).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// crea o documento, pinta a cabeceira, a táboa e o número de páxina
function construirPdf({ titulo, cabeceiras, filas, nomeArquivo }) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const ancho = doc.internal.pageSize.getWidth()

  doc.setFontSize(16)
  doc.setTextColor(...VERDE)
  doc.text(MARCA, 14, 16)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(titulo, 14, 24)

  doc.setFontSize(9)
  doc.setTextColor(...GRIS)
  doc.text(`Xerado o ${dataDeHoxe()}`, ancho - 14, 16, { align: 'right' })
  doc.text(`${filas.length} rexistro(s)`, ancho - 14, 24, { align: 'right' })

  autoTable(doc, {
    startY: 30,
    head: [cabeceiras],
    body: filas,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: VERDE, textColor: 255, halign: 'center' },
    alternateRowStyles: { fillColor: [240, 250, 244] },
    didDrawPage: () => {
      const alto = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(...GRIS)
      doc.text(
        `Páxina ${doc.getCurrentPageInfo().pageNumber}`,
        ancho - 14,
        alto - 8,
        { align: 'right' }
      )
    }
  })

  doc.save(nomeArquivo)
}

// coledoc garda "Si"/"Non"; os datos antigos gardaban unha data
function colexiadoDe(doctor) {
  const valor = String(doctor.coledoc ?? '').trim()
  if (valor === 'Non') return 'Non'
  return valor ? 'Si' : ''
}

export function exportarPacientes(pacientes) {
  construirPdf({
    titulo: 'Listaxe de pacientes',
    cabeceiras: ['DNI/CIF', 'Nome', 'Apelidos', 'Correo', 'Móbil', 'Dirección', 'Provincia', 'Municipio'],
    filas: pacientes.map((paciente) => [
      paciente.dnipac ?? '',
      paciente.nomepac ?? '',
      paciente.apelpac ?? '',
      paciente.mailpac ?? '',
      paciente.movilpac ?? '',
      paciente.dirpac ?? '',
      paciente.propac ?? '',
      paciente.munipac ?? ''
    ]),
    nomeArquivo: 'pacientes.pdf'
  })
}

export function exportarDoctores(doctores) {
  construirPdf({
    titulo: 'Listaxe de doutores',
    cabeceiras: ['ID', 'Nome', 'Apelidos', 'Colexiado', 'Móbil', 'Correo', 'Especialidade'],
    filas: doctores.map((doctor) => [
      doctor.iddoc ?? '',
      doctor.nomedoc ?? '',
      doctor.apeldoc ?? '',
      colexiadoDe(doctor),
      doctor.movildoc ?? '',
      doctor.maildoc ?? '',
      doctor.espedoc ?? ''
    ]),
    nomeArquivo: 'doutores.pdf'
  })
}

// Rexistro do PDF coas mesmas columnas que amosa o listaxe da pantalla
export function exportarCitas(citas) {
  construirPdf({
    titulo: 'Listaxe de citas',
    cabeceiras: ['ID cita', 'Data', 'Hora', 'Motivo', 'Estado'],
    filas: citas.map((cita) => [
      cita.idcita ?? cita._id ?? '',
      formatarData(cita.fecha),
      cita.hora ?? '',
      cita.motivo ?? '',
      cita.estado ?? ''
    ]),
    nomeArquivo: 'citas.pdf'
  })
}
