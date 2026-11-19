// detalle-pedido.js

const IGV = 0.18;

let pedidos = leerDatos("pedidos", []);

const ESTADOS = [
    "Pedido recibido",
    "Preparando pedido",
    "En camino",
    "Entregado"
];

// [n] WINDOW + URLSearchParams
function obtenerCodigo() {

    const parametros =
        new URLSearchParams(window.location.search);

    const codigo =
        parametros.get("codigo");

    if (codigo) {
        return codigo;
    }

    if (pedidos.length > 0) {
        return pedidos[pedidos.length - 1].codigo;
    }

    return null;
}

// [m] WHILE + [l] OPERADORES LÓGICOS
function buscarPedido(codigo) {

    let i = 0;

    while (
        i < pedidos.length &&
        pedidos[i].codigo !== codigo
    ) {
        i++;
    }

    if (i === pedidos.length) {
        return null;
    }

    return pedidos[i];
}

// [n] DOM + [l] ARITMÉTICOS
function mostrarDetalle(pedido) {

    const tablas = document.querySelectorAll(
        ".datos"
    );

    if (tablas.length >= 3) {

        // Información del pedido
        const datosPedido =
            tablas[0].querySelectorAll("tr");

        datosPedido[0].children[1].textContent =
            pedido.codigo;

        datosPedido[1].children[1].textContent =
            pedido.fecha;

        datosPedido[2].children[1].textContent =
            pedido.estado;

        datosPedido[3].children[1].textContent =
            pedido.entrega;

        // Información de entrega
        const datosEntrega =
            tablas[1].querySelectorAll("tr");

        datosEntrega[0].children[1].textContent =
            pedido.direccion || "No especificada";

        datosEntrega[1].children[1].textContent =
            pedido.referencia || "No especificada";

        // Información de pago
        const datosPago =
            tablas[2].querySelectorAll("tr");

        datosPago[0].children[1].textContent =
            pedido.metodoPago;

        datosPago[1].children[1].textContent =
            formatoSoles(pedido.subtotal);

        datosPago[2].children[1].textContent =
            formatoSoles(pedido.envio);

        datosPago[3].children[1].textContent =
            formatoSoles(pedido.total);
    }

    const tablaProductos =
        document.querySelector(".tabla-productos");

    if (!tablaProductos) {
        return;
    }

    const filas =
        tablaProductos.querySelectorAll("tr");

    for (let i = 1; i < filas.length; i++) {
        filas[i].remove();
    }

    pedido.productos.forEach(function (producto) {

        const fila = document.createElement("tr");

        const nombre = document.createElement("td");
        nombre.textContent = producto.nombre;

        const precio = document.createElement("td");
        precio.textContent =
            formatoSoles(producto.precio);

        const cantidad = document.createElement("td");
        cantidad.textContent =
            producto.cantidad;

        const subtotal = document.createElement("td");

        subtotal.textContent =
            formatoSoles(
                producto.precio *
                producto.cantidad
            );

        fila.appendChild(nombre);
        fila.appendChild(precio);
        fila.appendChild(cantidad);
        fila.appendChild(subtotal);

        tablaProductos.appendChild(fila);
    });
}

// [n] PROPIEDADES DE NAVEGACIÓN
function mostrarSeguimiento(pedido) {

    const pasos =
        document.querySelector(
            ".seguimiento table tr"
        );

    if (!pasos) {
        return;
    }

    let pasoActual =
        ESTADOS.indexOf(pedido.estado);

    if (pasoActual === -1) {
        pasoActual = 0;
    }

    let elemento = pasos.firstElementChild;

    let posicion = 0;

    while (elemento) {

        elemento.classList.remove(
            "paso-activo"
        );

        if (posicion <= pasoActual) {

            elemento.classList.add(
                "paso-activo"
            );
        }

        elemento =
            elemento.nextElementSibling;

        posicion++;
    }

    // Cancelado
    if (pedido.estado === "Cancelado") {

        const seguimiento =
            document.querySelector(
                ".seguimiento"
            );

        const aviso =
            document.createElement("p");

        aviso.textContent =
            "Este pedido fue cancelado.";

        aviso.style.color = "crimson";
        aviso.style.fontWeight = "bold";

        seguimiento.appendChild(aviso);
    }
}

