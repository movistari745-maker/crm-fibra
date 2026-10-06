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


// ==========================================
// CARGAR USUARIO DESDE SUPABASE
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

            return;

        }

        usuarioActual = user;

        console.log("Usuario autenticado:", user);


        // ==========================================
        // BUSCAR PERFIL
        // ==========================================

        const { data: perfil, error: errorPerfil } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();


        if (errorPerfil) {

            console.error(
                "Error obteniendo perfil:",
                errorPerfil
            );

            // Si no encuentra perfil,
            // usamos el nombre del metadata
            const nombre =
                user.user_metadata?.nombre ||
                user.user_metadata?.name ||
                user.email;

            mostrarNombreUsuario(nombre);

            return;

        }


        console.log("Perfil encontrado:", perfil);


        // ==========================================
        // OBTENER NOMBRE
        // ==========================================

        const nombre =
            perfil.nombre ||
            perfil.name ||
            user.user_metadata?.nombre ||
            user.user_metadata?.name ||
            user.email;


        mostrarNombreUsuario(nombre);

    }

    catch (error) {

        console.error(
            "Error cargando usuario:",
            error
        );

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
// DATOS DE CLIENTES
// ==========================================

let clientes =
    JSON.parse(
        localStorage.getItem("clientesCRM")
    ) || [];


// ==========================================
// CAMBIAR DE SECCIÓN
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

    document
        .getElementById("modal")
        .classList
        .remove("oculto");

}


// ==========================================
// CERRAR FORMULARIO
// ==========================================

function cerrarFormulario() {

    document
        .getElementById("modal")
        .classList
        .add("oculto");


    document
        .getElementById("clienteForm")
        .reset();

}


// ==========================================
// GUARDAR CLIENTE
// ==========================================

document
    .getElementById("clienteForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const cliente = {

                id: Date.now(),

                nombre:
                    document
                        .getElementById("nombre")
                        .value,

                telefono:
                    document
                        .getElementById("telefono")
                        .value,

                dni:
                    document
                        .getElementById("dni")
                        .value,

                localidad:
                    document
                        .getElementById("localidad")
                        .value,

                direccion:
                    document
                        .getElementById("direccion")
                        .value,

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

            };


            clientes.push(cliente);

            guardarClientes();

            cerrarFormulario();

            mostrarClientes();

            actualizarTodo();

            alert(
                "Cliente guardado correctamente ✅"
            );

        }
    );


// ==========================================
// GUARDAR EN LOCALSTORAGE
// ==========================================

function guardarClientes() {

    localStorage.setItem(
        "clientesCRM",
        JSON.stringify(clientes)
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


    if (lista.length === 0) {

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
                ${cliente.estado}
            </span>

            <h3>
                ${cliente.nombre}
            </h3>

            <p>
                📞 ${cliente.telefono}
            </p>

            <p>
                🪪 DNI: ${cliente.dni || "-"}
            </p>

            <p>
                📍 ${cliente.localidad || "-"}
            </p>

            <p>
                🏠 ${cliente.direccion || "-"}
            </p>

            <p>
                📦 ${cliente.plan}
            </p>

            ${
                cliente.observaciones
                ?
                `<p>📝 ${cliente.observaciones}</p>`
                :
                ""
            }

            <button
                onclick="eliminarCliente(${cliente.id})"
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

    const texto =
        document
            .getElementById("buscar")
            .value
            .toLowerCase();


    const resultados =
        clientes.filter(function(cliente) {

            return (

                (cliente.nombre || "")
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

            );

        });


    mostrarClientes(resultados);

}


// ==========================================
// ELIMINAR CLIENTE
// ==========================================

function eliminarCliente(id) {

    const confirmar =
        confirm(
            "¿Querés eliminar este cliente?"
        );


    if (!confirmar) return;


    clientes =
        clientes.filter(function(cliente) {

            return cliente.id !== id;

        });


    guardarClientes();

    actualizarTodo();

}


// ==========================================
// ACTUALIZAR CONTADORES
// ==========================================

function actualizarTodo() {

    const total =
        clientes.length;


    const interesados =
        clientes.filter(function(cliente) {

            return cliente.estado === "🔥 Caliente";

        }).length;


    const seguimientos =
        clientes.filter(function(cliente) {

            return cliente.estado === "🟡 Seguimiento";

        }).length;


    const ventas =
        clientes.filter(function(cliente) {

            return cliente.estado === "✅ Venta";

        }).length;


    const ids = [

        "totalClientes",
        "statClientes"

    ];

    ids.forEach(function(id) {

        const elemento =
            document.getElementById(id);

        if (elemento)
            elemento.textContent = total;

    });


    const interesadosIds = [

        "interesados",
        "statInteresados"

    ];

    interesadosIds.forEach(function(id) {

        const elemento =
            document.getElementById(id);

        if (elemento)
            elemento.textContent = interesados;

    });


    const seguimientosIds = [

        "seguimientos",
        "statSeguimientos"

    ];

    seguimientosIds.forEach(function(id) {

        const elemento =
            document.getElementById(id);

        if (elemento)
            elemento.textContent = seguimientos;

    });


    const ventasIds = [

        "ventas",
        "statVentas"

    ];

    ventasIds.forEach(function(id) {

        const elemento =
            document.getElementById(id);

        if (elemento)
            elemento.textContent = ventas;

    });


    mostrarClientes();

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
                "🔥 Caliente"

                ||

                cliente.estado ===
                "🟡 Seguimiento"

                ||

                cliente.estado ===
                "🟠 No responde"

            );

        });


    contenedor.innerHTML = "";


    if (lista.length === 0) {

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
                ${cliente.nombre}
            </h3>

            <p>
                📞 ${cliente.telefono}
            </p>

            <p>
                📍 ${cliente.localidad || "-"}
            </p>

            <p>
                📦 ${cliente.plan}
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

            return cliente.estado === "✅ Venta";

        });


    contenedor.innerHTML = "";


    if (lista.length === 0) {

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
                ✅ Venta
            </span>

            <h3>
                ${cliente.nombre}
            </h3>

            <p>
                📞 ${cliente.telefono}
            </p>

            <p>
                📍 ${cliente.localidad || "-"}
            </p>

            <p>
                📦 ${cliente.plan}
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

        await cargarUsuario();

        mostrarClientes();

        actualizarTodo();

    }
);
