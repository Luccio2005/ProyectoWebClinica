/* ==========================================================
   mis-citas.js - Citas del paciente
   Lee las citas que guarda citas.js en localStorage ("citas")
   y permite filtrarlas, ordenarlas, reprogramarlas y cancelarlas.
   ========================================================== */

// [l] CONSTANTES (mismos horarios que citas.js)
const HORAS_ATENCION = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

// [l] ARREGLO BIDIMENSIONAL: lunes a sábado x HORAS_ATENCION (true = se atiende)
const TABLA_DISPONIBILIDAD = [
    [true, true, true, true, true, true, true, false],      // lunes
    [true, true, true, false, true, true, true, true],      // martes
    [true, true, false, true, true, true, false, true],     // miércoles
    [true, true, true, true, false, true, true, true],      // jueves
    [true, true, true, true, true, false, false, false],    // viernes
    [true, true, true, true, false, false, false, false]    // sábado
];

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;


/* ---------- Fechas ---------- */

// "2026-11-20" + "09:00" -> objeto Date (hora local)
function crearFecha(fecha, hora) {
    let partes = fecha.split("-");
    let horas = hora.split(":");
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]), Number(horas[0]), Number(horas[1]));
}

function fechaBonita(fecha) {
    let partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Una cita "Programada" cuya fecha ya pasó se muestra como "Atendida"
function estadoActual(cita) {
    if (cita.estado === "Programada" && crearFecha(cita.fecha, cita.hora) < new Date()) {
        return "Atendida";
    }
    return cita.estado;
}


/* ---------- Datos ---------- */

function citasDelPaciente() {
    let cuenta = obtenerUsuario();
    let todas = leerDatos("citas", []);
    let mias = [];
    // [m] FOR: solo las citas del paciente con sesión
    for (let i = 0; i < todas.length; i++) {
        if (todas[i].paciente === cuenta.nombre) {
            mias.push(todas[i]);
        }
    }
    return mias;
}

function guardarCita(citaCambiada) {
    let todas = leerDatos("citas", []);
    for (let i = 0; i < todas.length; i++) {
        if (todas[i].codigo === citaCambiada.codigo) {
            todas[i] = citaCambiada;
        }
    }
    guardarDatos("citas", todas);
}


/* ---------- Resumen y próxima cita ---------- */

function mostrarResumenCitas(citas) {
    let programadas = 0;
    let atendidas = 0;
    let canceladas = 0;

    // [m] SWITCH - CASE dentro de un FOR: cuenta por estado
    for (let i = 0; i < citas.length; i++) {
        switch (estadoActual(citas[i])) {
            case "Programada":
                programadas++;
                break;
            case "Atendida":
                atendidas++;
                break;
            case "Cancelada":
                canceladas++;
                break;
        }
    }

    document.getElementById("total-citas").textContent = citas.length;
    document.getElementById("total-programadas").textContent = programadas;
    document.getElementById("total-atendidas").textContent = atendidas;
    document.getElementById("total-canceladas").textContent = canceladas;
}

function mostrarProximaCita(citas) {
    let caja = document.getElementById("proxima-cita");
    let futuras = [];
    citas.forEach(function (cita) {
        if (estadoActual(cita) === "Programada") {
            futuras.push(cita);
        }
    });

    if (futuras.length === 0) {
        caja.innerHTML = "<h2>No tienes citas próximas</h2><p>Cuando reserves una, aparecerá aquí.</p>";
        return;
    }

    let proxima = ordenarCitasBurbuja(futuras, "asc")[0];
    // [l] OPERADORES ARITMÉTICOS: días que faltan (diferencia de fechas / ms por día)
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let diferencia = crearFecha(proxima.fecha, "00:00") - hoy;
    let dias = Math.round(diferencia / MILISEGUNDOS_POR_DIA);

    let cuando = "";
    // [m] IF - ELSE IF - ELSE
    if (dias === 0) {
        cuando = "¡Es hoy! Llega 15 minutos antes.";
    } else if (dias === 1) {
        cuando = "Es mañana. Llega 15 minutos antes.";
    } else if (dias <= 7) {
        cuando = "Faltan " + dias + " días.";
    } else {
        cuando = "Faltan " + dias + " días. Te recomendamos anotarla en tu agenda.";
    }

    caja.innerHTML =
        "<p class='etiqueta-pagina'>TU PRÓXIMA CITA</p>" +
        "<h2>" + proxima.especialidad + " con " + proxima.medico + "</h2>" +
        "<p>" + fechaBonita(proxima.fecha) + " a las " + proxima.hora + " · " + proxima.modalidad + " · " + proxima.codigo + "</p>" +
        "<p class='faltan'>" + cuando + "</p>";
}


/* ---------- Tabla ---------- */

// [m] ORDENAMIENTO BURBUJA por fecha y hora ("2026-11-20 09:00" se puede comparar como texto)
function ordenarCitasBurbuja(lista, sentido) {
    let copia = lista.slice();
    for (let i = 0; i < copia.length - 1; i++) {
        for (let j = 0; j < copia.length - 1 - i; j++) {
            let a = copia[j].fecha + " " + copia[j].hora;
            let b = copia[j + 1].fecha + " " + copia[j + 1].hora;
            // [l] OPERADORES LÓGICOS: el sentido decide qué comparación se usa
            if ((sentido === "asc" && a > b) || (sentido === "desc" && a < b)) {
                let auxiliar = copia[j];
                copia[j] = copia[j + 1];
                copia[j + 1] = auxiliar;
            }
        }
    }
    return copia;
}

function crearCelda(fila, texto, etiqueta) {
    let celda = document.createElement("td");
    celda.textContent = texto;
    celda.setAttribute("data-label", etiqueta);
    fila.appendChild(celda);
    return celda;
}

function mostrarTabla(citas) {
    let filtro = document.getElementById("filtro-estado-cita").value;
    let sentido = document.getElementById("orden-citas").value;
    let cuerpo = document.getElementById("cuerpo-citas");
    cuerpo.innerHTML = "";

    let visibles = [];
    citas.forEach(function (cita) {
        if (filtro === "todas" || estadoActual(cita) === filtro) {
            visibles.push(cita);
        }
    });
    visibles = ordenarCitasBurbuja(visibles, sentido);

    visibles.forEach(function (cita) {
        let fila = document.createElement("tr");
        fila.setAttribute("data-codigo", cita.codigo);

        crearCelda(fila, cita.codigo, "Código");
        crearCelda(fila, fechaBonita(cita.fecha), "Fecha");
        crearCelda(fila, cita.hora, "Hora");
        crearCelda(fila, cita.especialidad, "Especialidad");
        crearCelda(fila, cita.medico, "Médico");
        crearCelda(fila, cita.modalidad, "Modalidad");
        crearCelda(fila, formatoSoles(cita.precio), "Precio");

        let estado = estadoActual(cita);
        let celdaEstado = crearCelda(fila, estado, "Estado");
        celdaEstado.className = "estado-cita " + estado.toLowerCase();

        let acciones = crearCelda(fila, "", "Acciones");
        if (estado === "Programada") {
            let reprogramar = document.createElement("button");
            reprogramar.type = "button";
            reprogramar.className = "boton-secundario-nuevo";
            reprogramar.textContent = "Reprogramar";
            reprogramar.onclick = function () {
                reprogramarCita(this);
            };

            let cancelar = document.createElement("button");
            cancelar.type = "button";
            cancelar.className = "boton-cancelar";
            cancelar.textContent = "Cancelar";
            cancelar.onclick = function () {
                cancelarCita(this);
            };

            acciones.appendChild(reprogramar);
            acciones.appendChild(cancelar);
        } else {
            acciones.textContent = "—";
        }

        cuerpo.appendChild(fila);
    });

    if (visibles.length === 0) {
        document.getElementById("sin-citas").classList.remove("oculto");
    } else {
        document.getElementById("sin-citas").classList.add("oculto");
    }
}


/* ---------- Acciones ---------- */

// [n] PROPIEDADES DE NAVEGACIÓN: botón -> td (parentElement) -> tr (parentElement)
function citaDelBoton(boton) {
    let fila = boton.parentElement.parentElement;
    let codigo = fila.getAttribute("data-codigo");
    let citas = leerDatos("citas", []);
    for (let i = 0; i < citas.length; i++) {
        if (citas[i].codigo === codigo) {
            return citas[i];
        }
    }
    return null;
}

function cancelarCita(boton) {
    let cita = citaDelBoton(boton);
    let horasQueFaltan = (crearFecha(cita.fecha, cita.hora) - new Date()) / (60 * 60 * 1000);

    let mensaje = "¿Cancelar tu cita " + cita.codigo + " del " + fechaBonita(cita.fecha) + " a las " + cita.hora + "?";
    // [m] IF ANIDADO: aviso extra si falta menos de un día
    if (horasQueFaltan < 24) {
        mensaje = "Tu cita es en menos de 24 horas. " + mensaje;
    }

    // [m] CONFIRM
    if (confirm(mensaje)) {
        cita.estado = "Cancelada";
        guardarCita(cita);
        refrescar();
        abrirVentana("Cita cancelada", "La cita " + cita.codigo + " fue cancelada.");
    }
}

function horaDisponible(fecha, hora) {
    let dia = crearFecha(fecha, "00:00").getDay();   // 1 = lunes ... 6 = sábado
    let columna = HORAS_ATENCION.indexOf(hora);
    if (dia === 0 || columna === -1) {
        return false;
    }
    return TABLA_DISPONIBILIDAD[dia - 1][columna];
}

function estaOcupado(medico, fecha, hora, codigoPropio) {
    let citas = leerDatos("citas", []);
    for (let i = 0; i < citas.length; i++) {
        let c = citas[i];
        if (c.codigo !== codigoPropio && c.medico === medico && c.fecha === fecha && c.hora === hora && c.estado !== "Cancelada") {
            return true;
        }
    }
    return false;
}

function esFechaValidaCita(texto) {
    // Formato AAAA-MM-DD, fecha futura y que no sea domingo
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return false;
    }
    let fecha = crearFecha(texto, "23:59");
    return !isNaN(fecha.getTime()) && fecha > new Date() && fecha.getDay() !== 0;
}

