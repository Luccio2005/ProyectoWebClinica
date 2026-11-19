/* ==========================================================
   medicos.js - Directorio de médicos
   Tarjetas generadas desde un arreglo de objetos, con búsqueda,
   filtro por especialidad, orden por burbuja y perfil en ventana.
   ========================================================== */

// [l] CONSTANTES
const NOMBRES_DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// [m] CLASE con constructor y métodos (orientación a objetos, semana 12)
class Medico {
    constructor(id, nombre, especialidad, experiencia, calificacion, dias, horas, idiomas, foto, descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.especialidad = especialidad;
        this.experiencia = experiencia;      // años
        this.calificacion = calificacion;    // de 1 a 5
        this.dias = dias;                    // números de getDay(): 1 = lunes
        this.horas = horas;
        this.idiomas = idiomas;
        this.foto = foto;                    // "" si no hay foto
        this.descripcion = descripcion;
    }

    atiendeHoy() {
        let hoy = new Date().getDay();
        // [m] FOR: busca el día de hoy dentro de sus días de atención
        for (let i = 0; i < this.dias.length; i++) {
            if (this.dias[i] === hoy) {
                return true;
            }
        }
        return false;
    }

    textoDias() {
        let nombres = [];
        this.dias.forEach(function (dia) {
            nombres.push(NOMBRES_DIAS[dia]);
        });
        return nombres.join(", ");
    }

    iniciales() {
        // "Dr. Raúl Mendoza" -> "RM" (se salta el "Dr." / "Dra.")
        let partes = this.nombre.split(" ");
        return partes[1].charAt(0) + partes[2].charAt(0);
    }
}

// [l] ARREGLO DE OBJETOS (los 4 primeros son los mismos de citas.js)
const listaMedicos = [
    new Medico("marisol", "Dra. Marisol Chávez", "Cardiología", 15, 4.9, [1, 3, 5], "08:00 - 13:00", "Español, inglés", "Imagenes/docMarisol.jpg",
        "Especialista en prevención cardiovascular, hipertensión y control del colesterol."),
    new Medico("raul", "Dr. Raúl Mendoza", "Cardiología", 9, 4.6, [2, 4], "14:00 - 18:00", "Español", "",
        "Realiza electrocardiogramas y chequeos cardiológicos preventivos."),
    new Medico("javier", "Dr. Javier Torres", "Pediatría", 12, 4.8, [1, 2, 3, 4, 5], "08:00 - 13:00", "Español, quechua", "Imagenes/docJavier.jpg",
        "Control de niño sano, vacunación y enfermedades respiratorias infantiles."),
    new Medico("carla", "Dra. Carla Huamán", "Pediatría", 6, 4.7, [2, 4, 6], "09:00 - 14:00", "Español", "",
        "Atención de recién nacidos, lactancia y nutrición infantil."),
    new Medico("lucia", "Dra. Lucía Ramos", "Dermatología", 10, 4.8, [1, 4], "15:00 - 19:00", "Español, inglés", "Imagenes/docLucia.jpg",
        "Tratamiento del acné, dermatitis y cuidado de la piel frente al sol."),
    new Medico("andres", "Dr. Andrés Paredes", "Dermatología", 4, 4.5, [3, 5], "08:00 - 12:00", "Español", "",
        "Evaluación de lunares, alergias de la piel y problemas del cabello."),
    new Medico("eduardo", "Dr. Eduardo Salas", "Traumatología", 18, 4.9, [1, 2, 4], "10:00 - 16:00", "Español", "Imagenes/docEduardo.jpg",
        "Lesiones deportivas, fracturas y dolor de rodilla y espalda."),
    new Medico("rocio", "Dra. Rocío Quispe", "Traumatología", 7, 4.6, [3, 5, 6], "08:00 - 13:00", "Español, quechua", "",
        "Rehabilitación, esguinces y cuidado de la columna.")
];


/* ---------- Tarjetas ---------- */

function estrellas(calificacion) {
    let llenas = Math.round(calificacion);
    let texto = "";
    // [m] FOR: arma "★★★★☆" según la calificación
    for (let i = 1; i <= 5; i++) {
        texto += i <= llenas ? "★" : "☆";
    }
    return texto;
}

