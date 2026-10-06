// ==========================================
// VANTIX CRM
// PANEL + SUPABASE
// ==========================================

const SUPABASE_URL = "https://wjitflgomrydkjersqaf.supabase.co";

const SUPABASE_KEY = "sb_publishable_oP6SL-ndOIchtWhJ-5NeDw_0yyR3j6I";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// USUARIO ACTUAL
// ==========================================

let usuarioActual = null;
let perfilActual = null;
let clientes = [];


// ==========================================
// CARGAR USUARIO
// ==========================================

async function cargarUsuario() {

    try {

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {

            console.error("No hay usuario autenticado.");

            window.location.href = "index.html";

            return false;
        }

        usuarioActual = user;

        console.log("Usuario autenticado:", user);


        // ==========================================
        // BUSCAR PERFIL
        // ==========================================

        const {
            data: perfil,
            error: errorPerfil
        } = await supabaseClient
            .from("perfiles")
            .select("*")
            .eq("id", user.id)
            .single();


        if (errorPerfil) {

            console.error(
                "Error obteniendo perfil:",
                errorPerfil
            );

            const nombre =
                user.user_metadata?.nombre ||
                user.user_metadata?.name ||
                user.email;

            mostrarNombreUsuario(nombre);

            return true;
        }


        perfilActual = perfil;

        console.log("Perfil encontrado:", perfil);


        const nombre =
            perfil.nombre ||
            perfil.name ||
            user.user_metadata?.nombre ||
            user.user_metadata?.name ||
            user.email;


        mostrarNombreUsuario(nombre);

        console.log("Rol del usuario:", perfil.rol);

        return true;

    }

    catch (error) {

        console.error(
            "Error cargando usuario:",
            error
        );

        return false;
    }
}


// ==========================================
// MOSTRAR NOMBRE
// ==========================================

function mostrarNombreUsuario(nombre) {

    const saludo =
        document.getElementById("saludoUsuario");

    const usuario =
        document.getElementById("usuarioNombre");


    if (saludo) {

        saludo.textContent =
            `¡Hola ${nombre}! 👋`;

    }


    if (usuario) {

        usuario.textContent =
            `👤 ${nombre}`;

    }

}


// ==========================================
// CARGAR CLIENTES DESDE SUPABASE
// ==========================================

async function cargarClientes() {

    try {

        let consulta =
            supabaseClient
                .from("clientes")
                .select("*")
                .order("fecha_carga", {
                    ascending: false
                });


        // ==========================================
        // VENDEDORES
        // ==========================================

        if (
            perfilActual &&
            perfilActual.rol !== "admin"
        ) {

            consulta =
                consulta.eq(
                    "vendedor_id",
                    usuarioActual.id
                );

        }


        const {
            data,
            error
        } = await consulta;


        if (error) {

            console.error(
                "Error cargando clientes:",
                error
            );

            alert(
                "❌ No se pudieron cargar los clientes."
            );

            return;

        }


        clientes = data || [];

        console.log(
            "Clientes cargados:",
            clientes
        );


        mostrarClientes();

        actualizarTodo();

    }

    catch (error) {

        console.error(
            "Error:",
            error
        );

    }

}


// ==========================================
// CAMBIAR SECCIÓN
// ==========================================

function mostrarSeccion(nombre) {

    const secciones =
        document.querySelectorAll(".seccion");


    secciones.forEach(function(seccion) {

        seccion.classList.add("oculto");

    });


    const seleccionada =
        document.getElementById(nombre);


    if (seleccionada) {

        seleccionada.classList.remove("oculto");

    }


    const botones =
        document.querySelectorAll(".menu");


    botones.forEach(function(boton) {

        boton.classList.remove("active");

    });


    botones.forEach(function(boton) {

        if (
            boton
                .getAttribute("onclick")
                ?.includes(nombre)
        ) {

            boton.classList.add("active");

        }

    });


    actualizarTodo();

}


// ==========================================
// ABRIR FORMULARIO
// ==========================================

function abrirFormulario() {

    const modal =
        document.getElementById("modal");


    if (modal) {

        modal.classList.remove("oculto");

    }

}


// ==========================================
// CERRAR FORMULARIO
// ==========================================

function cerrarFormulario() {

    const modal =
        document.getElementById("modal");


    if (modal) {

        modal.classList.add("oculto");

    }


    const formulario =
        document.getElementById("clienteForm");


    if (formulario) {

        formulario.reset();

    }

}


// ==========================================
// GUARDAR CLIENTE EN SUPABASE
// ==========================================

