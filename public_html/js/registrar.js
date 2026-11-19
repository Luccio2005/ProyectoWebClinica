// registrar.js

function registrarUsuario(evento) {
    evento.preventDefault();

    const nombre = document.querySelector("#nombre").value.trim();
    const tipoDocumento = document.querySelector("#tipo-documento").value;
    const dni = document.querySelector("#documento").value.trim();
    const correo = document.querySelector("#correo").value.trim();
    const celular = document.querySelector("#celular").value.trim();
    const password = document.querySelector("#password").value;
    const confirmarPassword =
        document.querySelector("#confirmar-password").value;

    const aceptaTerminos =
        document.querySelector('input[name="terminos"]').checked;

    const autorizaDatos =
        document.querySelector('input[name="datos"]').checked;


    // Validación del nombre
    if (nombre === "") {
        alert("Ingresa tus nombres y apellidos.");
        return;
    }


    // Validación del tipo de documento
    if (tipoDocumento === "") {
        alert("Selecciona tu tipo de documento.");
        return;
    }


    // [m] IF / ELSE
    // El PDF indica usar validarDNI() desde comun.js.
    if (tipoDocumento === "dni") {

        if (!validarDNI(dni)) {
            alert("Ingresa un DNI válido de 8 dígitos.");
            return;
        }

    } else if (tipoDocumento === "ce") {

        if (dni.length < 9 || dni.length > 12) {
            alert(
                "El Carné de extranjería debe tener entre 9 y 12 caracteres."
            );
            return;
        }
    }


    // Validación del correo
    if (!validarCorreo(correo)) {
        alert("Ingresa un correo electrónico válido.");
        return;
    }


    // Validación del celular
    if (!validarCelular(celular)) {
        alert("Ingresa un celular válido de 9 dígitos.");
        return;
    }


    // Validación de contraseña
    if (password === "") {
        alert("Ingresa una contraseña.");
        return;
    }

    if (password !== confirmarPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }


    // Validación de autorizaciones
    if (!aceptaTerminos) {
        alert("Debes aceptar los términos y condiciones.");
        return;
    }

    if (!autorizaDatos) {
        alert("Debes autorizar el tratamiento de tus datos personales.");
        return;
    }


    // [m] IF
    // Comprobar si ya existe una cuenta
    const usuarioExistente = leerDatos("usuario", null);

    if (usuarioExistente !== null) {

        const reemplazar = confirm(
            "Ya existe una cuenta registrada. ¿Deseas reemplazarla?"
        );

        if (!reemplazar) {
            return;
        }
    }


    // [l] OBJETO
    // Estructura indicada por el PDF:
    // {nombre, dni, correo, celular, password}
    const usuario = {
        nombre: nombre,
        dni: dni,
        correo: correo,
        celular: celular,
        password: password
    };


    // Guardar usuario en localStorage
    guardarDatos("usuario", usuario);


    // Confirmación
    alert("Cuenta creada correctamente.");


    // Redirección
    window.location.href = "login.html";
}


// [n] DOM
document.addEventListener("DOMContentLoaded", function () {

    const formulario =
        document.querySelector(".tarjeta-registro form");

    if (formulario) {
        formulario.onsubmit = registrarUsuario;
    }
});