function crearTarjeta(medico) {
    let tarjeta = document.createElement("article");
    tarjeta.className = "card tarjeta-medico";

    // Foto o, si no tiene, un círculo con sus iniciales
    let imagen;
    if (medico.foto !== "") {
        imagen = document.createElement("img");
        imagen.src = medico.foto;
        imagen.alt = medico.nombre;
    } else {
        imagen = document.createElement("div");
        imagen.textContent = medico.iniciales();
    }
    imagen.className = "foto-medico";

    let estado = document.createElement("span");
    // [m] IF - ELSE con el método de la clase
    if (medico.atiendeHoy()) {
        estado.className = "estado-hoy atiende";
        estado.textContent = "Atiende hoy";
    } else {
        estado.className = "estado-hoy";
        estado.textContent = "No atiende hoy";
    }

    let nombre = document.createElement("h3");
    nombre.textContent = medico.nombre;

    let especialidad = document.createElement("p");
    especialidad.className = "especialidad-medico";
    especialidad.textContent = medico.especialidad + " · " + medico.experiencia + " años de experiencia";

    let puntaje = document.createElement("p");
    puntaje.className = "estrellas";
    puntaje.textContent = estrellas(medico.calificacion) + " " + medico.calificacion.toFixed(1);

    let horario = document.createElement("p");
    horario.className = "horario-medico";
    horario.textContent = medico.textoDias() + " · " + medico.horas;

    let acciones = document.createElement("div");
    acciones.className = "acciones-medico";

    let perfil = document.createElement("button");
    perfil.type = "button";
    perfil.className = "boton-secundario-nuevo";
    perfil.textContent = "Ver perfil";
    perfil.onclick = function () {
        verPerfil(medico);
    };

    let reservar = document.createElement("a");
    reservar.className = "boton-nuevo";
    reservar.href = "citas.html";
    reservar.textContent = "Reservar cita";

    acciones.appendChild(perfil);
    acciones.appendChild(reservar);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(estado);
    tarjeta.appendChild(nombre);
    tarjeta.appendChild(especialidad);
    tarjeta.appendChild(puntaje);
    tarjeta.appendChild(horario);
    tarjeta.appendChild(acciones);
    return tarjeta;
}

function mostrarMedicos(lista) {
    let grilla = document.getElementById("grilla-medicos");
    grilla.innerHTML = "";

    // [m] FOREACH
    lista.forEach(function (medico) {
        grilla.appendChild(crearTarjeta(medico));
    });

    document.getElementById("contador-medicos").textContent =
        "Mostrando " + lista.length + " de " + listaMedicos.length + " médicos";

    // [n] DOM: mensaje cuando no hay resultados
    if (lista.length === 0) {
        document.getElementById("sin-medicos").classList.remove("oculto");
    } else {
        document.getElementById("sin-medicos").classList.add("oculto");
    }
}


/* ---------- Búsqueda, filtro y orden ---------- */

// [m] ORDENAMIENTO BURBUJA (dos FOR anidados), sobre una copia de la lista
function ordenarMedicosBurbuja(lista, criterio) {
    let copia = lista.slice();
    for (let i = 0; i < copia.length - 1; i++) {
        for (let j = 0; j < copia.length - 1 - i; j++) {
            let cambiar = false;

            // [m] SWITCH - CASE: qué se compara según el criterio
            switch (criterio) {
                case "nombre":
                    cambiar = copia[j].nombre.split(" ")[1] > copia[j + 1].nombre.split(" ")[1];
                    break;
                case "experiencia":
                    cambiar = copia[j].experiencia < copia[j + 1].experiencia;
                    break;
                case "calificacion":
                    cambiar = copia[j].calificacion < copia[j + 1].calificacion;
                    break;
            }

            if (cambiar) {
                let auxiliar = copia[j];
                copia[j] = copia[j + 1];
                copia[j + 1] = auxiliar;
            }
        }
    }
    return copia;
}

function aplicarFiltros() {
    let texto = document.getElementById("buscar-medico").value.trim().toLowerCase();
    let especialidad = document.getElementById("filtro-especialidad").value;
    let criterio = document.getElementById("orden-medicos").value;
    let soloHoy = document.getElementById("solo-hoy").checked;

    let resultado = [];
    for (let i = 0; i < listaMedicos.length; i++) {
        let medico = listaMedicos[i];
        let coincideTexto = medico.nombre.toLowerCase().includes(texto);
        let coincideEspecialidad = especialidad === "todas" || medico.especialidad === especialidad;
        let coincideHoy = !soloHoy || medico.atiendeHoy();

        // [l] OPERADORES LÓGICOS: tiene que cumplir los tres filtros
        if (coincideTexto && coincideEspecialidad && coincideHoy) {
            resultado.push(medico);
        }
    }

    mostrarMedicos(ordenarMedicosBurbuja(resultado, criterio));
}


/* ---------- [o] Perfil en ventana flotante ---------- */

function verPerfil(medico) {
    let texto = medico.descripcion +
        " Atiende " + medico.textoDias() + " de " + medico.horas + "." +
        " Idiomas: " + medico.idiomas + "." +
        " Calificación de pacientes: " + medico.calificacion.toFixed(1) + " de 5.";
    abrirVentana(medico.nombre + " · " + medico.especialidad, texto);
}


/* ---------- Inicio ---------- */

function leerEspecialidadDeLaDireccion() {
    // El index enlaza a medicos.html?especialidad=Cardiología
    let parametros = new URLSearchParams(window.location.search);
    let especialidad = parametros.get("especialidad");
    if (especialidad !== null) {
        let select = document.getElementById("filtro-especialidad");
        // [m] FOR: solo se acepta si existe en el select
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === especialidad) {
                select.value = especialidad;
            }
        }
    }
}

function iniciarMedicos() {
    leerEspecialidadDeLaDireccion();

    document.getElementById("buscar-medico").oninput = aplicarFiltros;
    document.getElementById("filtro-especialidad").onchange = aplicarFiltros;
    document.getElementById("orden-medicos").onchange = aplicarFiltros;
    document.getElementById("solo-hoy").onchange = aplicarFiltros;

    aplicarFiltros();
}

iniciarMedicos();
