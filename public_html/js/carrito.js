// ======================================================
// carrito.js
// Funciones de la página Mi carrito
// ======================================================

// [l] CONSTANTES
const IGV_CARRITO = 0.18;
const COSTO_ENVIO_CARRITO = 10;
const ENVIO_GRATIS_DESDE_CARRITO = 150;

// [l] VARIABLES
let carrito = leerDatos("carrito", []);
let pilaEliminados = [];


// ======================================================
// MOSTRAR CARRITO
// ======================================================

// [m] FOR
function mostrarCarrito() {
    const tabla = document.querySelector(".tabla-carrito");

    if (!tabla) {
        return;
    }

    // Eliminamos las filas de productos que pueda tener la tabla.
    const filas = tabla.querySelectorAll("tr");

    // Conservamos solamente la primera fila, que contiene los encabezados.
    for (let i = filas.length - 1; i > 0; i--) {
        filas[i].remove();
    }

    let unidadesTotales = 0;
    let subtotal = 0;

    // [m] FOR
    for (let i = 0; i < carrito.length; i++) {
        const producto = carrito[i];

        const cantidad = Number(producto.cantidad);
        const precio = Number(producto.precio);
        const subtotalProducto = precio * cantidad;

        unidadesTotales += cantidad;
        subtotal += subtotalProducto;

        const fila = document.createElement("tr");

        // Producto
        const celdaProducto = document.createElement("td");
        celdaProducto.setAttribute("data-label", "Producto");

        const contenedorProducto = document.createElement("div");
        contenedorProducto.className = "producto";

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;

        const informacionProducto = document.createElement("div");

        const nombre = document.createElement("b");
        nombre.textContent = producto.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.requiereReceta
            ? "Requiere receta médica"
            : "Producto de farmacia";

        informacionProducto.appendChild(nombre);
        informacionProducto.appendChild(descripcion);

        contenedorProducto.appendChild(imagen);
        contenedorProducto.appendChild(informacionProducto);

        celdaProducto.appendChild(contenedorProducto);

        // Precio
        const celdaPrecio = document.createElement("td");
        celdaPrecio.setAttribute("data-label", "Precio");
        celdaPrecio.textContent = formatoSoles(precio);

        // Cantidad
        const celdaCantidad = document.createElement("td");
        celdaCantidad.setAttribute("data-label", "Cantidad");

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.min = "1";
        inputCantidad.max = String(producto.stock);
        inputCantidad.value = cantidad;
        inputCantidad.setAttribute(
            "aria-label",
            "Cantidad de " + producto.nombre
        );

        inputCantidad.onchange = function () {
            cambiarCantidad(i, inputCantidad.value);
        };

        celdaCantidad.appendChild(inputCantidad);

        // Subtotal
        const celdaSubtotal = document.createElement("td");
        celdaSubtotal.setAttribute("data-label", "Subtotal");
        celdaSubtotal.textContent = formatoSoles(subtotalProducto);

        // Acción
        const celdaAccion = document.createElement("td");
        celdaAccion.setAttribute("data-label", "Acción");

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "eliminar";
        botonEliminar.textContent = "Eliminar";

        // [n] BOTÓN CREADO DINÁMICAMENTE
        botonEliminar.onclick = function () {
            eliminarProducto(botonEliminar);
        };

        celdaAccion.appendChild(botonEliminar);

        fila.appendChild(celdaProducto);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaCantidad);
        fila.appendChild(celdaSubtotal);
        fila.appendChild(celdaAccion);

        tabla.appendChild(fila);
    }

    // Calculamos envío
    let envio = 0;

    if (subtotal > 0 && subtotal < ENVIO_GRATIS_DESDE_CARRITO) {
        envio = COSTO_ENVIO_CARRITO;
    }

    // Calculamos total
    const total = subtotal + envio;

    // IGV incluido en el total
    const igv = total - total / (1 + IGV_CARRITO);

    actualizarResumen(
        unidadesTotales,
        subtotal,
        envio,
        total,
        igv
    );

    actualizarContadorCarrito();

    configurarBotonDeshacer();

    // Si el carrito está vacío
    if (carrito.length === 0) {
        mostrarCarritoVacio();
    }
}


