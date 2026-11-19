/* ==========================================================
   blog.js - Blog de salud
   Artículos desde un arreglo de objetos, barra lateral con
   búsqueda, categorías y "más leídos", y suscripción.
   ========================================================== */

// [l] CONSTANTES
const PALABRAS_POR_MINUTO = 200;
const CATEGORIAS = ["Todas", "Prevención", "Bienestar", "Nutrición", "Niños"];

// [l] VARIABLES
let categoriaActual = "Todas";

// [l] ARREGLO DE OBJETOS: cada artículo tiene su contenido en un arreglo de párrafos
let articulos = [
    {
        id: 1, titulo: "La importancia de los chequeos médicos", categoria: "Prevención",
        autor: "Dra. Marisol Chávez", fecha: "10/11/2026", visitas: 320,
        resumen: "Los controles periódicos permiten detectar problemas de salud antes de que den síntomas.",
        parrafos: [
            "Muchas enfermedades, como la hipertensión o la diabetes, avanzan durante años sin dar molestias. Un chequeo anual permite encontrarlas a tiempo, cuando el tratamiento es más sencillo.",
            "Un chequeo básico incluye la toma de presión, el peso y la talla, un análisis de sangre y una conversación con tu médico sobre tus antecedentes familiares.",
            "Desde los 40 años es recomendable sumar un control cardiológico. Si fumas, tienes sobrepeso o antecedentes en tu familia, conviene empezar antes."
        ]
    },
    {
        id: 2, titulo: "Hábitos para una vida saludable", categoria: "Bienestar",
        autor: "Dr. Eduardo Salas", fecha: "05/11/2026", visitas: 275,
        resumen: "Alimentación, actividad física y descanso: tres pilares que se refuerzan entre sí.",
        parrafos: [
            "No hace falta cambiar todo de golpe. Caminar 30 minutos al día, cinco días a la semana, ya reduce el riesgo de enfermedades del corazón.",
            "Dormir entre 7 y 8 horas ayuda a controlar el apetito, mejora el ánimo y fortalece las defensas.",
            "Elige un hábito, mantenlo dos semanas y luego suma otro. Los cambios pequeños y constantes son los que duran."
        ]
    },
    {
        id: 3, titulo: "¿Cuándo acudir al médico?", categoria: "Prevención",
        autor: "Dr. Raúl Mendoza", fecha: "28/10/2026", visitas: 410,
        resumen: "Algunas señales de alerta no deben esperar: conoce cuáles son.",
        parrafos: [
            "Dolor en el pecho, dificultad para respirar, pérdida brusca de fuerza en un lado del cuerpo o confusión repentina son emergencias: acude de inmediato.",
            "Una fiebre que dura más de tres días, una tos de más de dos semanas o una baja de peso sin explicación también merecen una consulta.",
            "Si tienes dudas, puedes usar nuestro servicio de Consulta de salud para orientarte antes de reservar una cita."
        ]
    },
    {
        id: 4, titulo: "Protector solar: cómo elegirlo y usarlo", categoria: "Bienestar",
        autor: "Dra. Lucía Ramos", fecha: "20/10/2026", visitas: 198,
        resumen: "En Arequipa la radiación es muy alta casi todo el año. El protector solar es diario.",
        parrafos: [
            "Elige un protector de amplio espectro con FPS 50 o más. Aplícalo 20 minutos antes de salir y renuévalo cada dos o tres horas.",
            "Usa una cantidad generosa: para el rostro y el cuello equivale a dos dedos de crema.",
            "Complementa con sombrero, lentes de sol y evita la exposición directa entre las 10 de la mañana y las 4 de la tarde."
        ]
    },
    {
        id: 5, titulo: "Vacunas en la infancia: lo que debes saber", categoria: "Niños",
        autor: "Dr. Javier Torres", fecha: "12/10/2026", visitas: 260,
        resumen: "Mantener al día el carné de vacunación protege a tu hijo y a quienes lo rodean.",
        parrafos: [
            "Las vacunas del calendario nacional son gratuitas y se aplican desde el nacimiento. Revisa el carné en cada control de niño sano.",
            "Es normal que aparezca fiebre baja o dolor en la zona de la inyección durante uno o dos días.",
            "Si se pasó alguna dosis, no es necesario empezar de cero: tu pediatra indicará cómo completar el esquema."
        ]
    },
    {
        id: 6, titulo: "Desayunos nutritivos en 5 minutos", categoria: "Nutrición",
        autor: "Dra. Carla Huamán", fecha: "02/10/2026", visitas: 150,
        resumen: "Ideas sencillas para empezar el día con energía, también para los niños.",
        parrafos: [
            "Un buen desayuno combina una fruta, un cereal integral y una proteína, como huevo, queso fresco o yogur natural.",
            "La avena con fruta picada o un pan integral con palta y huevo se preparan en minutos.",
            "Evita los jugos con azúcar añadida: es mejor comer la fruta entera, que conserva la fibra."
        ]
    }
];