function reprogramarCita(boton) {
    let cita = citaDelBoton(boton);

    // [m] PROMPT + WHILE: se repite hasta que la fecha sea válida (o cancele)
    let nuevaFecha = prompt("Nueva fecha para " + cita.codigo + " (AAAA-MM-DD). No se atiende domingos:", cita.fecha);
    while (nuevaFecha !== null && !esFechaValidaCita(nuevaFecha.trim())) {
        nuevaFecha = prompt("Fecha no válida. Escribe una fecha futura que no sea domingo (AAAA-MM-DD):", cita.fecha);
    }
    if (nuevaFecha === null) {
        return;
    }
    nuevaFecha = nuevaFecha.trim();

    // Horarios libres de ese día para el mismo médico
    let libres = [];
    for (let i = 0; i < HORAS_ATENCION.length; i++) {
        if (horaDisponible(nuevaFecha, HORAS_ATENCION[i]) && !estaOcupado(cita.medico, nuevaFecha, HORAS_ATENCION[i], cita.codigo)) {
            libres.push(HORAS_ATENCION[i]);
        }
    }
    if (libres.length === 0) {
        alert("No hay horarios libres ese día. Prueba con otra fecha.");
        return;
    }

    let nuevaHora = prompt("Horarios libres: " + libres.join(", ") + "\nEscribe la hora:", libres[0]);
    while (nuevaHora !== null && libres.indexOf(nuevaHora.trim()) === -1) {
        nuevaHora = prompt("Elige una de estas horas: " + libres.join(", "), libres[0]);
    }
    if (nuevaHora === null) {
        return;
    }

    cita.fecha = nuevaFecha;
    cita.hora = nuevaHora.trim();
    guardarCita(cita);
    refrescar();
    abrirVentana("Cita reprogramada", "Tu cita " + cita.codigo + " ahora es el " + fechaBonita(cita.fecha) + " a las " + cita.hora + ".");
}


/* ---------- Inicio ---------- */

function refrescar() {
    let citas = citasDelPaciente();
    mostrarProximaCita(citas);
    mostrarResumenCitas(citas);
    mostrarTabla(citas);
}

function iniciarMisCitas() {
    // Sin sesión no hay citas que mostrar
    if (obtenerUsuario() === null) {
        document.getElementById("sin-sesion").classList.remove("oculto");
        document.getElementById("zona-citas").classList.add("oculto");
        return;
    }

    document.getElementById("filtro-estado-cita").onchange = refrescar;
    document.getElementById("orden-citas").onchange = refrescar;
    refrescar();
}

iniciarMisCitas();
