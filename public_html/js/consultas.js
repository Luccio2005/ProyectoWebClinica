/* ==========================================================
   consultas.js - Consulta de salud
   Al enviar una consulta entra a una COLA de atención
   ("tu turno es el #4, hay 3 antes que tú"). El triaje revisa
   los síntomas y avisa si parecen urgentes. Las tarjetas de
   "Mis consultas" se generan desde un arreglo.
   Por el acuerdo de las 4 claves, las consultas NO se guardan
   en localStorage: al recargar vuelven las de ejemplo.
   Requiere js/comun.js
   ========================================================== */

// [l] ARREGLO UNIDIMENSIONAL (de objetos): las 2 consultas de ejemplo
let historial = [
    {
        numero: 1,
        tipo: "medicamentos",
        asunto: "Consulta sobre medicamentos",
        descripcion: "Quisiera saber si debo continuar tomando el medicamento indicado durante los próximos días.",
        estado: "Respondida",
        respuesta: "Gracias por comunicarse con nosotros. Para brindarle una orientación adecuada sobre su tratamiento, recomendamos revisar las indicaciones proporcionadas durante su última atención médica.",
        fecha: "10/09/2026",
        prioridad: "Baja"
    },
    {
        numero: 2,
        tipo: "resultados",
        asunto: "Consulta sobre resultados",
        descripcion: "Deseo consultar sobre los resultados obtenidos en mi última evaluación.",
        estado: "En revisión",
        respuesta: "",
        fecha: "11/09/2026",
        prioridad: "Baja"
    }
];

// [l] COLA (FIFO): gente que ya espera. cola.push() encola, cola.shift() atiende al primero.
let cola = ["Paciente 101", "Paciente 102", "Paciente 103"];

// Palabras clave del triaje (sin tildes, porque el texto se normaliza antes de comparar)
const PALABRAS_URGENTES = ["dolor de pecho", "sangrado", "dificultad para respirar", "desmayo"];
const PALABRAS_MODERADAS = ["fiebre", "vomito", "dolor"];

const PREFIJO_MIS_CONSULTAS = "Mi consulta #";


/* ---------- Funciones de apoyo ---------- */

// Minúsculas y sin tildes: "Vómito" -> "vomito"
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatoNumeroConsulta(numero) {
    return "CONSULTA #" + String(numero).padStart(3, "0");
}

function buscarConsultaPorNumero(numero) {
    for (let i = 0; i < historial.length; i++) {
        if (historial[i].numero === numero) {
            return historial[i];
        }
    }
    return null;
}

// [m] SWITCH-CASE: horas estimadas de respuesta según el tipo
function tiempoRespuesta(tipo) {
    switch (tipo) {
        case "orientacion":
            return 24;
        case "medicamentos":
            return 12;
        case "resultados":
            return 48;
        case "tratamiento":
            return 24;
        case "seguimiento":
            return 24;
        default:
            return 72;                             // "otro"
    }
}

// [m] FOR + ELSE-IF ANIDADO: triaje por palabras clave
function calcularPrioridad(texto) {
    let limpio = normalizarTexto(texto);
    let hayUrgente = false;
    let hayModerada = false;

    for (let i = 0; i < PALABRAS_URGENTES.length; i++) {
        if (limpio.includes(PALABRAS_URGENTES[i])) {
            hayUrgente = true;
        }
    }
    for (let j = 0; j < PALABRAS_MODERADAS.length; j++) {
        if (limpio.includes(PALABRAS_MODERADAS[j])) {
            hayModerada = true;
        }
    }

    if (hayUrgente) {
        return "Alta";
    } else if (hayModerada) {
        return "Media";
    } else {
        return "Baja";
    }
}


/* ---------- Mostrar consultas ---------- */