const formularioCliente =
    document.getElementById("clienteForm");


if (formularioCliente) {

    formularioCliente.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==========================================
            // VERIFICAR USUARIO
            // ==========================================

            if (!usuarioActual) {

                alert(
                    "❌ No se encontró el usuario actual."
                );

                return;

            }


            // ==========================================
            // DATOS DEL CLIENTE
            // ==========================================

            const cliente = {

                nombre_apellido:
                    document
                        .getElementById("nombre")
                        .value
                        .trim(),

                telefono:
                    document
                        .getElementById("telefono")
                        .value
                        .trim(),

                dni:
                    document
                        .getElementById("dni")
                        .value
                        .trim(),

                localidad:
                    document
                        .getElementById("localidad")
                        .value
                        .trim(),

                calle:
                    document
                        .getElementById("direccion")
                        .value
                        .trim(),

                plan:
                    document
                        .getElementById("plan")
                        .value,

                estado:
                    document
                        .getElementById("estado")
                        .value,

                observaciones:
                    document
                        .getElementById("observaciones")
                        .value
                        .trim(),

                vendedor_id:
                    usuarioActual.id

            };


            console.log(
                "Cliente a guardar:",
                cliente
            );


            // ==========================================
            // GUARDAR EN SUPABASE
            // ==========================================

            const {
                data,
                error
            } = await supabaseClient
                .from("clientes")
                .insert([cliente])
                .select();


            if (error) {

                console.error(
                    "Error guardando cliente:",
                    error
                );

                alert(
                    "❌ No se pudo guardar el cliente.\n\n" +
                    error.message
                );

                return;

            }


            console.log(
                "Cliente guardado:",
                data
            );


            alert(
                "✅ Cliente guardado correctamente."
            );


            cerrarFormulario();


            await cargarClientes();

        }
    );

}


// ==========================================
// MOSTRAR CLIENTES
// ==========================================

function mostrarClientes(lista = clientes) {

    const contenedor =
        document.getElementById(
            "listaClientes"
        );


    if (!contenedor) return;


    contenedor.innerHTML = "";


    if (!lista.length) {

        contenedor.innerHTML = `

            <div class="cliente-vacio">

                <div>👥</div>

                <h3>No hay clientes</h3>

                <p>
                    Agregá un cliente para comenzar.
                </p>

            </div>

        `;

        return;

    }


    lista.forEach(function(cliente) {

        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "cliente-card";


        tarjeta.innerHTML = `

            <span class="estado">
                ${cliente.estado || "🟡 Pendiente de verificación"}
            </span>

            <h3>
                ${cliente.nombre_apellido || "-"}
            </h3>

            <p>
                📞 ${cliente.telefono || "-"}
            </p>

            <p>
                🪪 DNI: ${cliente.dni || "-"}
            </p>

            <p>
                📍 ${cliente.localidad || "-"}
            </p>

            <p>
                🏠 ${cliente.calle || "-"}
            </p>

            <p>
                📦 ${cliente.plan || "-"}
            </p>

            ${
                cliente.observaciones
                ?
                `<p>📝 ${cliente.observaciones}</p>`
                :
                ""
            }

            <button
                onclick="eliminarCliente('${cliente.id}')"
                style="
                    background:#ffe8e8;
                    color:#d62828;
                    margin-top:15px;
                "
            >
                🗑️ Eliminar
            </button>

        `;


        contenedor.appendChild(tarjeta);

    });

}


// ==========================================
// BUSCAR CLIENTES
// ==========================================

function buscarClientes() {

    const campo =
        document.getElementById("buscar");


    if (!campo) return;


    const texto =
        campo.value
            .toLowerCase()
            .trim();


    const resultados =
        clientes.filter(function(cliente) {

            return (

                (cliente.nombre_apellido || "")
                    .toLowerCase()
                    .includes(texto)

                ||

                (cliente.telefono || "")
                    .toLowerCase()
                    .includes(texto)

                ||

                (cliente.localidad || "")
                    .toLowerCase()
                    .includes(texto)

                ||

                (cliente.dni || "")
                    .toLowerCase()
                    .includes(texto)

            );

        });


    mostrarClientes(resultados);

}


// ==========================================
// ELIMINAR CLIENTE
// ==========================================

async function eliminarCliente(id) {

    const confirmar =
        confirm(
            "¿Querés eliminar este cliente?"
        );


    if (!confirmar) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("clientes")
            .delete()
            .eq("id", id);


        if (error) {

            console.error(
                "Error eliminando cliente:",
                error
            );

            alert(
                "❌ No se pudo eliminar el cliente.\n\n" +
                error.message
            );

            return;

        }


        alert(
            "🗑️ Cliente eliminado correctamente."
        );


        await cargarClientes();

    }

    catch (error) {

        console.error(
            "Error:",
            error
        );

    }

}


