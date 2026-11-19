/* ==========================================================
   preguntas-frecuentes.js - Acordeón de preguntas
   Las preguntas están escritas en el HTML; el JS las recorre
   con las propiedades de navegación del DOM.
   ========================================================== */

// [l] VARIABLES
let categoriaFaq = "todas";
let votosUtiles = 0;
let votosNoUtiles = 0;


/* ---------- [n] Acordeón con propiedades de navegación ---------- */

function alternarPregunta(boton) {
    // La respuesta es el elemento que sigue al botón
    let respuesta = boton.nextElementSibling;
    let abierta = boton.classList.contains("abierta");

    // [m] IF - ELSE
    if (abierta) {
        boton.classList.remove("abierta");
        respuesta.classList.remove("visible");
        boton.setAttribute("aria-expanded", "false");
    } else {
        boton.classList.add("abierta");
        respuesta.classList.add("visible");
        boton.setAttribute("aria-expanded", "true");
    }
}

function abrirTodas(abrir) {
    let lista = document.getElementById("lista-faq");
    // [n] firstElementChild + nextElementSibling dentro de un [m] WHILE
    let item = lista.firstElementChild;
    while (item !== null) {
        // Al expandir se saltan las preguntas ocultas por el filtro; al contraer se cierran todas
        let saltar = abrir && item.classList.contains("oculto");
        if (!saltar) {
            let boton = item.firstElementChild;           // la pregunta
            let estaAbierta = boton.classList.contains("abierta");
            // [l] OPERADORES LÓGICOS: solo cambia las que no están como se pidió
            if ((abrir && !estaAbierta) || (!abrir && estaAbierta)) {
                alternarPregunta(boton);
            }
        }
        item = item.nextElementSibling;
    }
}


/* ---------- Búsqueda y categorías ---------- */

function filtrarPreguntas() {
    let texto = document.getElementById("buscar-faq").value.trim().toLowerCase();
    let items = document.querySelectorAll("#lista-faq .faq-item");
    let visibles = 0;

    // [m] FOR
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let pregunta = item.firstElementChild.textContent.toLowerCase();
        let respuesta = item.lastElementChild.textContent.toLowerCase();   // [n] lastElementChild
        let enCategoria = categoriaFaq === "todas" || item.getAttribute("data-categoria") === categoriaFaq;
        let coincide = pregunta.includes(texto) || respuesta.includes(texto);

        if (enCategoria && coincide) {
            item.classList.remove("oculto");
            visibles++;
        } else {
            item.classList.add("oculto");
        }
    }

    document.getElementById("contador-faq").textContent = visibles + " de " + items.length + " preguntas";

    if (visibles === 0) {
        document.getElementById("sin-faq").classList.remove("oculto");
    } else {
        document.getElementById("sin-faq").classList.add("oculto");
    }
}

function elegirCategoria(boton) {
    categoriaFaq = boton.getAttribute("data-categoria");

    // Quita "activo" a todos los botones hermanos y se lo pone al elegido
    let hermano = boton.parentElement.firstElementChild;
    while (hermano !== null) {
        hermano.classList.remove("activo");
        hermano = hermano.nextElementSibling;
    }
    boton.classList.add("activo");

    filtrarPreguntas();
}


/* ---------- ¿Te fue útil? ---------- */

function votar(boton, util) {
    let caja = boton.parentElement;

    // [m] IF - ELSE con PROMPT y ALERT
    if (util) {
        votosUtiles++;
        caja.textContent = "¡Gracias por tu respuesta!";
    } else {
        votosNoUtiles++;
        let comentario = prompt("¿Qué te faltó saber? (opcional)");
        if (comentario !== null && comentario.trim() !== "") {
            alert("Gracias. Usaremos tu comentario para mejorar esta respuesta.");
        }
        caja.textContent = "Gracias. Si necesitas más ayuda, escríbenos desde Contacto.";
    }
    console.log("Votos útiles: " + votosUtiles + " | no útiles: " + votosNoUtiles);
}


/* ---------- Inicio ---------- */

function iniciarPreguntas() {
    let preguntas = document.querySelectorAll(".faq-pregunta");
    // [m] FOREACH: conecta cada pregunta con el acordeón
    preguntas.forEach(function (boton) {
        boton.onclick = function () {
            alternarPregunta(this);
        };
    });

    document.querySelectorAll(".voto-si").forEach(function (boton) {
        boton.onclick = function () {
            votar(this, true);
        };
    });
    document.querySelectorAll(".voto-no").forEach(function (boton) {
        boton.onclick = function () {
            votar(this, false);
        };
    });

    document.querySelectorAll(".filtro-faq").forEach(function (boton) {
        boton.onclick = function () {
            elegirCategoria(this);
        };
    });

    document.getElementById("buscar-faq").oninput = filtrarPreguntas;
    filtrarPreguntas();
}

iniciarPreguntas();