// Avanza el estado para la demostración
function avanzarEstado() {

    const codigo =
        obtenerCodigo();

    const pedido =
        buscarPedido(codigo);

    if (!pedido) {
        return;
    }

    if (
        pedido.estado === "Entregado" ||
        pedido.estado === "Cancelado"
    ) {

        alert(
            "El pedido ya no puede avanzar de estado."
        );

        return;
    }

    const posicion =
        ESTADOS.indexOf(pedido.estado);

    pedido.estado =
        ESTADOS[posicion + 1];

    guardarDatos("pedidos", pedidos);

    mostrarDetalle(pedido);
    mostrarSeguimiento(pedido);
}

// [m] CONFIRM
function volverAComprar() {

    const codigo =
        obtenerCodigo();

    const pedido =
        buscarPedido(codigo);

    if (!pedido) {
        return;
    }

    const confirmar =
        confirm(
            "¿Deseas agregar estos productos nuevamente al carrito?"
        );

    if (!confirmar) {
        return;
    }

    let carrito =
        leerDatos("carrito", []);

    pedido.productos.forEach(function (producto) {

        const productoExistente =
            carrito.find(function (item) {
                return item.codigo === producto.codigo;
            });

        if (productoExistente) {

            productoExistente.cantidad +=
                producto.cantidad;

        } else {

            carrito.push({
                codigo: producto.codigo,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: producto.cantidad,
                stock: producto.stock || 99,
                imagen: producto.imagen || "",
                requiereReceta:
                    producto.requiereReceta || false
            });
        }
    });

    guardarDatos("carrito", carrito);

    actualizarContadorCarrito();

    window.location.href =
        "carrito.html";
}

// [n] WINDOW
function imprimirComprobante() {
    window.print();
}

// Mostrar mensaje cuando no existe el pedido
function mostrarPedidoNoEncontrado() {

    const titulo =
        document.querySelector(".titulo h1");

    if (titulo) {
        titulo.textContent =
            "Pedido no encontrado";
    }

    const secciones =
        document.querySelectorAll(".seccion");

    secciones.forEach(function (seccion) {
        seccion.style.display = "none";
    });

    const seguimiento =
        document.querySelector(".seguimiento");

    if (seguimiento) {
        seguimiento.style.display = "none";
    }

    const acciones =
        document.querySelector(".acciones");

    if (acciones) {

        acciones.innerHTML = `
            <a href="mis-pedidos.html"
               class="boton-principal">
               Ir a mis pedidos
            </a>
        `;
    }
}

// Crear botones que pide el PDF
function crearBotones() {

    const acciones =
        document.querySelector(".acciones");

    if (!acciones) {
        return;
    }

    const botonImprimir =
        document.createElement("button");

    botonImprimir.textContent =
        "Imprimir comprobante";

    botonImprimir.className =
        "boton-principal";

    botonImprimir.onclick =
        function () {
            imprimirComprobante();
        };

    const botonComprar =
        document.createElement("button");

    botonComprar.textContent =
        "Volver a comprar";

    botonComprar.className =
        "boton-secundario";

    botonComprar.onclick =
        function () {
            volverAComprar();
        };

    const botonAvanzar =
        document.createElement("button");

    botonAvanzar.textContent =
        "Avanzar estado (simulación)";

    botonAvanzar.className =
        "boton-secundario";

    botonAvanzar.onclick =
        function () {
            avanzarEstado();
        };

    acciones.appendChild(botonImprimir);
    acciones.appendChild(botonComprar);
    acciones.appendChild(botonAvanzar);
}

// Inicio
document.addEventListener("DOMContentLoaded", function () {

    const codigo =
        obtenerCodigo();

    const pedido =
        buscarPedido(codigo);

    if (!pedido) {

        mostrarPedidoNoEncontrado();

        return;
    }

    mostrarDetalle(pedido);
    mostrarSeguimiento(pedido);
    crearBotones();
});