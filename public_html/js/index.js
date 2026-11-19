/* ==========================================================
   index.js - Página de inicio
   Saludo según la hora, carrusel del banner y videos en
   pantalla completa.
   ========================================================== */

// [l] CONSTANTES
const SEGUNDOS_CARRUSEL = 6;

// [l] VARIABLES
let temporizadorCarrusel = null;


/* ---------- Saludo según la hora ---------- */

function mostrarSaludo() {
    let hora = new Date().getHours();
    let saludo = "";

    // [m] IF - ELSE IF - ELSE
    if (hora >= 5 && hora < 12) {
        saludo = "Buenos días";
    } else if (hora >= 12 && hora < 19) {
        saludo = "Buenas tardes";
    } else {
        saludo = "Buenas noches";
    }

    let cuenta = obtenerUsuario();
    // [m] IF - ELSE: con sesión se saluda por el nombre
    if (cuenta !== null) {
        saludo = saludo + ", " + cuenta.nombre.split(" ")[0] + ". ¿Qué haremos hoy por tu salud?";
    } else {
        saludo = saludo + ". Bienvenido a Clínica Raíz.";
    }

    document.getElementById("saludo-inicio").textContent = saludo;
}


/* ---------- [n] Carrusel del banner ---------- */

function diapositivaActiva() {
    return document.querySelector("#carrusel .activa");
}

function mostrarDiapositiva(nueva) {
    let actual = diapositivaActiva();
    actual.classList.remove("activa");
    nueva.classList.add("activa");
    marcarPunto();
}

function siguienteDiapositiva() {
    let actual = diapositivaActiva();
    // [n] PROPIEDADES DE NAVEGACIÓN: nextElementSibling; al final vuelve a firstElementChild
    let siguiente = actual.nextElementSibling;
    if (siguiente === null) {
        siguiente = actual.parentElement.firstElementChild;
    }
    mostrarDiapositiva(siguiente);
}

function anteriorDiapositiva() {
    let actual = diapositivaActiva();
    // [n] PROPIEDADES DE NAVEGACIÓN: previousElementSibling; al inicio va a lastElementChild
    let anterior = actual.previousElementSibling;
    if (anterior === null) {
        anterior = actual.parentElement.lastElementChild;
    }
    mostrarDiapositiva(anterior);
}

function crearPuntos() {
    let carrusel = document.getElementById("carrusel");
    let contenedor = document.getElementById("carrusel-puntos");

    // [m] FOR: un punto por cada diapositiva
    for (let i = 0; i < carrusel.children.length; i++) {
        let punto = document.createElement("button");
        punto.type = "button";
        punto.className = "carrusel-punto";
        punto.setAttribute("aria-label", "Ir a la diapositiva " + (i + 1));
        punto.onclick = function () {
            mostrarDiapositiva(carrusel.children[i]);
            reiniciarCarrusel();
        };
        contenedor.appendChild(punto);
    }
    marcarPunto();
}

function marcarPunto() {
    let carrusel = document.getElementById("carrusel");
    let puntos = document.getElementById("carrusel-puntos").children;
    for (let i = 0; i < carrusel.children.length; i++) {
        // [l] OPERADOR LÓGICO dentro de toggle: activo solo si es la diapositiva visible
        puntos[i].classList.toggle("activo", carrusel.children[i].classList.contains("activa"));
    }
}

function reiniciarCarrusel() {
    clearInterval(temporizadorCarrusel);
    temporizadorCarrusel = setInterval(siguienteDiapositiva, SEGUNDOS_CARRUSEL * 1000);
}

function iniciarCarrusel() {
    crearPuntos();
    document.getElementById("carrusel-siguiente").onclick = function () {
        siguienteDiapositiva();
        reiniciarCarrusel();
    };
    document.getElementById("carrusel-anterior").onclick = function () {
        anteriorDiapositiva();
        reiniciarCarrusel();
    };

    // Se detiene mientras el mouse está encima del banner
    let banner = document.querySelector(".hero");
    banner.onmouseenter = function () {
        clearInterval(temporizadorCarrusel);
    };
    banner.onmouseleave = reiniciarCarrusel;

    reiniciarCarrusel();
}


/* ---------- [o] Ventana responsive: video en pantalla completa ---------- */
// Igual que el ejemplo "Fullscreen Video" de la semana 14

function abrirPantallaCompleta(idVideo) {
    let elem = document.getElementById(idVideo);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {      /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {          /* IE11 */
        elem.msRequestFullscreen();
    }
    elem.play();
}


/* ---------- Inicio ---------- */

function iniciarIndex() {
    mostrarSaludo();
    iniciarCarrusel();
}

iniciarIndex();
