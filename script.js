const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");

    // Usuario temporal para probar el CRM
    const usuarioCorrecto = "agustina";
    const passwordCorrecta = "123456";

    if (usuario === usuarioCorrecto && password === passwordCorrecta) {

        mensaje.style.color = "#009900";
        mensaje.textContent = "Ingreso correcto...";

        setTimeout(function() {
            window.location.href = "panel.html";
        }, 800);

    } else {

        mensaje.style.color = "#e63946";
        mensaje.textContent = "Usuario o contraseña incorrectos.";

    }

});
