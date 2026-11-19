/* ==========================================================
   libro-reclamaciones.js - Hoja de reclamación virtual
   ========================================================== */

// [l] CONSTANTES
const DIAS_HABILES_RESPUESTA = 15;
const LARGO_MINIMO_DETALLE = 20;

// [l] VARIABLES
let numeroHoja = "";


/* ---------- Datos de la hoja ---------- */

function crearNumeroHoja() {
    // Número de la hoja: año + 4 dígitos tomados de la hora actual
    let anio = new Date().getFullYear();
    numeroHoja = generarCodigo("R-" + anio, Date.now() % 10000, 4);
    document.getElementById("numero-hoja").textContent = numeroHoja;
    document.getElementById("fecha-hoja").textContent = fechaHoy();
}

// [m] WHILE: suma días saltando sábados y domingos hasta juntar 15 días hábiles
function calcularFechaLimite() {
    let fecha = new Date();
    let contados = 0;
    while (contados < DIAS_HABILES_RESPUESTA) {
        fecha.setDate(fecha.getDate() + 1);
        let dia = fecha.getDay();
        if (dia !== 0 && dia !== 6) {
            contados++;
        }
    }
    let d = String(fecha.getDate()).padStart(2, "0");
    let m = String(fecha.getMonth() + 1).padStart(2, "0");
    return d + "/" + m + "/" + fecha.getFullYear();
}


/* ---------- Relacionar con un pedido o una cita ---------- */

function llenarRelaciones() {
    let select = document.getElementById("rec-relacion");
    let pedidos = leerDatos("pedidos", []);
    let citas = leerDatos("citas", []);

    // [m] FOREACH: una opción por cada pedido y por cada cita guardados
    pedidos.forEach(function (pedido) {
        let opcion = document.createElement("option");
        opcion.value = "Pedido " + pedido.codigo;
        opcion.textContent = "Pedido " + pedido.codigo + " · " + pedido.fecha + " · " + formatoSoles(pedido.total);
        select.appendChild(opcion);
    });
    citas.forEach(function (cita) {
        let opcion = document.createElement("option");
        opcion.value = "Cita " + cita.codigo;
        opcion.textContent = "Cita " + cita.codigo + " · " + cita.especialidad + " · " + cita.fecha;
        select.appendChild(opcion);
    });
}

function elegirRelacion() {
    let valor = document.getElementById("rec-relacion").value;
    if (valor === "") {
        return;
    }
    // Si eligió un pedido, se marca "Producto" y se copia su total; si es una cita, "Servicio"
    let esPedido = valor.indexOf("Pedido") === 0;
    let radios = document.getElementsByName("rec-bien");
    radios[0].checked = esPedido;
    radios[1].checked = !esPedido;

    let codigo = valor.split(" ")[1];
    if (esPedido) {
        let pedidos = leerDatos("pedidos", []);
        for (let i = 0; i < pedidos.length; i++) {
            if (pedidos[i].codigo === codigo) {
                document.getElementById("rec-monto").value = pedidos[i].total.toFixed(2);
            }
        }
    } else {
        let citas = leerDatos("citas", []);
        for (let i = 0; i < citas.length; i++) {
            if (citas[i].codigo === codigo) {
                document.getElementById("rec-monto").value = Number(citas[i].precio).toFixed(2);
            }
        }
    }
}


/* ---------- Ayudas del formulario ---------- */

function valorRadio(nombre) {
    let radios = document.getElementsByName(nombre);
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return "";
}

function explicarTipo() {
    let tipo = valorRadio("rec-tipo");
    let texto = "";
    // [m] SWITCH - CASE
    switch (tipo) {
        case "reclamo":
            texto = "Reclamo: no estás conforme con un producto o con un servicio que contrataste.";
            break;
        case "queja":
            texto = "Queja: no estás conforme con la atención recibida (trato, demoras, información), aunque no tenga que ver con un producto.";
            break;
        default:
            texto = "Elige si es un reclamo o una queja.";
    }
    document.getElementById("info-tipo").textContent = texto;
}

function mostrarApoderado() {
    let esMenor = document.getElementById("rec-menor").checked;
    // [n] DOM: classList muestra u oculta el campo del apoderado
    if (esMenor) {
        document.getElementById("bloque-apoderado").classList.remove("oculto");
    } else {
        document.getElementById("bloque-apoderado").classList.add("oculto");
    }
}

function contarDetalle() {
    let largo = document.getElementById("rec-detalle").value.length;
    document.getElementById("contador-detalle").textContent = largo + " / 1000";
}

function llenarDatosUsuario() {
    let cuenta = obtenerUsuario();
    if (cuenta !== null) {
        document.getElementById("rec-nombre").value = cuenta.nombre;
        document.getElementById("rec-documento").value = cuenta.dni;
        document.getElementById("rec-celular").value = cuenta.celular;
        document.getElementById("rec-correo").value = cuenta.correo;
    }
}


/* ---------- Validar y registrar ---------- */

function leerFormulario() {
    return {
        nombre: document.getElementById("rec-nombre").value.trim(),
        tipoDoc: document.getElementById("rec-tipo-doc").value,
        documento: document.getElementById("rec-documento").value.trim(),
        domicilio: document.getElementById("rec-domicilio").value.trim(),
        celular: document.getElementById("rec-celular").value.trim(),
        correo: document.getElementById("rec-correo").value.trim(),
        menor: document.getElementById("rec-menor").checked,
        apoderado: document.getElementById("rec-apoderado").value.trim(),
        bien: valorRadio("rec-bien"),
        relacion: document.getElementById("rec-relacion").value,
        monto: document.getElementById("rec-monto").value,
        descripcion: document.getElementById("rec-descripcion-bien").value.trim(),
        tipo: valorRadio("rec-tipo"),
        detalle: document.getElementById("rec-detalle").value.trim(),
        solicitud: document.getElementById("rec-pedido").value.trim(),
        acepto: document.getElementById("rec-acepto").checked
    };
}

