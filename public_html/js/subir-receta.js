/* ==========================================================
   subir-receta.js - Subir receta médica
   Valida el archivo y la fecha, muestra una vista previa y
   simula la validación de la receta avanzando los pasos.
   ========================================================== */

// [l] CONSTANTES
const TAMANO_MAXIMO_MB = 5;
const DIAS_VIGENCIA_RECETA = 30;
const SEGUNDOS_VALIDACION = 3;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

// [l] VARIABLES
let archivoRecetaValido = false;
let fechaRecetaValida = false;


/* ---------- Paciente y carrito ---------- */

function cargarPacienteReceta() {
    let cuenta = obtenerUsuario();
    if (cuenta === null) {
        // [m] CONFIRM
        if (confirm("Debes iniciar sesión para subir una receta. ¿Ir al inicio de sesión?")) {
            window.location.href = "login.html";
        }
        return;
    }
    document.getElementById("receta-paciente").value = cuenta.nombre;
    // Solo se muestran los 3 últimos dígitos del DNI
    document.getElementById("receta-documento").value = "*****" + String(cuenta.dni).slice(-3);
}

function mostrarProductosConReceta() {
    let carrito = leerDatos("carrito", []);
    let conReceta = [];
    // [m] FOREACH: busca en el carrito los productos que piden receta
    carrito.forEach(function (producto) {
        if (producto.requiereReceta) {
            conReceta.push(producto.nombre + " × " + producto.cantidad);
        }
    });

    if (conReceta.length > 0) {
        let aviso = document.getElementById("aviso-carrito");
        aviso.innerHTML = "<strong>Tu carrito tiene productos que necesitan receta:</strong> " + conReceta.join(", ") + ".";
        aviso.classList.remove("oculto");
    }
}


/* ---------- Archivo ---------- */

function extensionDe(nombre) {
    let partes = nombre.toLowerCase().split(".");
    return partes[partes.length - 1];
}

function revisarArchivo() {
    let campo = document.getElementById("receta");
    let info = document.getElementById("info-archivo");
    let vista = document.getElementById("vista-previa");
    vista.innerHTML = "";
    vista.classList.add("oculto");
    archivoRecetaValido = false;

    if (campo.files.length === 0) {
        info.textContent = "";
        actualizarBoton();
        return;
    }

    let archivo = campo.files[0];
    // [l] OPERADORES ARITMÉTICOS: bytes -> MB con dos decimales
    let tamanoMB = archivo.size / (1024 * 1024);
    let tipo = "";

    // [m] SWITCH - CASE: según la extensión
    switch (extensionDe(archivo.name)) {
        case "jpg":
        case "jpeg":
        case "png":
            tipo = "imagen";
            break;
        case "pdf":
            tipo = "pdf";
            break;
        default:
            tipo = "no permitido";
    }

    // [m] IF - ELSE IF - ELSE
    if (tipo === "no permitido") {
        info.textContent = "Ese formato no está permitido. Usa JPG, PNG o PDF.";
        info.className = "info-archivo error";
        campo.value = "";
    } else if (tamanoMB > TAMANO_MAXIMO_MB) {
        info.textContent = "El archivo pesa " + tamanoMB.toFixed(2) + " MB. El máximo es " + TAMANO_MAXIMO_MB + " MB.";
        info.className = "info-archivo error";
        campo.value = "";
    } else {
        info.textContent = "✓ " + archivo.name + " (" + tamanoMB.toFixed(2) + " MB)";
        info.className = "info-archivo correcto";
        archivoRecetaValido = true;
        mostrarVistaPrevia(archivo, tipo);
    }
    actualizarBoton();
}

function mostrarVistaPrevia(archivo, tipo) {
    let vista = document.getElementById("vista-previa");
    // [n] DOM: crea la imagen o el aviso del PDF
    if (tipo === "imagen") {
        let imagen = document.createElement("img");
        imagen.src = URL.createObjectURL(archivo);
        imagen.alt = "Vista previa de la receta";
        vista.appendChild(imagen);
    } else {
        let aviso = document.createElement("p");
        aviso.textContent = "📄 Documento PDF listo para enviar.";
        vista.appendChild(aviso);
    }
    vista.classList.remove("oculto");
}