/* ---------- Ayudas ---------- */

function minutosDeLectura(articulo) {
    let palabras = 0;
    // [m] FOR: cuenta las palabras de todos los párrafos
    for (let i = 0; i < articulo.parrafos.length; i++) {
        palabras += articulo.parrafos[i].split(" ").length;
    }
    palabras += articulo.resumen.split(" ").length;
    // [l] OPERADORES ARITMÉTICOS: división y redondeo hacia arriba
    return Math.ceil(palabras / PALABRAS_POR_MINUTO);
}

function claseCategoria(categoria) {
    // [m] SWITCH - CASE: color de la etiqueta según la categoría
    switch (categoria) {
        case "Prevención":
            return "etiqueta-prevencion";
        case "Bienestar":
            return "etiqueta-bienestar";
        case "Nutrición":
            return "etiqueta-nutricion";
        case "Niños":
            return "etiqueta-ninos";
        default:
            return "";
    }
}


/* ---------- Artículos ---------- */

function crearArticulo(articulo) {
    let tarjeta = document.createElement("article");
    tarjeta.className = "card articulo";
    tarjeta.id = "articulo-" + articulo.id;

    let etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-categoria " + claseCategoria(articulo.categoria);
    etiqueta.textContent = articulo.categoria;

    let titulo = document.createElement("h2");
    titulo.textContent = articulo.titulo;

    let datos = document.createElement("p");
    datos.className = "datos-articulo";
    datos.textContent = articulo.autor + " · " + articulo.fecha + " · " + minutosDeLectura(articulo) + " min de lectura";

    let resumen = document.createElement("p");
    resumen.className = "resumen-articulo";
    resumen.textContent = articulo.resumen;

    let contenido = document.createElement("div");
    contenido.className = "contenido-articulo oculto";
    articulo.parrafos.forEach(function (texto) {
        let p = document.createElement("p");
        p.textContent = texto;
        contenido.appendChild(p);
    });

    let boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-secundario-nuevo";
    boton.textContent = "Leer más";
    boton.onclick = function () {
        alternarArticulo(this, articulo.id);
    };

    tarjeta.appendChild(etiqueta);
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(datos);
    tarjeta.appendChild(resumen);
    tarjeta.appendChild(contenido);
    tarjeta.appendChild(boton);
    return tarjeta;
}

// [n] PROPIEDADES DE NAVEGACIÓN: el contenido está justo antes del botón
function alternarArticulo(boton, id) {
    let contenido = boton.previousElementSibling;
    if (contenido.classList.contains("oculto")) {
        contenido.classList.remove("oculto");
        boton.textContent = "Leer menos";
        sumarVisita(id);
    } else {
        contenido.classList.add("oculto");
        boton.textContent = "Leer más";
    }
}

function sumarVisita(id) {
    for (let i = 0; i < articulos.length; i++) {
        if (articulos[i].id === id) {
            articulos[i].visitas++;               // [l] incremento
        }
    }
    mostrarPopulares();
}

