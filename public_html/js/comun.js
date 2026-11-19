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

// Devuelve el usuario solo si tiene la sesión abierta.
// (registrar guarda el usuario sin "sesionActiva": eso cuenta como sesión abierta;
//  al cerrar sesión se marca sesionActiva = false y la cuenta sigue guardada)
function obtenerUsuario() {
    let cuenta = leerDatos("usuario", null);
    if (cuenta === null || cuenta.sesionActiva === false) {
        return null;
    }
    return cuenta;
}

// Devuelve la cuenta registrada aunque la sesión esté cerrada (la usa login.js)
function obtenerCuentaRegistrada() {
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


// ---------- [o] MENÚ RESPONSIVE (botón hamburguesa) ----------
// Igual que el ejemplo de la semana 14: un botón que agrega o quita una
// clase al menú. En pantallas pequeñas el CSS oculta el menú hasta que
// el menú tiene la clase "menu-abierto".

const ANCHO_MENU_MOVIL = 700;   // mismo ancho que usa el @media del CSS

function buscarMenuPrincipal() {
    // Las páginas usan distintos menús según quién las hizo
    let barra = document.querySelector(".barra");
    if (barra !== null) {
        return barra.querySelector("ul");          // en .barra se oculta la lista, no el logo
    }
    return document.querySelector(".navbar, .navbar-index, .navbar-confirmacion");
}

function iniciarMenuResponsive() {
    let menu = buscarMenuPrincipal();
    if (menu === null) {
        return;                                    // login y registro no tienen menú
    }
    menu.classList.add("menu-principal");

    let boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-menu";
    boton.textContent = "☰";
    boton.setAttribute("aria-label", "Abrir menú");
    boton.setAttribute("aria-expanded", "false");

    boton.onclick = function () {
        if (menu.classList.contains("menu-abierto")) {
            cerrarMenu(menu, boton);
        } else {
            menu.classList.add("menu-abierto");
            boton.textContent = "✕";
            boton.setAttribute("aria-label", "Cerrar menú");
            boton.setAttribute("aria-expanded", "true");
        }
    };

    // [n] PROPIEDADES DE NAVEGACIÓN: el botón va justo antes del menú
    menu.parentElement.insertBefore(boton, menu);

    // Si la ventana vuelve a ser ancha, el menú se cierra solo
    window.onresize = function () {
        if (window.innerWidth > ANCHO_MENU_MOVIL) {
            cerrarMenu(menu, boton);
        }
    };
}

function cerrarMenu(menu, boton) {
    menu.classList.remove("menu-abierto");
    boton.textContent = "☰";
    boton.setAttribute("aria-label", "Abrir menú");
    boton.setAttribute("aria-expanded", "false");
}


// ---------- SESIÓN EN EL MENÚ ----------
// Quita los enlaces de cuenta que trae cada HTML y pone los mismos en
// todas las páginas: "Iniciar sesión", o "Hola, Nombre" + "Cerrar sesión".

function crearEnlaceMenu(texto, destino, clase) {
    let enlace = document.createElement("a");
    enlace.href = destino;
    enlace.textContent = texto;
    enlace.className = clase;
    return enlace;
}

function mostrarSesion() {
    let menu = buscarMenuPrincipal();
    if (menu === null) {
        return;
    }

    // Enlaces de cuenta escritos a mano en cada página
    let viejos = menu.querySelectorAll(".btn-cuenta, .btn-cerrar-sesion, .cuenta-nav, .menu-cuenta");
    viejos.forEach(function (elemento) {
        elemento.remove();
    });

    // Cada menú tiene su propia clase para los enlaces
    let clase = "enlace-cuenta";
    let claseSalir = "enlace-salir";
    if (menu.classList.contains("navbar")) {
        clase = "btn-cuenta enlace-cuenta";        // píldora de las páginas de servicios
    } else if (menu.classList.contains("navbar-index")) {
        clase = "enlace-nav enlace-cuenta";
        claseSalir = "enlace-nav enlace-salir";
    }

    let cuenta = obtenerUsuario();
    let nuevos = [];
    if (cuenta === null) {
        nuevos.push(crearEnlaceMenu("Iniciar sesión", "login.html", clase));
    } else {
        let primerNombre = cuenta.nombre.split(" ")[0];
        nuevos.push(crearEnlaceMenu("Hola, " + primerNombre, "mis-citas.html", clase));
        let salir = crearEnlaceMenu("Cerrar sesión", "#", claseSalir);
        salir.onclick = function (evento) {
            evento.preventDefault();
            cerrarSesion();
        };
        nuevos.push(salir);
    }

    // En .barra los enlaces van dentro de <li>
    for (let i = 0; i < nuevos.length; i++) {
        if (menu.tagName === "UL") {
            let item = document.createElement("li");
            item.appendChild(nuevos[i]);
            menu.appendChild(item);
        } else {
            menu.appendChild(nuevos[i]);
        }
    }
}

function cerrarSesion() {
    let seguro = confirm("¿Deseas cerrar tu sesión?");
    if (!seguro) {
        return;
    }
    let cuenta = obtenerCuentaRegistrada();
    if (cuenta !== null) {
        cuenta.sesionActiva = false;               // la cuenta no se borra
        guardarDatos("usuario", cuenta);
    }
    abrirVentana("Sesión cerrada", "Vuelve pronto.", function () {
        window.location.href = "index.html";
    });
}


// ---------- Se ejecuta en todas las páginas ----------
iniciarMenuResponsive();
mostrarSesion();
actualizarContadorCarrito();