// [m] FOREACH   [n] DOM: createElement / appendChild
function mostrarConsultas() {
    let contenedor = document.getElementById("lista-consultas");
    contenedor.innerHTML = "";

    // Las más recientes primero (se invierte una copia, el historial no cambia)
    let recientes = historial.slice().reverse();

    recientes.forEach(function (c) {
        let respondida = c.estado === "Respondida";

        let tarjeta = document.createElement("article");
        tarjeta.id = "consulta-" + c.numero;
        tarjeta.className = "tarjeta-consulta " + (respondida ? "respondida" : "pendiente");

        // Cabecera: número + asunto, y la etiqueta de estado
        let cabecera = document.createElement("div");
        cabecera.className = "cabecera-tarjeta";
        let izquierda = document.createElement("div");
        let numero = document.createElement("span");
        numero.className = "numero-consulta";
        numero.textContent = formatoNumeroConsulta(c.numero);
        let titulo = document.createElement("h3");
        titulo.textContent = c.asunto;
        izquierda.appendChild(numero);
        izquierda.appendChild(titulo);
        let etiquetaEstado = document.createElement("span");
        etiquetaEstado.className = "estado " + (respondida ? "respondida" : "pendiente");
        etiquetaEstado.textContent = c.estado;
        cabecera.appendChild(izquierda);
        cabecera.appendChild(etiquetaEstado);

        let fecha = document.createElement("p");
        fecha.className = "fecha-consulta";
        fecha.textContent = "Enviada el " + c.fecha;

        let mensaje = document.createElement("div");
        mensaje.className = "mensaje-paciente";
        let mensajeTitulo = document.createElement("strong");
        mensajeTitulo.textContent = "Mi consulta";
        let mensajeTexto = document.createElement("p");
        mensajeTexto.textContent = c.descripcion;
        mensaje.appendChild(mensajeTitulo);
        mensaje.appendChild(mensajeTexto);

        tarjeta.appendChild(cabecera);
        tarjeta.appendChild(fecha);
        tarjeta.appendChild(mensaje);

        if (respondida) {
            let respuesta = document.createElement("div");
            respuesta.className = "respuesta-profesional";
            let respuestaTitulo = document.createElement("strong");
            respuestaTitulo.textContent = "Respuesta del personal de salud";
            let respuestaTexto = document.createElement("p");
            respuestaTexto.textContent = c.respuesta;
            let profesional = document.createElement("span");
            profesional.className = "profesional";
            profesional.textContent = "Personal de salud · Hospital Raíz";
            respuesta.appendChild(respuestaTitulo);
            respuesta.appendChild(respuestaTexto);
            respuesta.appendChild(profesional);
            tarjeta.appendChild(respuesta);
        } else {
            let espera = document.createElement("div");
            espera.className = "mensaje-espera";
            let icono = document.createElement("span");
            icono.className = "icono-espera";
            icono.textContent = "⏳";
            let textos = document.createElement("div");
            let esperaTitulo = document.createElement("strong");
            esperaTitulo.textContent = "Consulta en revisión";
            let esperaTexto = document.createElement("p");
            esperaTexto.textContent = "El personal de salud revisará tu consulta y responderá cuando esté disponible. Tiempo estimado: " + tiempoRespuesta(c.tipo) + " h.";
            textos.appendChild(esperaTitulo);
            textos.appendChild(esperaTexto);
            espera.appendChild(icono);
            espera.appendChild(textos);
            tarjeta.appendChild(espera);
        }

        // "Ver detalle" abre una ventana flotante con los datos completos
        let enlace = document.createElement("a");
        enlace.href = "#";
        enlace.className = "ver-consulta";
        enlace.textContent = "Ver detalle →";
        enlace.onclick = function (evento) {
            evento.preventDefault();
            let detalle = c.descripcion + " | Prioridad: " + c.prioridad + " | Estado: " + c.estado;
            if (c.archivo) {
                detalle += " | Archivo: " + c.archivo;
            }
            abrirVentana(formatoNumeroConsulta(c.numero) + " - " + c.asunto, detalle);
        };
        tarjeta.appendChild(enlace);

        contenedor.appendChild(tarjeta);
    });
}


/* ---------- Turno en la cola ---------- */

// Busca en la cola la primera consulta del paciente y escribe su turno en #turno-actual
function actualizarTurno() {
    let caja = document.getElementById("turno-actual");
    let posicion = -1;

    for (let i = 0; i < cola.length; i++) {
        if (posicion === -1 && cola[i].indexOf(PREFIJO_MIS_CONSULTAS) === 0) {
            posicion = i;
        }
    }

    if (posicion === -1) {
        caja.textContent = "No tienes consultas en la cola de atención. Hay " + cola.length + " paciente(s) esperando.";
        return;
    }

    let numero = parseInt(cola[posicion].replace(PREFIJO_MIS_CONSULTAS, ""));
    let consulta = buscarConsultaPorNumero(numero);
    caja.textContent = "Tu consulta #" + numero + " está en el turno #" + (posicion + 1) +
        ": hay " + posicion + " antes que tú. Tiempo estimado de respuesta: " + tiempoRespuesta(consulta.tipo) + " horas.";
}


/* ---------- Enviar consulta ---------- */

// [m] IF / ELSE IF   [l] OPERADORES LÓGICOS
function validarConsulta() {
    let tipo = document.getElementById("tipo-consulta").value;
    let asunto = document.getElementById("asunto").value.trim();
    let descripcion = document.getElementById("descripcion").value.trim();
    let confirmado = document.getElementById("confirmacion").checked;
    let archivo = document.getElementById("archivo");

    let mensaje = "";
    if (tipo === "") {
        mensaje = "Selecciona el tipo de consulta.";
    } else if (asunto.length < 5) {
        mensaje = "El asunto debe tener al menos 5 letras.";
    } else if (descripcion.length < 20) {
        mensaje = "Describe tu consulta con al menos 20 letras.";
    } else if (!confirmado) {
        mensaje = "Marca la casilla para confirmar que la información es correcta.";
    } else if (archivo.files.length > 0) {
        let nombre = archivo.files[0].name.toLowerCase();
        let extensionValida = nombre.endsWith(".jpg") || nombre.endsWith(".jpeg") ||
            nombre.endsWith(".png") || nombre.endsWith(".pdf");
        if (!extensionValida) {
            mensaje = "El archivo debe ser jpg, png o pdf.";
        } else if (archivo.files[0].size > 2 * 1024 * 1024) {
            mensaje = "El archivo debe pesar menos de 2 MB.";
        }
    }

    if (mensaje !== "") {
        alert(mensaje);
        return false;
    }
    return true;
}