// ==========================================
// ACTUALIZAR CONTADORES
// ==========================================

function actualizarTodo() {

    const total =
        clientes.length;


    const interesados =
        clientes.filter(function(cliente) {

            return (
                cliente.estado ===
                "🔥 Caliente"
            );

        }).length;


    const seguimientos =
        clientes.filter(function(cliente) {

            return (
                cliente.estado ===
                "🟡 Pendiente de verificación"
                ||

                cliente.estado ===
                "🟠 No contesta"
            );

        }).length;


    const ventas =
        clientes.filter(function(cliente) {

            return (
                cliente.estado ===
                "🟢 Vendido"
            );

        }).length;


    const idsTotal = [

        "totalClientes",
        "statClientes"

    ];


    idsTotal.forEach(function(id) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.textContent =
                total;

        }

    });


    const interesadosIds = [

        "interesados",
        "statInteresados"

    ];


    interesadosIds.forEach(function(id) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.textContent =
                interesados;

        }

    });


    const seguimientosIds = [

        "seguimientos",
        "statSeguimientos"

    ];


    seguimientosIds.forEach(function(id) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.textContent =
                seguimientos;

        }

    });


    const ventasIds = [

        "ventas",
        "statVentas"

    ];


    ventasIds.forEach(function(id) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.textContent =
                ventas;

        }

    });


    mostrarSeguimientos();

    mostrarVentas();

}


// ==========================================
// MOSTRAR SEGUIMIENTOS
// ==========================================

function mostrarSeguimientos() {

    const contenedor =
        document.getElementById(
            "listaSeguimiento"
        );


    if (!contenedor) return;


    const lista =
        clientes.filter(function(cliente) {

            return (

                cliente.estado ===
                "🟡 Pendiente de verificación"

                ||

                cliente.estado ===
                "🟠 No contesta"

            );

        });


    contenedor.innerHTML = "";


    if (!lista.length) {

        contenedor.innerHTML = `

            <div class="cliente-vacio">

                <div>📋</div>

                <h3>
                    No hay seguimientos
                </h3>

                <p>
                    Los clientes pendientes aparecerán acá.
                </p>

            </div>

        `;

        return;

    }


    lista.forEach(function(cliente) {

        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "cliente-card";


        tarjeta.innerHTML = `

            <span class="estado">
                ${cliente.estado}
            </span>

            <h3>
                ${cliente.nombre_apellido || "-"}
            </h3>

            <p>
                📞 ${cliente.telefono || "-"}
            </p>

            <p>
                📍 ${cliente.localidad || "-"}
            </p>

            <p>
                📦 ${cliente.plan || "-"}
            </p>

        `;


        contenedor.appendChild(tarjeta);

    });

}


// ==========================================
// MOSTRAR VENTAS
// ==========================================

function mostrarVentas() {

    const contenedor =
        document.getElementById(
            "listaVentas"
        );


    if (!contenedor) return;


    const lista =
        clientes.filter(function(cliente) {

            return (
                cliente.estado ===
                "🟢 Vendido"
            );

        });


    contenedor.innerHTML = "";


    if (!lista.length) {

        contenedor.innerHTML = `

            <div class="cliente-vacio">

                <div>✅</div>

                <h3>
                    No hay ventas registradas
                </h3>

                <p>
                    Las ventas aparecerán acá.
                </p>

            </div>

        `;

        return;

    }


    lista.forEach(function(cliente) {

        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "cliente-card";


        tarjeta.innerHTML = `

            <span class="estado">
                🟢 Vendido
            </span>

            <h3>
                ${cliente.nombre_apellido || "-"}
            </h3>

            <p>
                📞 ${cliente.telefono || "-"}
            </p>

            <p>
                📍 ${cliente.localidad || "-"}
            </p>

            <p>
                📦 ${cliente.plan || "-"}
            </p>

        `;


        contenedor.appendChild(tarjeta);

    });

}


// ==========================================
// CERRAR SESIÓN
// ==========================================

async function cerrarSesion() {

    await supabaseClient.auth.signOut();

    window.location.href =
        "index.html";

}


// ==========================================
// INICIAR CRM
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        const usuarioCargado =
            await cargarUsuario();


        if (!usuarioCargado) return;


        await cargarClientes();

    }
);