function validarReclamo(datos) {
    // [m] IF - ELSE IF ANIDADO
    if (datos.nombre.length < 3) {
        return "Escribe tus nombres y apellidos.";
    } else if (datos.tipoDoc === "DNI" && !validarDNI(datos.documento)) {
        return "El DNI debe tener 8 dígitos.";
    } else if (datos.tipoDoc === "CE" && (datos.documento.length < 9 || datos.documento.length > 12)) {
        return "El carné de extranjería debe tener entre 9 y 12 caracteres.";
    } else if (datos.domicilio.length < 5) {
        return "Escribe tu domicilio.";
    } else if (!validarCelular(datos.celular)) {
        return "El celular debe tener 9 dígitos y empezar con 9.";
    } else if (!validarCorreo(datos.correo)) {
        return "Escribe un correo válido.";
    } else if (datos.menor && datos.apoderado.length < 3) {
        return "Escribe el nombre de tu padre, madre o apoderado.";
    } else if (datos.bien === "") {
        return "Indica si es un producto o un servicio.";
    } else if (datos.monto !== "" && (isNaN(datos.monto) || Number(datos.monto) < 0)) {
        return "El monto debe ser un número mayor o igual a 0.";
    } else if (datos.tipo === "") {
        return "Indica si es un reclamo o una queja.";
    } else if (datos.detalle.length < LARGO_MINIMO_DETALLE) {
        return "Cuéntanos el detalle con al menos " + LARGO_MINIMO_DETALLE + " caracteres.";
    } else if (datos.solicitud === "") {
        return "Indica qué solicitas.";
    } else if (!datos.acepto) {
        return "Debes declarar que los datos son verdaderos.";
    }
    return "";
}

function registrarReclamo(evento) {
    evento.preventDefault();

    let datos = leerFormulario();
    let error = validarReclamo(datos);
    if (error !== "") {
        alert(error);
        return;
    }

    // [m] CONFIRM
    let seguro = confirm("¿Registrar tu " + datos.tipo + " N.º " + numeroHoja + "?");
    if (!seguro) {
        return;
    }

    mostrarConstancia(datos);
}

function mostrarConstancia(datos) {
    let limite = calcularFechaLimite();
    let monto = datos.monto === "" ? "No indicado" : formatoSoles(datos.monto);

    // [l] ARREGLO BIDIMENSIONAL: cada fila es [dato, valor]
    let filas = [
        ["N.º de hoja", numeroHoja],
        ["Fecha", fechaHoy()],
        ["Consumidor", datos.nombre],
        ["Documento", datos.tipoDoc + " " + datos.documento],
        ["Correo", datos.correo],
        ["Tipo", datos.tipo === "reclamo" ? "Reclamo" : "Queja"],
        ["Bien contratado", datos.bien + (datos.relacion !== "" ? " · " + datos.relacion : "")],
        ["Monto reclamado", monto],
        ["Detalle", datos.detalle],
        ["Solicitud", datos.solicitud],
        ["Respuesta a más tardar", limite]
    ];
    if (datos.menor) {
        filas.splice(3, 0, ["Apoderado", datos.apoderado]);
    }

    let tabla = document.getElementById("tabla-constancia");
    tabla.innerHTML = "";
    // [m] FOR: recorre filas y columnas de la matriz
    for (let i = 0; i < filas.length; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < filas[i].length; j++) {
            let celda = document.createElement(j === 0 ? "th" : "td");
            celda.textContent = filas[i][j];
            tr.appendChild(celda);
        }
        tabla.appendChild(tr);
    }

    document.getElementById("texto-plazo").textContent =
        "Te responderemos a " + datos.correo + " a más tardar el " + limite + " (" + DIAS_HABILES_RESPUESTA + " días hábiles).";

    // [n] DOM: se oculta el formulario y aparece la constancia
    document.getElementById("form-reclamo").classList.add("oculto");
    document.getElementById("constancia").classList.remove("oculto");
    window.scrollTo(0, 0);

    // [o] VENTANA FLOTANTE
    abrirVentana("Reclamación registrada", "Guarda tu número de hoja: " + numeroHoja + ".");
}

function nuevaReclamacion() {
    document.getElementById("form-reclamo").reset();
    document.getElementById("form-reclamo").classList.remove("oculto");
    document.getElementById("constancia").classList.add("oculto");
    crearNumeroHoja();
    llenarDatosUsuario();
    explicarTipo();
    mostrarApoderado();
    contarDetalle();
}


/* ---------- Inicio ---------- */

function iniciarReclamaciones() {
    crearNumeroHoja();
    llenarRelaciones();
    llenarDatosUsuario();

    document.getElementById("form-reclamo").onsubmit = registrarReclamo;
    document.getElementById("rec-menor").onchange = mostrarApoderado;
    document.getElementById("rec-relacion").onchange = elegirRelacion;
    document.getElementById("rec-detalle").oninput = contarDetalle;

    let tipos = document.getElementsByName("rec-tipo");
    for (let i = 0; i < tipos.length; i++) {
        tipos[i].onchange = explicarTipo;
    }
}

iniciarReclamaciones();
