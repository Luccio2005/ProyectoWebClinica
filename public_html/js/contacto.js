/* ==========================================================
   contacto.js - Formulario de contacto y horario de atención
   ========================================================== */

// [l] CONSTANTES
const LARGO_MAXIMO_MENSAJE = 500;

// [l] ARREGLO BIDIMENSIONAL: [día, hora de apertura, hora de cierre]
// La fila coincide con getDay(): 0 = domingo ... 6 = sábado. null = cerrado.
const HORARIO = [
    ["Domingo", null, null],
    ["Lunes", 7, 20],
    ["Martes", 7, 20],
    ["Miércoles", 7, 20],
    ["Jueves", 7, 20],
    ["Viernes", 7, 20],
    ["Sábado", 8, 14]
];


/* ---------- Horario: tabla y "abierto / cerrado" ---------- */

function textoHora(hora) {
    return String(hora).padStart(2, "0") + ":00";
}

function mostrarHorario() {
    let cuerpo = document.getElementById("cuerpo-horario");
    let hoy = new Date().getDay();

    // [m] FOR: recorre las filas de la matriz
    for (let i = 0; i < HORARIO.length; i++) {
        let fila = document.createElement("tr");
        let dia = document.createElement("td");
        let horas = document.createElement("td");

        dia.textContent = HORARIO[i][0];
        // [m] IF - ELSE
        if (HORARIO[i][1] === null) {
            horas.textContent = "Cerrado";
        } else {
            horas.textContent = textoHora(HORARIO[i][1]) + " - " + textoHora(HORARIO[i][2]);
        }

        if (i === hoy) {
            fila.className = "fila-hoy";
        }
        fila.appendChild(dia);
        fila.appendChild(horas);
        cuerpo.appendChild(fila);
    }
}

function mostrarEstado() {
    let ahora = new Date();
    let dia = ahora.getDay();
    let hora = ahora.getHours();
    let abre = HORARIO[dia][1];
    let cierra = HORARIO[dia][2];
    let estado = document.getElementById("estado-clinica");

    // [l] OPERADORES LÓGICOS: abierto si hoy atiende Y la hora está dentro del rango
    let abierto = abre !== null && hora >= abre && hora < cierra;

    if (abierto) {
        estado.textContent = "Abierto ahora · cierra a las " + textoHora(cierra);
        estado.className = "estado-clinica abierto";
    } else {
        estado.textContent = "Cerrado en este momento";
        estado.className = "estado-clinica cerrado";
    }
}


/* ---------- Formulario ---------- */

function infoMotivo() {
    let motivo = document.getElementById("contacto-motivo").value;
    let texto = "";

    // [m] SWITCH - CASE: área que responde y tiempo de respuesta
    switch (motivo) {
        case "informacion":
            texto = "Lo responde Atención al paciente en menos de 24 horas.";
            break;
        case "citas":
            texto = "Lo responde Admisión en menos de 12 horas. También puedes reservar en línea.";
            break;
        case "farmacia":
            texto = "Lo responde Farmacia en menos de 12 horas. Ten a mano tu código de pedido.";
            break;
        case "resultados":
            texto = "Lo responde Laboratorio en menos de 48 horas.";
            break;
        case "sugerencia":
            texto = "Gracias por ayudarnos a mejorar. Lo revisa Calidad en menos de 72 horas.";
            break;
        case "otro":
            texto = "Lo revisamos y lo derivamos al área correcta en menos de 48 horas.";
            break;
        default:
            texto = "";
    }
    document.getElementById("info-motivo").textContent = texto;
}

function contarCaracteresContacto() {
    let mensaje = document.getElementById("contacto-mensaje").value;
    let contador = document.getElementById("contador-contacto");
    contador.textContent = mensaje.length + " / " + LARGO_MAXIMO_MENSAJE;
    // [n] DOM: cambia el color cuando falta poco
    if (mensaje.length > LARGO_MAXIMO_MENSAJE - 50) {
        contador.style.color = "crimson";
    } else {
        contador.style.color = "";
    }
}

function validarContacto() {
    let nombre = document.getElementById("contacto-nombre").value.trim();
    let correo = document.getElementById("contacto-correo").value.trim();
    let celular = document.getElementById("contacto-celular").value.trim();
    let motivo = document.getElementById("contacto-motivo").value;
    let mensaje = document.getElementById("contacto-mensaje").value.trim();
    let acepto = document.getElementById("contacto-acepto").checked;

    // [m] IF - ELSE IF: se avisa el primer error que encuentre
    if (nombre.length < 3) {
        return "Escribe tu nombre completo.";
    } else if (!validarCorreo(correo)) {
        return "Escribe un correo válido.";
    } else if (celular !== "" && !validarCelular(celular)) {
        return "El celular debe tener 9 dígitos y empezar con 9.";
    } else if (motivo === "") {
        return "Elige el motivo de tu mensaje.";
    } else if (mensaje.length < 10) {
        return "Tu mensaje debe tener al menos 10 caracteres.";
    } else if (!acepto) {
        return "Debes aceptar el uso de tus datos para que podamos responderte.";
    }
    return "";
}

function enviarContacto(evento) {
    evento.preventDefault();

    let error = validarContacto();
    if (error !== "") {
        // [m] ALERT
        alert(error);
        return;
    }

    // Número de seguimiento: últimos 4 dígitos de la hora actual en milisegundos
    let numero = generarCodigo("MSG", Date.now() % 10000, 4);
    let nombre = document.getElementById("contacto-nombre").value.trim().split(" ")[0];

    // [o] VENTANA FLOTANTE
    abrirVentana("¡Mensaje enviado!", "Gracias, " + nombre + ". Tu número de seguimiento es " + numero + ".");

    document.getElementById("form-contacto").reset();
    llenarDatosContacto();
    infoMotivo();
    contarCaracteresContacto();
}

function llenarDatosContacto() {
    let cuenta = obtenerUsuario();
    // Si hay sesión, el formulario aparece con sus datos
    if (cuenta !== null) {
        document.getElementById("contacto-nombre").value = cuenta.nombre;
        document.getElementById("contacto-correo").value = cuenta.correo;
        document.getElementById("contacto-celular").value = cuenta.celular;
    }
}


/* ---------- Inicio ---------- */

function iniciarContacto() {
    mostrarHorario();
    mostrarEstado();
    llenarDatosContacto();

    document.getElementById("form-contacto").onsubmit = enviarContacto;
    document.getElementById("contacto-motivo").onchange = infoMotivo;
    document.getElementById("contacto-mensaje").oninput = contarCaracteresContacto;
}

iniciarContacto();
