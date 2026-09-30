// ==========================================
// VANTIX CRM
// LOGIN CON SUPABASE
// ==========================================

const SUPABASE_URL = "https://wjitflgomrydkjersqaf.supabase.co";

const SUPABASE_KEY = "sb_publishable_oP6SL-ndOIchtWhJ-5NeDw_0yyR3j6I";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// FORMULARIO DE LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const correo = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    mensaje.style.color = "#333";
    mensaje.textContent = "Ingresando a VANTIX...";

    // Iniciar sesión en Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: correo,
        password: password
    });

    // Si hay error
    if (error) {

        console.error("Error de login:", error);

        mensaje.style.color = "#e63946";
        mensaje.textContent = "❌ Correo o contraseña incorrectos.";

        return;
    }

    // Login correcto
    mensaje.style.color = "#009900";
    mensaje.textContent = "✅ Ingreso correcto. Cargando VANTIX...";

    setTimeout(function() {

        window.location.href = "panel.html";

    }, 800);

});