// [m] CONFIRM   [l] COLAS (push)   [o] VENTANA FLOTANTE
function enviarConsulta(evento) {
    evento.preventDefault();
    if (!validarConsulta()) {
        return;
    }

    let tipo = document.getElementById("tipo-consulta").value;
    let asunto = document.getElementById("asunto").value.trim();
    let descripcion = document.getElementById("descripcion").value.trim();
    let archivo = document.getElementById("archivo");

    let prioridad = calcularPrioridad(asunto + " " + descripcion);
    if (prioridad === "Alta") {
        let seguir = confirm("Tus síntomas podrían ser urgentes. Si es una emergencia, acude a la clínica. ¿Enviar igual?");
        if (!seguir) {
            return;
        }
    }

    let consulta = {
        numero: historial.length + 1,
        tipo: tipo,
        asunto: asunto,
        descripcion: descripcion,
        estado: "En revisión",
        respuesta: "",
        fecha: fechaHoy(),
        prioridad: prioridad
    };
    if (archivo.files.length > 0) {
        consulta.archivo = archivo.files[0].name;
    }

    historial.push(consulta);
    cola.push(PREFIJO_MIS_CONSULTAS + consulta.numero);      // entra al final de la cola

    mostrarConsultas();
    actualizarTurno();
    document.getElementById("form-consulta").reset();
    contarCaracteres();

    abrirVentana(
        "Consulta enviada",
        "Tu consulta #" + consulta.numero + " entró a la cola de atención en el turno #" + cola.length +
        " (hay " + (cola.length - 1) + " antes que tú). Prioridad: " + prioridad + "."
    );
}


/* ---------- Simular respuesta (para la demo) ---------- */

// [l] COLAS (shift = FIFO)
function simularRespuesta() {
    if (cola.length === 0) {
        alert("No hay nadie en la cola de atención.");
        return;
    }

    let atendido = cola.shift();                   // sale el primero de la cola
    let mensaje = "El personal atendió a: " + atendido + ".";

    // ¿Era una consulta del paciente?
    if (atendido.indexOf(PREFIJO_MIS_CONSULTAS) === 0) {
        let numero = parseInt(atendido.replace(PREFIJO_MIS_CONSULTAS, ""));
        let consulta = buscarConsultaPorNumero(numero);
        if (consulta !== null) {
            consulta.estado = "Respondida";
            consulta.respuesta = "Gracias por escribirnos. Hemos revisado tu consulta y te recomendamos seguir las indicaciones de tu última atención. Si los síntomas continúan o empeoran, reserva una cita con nuestro personal médico.";
            mensaje += " ¡Tu consulta #" + numero + " ya tiene respuesta!";
        }
    }

    mostrarConsultas();
    actualizarTurno();
    abrirVentana("Cola de atención", mensaje + " Quedan " + cola.length + " en espera.");
}


/* ---------- Buscar por número ---------- */

// [m] PROMPT + WHILE
function buscarConsulta() {
    let entrada = prompt("Número de consulta");
    if (entrada === null) {
        return;                                    // canceló
    }
    let numero = parseInt(entrada);

    while (isNaN(numero)) {                        // mientras no sea un número válido, se vuelve a pedir
        entrada = prompt("Escribe solo números. Número de consulta:");
        if (entrada === null) {
            return;
        }
        numero = parseInt(entrada);
    }

    let consulta = buscarConsultaPorNumero(numero);
    if (consulta === null) {
        alert("No existe la consulta #" + numero + ".");
        return;
    }

    // Se quita el resaltado anterior y se resalta la encontrada
    let anteriores = document.querySelectorAll(".tarjeta-consulta.resaltada");
    for (let i = 0; i < anteriores.length; i++) {
        anteriores[i].classList.remove("resaltada");
    }
    let tarjeta = document.getElementById("consulta-" + numero);
    tarjeta.classList.add("resaltada");
    tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
}


/* ---------- Contador de caracteres ---------- */

// [n] DOM
function contarCaracteres() {
    let largo = document.getElementById("descripcion").value.length;
    document.getElementById("contador-descripcion").textContent = largo + " / 1000";
}


/* ---------- Inicio ---------- */

function iniciarConsultas() {
    mostrarConsultas();
    actualizarTurno();
    contarCaracteres();
}

iniciarConsultas();
