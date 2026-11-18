/* ==========================================================
   confirmar-pedido.js - Confirmar pedido
   Toma el carrito y el usuario, pide entrega y método de pago,
   valida todo y guarda el pedido en "pedidos".
   Aquí va el ARREGLO BIDIMENSIONAL (matriz del resumen).
   Requiere js/comun.js
   ========================================================== */

// [l] CONSTANTES (los precios YA incluyen IGV)
const IGV = 0.18;
const COSTO_ENVIO = 10;
const ENVIO_GRATIS_DESDE = 150;

// [l] ARREGLO UNIDIMENSIONAL: nombres de las columnas de la matriz
const COLUMNAS_RESUMEN = ["Código", "Producto", "Cantidad", "Precio", "Subtotal"];

let usuario = obtenerUsuario();
let carrito = leerDatos("carrito", []);
let matrizResumen = [];


/* ---------- [l] ARREGLO BIDIMENSIONAL ---------- */

// Una fila por producto; columnas: [codigo, nombre, cantidad, precio, subtotal]
function crearMatrizResumen() {
    let matriz = [];
    for (let i = 0; i < carrito.length; i++) {
        let p = carrito[i];
        matriz[i] = [p.codigo, p.nombre, p.cantidad, p.precio, p.precio * p.cantidad];
    }
    return matriz;
}

// [m] FOR ANIDADO: filas (i) y columnas (j). matriz[i][4] es el subtotal de la fila i
function mostrarResumen(matriz) {
    let tabla = document.getElementById("tabla-resumen");
    let cuerpo = tabla.tBodies[0];
    // Se deja solo la fila de encabezado (la primera) y se vuelve a llenar
    while (cuerpo.rows.length > 1) {
        cuerpo.deleteRow(1);
    }

    for (let i = 0; i < matriz.length; i++) {
        let fila = document.createElement("tr");
        for (let j = 0; j < matriz[i].length; j++) {
            let celda = document.createElement("td");
            celda.setAttribute("data-label", COLUMNAS_RESUMEN[j]);

            if (j === 1) {
                // Columna Producto: miniatura + nombre
                let contenedor = document.createElement("div");
                contenedor.className = "celda-producto";
                let imagen = document.createElement("img");
                imagen.className = "miniatura";
                imagen.src = carrito[i].imagen;
                imagen.alt = matriz[i][j];
                let nombre = document.createElement("span");
                nombre.textContent = matriz[i][j];
                contenedor.appendChild(imagen);
                contenedor.appendChild(nombre);
                celda.appendChild(contenedor);
            } else if (j === 3 || j === 4) {
                celda.textContent = formatoSoles(matriz[i][j]);   // precio y subtotal
            } else {
                celda.textContent = matriz[i][j];
            }
            fila.appendChild(celda);
        }
        cuerpo.appendChild(fila);
    }
}


/* ---------- Entrega, totales y pago ---------- */

// [m] IF / ELSE   [n] DOM (style.display)
function cambiarEntrega() {
    let tipo = document.getElementById("tipo-entrega").value;
    let filaDireccion = document.getElementById("fila-direccion");
    let filaReferencia = document.getElementById("fila-referencia");

    if (tipo === "delivery") {
        filaDireccion.style.display = "";          // "" = vuelve a mostrarse
        filaReferencia.style.display = "";
    } else {
        filaDireccion.style.display = "none";
        filaReferencia.style.display = "none";
    }
    calcularTotales();
}

// [l] OPERADORES ARITMÉTICOS Y CONSTANTES
function calcularTotales() {
    let tipo = document.getElementById("tipo-entrega").value;

    let subtotal = 0;
    for (let i = 0; i < matrizResumen.length; i++) {
        subtotal += matrizResumen[i][4];           // columna 4 = subtotal de cada fila
    }

    let envio = 0;
    if (tipo === "delivery") {
        envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
    }                                              // recojo (o sin elegir) = 0

    let total = subtotal + envio;
    let igv = total - total / (1 + IGV);           // IGV que ya viene incluido

    document.getElementById("res-subtotal").textContent = formatoSoles(subtotal);
    if (tipo === "delivery" && envio === 0) {
        document.getElementById("res-envio").textContent = "Gratis";
    } else {
        document.getElementById("res-envio").textContent = formatoSoles(envio);
    }
    document.getElementById("res-igv").textContent = formatoSoles(igv);
    document.getElementById("res-total").textContent = formatoSoles(total);

    return { subtotal: subtotal, envio: envio, igv: igv, total: total };
}