// ======================================================
// ACTUALIZAR RESUMEN
// ======================================================

function actualizarResumen(
    unidadesTotales,
    subtotal,
    envio,
    total,
    igv
) {
    const resumen = document.querySelector(".resumen");

    if (!resumen) {
        return;
    }

    const filas = resumen.querySelectorAll("table tr");

    if (filas.length >= 1) {
        filas[0].children[1].textContent =
            unidadesTotales + " unidades";
    }

    if (filas.length >= 2) {
        filas[1].children[1].textContent =
            formatoSoles(subtotal);
    }

    if (filas.length >= 3) {
        if (envio === 0 && subtotal >= ENVIO_GRATIS_DESDE) {
            filas[2].children[1].textContent = "Gratis";
        } else {
            filas[2].children[1].textContent =
                formatoSoles(envio);
        }
    }

    if (filas.length >= 4) {
        filas[3].children[1].textContent =
            formatoSoles(total);
    }

    // Agregamos información del IGV incluido
    let filaIGV = document.querySelector("#fila-igv");

    if (!filaIGV) {
        filaIGV = document.createElement("tr");
        filaIGV.id = "fila-igv";

        const celdaTexto = document.createElement("td");
        celdaTexto.textContent = "IGV incluido (18%):";

        const celdaValor = document.createElement("td");

        filaIGV.appendChild(celdaTexto);
        filaIGV.appendChild(celdaValor);

        const tablaResumen = resumen.querySelector("table");

        if (tablaResumen) {
            tablaResumen.appendChild(filaIGV);
        }
    }

    filaIGV.children[1].textContent = formatoSoles(igv);
}


// ======================================================
// ELIMINAR PRODUCTO
// ======================================================

// [n] ELIMINAR PRODUCTO
function eliminarProducto(boton) {
    const fila = boton.parentElement.parentElement;

    if (!fila) {
        return;
    }

    const filas = document.querySelectorAll(".tabla-carrito tr");

    let indice = -1;

    // [m] FOR
    for (let i = 1; i < filas.length; i++) {
        if (filas[i] === fila) {
            indice = i - 1;
            break;
        }
    }

    if (indice === -1 || indice >= carrito.length) {
        return;
    }

    const productoEliminado = carrito[indice];

    const confirmar = confirm(
        "¿Deseas eliminar " +
        productoEliminado.nombre +
        " del carrito?"
    );

    if (!confirmar) {
        return;
    }

    // Guardamos el producto eliminado para poder deshacer.
    pilaEliminados.push({
        producto: productoEliminado,
        indice: indice
    });

    // Eliminamos el producto del arreglo.
    carrito.splice(indice, 1);

    // Guardamos el nuevo carrito.
    guardarDatos("carrito", carrito);

    // Actualizamos la página.
    mostrarCarrito();

    actualizarContadorCarrito();

    mostrarBotonDeshacer();
}


// ======================================================
// DESHACER ELIMINACIÓN
// ======================================================

// [n] DESHACER
function deshacerEliminar() {
    if (pilaEliminados.length === 0) {
        return;
    }

    // Recuperamos el último producto eliminado.
    const eliminado = pilaEliminados.pop();

    carrito.splice(
        eliminado.indice,
        0,
        eliminado.producto
    );

    guardarDatos("carrito", carrito);

    mostrarCarrito();

    actualizarContadorCarrito();
}


// ======================================================
// BOTÓN DESHACER
// ======================================================

function configurarBotonDeshacer() {
    let boton = document.querySelector("#btn-deshacer");

    if (!boton) {
        boton = document.createElement("button");
        boton.id = "btn-deshacer";
        boton.type = "button";
        boton.textContent = "Deshacer";
        boton.style.display = "none";

        const acciones = document.querySelector(
            ".acciones-carrito"
        );

        if (acciones) {
            acciones.appendChild(boton);
        }
    }

    boton.onclick = deshacerEliminar;

    if (pilaEliminados.length > 0) {
        boton.style.display = "inline-block";
    } else {
        boton.style.display = "none";
    }
}

