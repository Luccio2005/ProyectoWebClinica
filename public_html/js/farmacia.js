/* ==========================================================
   farmacia.js - Farmacia virtual
   Genera las 16 tarjetas desde un arreglo, permite buscar,
   filtrar, ordenar y agregar al carrito.
   Requiere js/comun.js (leerDatos, guardarDatos, abrirVentana,
   actualizarContadorCarrito).
   ========================================================== */

// [l] CLASES Y OBJETOS
class Producto {
    constructor(codigo, nombre, precio, categoria, stock, requiereReceta, imagen, descripcion) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.precio = precio;               // número (35), NO texto ("S/ 35.00")
        this.categoria = categoria;
        this.stock = stock;
        this.requiereReceta = requiereReceta;
        this.imagen = imagen;
        this.descripcion = descripcion;
    }

    // [m] IF / ELSE IF / ELSE
    estadoStock() {
        if (this.stock === 0) {
            return "Agotado";
        } else if (this.stock <= 5) {
            return "Pocas unidades";
        } else {
            return "Disponible";
        }
    }
}

// [l] ARREGLO UNIDIMENSIONAL (de objetos)
const productos = [
    new Producto("P001", "Protector Solar FPS 50", 35, "solar", 20, false, "Imagenes/producto1.webp", "Protección contra los rayos solares para el cuidado de la piel."),
    new Producto("P002", "Crema Hidratante", 28, "piel", 15, false, "Imagenes/producto2.webp", "Crema para mantener la hidratación y cuidado de la piel."),
    new Producto("P003", "Gel Antibacterial", 12, "higiene", 30, false, "Imagenes/producto3.webp", "Producto para la higiene y desinfección de las manos."),
    new Producto("P004", "Termómetro Digital", 25, "auxilios", 3, false, "Imagenes/producto4.webp", "Dispositivo para medir la temperatura corporal."),
    new Producto("P005", "Vitamina C", 18, "vitaminas", 5, false, "Imagenes/producto5.jpg", "Suplemento para complementar una alimentación equilibrada."),
    new Producto("P006", "Alcohol Medicinal", 10, "higiene", 40, false, "Imagenes/producto6.jpg", "Producto para limpieza y desinfección."),
    new Producto("P007", "Vendas Elásticas", 15, "auxilios", 12, false, "Imagenes/producto7.jpg", "Producto para primeros auxilios y soporte."),
    new Producto("P008", "Gasas Estériles", 9, "auxilios", 0, false, "Imagenes/producto8.jpg", "Gasas para curaciones y primeros auxilios."),
    new Producto("P009", "Paracetamol 500 mg", 8.5, "receta", 50, true, "Imagenes/producto9.jpg", "Medicamento utilizado para aliviar dolor y reducir la fiebre."),
    new Producto("P010", "Amoxicilina 500 mg", 25, "receta", 4, true, "Imagenes/producto10.jpg", "Antibiótico utilizado bajo indicación médica."),
    new Producto("P011", "Ibuprofeno 400 mg", 12, "receta", 25, true, "Imagenes/producto11.webp", "Medicamento utilizado para aliviar determinados dolores e inflamaciones."),
    new Producto("P012", "Antialérgico", 20, "receta", 18, true, "Imagenes/producto12.webp", "Medicamento utilizado para el tratamiento de determinados síntomas."),
    new Producto("P013", "Crema Dermatológica", 32, "piel", 10, false, "Imagenes/producto13.jpg", "Producto para el cuidado de determinadas afecciones de la piel."),
    new Producto("P014", "Jarabe para la tos", 22, "auxilios", 14, false, "Imagenes/producto14.jpg", "Producto destinado al alivio de determinados síntomas respiratorios."),
    new Producto("P015", "Tiras Reactivas", 30, "auxilios", 0, false, "Imagenes/producto15.jpg", "Accesorios para el control de determinados parámetros de salud."),
    new Producto("P016", "Botiquín de Primeros Auxilios", 55, "auxilios", 8, false, "Imagenes/producto16.webp", "Kit básico para atención de pequeñas emergencias.")
];

let carrito = leerDatos("carrito", []);


/* ---------- Categorías ---------- */

// [m] SWITCH-CASE
function nombreCategoria(clave) {
    switch (clave) {
        case "solar":
            return "☀️ Protección Solar";
        case "piel":
            return "💧 Cuidado de Piel";
        case "higiene":
            return "🧴 Higiene & Desinfección";
        case "auxilios":
            return "🌡️ Primeros Auxilios";
        case "vitaminas":
            return "💊 Vitaminas & Suplementos";
        case "receta":
            return "🩺 Medicamentos con Receta";
        default:
            return "Otros";
    }
}


/* ---------- Mostrar productos ---------- */