// [m] SWITCH-CASE
function mostrarInfoPago() {
    let metodo = document.getElementById("metodo-pago").value;
    let mensaje = "";

    switch (metodo) {
        case "yape":
            mensaje = "Yapea al 999 888 777";
            break;
        case "tarjeta":
            mensaje = "Pagarás con POS al recibir";
            break;
        case "clinica":
            mensaje = "Pagas al recoger";
            break;
        default:
            mensaje = "";
    }
    document.getElementById("info-pago").textContent = mensaje;
}


/* ---------- Validación y confirmación ---------- */

// [m] IF ANIDADO   [l] OPERADORES LÓGICOS
function validarPedido() {
    let errores = [];
    let tipo = document.getElementById("tipo-entrega").value;
    let direccion = document.getElementById("direccion").value.trim();
    let metodo = document.getElementById("metodo-pago").value;
    let terminos = document.getElementById("acepto-terminos").checked;

    if (usuario === null) {
        errores.push("Debes iniciar sesión para comprar.");
    }

    if (tipo === "") {
        errores.push("Elige la forma de entrega.");
    } else if (tipo === "delivery" && direccion.length < 5) {
        errores.push("Para delivery escribe una dirección de al menos 5 letras.");
    }

    if (metodo === "") {
        errores.push("Elige un método de pago.");
    } else {
        if (metodo === "clinica") {
            if (tipo === "delivery") {             // decisión anidada
                errores.push("El pago en clínica solo es posible con recojo en la clínica.");
            }
        }
    }

    if (!terminos) {
        errores.push("Marca la casilla de confirmación de datos.");
    }

    if (errores.length > 0) {
        alert(errores.join("\n"));
        return false;
    }
    return true;
}

// [m] CONFIRM   [l] OBJETOS
function confirmarPedido() {
    if (!validarPedido()) {
        return;
    }

    let totales = calcularTotales();
    let seguro = confirm("¿Confirmas tu pedido por " + formatoSoles(totales.total) + "?");
    if (!seguro) {
        return;
    }

    let selectEntrega = document.getElementById("tipo-entrega");
    let selectPago = document.getElementById("metodo-pago");
    let esDelivery = selectEntrega.value === "delivery";

    let pedidos = leerDatos("pedidos", []);
    let pedido = {
        codigo: generarCodigo("HR", 126 + pedidos.length, 6),
        fecha: fechaHoy(),
        cliente: usuario.nombre,
        entrega: esDelivery ? "Delivery" : "Recojo en la clínica",
        direccion: esDelivery ? document.getElementById("direccion").value.trim() : "",
        referencia: esDelivery ? document.getElementById("referencia").value.trim() : "",
        metodoPago: selectPago.options[selectPago.selectedIndex].text,
        productos: carrito.slice(),                // copia de las líneas del carrito
        subtotal: totales.subtotal,
        envio: totales.envio,
        total: totales.total,
        estado: "Pedido recibido"
    };

    pedidos.push(pedido);
    guardarDatos("pedidos", pedidos);
    guardarDatos("carrito", []);                   // el carrito queda vacío
    actualizarContadorCarrito();
    window.location.href = "confirmacion.html";
}


/* ---------- Inicio ---------- */

function llenarDatosCliente() {
    if (usuario !== null) {
        document.getElementById("cli-nombre").textContent = usuario.nombre;
        document.getElementById("cli-dni").textContent = usuario.dni;
        document.getElementById("cli-correo").textContent = usuario.correo;
        document.getElementById("cli-celular").textContent = usuario.celular;
    }
}

function iniciarConfirmarPedido() {
    // 1) Debe haber sesión
    if (usuario === null) {
        let irLogin = confirm("Debes iniciar sesión para comprar. ¿Ir al login?");
        if (irLogin) {
            window.location.href = "login.html";
            return;
        }
    }

    // 2) Debe haber algo en el carrito
    if (carrito.length === 0) {
        window.location.href = "carrito.html";
        return;
    }

    llenarDatosCliente();
    matrizResumen = crearMatrizResumen();
    mostrarResumen(matrizResumen);
    cambiarEntrega();                              // oculta dirección/referencia y calcula
    actualizarContadorCarrito();
}

iniciarConfirmarPedido();
