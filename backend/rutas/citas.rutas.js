import express from "express";
import mongoose from "mongoose";
import Cita from "../modelos/Cita.js";
import Paciente from "../modelos/Paciente.js";
import Doctor from "../modelos/Doctor.js";

const router = express.Router();

// Campos que interesan ao frontend para amosar cada referencia
const camposPaciente = "dnipac nomepac apelpac";
const camposDoutor = "iddoc nomedoc apeldoc espedoc";

// Lista blanca de propiedades que se aceptan al crear o editar una cita.
// Descarta campos no admitidos para evitar guardar propiedades arbitrarias.
const camposCita = [
    "idcita",
    "pacienteId",
    "doctorId",
    "fecha",
    "hora",
    "motivo",
    "observacions",
    "estado"
];

function datosPermitidos(body) {
    const recibidos = body ?? {};
    return Object.fromEntries(
        camposCita
            .filter((campo) => recibidos[campo] !== undefined)
            .map((campo) => [campo, recibidos[campo]])
    );
}

// Devolve a consulta co paciente e o doutor xa resoltos (e non só os _id)
function conReferencias(consulta) {
    return consulta
        .populate("pacienteId", camposPaciente)
        .populate("doctorId", camposDoutor);
}

// Escape de caracteres especiais para usalo dentro dun regex
function escapeRegex(texto) {
    return String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Busca un paciente por DNI sen importar maiúsculas/minúsculas
async function buscarPacientePorDNI(dni) {
    const texto = String(dni ?? "").trim();
    if (!texto) return null;

    if (mongoose.isValidObjectId(texto)) {
        const porId = await Paciente.findById(texto);
        if (porId) return porId;
    }

    return Paciente.findOne({
        dnipac: { $regex: `^${escapeRegex(texto)}$`, $options: "i" },
    });
}

// Busca un doctor polo seu _id ou polo seu iddoc
async function buscarDoctor(valor) {
    const texto = String(valor ?? "").trim();
    if (!texto) return null;

    if (mongoose.isValidObjectId(texto)) {
        const porId = await Doctor.findById(texto);
        if (porId) return porId;
    }

    return Doctor.findOne({ iddoc: texto });
}

// O formulario manda o DNI do paciente (ou o seu _id); a cita garda o _id
async function resolverPacienteId(valor) {
    const paciente = await buscarPacientePorDNI(valor);

    if (!paciente) {
        const erro = new Error("El paciente seleccionado no existe");
        erro.status = 400;
        throw erro;
    }

    return paciente._id;
}

// O formulario manda o ID do doctor (iddoc) ou o seu _id; a cita garda o _id
async function resolverDoctorId(valor) {
    const doctor = await buscarDoctor(valor);

    if (!doctor) {
        const erro = new Error("El doctor seleccionado no existe");
        erro.status = 400;
        throw erro;
    }

    return doctor._id;
}

// Convierte el error en respuesta:400 para validación, 500 para el resto.
function responderErro(res, error, porDefecto) {
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ message: error.message });
    }

    console.error(porDefecto, error);
    res.status(500).json({ message: porDefecto });
}

// GET /api/citas: filtra por DNI de paciente e id/_id de doctor, e ordena.
router.get("/", async (req, res) => {
    try {
        const filtros = {};

        // Filtro por paciente: resólvese o DNI a _id; sen coincidencias devólvese baleiro.
        if (req.query.pacienteDNI) {
            const paciente = await buscarPacientePorDNI(req.query.pacienteDNI);
            filtros.pacienteId = paciente ? paciente._id : null;
        }

        // Filtro por doctor: acepta _id ou iddoc; id inexistente devolve baleiro.
        if (req.query.doctorId) {
            const doctor = await buscarDoctor(req.query.doctorId);
            filtros.doctorId = doctor ? doctor._id : null;
        }

        const citas = await conReferencias(
            Cita.find(filtros).sort({ fecha: 1, hora: 1 }),
        );
        res.json(citas);
    } catch (error) {
        responderErro(res, error, "Error al obtener las citas");
    }
});

// POST /api/citas: valida as referencias e garda a cita nova.
router.post("/", async (req, res) => {
    try {
        const datos = datosPermitidos(req.body);

        // Acepta tanto os nomes do esquema (pacienteId/doctorId) como os do
        // formulario antigo (idpaciente/iddoctor con DNI e iddoc).
        const valorPaciente = datos.pacienteId ?? req.body?.idpaciente;
        const valorDoctor = datos.doctorId ?? req.body?.iddoctor;

        const [pacienteId, doctorId] = await Promise.all([
            resolverPacienteId(valorPaciente),
            resolverDoctorId(valorDoctor),
        ]);

        const datosFinales = { ...datos, pacienteId, doctorId };

        const cita = await Cita.create(datosFinales);
        const citaCompleta = await conReferencias(Cita.findById(cita._id));

        res.status(201).json(citaCompleta);
    } catch (error) {
        responderErro(res, error, "Error al crear la cita");
    }
});

// PUT /api/citas/:id: actualiza os campos permitidos dunha cita existente.
router.put("/:id", async (req, res) => {
    try {
        const datos = datosPermitidos(req.body);

        // Só se resolven as referencias se o corpo as trae
        if (datos.pacienteId !== undefined || req.body?.idpaciente !== undefined) {
            datos.pacienteId = await resolverPacienteId(
                datos.pacienteId ?? req.body.idpaciente,
            );
        }
        if (datos.doctorId !== undefined || req.body?.iddoctor !== undefined) {
            datos.doctorId = await resolverDoctorId(
                datos.doctorId ?? req.body.iddoctor,
            );
        }

        const cita = await conReferencias(
            Cita.findByIdAndUpdate(req.params.id, datos, {
                new: true,
                runValidators: true,
            }),
        );

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        res.json(cita);
    } catch (error) {
        responderErro(res, error, "Error al modificar la cita");
    }
});

// DELETE /api/citas/:id: elimina a cita co identificador de MongoDB.
router.delete("/:id", async (req, res) => {
    try {
        const cita = await Cita.findByIdAndDelete(req.params.id);

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        res.json({ message: "Cita eliminada", id: req.params.id });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "El ID de la cita no es válido" });
        }

        responderErro(res, error, "Error al eliminar la cita");
    }
});

export default router;