// [m] FOREACH  [n] DOM: createElement / appendChild / setAttribute
function mostrarProductos(lista) {
    let grilla = document.querySelector(".productos-grid");
    grilla.innerHTML = "";                       // se vacía y se vuelve a llenar

    let contador = document.getElementById("resultado-productos");
    if (contador !== null) {
        contador.textContent = "Mostrando " + lista.length + " de " + productos.length + " productos";
    }

    if (lista.length === 0) {
        let aviso = document.createElement("p");
        aviso.className = "sin-resultados";
        aviso.textContent = "No encontramos productos con esa búsqueda. Prueba con otra palabra o categoría.";
        grilla.appendChild(aviso);
        return;
    }

    lista.forEach(function (p) {
        let tarjeta = document.createElement("div");
        tarjeta.className = "producto-card";

        let imagen = document.createElement("img");
        imagen.src = p.imagen;
        imagen.alt = p.nombre;
        imagen.className = "img-responsive producto-img";

        // nombreCategoria() (switch-case) rotula cada tarjeta
        let etiquetaCategoria = document.createElement("small");
        etiquetaCategoria.className = "categoria-producto";
        etiquetaCategoria.textContent = nombreCategoria(p.categoria);

        let titulo = document.createElement("h3");
        titulo.textContent = p.nombre;

        let descripcion = document.createElement("p");
        descripcion.textContent = p.descripcion;

        let precio = document.createElement("p");
        precio.className = "precio";
        precio.textContent = formatoSoles(p.precio);

        let tipo = document.createElement("p");
        if (p.requiereReceta) {
            tipo.className = "receta";
            tipo.textContent = "Requiere receta";
        } else {
            tipo.className = "tipo";
            tipo.textContent = "Venta libre";
        }

        // Estado del stock: Agotado / Pocas unidades / Disponible
        let estado = p.estadoStock();
        let etiquetaStock = document.createElement("p");
        etiquetaStock.className = "estado-stock";
        if (estado === "Agotado") {
            etiquetaStock.className += " stock-agotado";
        } else if (estado === "Pocas unidades") {
            etiquetaStock.className += " stock-pocas";
        } else {
            etiquetaStock.className += " stock-disponible";
        }
        etiquetaStock.textContent = estado;
        if (estado === "Pocas unidades") {
            etiquetaStock.textContent = estado + " (" + p.stock + ")";
        }

        // Cantidad (.cantidad-box) y botón: el botón queda justo DESPUÉS de la caja
        let cajaCantidad = document.createElement("div");
        cajaCantidad.className = "cantidad-box";
        let etiqueta = document.createElement("label");
        etiqueta.textContent = "Cantidad:";
        let entrada = document.createElement("input");
        entrada.type = "number";
        entrada.value = 1;
        entrada.min = 1;
        if (p.stock > 0) {
            entrada.max = p.stock;
        }
        cajaCantidad.appendChild(etiqueta);
        cajaCantidad.appendChild(entrada);

        let boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-producto";
        boton.textContent = "Agregar al carrito";
        boton.onclick = function () {
            agregarAlCarrito(p.codigo, boton);
        };

        let botonVarias = document.createElement("button");
        botonVarias.type = "button";
        botonVarias.className = "boton-secundario";
        botonVarias.textContent = "Agregar varias unidades";
        botonVarias.onclick = function () {
            agregarVarias(p.codigo);
        };

        // Si está agotado se bloquea todo
        if (p.stock === 0) {
            boton.setAttribute("disabled", "");
            boton.textContent = "Agotado";
            botonVarias.setAttribute("disabled", "");
            entrada.setAttribute("disabled", "");
        }

        tarjeta.appendChild(imagen);
        tarjeta.appendChild(etiquetaCategoria);
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(descripcion);
        tarjeta.appendChild(precio);
        tarjeta.appendChild(tipo);
        tarjeta.appendChild(etiquetaStock);
        tarjeta.appendChild(cajaCantidad);
        tarjeta.appendChild(boton);
        tarjeta.appendChild(botonVarias);

        // Los medicamentos con receta enlazan a la página de subir receta
        if (p.requiereReceta) {
            let enlaceReceta = document.createElement("a");
            enlaceReceta.href = "subir-receta.html";
            enlaceReceta.className = "enlace-receta";
            enlaceReceta.textContent = "Subir mi receta";
            tarjeta.appendChild(enlaceReceta);
        }

        grilla.appendChild(tarjeta);
    });
}


/* ---------- Buscar, filtrar y ordenar ---------- */

// [m] FOR  [l] CADENAS (toLowerCase / includes)
function buscarProductos(texto) {
    let buscado = texto.toLowerCase().trim();
    let encontrados = [];
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].nombre.toLowerCase().includes(buscado)) {
            encontrados.push(productos[i]);
        }
    }
    return encontrados;
}

