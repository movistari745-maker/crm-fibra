// ===============================
// DATOS DE CLIENTES
// ===============================

let clientes = JSON.parse(localStorage.getItem("clientesCRM")) || [];


// ===============================
// CAMBIAR DE SECCIÓN
// ===============================

function mostrarSeccion(nombre) {

    const secciones = document.querySelectorAll(".seccion");

    secciones.forEach(function(seccion) {
        seccion.classList.add("oculto");
    });

    const seleccionada = document.getElementById(nombre);

    if (seleccionada) {
        seleccionada.classList.remove("oculto");
    }

    const botones = document.querySelectorAll(".menu");

    botones.forEach(function(boton) {
        boton.classList.remove("active");
    });

    botones.forEach(function(boton) {

        if (boton.getAttribute("onclick")?.includes(nombre)) {
            boton.classList.add("active");
        }

    });

    actualizarTodo();
}


// ===============================
// ABRIR FORMULARIO
// ===============================

function abrirFormulario() {

    document.getElementById("modal").classList.remove("oculto");

}


// ===============================
// CERRAR FORMULARIO
// ===============================

function cerrarFormulario() {

    document.getElementById("modal").classList.add("oculto");

    document.getElementById("clienteForm").reset();

}


// ===============================
// GUARDAR CLIENTE
// ===============================

document
    .getElementById("clienteForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const cliente = {

            id: Date.now(),

            nombre:
                document.getElementById("nombre").value,

            telefono:
                document.getElementById("telefono").value,

            dni:
                document.getElementById("dni").value,

            localidad:
                document.getElementById("localidad").value,

            direccion:
                document.getElementById("direccion").value,

            plan:
                document.getElementById("plan").value,

            estado:
                document.getElementById("estado").value,

            observaciones:
                document.getElementById("observaciones").value

        };

        clientes.push(cliente);

        guardarClientes();

        cerrarFormulario();

        mostrarClientes();

        actualizarTodo();

        alert("Cliente guardado correctamente ✅");

    });


// ===============================
// GUARDAR EN EL NAVEGADOR
// ===============================

function guardarClientes() {

    localStorage.setItem(
        "clientesCRM",
        JSON.stringify(clientes)
    );

}


// ===============================
// MOSTRAR CLIENTES
// ===============================

function mostrarClientes(lista = clientes) {

    const contenedor =
        document.getElementById("listaClientes");

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

        tarjeta.className = "cliente-card";


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


// ===============================
// BUSCAR CLIENTES
// ===============================

function buscarClientes() {

    const texto =
        document
            .getElementById("buscar")
            .value
            .toLowerCase();

    const resultados =
        clientes.filter(function(cliente) {

            return (

                cliente.nombre
                    .toLowerCase()
                    .includes(texto)

                ||

                cliente.telefono
                    .toLowerCase()
                    .includes(texto)

                ||

                cliente.localidad
                    .toLowerCase()
                    .includes(texto)

            );

        });


    mostrarClientes(resultados);

}


// ===============================
// ELIMINAR CLIENTE
// ===============================

function eliminarCliente(id) {

    const confirmar =
        confirm(
            "¿Querés eliminar este cliente?"
        );

    if (!confirmar) {
        return;
    }


    clientes =
        clientes.filter(function(cliente) {

            return cliente.id !== id;

        });


    guardarClientes();

    actualizarTodo();

}


// ===============================
// ACTUALIZAR CONTADORES
// ===============================

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


    document.getElementById(
        "totalClientes"
    ).textContent = total;


    document.getElementById(
        "interesados"
    ).textContent = interesados;


    document.getElementById(
        "seguimientos"
    ).textContent = seguimientos;


    document.getElementById(
        "ventas"
    ).textContent = ventas;


    document.getElementById(
        "statClientes"
    ).textContent = total;


    document.getElementById(
        "statInteresados"
    ).textContent = interesados;


    document.getElementById(
        "statSeguimientos"
    ).textContent = seguimientos;


    document.getElementById(
        "statVentas"
    ).textContent = ventas;


    mostrarClientes();


    mostrarSeguimientos();


    mostrarVentas();

}


// ===============================
// MOSTRAR SEGUIMIENTOS
// ===============================

function mostrarSeguimientos() {

    const contenedor =
        document.getElementById(
            "listaSeguimiento"
        );

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
                <h3>No hay seguimientos</h3>
                <p>Los clientes pendientes aparecerán acá.</p>
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


// ===============================
// MOSTRAR VENTAS
// ===============================

function mostrarVentas() {

    const contenedor =
        document.getElementById(
            "listaVentas"
        );

    const lista =
        clientes.filter(function(cliente) {

            return cliente.estado === "✅ Venta";

        });


    contenedor.innerHTML = "";


    if (lista.length === 0) {

        contenedor.innerHTML = `
            <div class="cliente-vacio">
                <div>✅</div>
                <h3>No hay ventas registradas</h3>
                <p>Las ventas aparecerán acá.</p>
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


// ===============================
// CERRAR SESIÓN
// ===============================

function cerrarSesion() {

    window.location.href = "index.html";

}


// ===============================
// INICIAR CRM
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        mostrarClientes();

        actualizarTodo();

    }
);
