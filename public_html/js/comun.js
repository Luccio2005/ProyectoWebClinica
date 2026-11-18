/* ==========================================================
   comun.js - Funciones compartidas por todas las páginas
   Se enlaza SIEMPRE primero:  <script src="js/comun.js"></script>
   ----------------------------------------------------------
   Aquí NO se declaran constantes ni variables globales con
   nombres que usen los demás archivos (IGV, carrito, citas...),
   porque si dos archivos declaran el mismo const/let el
   navegador da error y el segundo script no corre.
   ========================================================== */

// ---------- localStorage (solo 4 claves: usuario, carrito, pedidos, citas) ----------

function leerDatos(clave, valorPorDefecto) {
    let texto = localStorage.getItem(clave);
    if (texto === null) {
        return valorPorDefecto;
    }
    // Si el dato estuviera dañado, se usa el valor por defecto
    try {
        return JSON.parse(texto);
    } catch (error) {
        return valorPorDefecto;
    }
}

function guardarDatos(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerUsuario() {
    return leerDatos("usuario", null);
}

// ---------- Formatos ----------

function formatoSoles(numero) {
    return "S/ " + Number(numero).toFixed(2);          // 35 -> "S/ 35.00"
}

function fechaHoy() {
    let hoy = new Date();
    let dia = String(hoy.getDate()).padStart(2, "0");
    let mes = String(hoy.getMonth() + 1).padStart(2, "0");
    return dia + "/" + mes + "/" + hoy.getFullYear();  // "16/11/2026"
}

// Códigos con guion, igual que los valores fijos de la hoja:
// generarCodigo("HR", 126, 6) -> "HR-000126" | generarCodigo("CT", 1, 4) -> "CT-0001"
function generarCodigo(prefijo, numero, cifras) {
    let texto = String(numero);
    while (texto.length < cifras) {
        texto = "0" + texto;
    }
    return prefijo + "-" + texto;
}

// ---------- Validaciones ----------

function validarDNI(texto) {
    return /^[0-9]{8}$/.test(texto);
}

function validarCelular(texto) {
    return /^9[0-9]{8}$/.test(texto);
}

function validarCorreo(texto) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
}

// ---------- Contador del carrito en el menú ----------

function actualizarContadorCarrito() {
    let lista = leerDatos("carrito", []);
    let total = 0;
    for (let i = 0; i < lista.length; i++) {
        total += lista[i].cantidad;
    }
    // Enlace "Ver carrito" que esté dentro del menú (navbar o barra)
    let enlace = document.querySelector(".navbar a[href='carrito.html'], .barra a[href='carrito.html']");
    if (enlace !== null) {
        if (total > 0) {
            enlace.textContent = "Ver carrito (" + total + ")";
        } else {
            enlace.textContent = "Ver carrito";
        }
    }
}

// ---------- [o] VENTANA FLOTANTE ----------
// abrirVentana(titulo, mensaje)            -> ventana con botón Aceptar
// abrirVentana(titulo, mensaje, alCerrar)  -> además ejecuta alCerrar al cerrarla

let funcionAlCerrarVentana = null;

function abrirVentana(titulo, mensaje, alCerrar) {
    cerrarVentana();                       // nunca dos ventanas a la vez
    funcionAlCerrarVentana = alCerrar || null;

    let fondo = document.createElement("div");
    fondo.className = "ventana-fondo";
    fondo.id = "ventana-flotante";

    let caja = document.createElement("div");
    caja.className = "ventana-caja";
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-modal", "true");
    caja.setAttribute("aria-label", titulo);

    let encabezado = document.createElement("h2");
    encabezado.textContent = titulo;

    let texto = document.createElement("p");
    texto.textContent = mensaje;

    let boton = document.createElement("button");
    boton.type = "button";
    boton.className = "ventana-boton";
    boton.textContent = "Aceptar";
    boton.onclick = function () {
        cerrarVentana();
    };

    caja.appendChild(encabezado);
    caja.appendChild(texto);
    caja.appendChild(boton);
    fondo.appendChild(caja);

    // Clic en el fondo oscuro o tecla Escape también cierran
    fondo.onclick = function (evento) {
        if (evento.target === fondo) {
            cerrarVentana();
        }
    };
    fondo.onkeydown = function (evento) {
        if (evento.key === "Escape") {
            cerrarVentana();
        }
    };

    document.body.appendChild(fondo);
    boton.focus();
}

function cerrarVentana() {
    let fondo = document.getElementById("ventana-flotante");
    if (fondo !== null) {
        fondo.remove();
    }
    // La función pendiente se ejecuta una sola vez
    if (funcionAlCerrarVentana !== null) {
        let pendiente = funcionAlCerrarVentana;
        funcionAlCerrarVentana = null;
        pendiente();
    }
}
