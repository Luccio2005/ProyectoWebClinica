/* ==========================================================
   citas.js - Reserva de citas médicas
   Filtra médicos por especialidad, deja elegir solo horarios
   libres, calcula el precio, avanza la barra de pasos, muestra
   el resumen en vivo y guarda la cita en "citas".
   Aquí va la matriz de horarios (ARREGLO BIDIMENSIONAL).
   Requiere js/comun.js
   ========================================================== */

// [l] ARREGLO UNIDIMENSIONAL (de objetos). La página Médicos usará los mismos nombres.
const medicos = [
    { id: "marisol", nombre: "Dra. Marisol Chávez", especialidad: "cardiologia" },
    { id: "javier", nombre: "Dr. Javier Torres", especialidad: "pediatria" },
    { id: "lucia", nombre: "Dra. Lucía Ramos", especialidad: "dermatologia" },
    { id: "eduardo", nombre: "Dr. Eduardo Salas", especialidad: "traumatologia" }
];

// [l] CONSTANTES
const HORAS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const DESCUENTO_VIRTUAL = 0.20;

// [l] ARREGLO BIDIMENSIONAL: 6 filas (lunes a sábado) x 8 columnas (HORAS).
// true = el consultorio atiende a esa hora; false = no atiende.
// Se lee así: disponibilidad[dia][hora]
const disponibilidad = [
    // 08:00  09:00  10:00  11:00  14:00  15:00  16:00  17:00
    [true,  true,  true,  true,  true,  true,  true,  false],   // lunes
    [true,  true,  true,  false, true,  true,  true,  true ],   // martes
    [true,  true,  false, true,  true,  true,  false, true ],   // miércoles
    [true,  true,  true,  true,  false, true,  true,  true ],   // jueves
    [true,  true,  true,  true,  true,  false, false, false],   // viernes
    [true,  true,  true,  true,  false, false, false, false]    // sábado (solo mañana)
];

let usuario = obtenerUsuario();
let citas = leerDatos("citas", []);


/* ---------- Funciones de apoyo ---------- */

// "2026-11-20" -> Date a las 00:00 HORA LOCAL.
// Ojo: new Date("2026-11-20") (sin hora) se interpreta en UTC y en Perú (UTC-5)
// devolvería el día anterior; con "T00:00:00" se interpreta en hora local.
function fechaLocal(texto) {
    return new Date(texto + "T00:00:00");
}

