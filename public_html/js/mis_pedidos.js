// mis-pedidos.js

let pedidos = leerDatos("pedidos", []);

// Datos de ejemplo para que la página no aparezca vacía
const pedidosEjemplo = [
    {
        codigo: "HR-000125",
        fecha: "08/09/2026",
        cliente: "Paciente",
        entrega: "Delivery",
        direccion: "Av. Daniel Alcides Carreón 240, Arequipa",
        referencia: "Frente a la entrada principal",
        metodoPago: "Tarjeta de crédito o débito",
        productos: [
            {
                codigo: "P001",
                nombre: "Protector Solar FPS 50",
                precio: 35,
                cantidad: 2,
                stock: 20,
                imagen: "Imagenes/producto1.webp"
            },
            {
                codigo: "P003",
                nombre: "Gel Antibacterial",
                precio: 12,
                cantidad: 1,
                stock: 20,
                imagen: "Imagenes/producto3.webp"
            },
            {
                codigo: "P007",
                nombre: "Vendas Elásticas",
                precio: 15,
                cantidad: 1,
                stock: 20,
                imagen: "Imagenes/producto7.jpg"
            }
        ],
        subtotal: 97,
        envio: 10,
        total: 107,
        estado: "Pedido recibido"
    },

    {
        codigo: "HR-000108",
        fecha: "02/09/2026",
        cliente: "Paciente",
        entrega: "Delivery",
        direccion: "Arequipa",
        referencia: "",
        metodoPago: "Tarjeta",
        productos: [],
        subtotal: 48,
        envio: 0,
        total: 48,
        estado: "Entregado"
    },

    {
        codigo: "HR-000091",
        fecha: "25/08/2026",
        cliente: "Paciente",
        entrega: "Recojo en la clínica",
        direccion: "",
        referencia: "",
        metodoPago: "Pago en clínica",
        productos: [],
        subtotal: 72,
        envio: 0,
        total: 72,
        estado: "Entregado"
    },

    {
        codigo: "HR-000075",
        fecha: "17/08/2026",
        cliente: "Paciente",
        entrega: "Delivery",
        direccion: "Arequipa",
        referencia: "",
        metodoPago: "Tarjeta",
        productos: [],
        subtotal: 35,
        envio: 10,
        total: 35,
        estado: "Cancelado"
    }
];

if (pedidos.length === 0) {
    pedidos = pedidosEjemplo;
}

// [m] SWITCH-CASE + FOR
function calcularEstadisticas() {

    let totalPedidos = pedidos.length;
    let recibidos = 0;
    let entregados = 0;
    let cancelados = 0;

    for (let i = 0; i < pedidos.length; i++) {

        switch (pedidos[i].estado) {

            case "Pedido recibido":
                recibidos++;
                break;

            case "Entregado":
                entregados++;
                break;

            case "Cancelado":
                cancelados++;
                break;
        }
    }

    const numeros = document.querySelectorAll(".dato-pedido");

    if (numeros.length >= 4) {

        numeros[0].textContent = totalPedidos;
        numeros[1].textContent = recibidos;
        numeros[2].textContent = entregados;
        numeros[3].textContent = cancelados;
    }
}

// [l] ARREGLOS + [n] DOM
function mostrarUltimoPedido() {

    const titulo = document.querySelector(
        ".contenedor h2"
    );

    if (!titulo || pedidos.length === 0) {
        return;
    }

    const ultimoPedido = pedidos[pedidos.length - 1];

    // No reemplazamos el título principal del historial.
    // Se agrega una sección informativa.
    let seccionUltimo = document.querySelector(
        ".ultimo-pedido"
    );

    if (!seccionUltimo) {

        seccionUltimo = document.createElement("div");
        seccionUltimo.className = "ultimo-pedido";

        titulo.parentElement.insertBefore(
            seccionUltimo,
            titulo
        );
    }

    seccionUltimo.innerHTML =
        "<h2>Tu último pedido</h2>" +
        "<p><b>" +
        ultimoPedido.codigo +
        "</b> - " +
        ultimoPedido.estado +
        "</p>";
}

// [m] SWITCH
function claseEstado(estado) {

    switch (estado) {

        case "Pedido recibido":
            return "recibido";

        case "Entregado":
            return "entregado";

        case "Cancelado":
            return "cancelado";

        default:
            return "";
    }
}

// [m] FOREACH + [n] ATRIBUTOS
function mostrarHistorial(lista) {

    const tabla = document.querySelector(
        ".tabla-pedidos"
    );

    if (!tabla) {
        return;
    }

    const filas = tabla.querySelectorAll("tr");

    // Elimina las filas antiguas dejando encabezado
    for (let i = 1; i < filas.length; i++) {
        filas[i].remove();
    }

    lista.forEach(function (pedido) {

        const fila = document.createElement("tr");

        const celdaCodigo = document.createElement("td");
        celdaCodigo.textContent = pedido.codigo;

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = pedido.fecha;

        const celdaProductos = document.createElement("td");

        let cantidadProductos = 0;

        if (pedido.productos) {

            pedido.productos.forEach(function (producto) {
                cantidadProductos += producto.cantidad;
            });
        }

        celdaProductos.textContent =
            cantidadProductos +
            (cantidadProductos === 1
                ? " producto"
                : " productos");

        const celdaTotal = document.createElement("td");
        celdaTotal.textContent =
            formatoSoles(pedido.total);

        const celdaEstado = document.createElement("td");
        celdaEstado.textContent = pedido.estado;
        celdaEstado.className =
            claseEstado(pedido.estado);

        const celdaDetalle = document.createElement("td");

        const enlace = document.createElement("a");

        enlace.href =
            "detalle-pedido.html?codigo=" +
            encodeURIComponent(pedido.codigo);

        enlace.className = "boton-detalle";
        enlace.textContent = "Ver detalle";

        celdaDetalle.appendChild(enlace);

        // Solo se puede cancelar si fue recibido
        if (pedido.estado === "Pedido recibido") {

            const botonCancelar =
                document.createElement("button");

            botonCancelar.textContent = "Cancelar";
            botonCancelar.className = "boton-detalle";
            botonCancelar.style.marginLeft = "5px";

            botonCancelar.onclick = function () {
                cancelarPedido(pedido.codigo);
            };

            celdaDetalle.appendChild(botonCancelar);
        }

        fila.appendChild(celdaCodigo);
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaProductos);
        fila.appendChild(celdaTotal);
        fila.appendChild(celdaEstado);
        fila.appendChild(celdaDetalle);

        tabla.appendChild(fila);
    });
}