function mostrarBotonDeshacer() {
    configurarBotonDeshacer();

    const boton = document.querySelector("#btn-deshacer");

    if (boton) {
        boton.style.display = "inline-block";
    }
}


// ======================================================
// CAMBIAR CANTIDAD
// ======================================================

function cambiarCantidad(indice, valor) {
    if (indice < 0 || indice >= carrito.length) {
        return;
    }

    const producto = carrito[indice];

    let nuevaCantidad = Number(valor);

    if (!Number.isInteger(nuevaCantidad)) {
        alert("Ingresa una cantidad válida.");
        mostrarCarrito();
        return;
    }

    if (nuevaCantidad < 1) {
        alert("La cantidad mínima es 1.");
        mostrarCarrito();
        return;
    }

    if (nuevaCantidad > Number(producto.stock)) {
        alert(
            "No hay suficiente stock. Stock disponible: " +
            producto.stock
        );

        mostrarCarrito();
        return;
    }

    producto.cantidad = nuevaCantidad;

    guardarDatos("carrito", carrito);

    mostrarCarrito();

    actualizarContadorCarrito();
}


// ======================================================
// VACIAR CARRITO
// ======================================================

function vaciarCarrito() {
    if (carrito.length === 0) {
        alert("El carrito ya está vacío.");
        return;
    }

    const confirmar = confirm(
        "¿Estás seguro de que deseas vaciar todo el carrito?"
    );

    if (!confirmar) {
        return;
    }

    carrito = [];

    pilaEliminados = [];

    guardarDatos("carrito", carrito);

    mostrarCarrito();

    actualizarContadorCarrito();
}


// ======================================================
// CONTINUAR CON LA COMPRA
// ======================================================

function continuarCompra() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    window.location.href = "confirmar-pedido.html";
}


// ======================================================
// CARRITO VACÍO
// ======================================================

function mostrarCarritoVacio() {
    const tabla = document.querySelector(".tabla-carrito");

    if (!tabla) {
        return;
    }

    const fila = document.createElement("tr");

    const celda = document.createElement("td");

    celda.colSpan = 5;
    celda.textContent =
        "No hay productos en tu carrito.";

    celda.style.textAlign = "center";

    fila.appendChild(celda);
    tabla.appendChild(fila);

    const botonContinuar = document.querySelector(
        ".acciones-carrito .boton-principal"
    );

    if (botonContinuar) {
        botonContinuar.style.pointerEvents = "none";
        botonContinuar.style.opacity = "0.5";
    }

    const botonVaciar = document.querySelector(
        "#btn-vaciar-carrito"
    );

    if (botonVaciar) {
        botonVaciar.disabled = true;
    }
}


// ======================================================
// INICIALIZACIÓN
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    mostrarCarrito();

    // Botones eliminar que ya existen en el HTML.
    // Esto permite trabajar también con las filas
    // estáticas que tienes actualmente.
    const botonesEliminar =
        document.querySelectorAll(".eliminar");

    botonesEliminar.forEach(function (boton, indice) {
        boton.onclick = function () {
            eliminarProducto(boton);
        };
    });

    // Botón Vaciar carrito
    let botonVaciar = document.querySelector(
        "#btn-vaciar-carrito"
    );

    if (!botonVaciar) {
        botonVaciar = document.createElement("button");
        botonVaciar.id = "btn-vaciar-carrito";
        botonVaciar.type = "button";
        botonVaciar.textContent = "Vaciar carrito";
        botonVaciar.className = "boton-secundario";

        const acciones = document.querySelector(
            ".acciones-carrito"
        );

        if (acciones) {
            acciones.appendChild(botonVaciar);
        }
    }

    botonVaciar.onclick = vaciarCarrito;

    // Botón continuar
    const botonContinuar = document.querySelector(
        ".acciones-carrito .boton-principal"
    );

    if (botonContinuar) {
        botonContinuar.onclick = function (evento) {
            evento.preventDefault();
            continuarCompra();
        };
    }

    configurarBotonDeshacer();

    actualizarContadorCarrito();
});