// [l] OPERADORES LÓGICOS: búsqueda Y categoría
function filtrarProductos() {
    let texto = document.getElementById("buscar-producto").value;
    let categoria = document.getElementById("filtro-categoria").value;
    let criterio = document.getElementById("orden-productos").value;

    let porTexto = buscarProductos(texto);
    let resultado = [];
    for (let i = 0; i < productos.length; i++) {
        let p = productos[i];
        let coincideTexto = porTexto.includes(p);
        if (coincideTexto && (categoria === "todas" || p.categoria === categoria)) {
            resultado.push(p);
        }
    }

    resultado = ordenarBurbuja(resultado, criterio);
    mostrarProductos(resultado);
}

// [m] FOR ANIDADO - MÉTODO BURBUJA (trabaja sobre una copia)
function ordenarBurbuja(lista, criterio) {
    let copia = lista.slice();
    for (let i = 0; i < copia.length - 1; i++) {
        for (let j = 0; j < copia.length - 1 - i; j++) {
            let hayQueCambiar = false;
            if (criterio === "precio-menor") {
                hayQueCambiar = copia[j].precio > copia[j + 1].precio;
            } else if (criterio === "precio-mayor") {
                hayQueCambiar = copia[j].precio < copia[j + 1].precio;
            } else if (criterio === "nombre") {
                hayQueCambiar = copia[j].nombre.localeCompare(copia[j + 1].nombre) > 0;
            }
            if (hayQueCambiar) {
                let auxiliar = copia[j];          // intercambio con variable auxiliar
                copia[j] = copia[j + 1];
                copia[j + 1] = auxiliar;
            }
        }
    }
    return copia;
}


/* ---------- Carrito ---------- */

function buscarPorCodigo(codigo) {
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].codigo === codigo) {
            return productos[i];
        }
    }
    return null;
}

// [n] PROPIEDADES DE NAVEGACIÓN: previousElementSibling
// [m] ALERT / CONFIRM
function agregarAlCarrito(codigo, boton) {
    let producto = buscarPorCodigo(codigo);
    // El botón está justo después de .cantidad-box, así que el hermano anterior es esa caja
    let caja = boton.previousElementSibling;
    let entrada = caja.querySelector("input");
    let cantidad = parseInt(entrada.value);

    if (isNaN(cantidad) || cantidad < 1) {
        alert("La cantidad debe ser al menos 1.");
        entrada.value = 1;
        return;
    } else if (cantidad > producto.stock) {
        alert("Solo hay " + producto.stock + " unidades disponibles de " + producto.nombre + ".");
        entrada.value = producto.stock;
        return;
    }

    guardarEnCarrito(producto, cantidad);
    entrada.value = 1;
}

// [m] PROMPT + WHILE: pide la cantidad hasta que sea válida
function agregarVarias(codigo) {
    let producto = buscarPorCodigo(codigo);
    let texto = prompt("¿Cuántas unidades de " + producto.nombre + " deseas agregar? (máximo " + producto.stock + ")");
    if (texto === null) {
        return;                                   // el usuario canceló
    }
    let cantidad = parseInt(texto);

    while (isNaN(cantidad) || cantidad < 1 || cantidad > producto.stock) {
        texto = prompt("Cantidad no válida. Escribe un número entre 1 y " + producto.stock + ":");
        if (texto === null) {
            return;
        }
        cantidad = parseInt(texto);
    }

    guardarEnCarrito(producto, cantidad);
}

// Parte común: receta, sumar o crear la línea, guardar y avisar
function guardarEnCarrito(producto, cantidad) {
    if (producto.requiereReceta) {
        let tieneReceta = confirm("Este producto requiere receta. ¿Ya la subiste?");
        if (!tieneReceta) {
            return;
        }
    }

    carrito = leerDatos("carrito", []);           // por si cambió en otra pestaña

    let existente = null;
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === producto.codigo) {
            existente = carrito[i];
        }
    }

    if (existente !== null) {
        let nuevaCantidad = existente.cantidad + cantidad;
        if (nuevaCantidad > producto.stock) {
            alert("Ya tienes " + existente.cantidad + " en tu carrito y solo hay " + producto.stock + " unidades disponibles.");
            return;
        }
        existente.cantidad = nuevaCantidad;       // ya estaba: se suma
    } else {
        carrito.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad,
            stock: producto.stock,
            imagen: producto.imagen,
            requiereReceta: producto.requiereReceta
        });
    }

    guardarDatos("carrito", carrito);
    actualizarContadorCarrito();
    // [o] VENTANA FLOTANTE
    abrirVentana("Producto agregado", cantidad + " × " + producto.nombre + " se agregó a tu carrito.");
}


/* ---------- Inicio ---------- */

// [m] FUNCIONES
function iniciarFarmacia() {
    mostrarProductos(productos);
    actualizarContadorCarrito();

    document.getElementById("buscar-producto").oninput = filtrarProductos;
    document.getElementById("filtro-categoria").onchange = filtrarProductos;
    document.getElementById("orden-productos").onchange = filtrarProductos;
}

iniciarFarmacia();