// [l] OPERADORES LÓGICOS
function filtrarPedidos() {

    const input = document.querySelector(
        "#buscar-pedido"
    );

    const select = document.querySelector(
        "#filtro-estado"
    );

    const texto = input
        ? input.value.toLowerCase()
        : "";

    const estado = select
        ? select.value
        : "todos";

    const listaFiltrada = pedidos.filter(function (pedido) {

        const coincideCodigo =
            pedido.codigo.toLowerCase().includes(texto);

        return coincideCodigo &&
            (estado === "todos" ||
             pedido.estado === estado);
    });

    mostrarHistorial(listaFiltrada);
}

// [m] BURBUJA
function ordenarBurbuja(lista, criterio) {

    const copia = [...lista];

    for (let i = 0; i < copia.length - 1; i++) {

        for (let j = 0; j < copia.length - 1 - i; j++) {

            let cambiar = false;

            if (criterio === "total") {

                if (copia[j].total < copia[j + 1].total) {
                    cambiar = true;
                }

            } else if (criterio === "fecha") {

                if (
                    new Date(copia[j].fecha.split("/").reverse().join("-")) <
                    new Date(copia[j + 1].fecha.split("/").reverse().join("-"))
                ) {
                    cambiar = true;
                }
            }

            if (cambiar) {

                const auxiliar = copia[j];
                copia[j] = copia[j + 1];
                copia[j + 1] = auxiliar;
            }
        }
    }

    return copia;
}

// [m] IF / ELSE + CONFIRM
function cancelarPedido(codigo) {

    let pedidoEncontrado = null;

    for (let i = 0; i < pedidos.length; i++) {

        if (pedidos[i].codigo === codigo) {
            pedidoEncontrado = pedidos[i];
            break;
        }
    }

    if (!pedidoEncontrado) {
        return;
    }

    if (pedidoEncontrado.estado === "Pedido recibido") {

        const confirmar = confirm(
            "¿Deseas cancelar el pedido " +
            codigo +
            "?"
        );

        if (confirmar) {

            pedidoEncontrado.estado = "Cancelado";

            guardarDatos("pedidos", pedidos);

            mostrarHistorial(pedidos);
            calcularEstadisticas();
            mostrarUltimoPedido();
        }

    } else {

        alert(
            "Ya no se puede cancelar este pedido."
        );
    }
}

// Crea los controles que pide el PDF
function crearControles() {

    const contenedor = document.querySelector(
        ".contenedor"
    );

    if (!contenedor) {
        return;
    }

    const controles = document.createElement("div");

    controles.className = "controles-pedidos";

    const buscador = document.createElement("input");

    buscador.id = "buscar-pedido";
    buscador.type = "text";
    buscador.placeholder =
        "Buscar por número de pedido";

    buscador.oninput = function () {
        filtrarPedidos();
    };

    const filtro = document.createElement("select");

    filtro.id = "filtro-estado";

    filtro.innerHTML = `
        <option value="todos">Todos los estados</option>
        <option value="Pedido recibido">Pedido recibido</option>
        <option value="Preparando pedido">Preparando pedido</option>
        <option value="En camino">En camino</option>
        <option value="Entregado">Entregado</option>
        <option value="Cancelado">Cancelado</option>
    `;

    filtro.onchange = function () {
        filtrarPedidos();
    };

    const orden = document.createElement("select");

    orden.id = "orden-pedidos";

    orden.innerHTML = `
        <option value="ninguno">Orden original</option>
        <option value="total">Total mayor a menor</option>
        <option value="fecha">Fecha más reciente</option>
    `;

    orden.onchange = function () {

        if (orden.value === "ninguno") {
            filtrarPedidos();
        } else {

            const texto =
                buscador.value.toLowerCase();

            const estado =
                filtro.value;

            let lista = pedidos.filter(function (pedido) {

                return pedido.codigo
                    .toLowerCase()
                    .includes(texto) &&
                    (estado === "todos" ||
                     pedido.estado === estado);
            });

            lista = ordenarBurbuja(
                lista,
                orden.value
            );

            mostrarHistorial(lista);
        }
    };

    controles.appendChild(buscador);
    controles.appendChild(filtro);
    controles.appendChild(orden);

    contenedor.insertBefore(
        controles,
        contenedor.querySelector(".tabla-pedidos")
    );
}

// Inicio
document.addEventListener("DOMContentLoaded", function () {

    crearControles();
    calcularEstadisticas();
    mostrarUltimoPedido();
    mostrarHistorial(pedidos);
});