/* ==========================================================
   login.js - Iniciar sesión
   Valida el DNI y la contraseña contra la cuenta guardada por
   registrar.js en localStorage ("usuario").
   Máximo 3 intentos: después el formulario se bloquea 30 segundos.
   ========================================================== */

// [l] CONSTANTES
const MAX_INTENTOS = 3;
const SEGUNDOS_BLOQUEO = 30;
const LARGO_MINIMO_PASSWORD = 6;

// [l] VARIABLES
let intentosFallidos = 0;


/* ---------- Iniciar sesión ---------- */

function iniciarSesion(evento) {
    evento.preventDefault();

    let dni = document.getElementById("dni").value.trim();
    let password = document.getElementById("password").value;
    let recordar = document.getElementById("recordarme").checked;

    // [m] IF - ELSE IF: primero lo que falta, después el formato
    if (dni === "" || password === "") {
        mostrarMensaje("Completa tu DNI y tu contraseña.");
        return;
    } else if (!validarDNI(dni)) {
        mostrarMensaje("El DNI debe tener 8 dígitos.");
        return;
    }

    let cuenta = obtenerCuentaRegistrada();

    // [m] IF - ELSE ANIDADO
    if (cuenta === null) {
        // [m] CONFIRM
        let crear = confirm("Todavía no hay ninguna cuenta registrada. ¿Deseas crear una?");
        if (crear) {
            window.location.href = "registrar.html";
        }
    } else {
        // [l] OPERADORES LÓGICOS: los dos datos tienen que coincidir
        if (dni === String(cuenta.dni) && password === cuenta.password) {
            entrar(cuenta, recordar);
        } else {
            registrarIntentoFallido();
        }
    }
}

function entrar(cuenta, recordar) {
    cuenta.sesionActiva = true;
    cuenta.recordarDni = recordar;
    guardarDatos("usuario", cuenta);
    intentosFallidos = 0;
    mostrarMensaje("");

    let primerNombre = cuenta.nombre.split(" ")[0];
    // [o] VENTANA FLOTANTE
    abrirVentana("¡Bienvenido, " + primerNombre + "!", "Iniciaste sesión correctamente.", function () {
        window.location.href = "index.html";
    });
}

function registrarIntentoFallido() {
    // [l] OPERADORES ARITMÉTICOS: incremento y resta
    intentosFallidos++;
    let restantes = MAX_INTENTOS - intentosFallidos;

    if (restantes > 0) {
        mostrarMensaje("DNI o contraseña incorrectos. Te quedan " + restantes + " intento(s).");
        document.getElementById("password").value = "";
    } else {
        bloquearFormulario();
    }
}


/* ---------- Bloqueo por intentos ---------- */

function bloquearFormulario() {
    let campos = [document.getElementById("dni"), document.getElementById("password"), document.getElementById("boton-login")];

    // [n] ATRIBUTOS: setAttribute deshabilita los campos
    campos.forEach(function (campo) {
        campo.setAttribute("disabled", "");
    });

    let segundos = SEGUNDOS_BLOQUEO;
    let boton = document.getElementById("boton-login");
    boton.textContent = "Espera " + segundos + " s";
    mostrarMensaje("Superaste los " + MAX_INTENTOS + " intentos. El formulario se bloqueó por " + SEGUNDOS_BLOQUEO + " segundos.");

    let reloj = setInterval(function () {
        segundos--;
        boton.textContent = "Espera " + segundos + " s";
        if (segundos <= 0) {
            clearInterval(reloj);
            // [n] ATRIBUTOS: removeAttribute los vuelve a habilitar
            campos.forEach(function (campo) {
                campo.removeAttribute("disabled");
            });
            boton.textContent = "Iniciar sesión";
            intentosFallidos = 0;
            mostrarMensaje("");
        }
    }, 1000);
}


/* ---------- ¿Olvidaste tu contraseña? ---------- */

function recuperarPassword(evento) {
    evento.preventDefault();

    let cuenta = obtenerCuentaRegistrada();
    if (cuenta === null) {
        alert("No hay ninguna cuenta registrada.");
        return;
    }

    // [m] PROMPT + WHILE: se vuelve a pedir hasta que el DNI tenga 8 dígitos
    let dni = prompt("Ingresa el DNI de tu cuenta:");
    while (dni !== null && !validarDNI(dni.trim())) {
        dni = prompt("El DNI debe tener 8 dígitos. Inténtalo de nuevo:");
    }
    if (dni === null) {
        return;                                    // el usuario canceló
    }

    if (dni.trim() !== String(cuenta.dni)) {
        alert("Ese DNI no corresponde a ninguna cuenta.");
        return;
    }

    let nueva = prompt("Escribe tu nueva contraseña (mínimo " + LARGO_MINIMO_PASSWORD + " caracteres):");
    while (nueva !== null && nueva.length < LARGO_MINIMO_PASSWORD) {
        nueva = prompt("Muy corta. Mínimo " + LARGO_MINIMO_PASSWORD + " caracteres:");
    }
    if (nueva === null) {
        return;
    }

    cuenta.password = nueva;
    guardarDatos("usuario", cuenta);
    // [m] ALERT
    alert("Tu contraseña se cambió. Ya puedes iniciar sesión.");
}


/* ---------- Ayudas de la pantalla ---------- */

function mostrarMensaje(texto) {
    document.getElementById("mensaje-login").textContent = texto;
}

function alternarPassword() {
    let campo = document.getElementById("password");
    let boton = document.getElementById("ver-password");
    // [n] ATRIBUTOS: getAttribute / setAttribute cambian el tipo del campo
    if (campo.getAttribute("type") === "password") {
        campo.setAttribute("type", "text");
        boton.textContent = "Ocultar";
    } else {
        campo.setAttribute("type", "password");
        boton.textContent = "Mostrar";
    }
}

function soloNumeros() {
    let campo = document.getElementById("dni");
    // Quita todo lo que no sea número mientras se escribe
    campo.value = campo.value.replace(/[^0-9]/g, "");
}


/* ---------- Inicio ---------- */

function iniciarLogin() {
    let cuenta = obtenerCuentaRegistrada();

    // Si marcó "Recordarme", el DNI aparece escrito
    if (cuenta !== null && cuenta.recordarDni === true) {
        document.getElementById("dni").value = cuenta.dni;
        document.getElementById("recordarme").checked = true;
    }

    // Si ya tiene la sesión abierta, se le avisa
    if (obtenerUsuario() !== null) {
        mostrarMensaje("Ya tienes una sesión abierta como " + cuenta.nombre + ".");
    }

    document.getElementById("form-login").onsubmit = iniciarSesion;
    document.getElementById("olvide-password").onclick = recuperarPassword;
    document.getElementById("ver-password").onclick = alternarPassword;
    document.getElementById("dni").oninput = soloNumeros;
}

iniciarLogin();