/* ---------- Fecha de emisión ---------- */

function revisarFecha() {
    let valor = document.getElementById("fecha-receta").value;
    let info = document.getElementById("info-fecha");
    fechaRecetaValida = false;

    if (valor === "") {
        info.textContent = "";
        actualizarBoton();
        return;
    }

    let partes = valor.split("-");
    let emision = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let diasPasados = Math.round((hoy - emision) / MS_POR_DIA);
    let diasRestantes = DIAS_VIGENCIA_RECETA - diasPasados;

    // [m] IF - ELSE IF ANIDADO: futura, vencida, por vencer o vigente
    if (diasPasados < 0) {
        info.textContent = "La fecha de emisión no puede ser futura.";
        info.className = "info-fecha error";
    } else if (diasRestantes < 0) {
        info.textContent = "Esta receta venció hace " + Math.abs(diasRestantes) + " día(s). Las recetas valen " + DIAS_VIGENCIA_RECETA + " días.";
        info.className = "info-fecha error";
    } else {
        if (diasRestantes <= 5) {
            info.textContent = "Vigente, pero vence en " + diasRestantes + " día(s).";
            info.className = "info-fecha aviso";
        } else {
            info.textContent = "Receta vigente (" + diasRestantes + " días restantes).";
            info.className = "info-fecha correcto";
        }
        fechaRecetaValida = true;
    }
    actualizarBoton();
}


/* ---------- Botón y envío ---------- */

function actualizarBoton() {
    let tipo = document.getElementById("tipo-receta").value;
    let confirmo = document.getElementById("confirmo-receta").checked;
    let boton = document.getElementById("boton-subir");

    // [l] OPERADORES LÓGICOS + [n] ATRIBUTOS: el botón se habilita solo si todo está bien
    if (archivoRecetaValido && fechaRecetaValida && tipo !== "" && confirmo) {
        boton.removeAttribute("disabled");
    } else {
        boton.setAttribute("disabled", "");
    }
}

function contarObservaciones() {
    let largo = document.getElementById("observaciones").value.length;
    document.getElementById("contador-observaciones").textContent = largo + " / 500 caracteres";
}

// [n] PROPIEDADES DE NAVEGACIÓN: pasa la clase "paso-activo" al paso indicado
function marcarPaso(numero) {
    let paso = document.querySelector(".pasos-grid").firstElementChild;
    let contador = 1;
    while (paso !== null) {
        if (contador <= numero) {
            paso.classList.add("paso-activo");
        } else {
            paso.classList.remove("paso-activo");
        }
        paso = paso.nextElementSibling;
        contador++;
    }
}

function enviarReceta(evento) {
    evento.preventDefault();
    if (obtenerUsuario() === null) {
        cargarPacienteReceta();
        return;
    }

    marcarPaso(2);
    let boton = document.getElementById("boton-subir");
    boton.setAttribute("disabled", "");
    boton.textContent = "Validando receta...";

    // Simulación de la revisión del químico farmacéutico
    setTimeout(function () {
        marcarPaso(3);
        boton.textContent = "Receta aprobada ✓";
        // [o] VENTANA FLOTANTE: al cerrarla vuelve a la farmacia
        abrirVentana("Receta aprobada", "Ya puedes comprar los medicamentos que requieren receta.", function () {
            window.location.href = "farmacia.html";
        });
    }, SEGUNDOS_VALIDACION * 1000);
}


/* ---------- Inicio ---------- */

function iniciarSubirReceta() {
    cargarPacienteReceta();
    mostrarProductosConReceta();

    // No se puede elegir una fecha futura en el calendario
    let hoy = new Date();
    document.getElementById("fecha-receta").max =
        hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");

    document.getElementById("receta").onchange = revisarArchivo;
    document.getElementById("fecha-receta").onchange = revisarFecha;
    document.getElementById("tipo-receta").onchange = actualizarBoton;
    document.getElementById("confirmo-receta").onchange = actualizarBoton;
    document.getElementById("observaciones").oninput = contarObservaciones;
    document.getElementById("form-receta").onsubmit = enviarReceta;

    marcarPaso(1);
}

iniciarSubirReceta();