function formatoFecha(texto) {                     // "2026-11-20" -> "20/11/2026"
    let partes = texto.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function formatoHora(hora) {                       // "14:00" -> "02:00 p. m."
    let h = parseInt(hora.split(":")[0]);
    let minutos = hora.split(":")[1];
    let sufijo = h < 12 ? "a. m." : "p. m.";
    if (h > 12) {
        h = h - 12;
    }
    return String(h).padStart(2, "0") + ":" + minutos + " " + sufijo;
}

function buscarMedico(id) {
    for (let i = 0; i < medicos.length; i++) {
        if (medicos[i].id === id) {
            return medicos[i];
        }
    }
    return null;
}

// ¿Ya hay una cita (no cancelada) con ese médico, fecha y hora?
function estaOcupada(nombreMedico, fecha, hora) {
    for (let i = 0; i < citas.length; i++) {
        let c = citas[i];
        if (c.medico === nombreMedico && c.fecha === fecha && c.hora === hora && c.estado !== "Cancelada") {
            return true;
        }
    }
    return false;
}

function textoSeleccionado(idSelect) {
    let select = document.getElementById(idSelect);
    if (select.value === "") {
        return "";
    }
    return select.options[select.selectedIndex].text;
}

function modalidadElegida() {
    let marcada = document.querySelector("input[name='modalidad']:checked");
    if (marcada === null) {
        return "";
    }
    return marcada.value;
}


/* ---------- Paciente ---------- */

// [m] IF
function cargarPaciente() {
    if (usuario !== null) {
        document.getElementById("pac-nombre").value = usuario.nombre;
        document.getElementById("pac-dni").value = "*****" + String(usuario.dni).slice(-3);
        document.getElementById("pac-correo").value = usuario.correo;
        document.getElementById("pac-celular").value = usuario.celular;
    } else {
        // [m] CONFIRM
        let irLogin = confirm("Debes iniciar sesión para reservar una cita. ¿Ir al login?");
        if (irLogin) {
            window.location.href = "login.html";
        }
    }
}


/* ---------- Especialidad, médico y precio ---------- */

// [m] FOREACH + IF   [n] createElement
function filtrarMedicos() {
    let especialidad = document.getElementById("especialidad").value;
    let selectMedico = document.getElementById("medico");
    selectMedico.innerHTML = "";

    let opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Selecciona un médico";
    selectMedico.appendChild(opcionInicial);

    medicos.forEach(function (m) {
        if (m.especialidad === especialidad) {
            let opcion = document.createElement("option");
            opcion.value = m.id;
            opcion.textContent = m.nombre;
            selectMedico.appendChild(opcion);
        }
    });

    if (especialidad === "") {
        actualizarPaso(1);
    } else {
        actualizarPaso(2);
    }
    llenarHoras();           // el médico cambió, los horarios ocupados también
    actualizarResumen();
}

// [m] SWITCH-CASE   [l] OPERADORES ARITMÉTICOS
function calcularPrecio() {
    let especialidad = document.getElementById("especialidad").value;
    let precio = 0;

    switch (especialidad) {
        case "cardiologia":
            precio = 120;
            break;
        case "pediatria":
            precio = 90;
            break;
        case "dermatologia":
            precio = 100;
            break;
        case "traumatologia":
            precio = 110;
            break;
        default:
            precio = 0;
    }

    if (modalidadElegida() === "virtual") {
        precio = precio - precio * DESCUENTO_VIRTUAL;      // 20% menos
    }
    return precio;
}

// Al elegir médico: pasa al paso 3 y recalcula los horarios
function elegirMedico() {
    let medico = document.getElementById("medico").value;
    if (medico !== "") {
        actualizarPaso(3);
    } else {
        actualizarPaso(2);
    }
    llenarHoras();
    actualizarResumen();
}

// Al elegir modalidad solo cambia el precio
function elegirModalidad() {
    actualizarResumen();
}


/* ---------- Fecha y horas ---------- */

// [m] IF / ELSE IF
function validarFecha() {
    let campoFecha = document.getElementById("fecha");
    if (campoFecha.value === "") {
        llenarHoras();
        actualizarResumen();
        return;
    }

    let elegida = fechaLocal(campoFecha.value);
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (elegida < hoy) {
        alert("No puedes reservar en una fecha pasada.");
        campoFecha.value = "";
    } else if (elegida.getDay() === 0) {
        alert("No atendemos los domingos. Elige otro día.");
        campoFecha.value = "";
    }
    llenarHoras();
    actualizarResumen();
}

// [l] ARREGLO BIDIMENSIONAL   [m] FOR   [n] setAttribute
function llenarHoras() {
    let selectHora = document.getElementById("hora");
    let anterior = selectHora.value;               // para conservar la hora si sigue libre
    selectHora.innerHTML = "";

    let opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Selecciona un horario";
    selectHora.appendChild(opcionInicial);

    let fecha = document.getElementById("fecha").value;
    if (fecha === "") {
        return;                                    // sin fecha no hay horarios
    }

    let dia = fechaLocal(fecha).getDay() - 1;      // lunes = 1, así que la fila es getDay() - 1
    let medico = buscarMedico(document.getElementById("medico").value);

    for (let h = 0; h < HORAS.length; h++) {
        let opcion = document.createElement("option");
        opcion.value = HORAS[h];
        opcion.textContent = formatoHora(HORAS[h]);

        let ocupado = false;
        if (dia < 0 || dia > 5 || disponibilidad[dia][h] === false) {
            ocupado = true;                        // el consultorio no atiende a esa hora
        }
        if (medico !== null && estaOcupada(medico.nombre, fecha, HORAS[h])) {
            ocupado = true;                        // ya hay una cita guardada
        }

        if (ocupado) {
            opcion.setAttribute("disabled", "");
            opcion.textContent += " (ocupado)";
        }
        selectHora.appendChild(opcion);
    }

    // Si la hora que estaba elegida sigue libre, se conserva
    for (let i = 0; i < selectHora.options.length; i++) {
        if (selectHora.options[i].value === anterior && !selectHora.options[i].disabled) {
            selectHora.value = anterior;
        }
    }
}

function elegirHora() {
    if (document.getElementById("hora").value !== "") {
        actualizarPaso(4);
    } else {
        actualizarPaso(3);
    }
    actualizarResumen();
}


/* ---------- Barra de pasos y resumen ---------- */

// [n] PROPIEDADES DE NAVEGACIÓN: firstElementChild / nextElementSibling   [m] WHILE
function actualizarPaso(numero) {
    let contenedor = document.querySelector(".pasos-grid");
    let paso = contenedor.firstElementChild;
    let contador = 1;

    while (paso !== null) {
        paso.classList.remove("paso-activo");
        if (contador === numero) {
            paso.classList.add("paso-activo");
        }
        paso = paso.nextElementSibling;
        contador++;
    }
}

// [n] lastElementChild: el <strong> de cada .resumen-fila
function actualizarResumen() {
    let nombrePaciente = "";
    if (usuario !== null) {
        nombrePaciente = usuario.nombre;
    }

    let modalidad = modalidadElegida();
    let textoModalidad = "";
    if (modalidad === "presencial") {
        textoModalidad = "Presencial";
    } else if (modalidad === "virtual") {
        textoModalidad = "Virtual";
    }

    let fecha = document.getElementById("fecha").value;
    let textoFecha = "";
    if (fecha !== "") {
        textoFecha = formatoFecha(fecha);
    }

    let textoPrecio = "";
    if (document.getElementById("especialidad").value !== "") {
        textoPrecio = formatoSoles(calcularPrecio());
    }

    // Mismo orden que las filas del HTML
    let valores = [
        nombrePaciente,
        textoSeleccionado("especialidad"),
        textoSeleccionado("medico"),
        textoModalidad,
        textoFecha,
        textoSeleccionado("hora"),
        textoPrecio
    ];

    let filas = document.querySelectorAll(".resumen-fila");
    for (let i = 0; i < filas.length; i++) {
        let dato = filas[i].lastElementChild;
        if (valores[i] === "") {
            dato.textContent = "Sin seleccionar";
        } else {
            dato.textContent = valores[i];
        }
    }
}

// [n] DOM y estilos (style.color)
function contarCaracteres() {
    let largo = document.getElementById("motivo").value.length;
    let contador = document.getElementById("contador-motivo");
    contador.textContent = largo + " / 500";
    if (largo > 450) {
        contador.style.color = "crimson";
    } else {
        contador.style.color = "";
    }
}


/* ---------- Reservar ---------- */

// [m] ELSE-IF  [m] CONFIRM  [o] VENTANA FLOTANTE
function reservarCita(evento) {
    evento.preventDefault();

    let especialidad = document.getElementById("especialidad").value;
    let idMedico = document.getElementById("medico").value;
    let modalidad = modalidadElegida();
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;
    let motivo = document.getElementById("motivo").value.trim();
    let confirmado = document.getElementById("confirmar-datos").checked;

    // Se avisa del primer campo que falte
    let mensaje = "";
    if (usuario === null) {
        mensaje = "Debes iniciar sesión para reservar una cita.";
    } else if (especialidad === "") {
        mensaje = "Selecciona una especialidad.";
    } else if (idMedico === "") {
        mensaje = "Selecciona un médico.";
    } else if (modalidad === "") {
        mensaje = "Elige la modalidad de atención.";
    } else if (fecha === "") {
        mensaje = "Selecciona la fecha de atención.";
    } else if (hora === "") {
        mensaje = "Selecciona un horario disponible.";
    } else if (motivo.length < 10) {
        mensaje = "Describe el motivo de tu cita (mínimo 10 caracteres).";
    } else if (!confirmado) {
        mensaje = "Marca la casilla para confirmar que tus datos son correctos.";
    }

    if (mensaje !== "") {
        alert(mensaje);
        return;
    }

    let medico = buscarMedico(idMedico);
    citas = leerDatos("citas", []);                // se relee por si otra pestaña reservó
    if (estaOcupada(medico.nombre, fecha, hora)) {
        alert("Ese horario acaba de ser reservado. Elige otro.");
        llenarHoras();
        return;
    }

    let precio = calcularPrecio();
    let seguro = confirm("¿Confirmas tu cita del " + formatoFecha(fecha) + " a las " + hora + " por " + formatoSoles(precio) + "?");
    if (!seguro) {
        return;
    }

    let cita = {
        codigo: generarCodigo("CT", citas.length + 1, 4),
        paciente: usuario.nombre,
        especialidad: textoSeleccionado("especialidad"),
        medico: medico.nombre,
        modalidad: modalidad === "virtual" ? "Virtual" : "Presencial",
        fecha: fecha,
        hora: hora,
        motivo: motivo,
        precio: precio,
        estado: "Programada"
    };

    citas.push(cita);
    guardarDatos("citas", citas);

    abrirVentana(
        "¡Cita reservada!",
        "Tu cita " + cita.codigo + " con " + cita.medico + " quedó programada para el " + formatoFecha(fecha) + " a las " + hora + ".",
        function () {
            window.location.href = "mis-citas.html";
        }
    );
}


/* ---------- Inicio ---------- */

function iniciarCitas() {
    // No se permiten fechas pasadas en el calendario
    let hoy = new Date();
    let mes = String(hoy.getMonth() + 1).padStart(2, "0");
    let dia = String(hoy.getDate()).padStart(2, "0");
    document.getElementById("fecha").min = hoy.getFullYear() + "-" + mes + "-" + dia;

    cargarPaciente();
    filtrarMedicos();        // deja el select de médicos vacío hasta elegir especialidad
    actualizarPaso(1);
    actualizarResumen();
    contarCaracteres();
}

iniciarCitas();