function mostrarArticulos() {
    let texto = document.getElementById("buscar-articulo").value.trim().toLowerCase();
    let lista = document.getElementById("lista-articulos");
    lista.innerHTML = "";

    let mostrados = 0;
    articulos.forEach(function (articulo) {
        let enCategoria = categoriaActual === "Todas" || articulo.categoria === categoriaActual;
        let contieneTexto = (articulo.titulo + " " + articulo.resumen + " " + articulo.parrafos.join(" ")).toLowerCase().includes(texto);
        // [l] OPERADORES LÓGICOS
        if (enCategoria && contieneTexto) {
            lista.appendChild(crearArticulo(articulo));
            mostrados++;
        }
    });

    document.getElementById("contador-articulos").textContent =
        mostrados + " artículo(s)" + (categoriaActual !== "Todas" ? " en " + categoriaActual : "");

    if (mostrados === 0) {
        document.getElementById("sin-articulos").classList.remove("oculto");
    } else {
        document.getElementById("sin-articulos").classList.add("oculto");
    }
}


/* ---------- Barra lateral ---------- */

function mostrarCategorias() {
    let lista = document.getElementById("lista-categorias");
    lista.innerHTML = "";

    // [l] ARREGLO BIDIMENSIONAL: [categoría, cantidad de artículos]
    let conteo = [];
    for (let i = 0; i < CATEGORIAS.length; i++) {
        let cantidad = 0;
        for (let j = 0; j < articulos.length; j++) {
            if (CATEGORIAS[i] === "Todas" || articulos[j].categoria === CATEGORIAS[i]) {
                cantidad++;
            }
        }
        conteo.push([CATEGORIAS[i], cantidad]);
    }

    conteo.forEach(function (fila) {
        let item = document.createElement("li");
        let boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = fila[0] + " (" + fila[1] + ")";
        if (fila[0] === categoriaActual) {
            boton.className = "activa";
        }
        boton.onclick = function () {
            categoriaActual = fila[0];
            mostrarCategorias();
            mostrarArticulos();
        };
        item.appendChild(boton);
        lista.appendChild(item);
    });
}

// [m] ORDENAMIENTO BURBUJA por visitas (de mayor a menor)
function ordenarPorVisitasBurbuja(lista) {
    let copia = lista.slice();
    for (let i = 0; i < copia.length - 1; i++) {
        for (let j = 0; j < copia.length - 1 - i; j++) {
            if (copia[j].visitas < copia[j + 1].visitas) {
                let auxiliar = copia[j];
                copia[j] = copia[j + 1];
                copia[j + 1] = auxiliar;
            }
        }
    }
    return copia;
}

function mostrarPopulares() {
    let lista = document.getElementById("lista-populares");
    lista.innerHTML = "";
    let ordenados = ordenarPorVisitasBurbuja(articulos);

    // [m] WHILE: solo los 3 primeros
    let i = 0;
    while (i < 3 && i < ordenados.length) {
        let item = document.createElement("li");
        let enlace = document.createElement("a");
        enlace.href = "#articulo-" + ordenados[i].id;
        enlace.textContent = ordenados[i].titulo;
        let visitas = document.createElement("small");
        visitas.textContent = ordenados[i].visitas + " lecturas";
        item.appendChild(enlace);
        item.appendChild(visitas);
        lista.appendChild(item);
        i++;
    }
}


/* ---------- Suscripción ---------- */

function suscribirse(evento) {
    evento.preventDefault();
    let correo = document.getElementById("correo-suscripcion").value.trim();

    // [m] IF - ELSE
    if (!validarCorreo(correo)) {
        alert("Escribe un correo válido para suscribirte.");
    } else {
        abrirVentana("¡Listo!", "Te enviaremos nuestros consejos de salud a " + correo + ".");
        document.getElementById("form-suscripcion").reset();
    }
}


/* ---------- Inicio ---------- */

function iniciarBlog() {
    let cuenta = obtenerUsuario();
    if (cuenta !== null) {
        document.getElementById("correo-suscripcion").value = cuenta.correo;
    }

    document.getElementById("buscar-articulo").oninput = mostrarArticulos;
    document.getElementById("form-suscripcion").onsubmit = suscribirse;

    mostrarCategorias();
    mostrarArticulos();
    mostrarPopulares();
}

iniciarBlog();
