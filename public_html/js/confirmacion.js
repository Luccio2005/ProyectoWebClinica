/* ==========================================================
   confirmacion.js - Pedido confirmado
   Muestra el último pedido que guardó confirmar-pedido.js en
   localStorage ("pedidos").
   ========================================================== */

// [l] CONSTANTES
const TASA_IGV = 0.18;
const DIAS_DELIVERY = 2;


/* ---------- Datos ---------- */

function obtenerUltimoPedido() {
    let lista = leerDatos("pedidos", []);
    // [m] IF - ELSE
    if (lista.length === 0) {
        return null;
    }
    return lista[lista.length - 1];          // el último que se guardó
}

// [m] WHILE: suma días saltando domingos (no hay reparto los domingos)
function fechaEstimadaEntrega() {
    let fecha = new Date();
    let sumados = 0;
    while (sumados < DIAS_DELIVERY) {
        fecha.setDate(fecha.getDate() + 1);
        if (fecha.getDay() !== 0) {
            sumados++;
        }
    }
    return String(fecha.getDate()).padStart(2, "0") + "/" + String(fecha.getMonth() + 1).padStart(2, "0") + "/" + fecha.getFullYear();
}


/* ---------- Mostrar en la página ---------- */

function mostrarSinPedido() {
    document.getElementById("titulo-confirmacion").textContent = "Aún no tienes pedidos";
    document.getElementById("texto-confirmacion").textContent = "Cuando confirmes una compra en la farmacia, verás aquí su resumen.";

    // [n] DOM: se ocultan las secciones que no tienen datos
    let secciones = ["seccion-informacion", "seccion-productos", "seccion-total", "seccion-pasos"];
    for (let i = 0; i < secciones.length; i++) {
        document.getElementById(secciones[i]).classList.add("oculto");
    }
    document.querySelector(".icono").textContent = "!";
}

function mostrarInformacion(pedido) {
    // [l] ARREGLO BIDIMENSIONAL: cada fila es [dato, valor]
    let filas = [
        ["Número de pedido:", pedido.codigo],
        ["Fecha:", pedido.fecha],
        ["Cliente:", pedido.cliente],
        ["Estado:", pedido.estado],
        ["Modalidad:", pedido.entrega],
        ["Método de pago:", pedido.metodoPago]
    ];
    if (pedido.entrega === "Delivery") {
        filas.push(["Dirección:", pedido.direccion + (pedido.referencia !== "" ? " (" + pedido.referencia + ")" : "")]);
    }

    let cuerpo = document.getElementById("tabla-informacion");
    // [m] FOR anidado: filas y columnas de la matriz
    for (let i = 0; i < filas.length; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < filas[i].length; j++) {
            let td = document.createElement("td");
            if (j === 0) {
                let negrita = document.createElement("b");
                negrita.textContent = filas[i][j];
                td.appendChild(negrita);
            } else {
                td.textContent = filas[i][j];
            }
            if (filas[i][0] === "Estado:" && j === 1) {
                td.className = "estado";
            }
            tr.appendChild(td);
        }
        cuerpo.appendChild(tr);
    }
}

function mostrarProductosConfirmacion(pedido) {
    let cuerpo = document.getElementById("tabla-productos-confirmacion");
    // [m] FOREACH: una fila por producto
    pedido.productos.forEach(function (producto) {
        let tr = document.createElement("tr");
        let datos = [producto.nombre, formatoSoles(producto.precio), producto.cantidad, formatoSoles(producto.precio * producto.cantidad)];
        datos.forEach(function (valor) {
            let td = document.createElement("td");
            td.textContent = valor;
            tr.appendChild(td);
        });
        cuerpo.appendChild(tr);
    });
}

function mostrarTotales(pedido) {
    // [l] OPERADORES ARITMÉTICOS: IGV que ya está incluido en el total
    let igv = pedido.total - pedido.total / (1 + TASA_IGV);
    document.getElementById("conf-subtotal").textContent = formatoSoles(pedido.subtotal);
    document.getElementById("conf-envio").textContent = pedido.envio === 0 ? "Gratis" : formatoSoles(pedido.envio);
    document.getElementById("conf-igv").textContent = formatoSoles(igv);
    document.getElementById("conf-total").textContent = formatoSoles(pedido.total);
}

function mostrarSiguientesPasos(pedido) {
    let entrega = "";
    // [m] IF - ELSE
    if (pedido.entrega === "Delivery") {
        entrega = "Tu pedido llegará a " + pedido.direccion + " a más tardar el " + fechaEstimadaEntrega() + ".";
    } else {
        entrega = "Recógelo en la farmacia del primer piso con tu DNI desde mañana, de 8:00 a 20:00.";
    }

    let pago = "";
    let metodo = pedido.metodoPago.toLowerCase();
    // [m] IF - ELSE IF - ELSE según el método de pago
    if (metodo.indexOf("yape") !== -1) {
        pago = "Si aún no yapeaste, hazlo al 999 888 777 indicando el número " + pedido.codigo + ".";
    } else if (metodo.indexOf("tarjeta") !== -1) {
        pago = "Pagarás con tarjeta al recibir tu pedido; el repartidor llevará POS.";
    } else {
        pago = "Pagarás en caja al momento de recoger tu pedido.";
    }

    document.getElementById("paso-entrega").textContent = entrega;
    document.getElementById("paso-pago").textContent = pago;
}

function imprimirConfirmacion() {
    // Objeto window (semana 12)
    window.print();
}


/* ---------- Inicio ---------- */

function iniciarConfirmacion() {
    let pedido = obtenerUltimoPedido();
    if (pedido === null) {
        mostrarSinPedido();
        return;
    }
    mostrarInformacion(pedido);
    mostrarProductosConfirmacion(pedido);
    mostrarTotales(pedido);
    mostrarSiguientesPasos(pedido);
}

iniciarConfirmacion();
