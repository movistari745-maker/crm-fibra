// ======================================================
// VANTIX CRM
// PANEL PRINCIPAL
// ======================================================

// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL = "https://wjitflgomrydkjersqaf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oP6SL-ndOIchtWhJ-5NeDw_0yyR3j6I";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// VARIABLES
// ===============================

let usuarioActual = null;
let perfilActual = null;
let clientes = [];
let perfiles = [];

let clienteEditando = null;


// ===============================
// INICIO
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    await cargarUsuario();

    await cargarPerfiles();

    await cargarClientes();

    configurarFormulario();

});


// ===============================
// CARGAR USUARIO
// ===============================

async function cargarUsuario() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error || !data.user) {

        window.location.href = "index.html";

        return;
    }

    usuarioActual = data.user;


    // Buscar perfil
    const {
        data: perfil,
        error: errorPerfil
    } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("id", usuarioActual.id)
        .maybeSingle();


    if (errorPerfil) {

        console.error(errorPerfil);

        alert(
            "No se pudo cargar el perfil del usuario."
        );

        return;
    }


    perfilActual = perfil;


    const nombre =
        perfil?.nombre ||
        usuarioActual.email;


    const saludo =
        document.getElementById("saludoUsuario");

    const usuarioNombre =
        document.getElementById("usuarioNombre");


    if (saludo) {

        saludo.textContent =
            `¡Hola ${nombre}! 👋`;
    }


    if (usuarioNombre) {

        usuarioNombre.textContent =
            `👤 ${nombre}`;
    }


    // Mostrar bloque de auditoría solamente al administrador
    controlarAuditoria();
}


// ===============================
// CONTROLAR AUDITORÍA
// ===============================

function controlarAuditoria() {

    const bloque =
        document.getElementById("bloqueAuditoria");


    if (!bloque) return;


    if (
        perfilActual &&
        perfilActual.rol === "admin"
    ) {

        bloque.style.display = "block";

    } else {

        bloque.style.display = "none";
    }
}


// ===============================
// CARGAR PERFILES
// ===============================

async function cargarPerfiles() {

    const {
        data,
        error
    } = await supabaseClient
        .from("perfiles")
        .select("id,nombre,rol");


    if (error) {

        console.error(
            "Error cargando perfiles:",
            error
        );

        return;
    }


    perfiles = data || [];
}


// ===============================
// CARGAR CLIENTES
// ===============================

async function cargarClientes() {

    if (!usuarioActual || !perfilActual) {

        return;
    }


    let query =
        supabaseClient
            .from("clientes")
            .select("*")
            .order(
                "fecha_carga",
                {
                    ascending: false
                }
            );


    // ==========================================
    // VENDEDORES
    // ==========================================

    if (
        perfilActual.rol !== "admin"
    ) {

        query =
            query.eq(
                "vendedor_id",
                usuarioActual.id
            );
    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        alert(
            "No se pudieron cargar los clientes."
        );

        return;
    }


    clientes = data || [];


    renderizarClientes();

    actualizarEstadisticas();

    renderizarSeguimiento();

    renderizarVentas();
}


// ===============================
// OBTENER NOMBRE DEL VENDEDOR
// ===============================

function obtenerNombreVendedor(
    vendedorId
) {

    const perfil =
        perfiles.find(
            p => p.id === vendedorId
        );


    if (!perfil) {

        return "Sin vendedor";
    }


    return perfil.nombre ||
        "Sin nombre";
}


// ===============================
// OBTENER NOMBRE DEL AUDITOR
// ===============================

function obtenerNombreAuditor(
    auditorId
) {

    if (!auditorId) {

        return "Sin auditar";
    }


    const perfil =
        perfiles.find(
            p => p.id === auditorId
        );


    if (!perfil) {

        return "Administrador";
    }


    return perfil.nombre ||
        "Administrador";
}


// ===============================
// RENDERIZAR CLIENTES
// ===============================

function renderizarClientes(
    lista = clientes
) {

    const contenedor =
        document.getElementById(
            "listaClientes"
        );


    if (!contenedor) return;


    if (!lista.length) {

        contenedor.innerHTML = `

            <div class="cliente-vacio">

                <div>
                    👥
                </div>

                <h3>
                    No hay clientes todavía
                </h3>

                <p>
                    Agregá tu primer cliente para comenzar.
                </p>

            </div>

        `;

        return;
    }


    contenedor.innerHTML =
        lista.map(cliente => {

            const vendedor =
                obtenerNombreVendedor(
                    cliente.vendedor_id
                );


            const auditor =
                obtenerNombreAuditor(
                    cliente.auditado_por
                );


            const auditado =
                cliente.auditado === true;


            const puedeEditar =
                perfilActual?.rol === "admin" ||
                cliente.vendedor_id ===
                usuarioActual?.id;


            return `

                <div class="cliente-card">

                    <div class="cliente-header">

                        <div>

                            <h3>
                                ${escaparHTML(
                                    cliente.nombre_apellido || ""
                                )}
                            </h3>

                            <span>
                                📞 ${escaparHTML(
                                    cliente.telefono || "-"
                                )}
                            </span>

                        </div>

                        <div>

                            ${cliente.estado || ""}

                        </div>

                    </div>


                    <div class="cliente-info">

                        <p>
                            🪪 <strong>DNI:</strong>
                            ${escaparHTML(
                                cliente.dni || "-"
                            )}
                        </p>


                        <p>
                            📍 <strong>Localidad:</strong>
                            ${escaparHTML(
                                cliente.localidad || "-"
                            )}
                        </p>


                        <p>
                            🏠 <strong>Dirección:</strong>
                            ${escaparHTML(
                                cliente.calle || "-"
                            )}
                        </p>


                        ${
                            cliente.entre_calles
                            ?
                            `
                            <p>
                                🛣️ <strong>Entre calles:</strong>
                                ${escaparHTML(
                                    cliente.entre_calles
                                )}
                            </p>
                            `
                            :
                            ""
                        }


                        ${
                            cliente.piso
                            ?
                            `
                            <p>
                                🏢 <strong>Piso:</strong>
                                ${escaparHTML(
                                    cliente.piso
                                )}
                            </p>
                            `
                            :
                            ""
                        }


                        ${
                            cliente.numero_departamento
                            ?
                            `
                            <p>
                                🚪 <strong>Depto:</strong>
                                ${escaparHTML(
                                    cliente.numero_departamento
                                )}
                            </p>
                            `
                            :
                            ""
                        }


                        <p>
                            📡 <strong>Plan:</strong>
                            ${escaparHTML(
                                cliente.plan || "-"
                            )}
                        </p>


                        <p>
                            👤 <strong>Vendedor:</strong>
                            ${escaparHTML(
                                vendedor
                            )}
                        </p>

                    </div>


                    ${
                        cliente.observaciones
                        ?
                        `
                        <div class="cliente-observaciones">

                            📝
                            ${escaparHTML(
                                cliente.observaciones
                            )}

                        </div>
                        `
                        :
                        ""
                    }


                    <div class="auditoria-box">

                        ${
                            auditado
                            ?
                            `
                            <p>
                                🔵 <strong>Auditado</strong>
                            </p>

                            <p>
                                👩‍💼 <strong>Auditado por:</strong>
                                ${escaparHTML(
                                    auditor
                                )}
                            </p>

                            <p>
                                📅 <strong>Fecha:</strong>
                                ${formatearFecha(
                                    cliente.fecha_auditoria
                                )}
                            </p>

                            ${
                                cliente.observaciones_auditoria
                                ?
                                `
                                <p>
                                    📝 <strong>Observación:</strong>
                                    ${escaparHTML(
                                        cliente.observaciones_auditoria
                                    )}
                                </p>
                                `
                                :
                                ""
                            }
                            `
                            :
                            `
                            <p>
                                ⚪ <strong>No auditado</strong>
                            </p>
                            `
                        }

                    </div>


                    <div class="cliente-acciones">

                        ${
                            puedeEditar
                            ?
                            `
                            <button
                                onclick="editarCliente('${cliente.id}')"
                            >
                                ✏️ Editar
                            </button>

                            <button
                                onclick="eliminarCliente('${cliente.id}')"
                            >
                                🗑️ Eliminar
                            </button>
                            `
                            :
                            ""
                        }


                        ${
                            perfilActual?.rol === "admin"
                            ?
                            `
                            <button
                                onclick="auditarCliente('${cliente.id}')"
                            >
                                ${
                                    auditado
                                    ?
                                    "↩️ Quitar auditoría"
                                    :
                                    "🔵 Auditar"
                                }
                            </button>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            `;

        }).join("");
}


// ===============================
// ESCAPAR HTML
// ===============================

function escaparHTML(valor) {

    const div =
        document.createElement("div");

    div.textContent =
        valor ?? "";

    return div.innerHTML;
}


// ===============================
// FORMATEAR FECHA
// ===============================

function formatearFecha(fecha) {

    if (!fecha) {

        return "-";
    }


    return new Date(fecha)
        .toLocaleString(
            "es-AR"
        );
}


// ===============================
// BUSCAR CLIENTES
// ===============================

function buscarClientes() {

    const input =
        document.getElementById(
            "buscar"
        );


    const texto =
        input.value
            .toLowerCase()
            .trim();


    if (!texto) {

        renderizarClientes();

        return;
    }


    const resultado =
        clientes.filter(cliente => {

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

                ||

                obtenerNombreVendedor(
                    cliente.vendedor_id
                )
                    .toLowerCase()
                    .includes(texto)

            );

        });


    renderizarClientes(
        resultado
    );
}


// ===============================
// ABRIR FORMULARIO
// ===============================

function abrirFormulario() {

    clienteEditando = null;


    const form =
        document.getElementById(
            "clienteForm"
        );


    form.reset();


    document.getElementById(
        "clienteId"
    ).value = "";


    document.getElementById(
        "tituloModal"
    ).textContent =
        "➕ Nuevo cliente";


    document.getElementById(
        "auditado"
    ).value = "false";


    document.getElementById(
        "observaciones_auditoria"
    ).value = "";


    controlarAuditoria();


    document.getElementById(
        "modal"
    ).classList.remove(
        "oculto"
    );
}


// ===============================
// CERRAR FORMULARIO
// ===============================

function cerrarFormulario() {

    document.getElementById(
        "modal"
    ).classList.add(
        "oculto"
    );

    clienteEditando = null;
}


// ===============================
// CONFIGURAR FORMULARIO
// ===============================

function configurarFormulario() {

    const form =
        document.getElementById(
            "clienteForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        guardarCliente
    );
}


// ===============================
// GUARDAR CLIENTE
// ===============================

async function guardarCliente(
    e
) {

    e.preventDefault();


    if (!usuarioActual) {

        alert(
            "No hay un usuario autenticado."
        );

        return;
    }


    const id =
        document.getElementById(
            "clienteId"
        ).value;


    const datos = {

        nombre_apellido:
            document.getElementById(
                "nombre"
            ).value.trim(),

        telefono:
            document.getElementById(
                "telefono"
            ).value.trim(),

        dni:
            document.getElementById(
                "dni"
            ).value.trim(),

        localidad:
            document.getElementById(
                "localidad"
            ).value.trim(),

        calle:
            document.getElementById(
                "direccion"
            ).value.trim(),

        entre_calles:
            document.getElementById(
                "entre_calles"
            ).value.trim(),

        es_departamento:
            document.getElementById(
                "es_departamento"
            ).value === "true",

        numero_departamento:
            document.getElementById(
                "numero_departamento"
            ).value.trim(),

        piso:
            document.getElementById(
                "piso"
            ).value.trim(),

        plan:
            document.getElementById(
                "plan"
            ).value,

        medio_pago:
            document.getElementById(
                "medio_pago"
            ).value,

        banco:
            document.getElementById(
                "banco"
            ).value.trim(),

        ultimos_4_tarjeta:
            document.getElementById(
                "ultimos_4_tarjeta"
            ).value.trim(),

        estado:
            document.getElementById(
                "estado"
            ).value,

        observaciones:
            document.getElementById(
                "observaciones"
            ).value.trim()

    };


    // ==========================================
    // NUEVO CLIENTE
    // ==========================================

    if (!id) {

        datos.vendedor_id =
            usuarioActual.id;


        const {
            error
        } = await supabaseClient
            .from("clientes")
            .insert(datos);


        if (error) {

            console.error(error);

            alert(
                "Error al guardar el cliente:\n" +
                error.message
            );

            return;
        }


        alert(
            "✅ Cliente guardado correctamente."
        );

    }

    // ==========================================
    // EDITAR CLIENTE
    // ==========================================

    else {

        const cliente =
            clientes.find(
                c => c.id === id
            );


        if (!cliente) {

            alert(
                "No se encontró el cliente."
            );

            return;
        }


        const puedeEditar =
            perfilActual?.rol === "admin" ||
            cliente.vendedor_id ===
            usuarioActual.id;


        if (!puedeEditar) {

            alert(
                "No tenés permiso para editar este cliente."
            );

            return;
        }


        const {
            error
        } = await supabaseClient
            .from("clientes")
            .update(datos)
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(error);

            alert(
                "Error al actualizar:\n" +
                error.message
            );

            return;
        }


        // ======================================
        // AUDITORÍA
        // ======================================

        if (
            perfilActual?.rol === "admin"
        ) {

            const auditado =
                document.getElementById(
                    "auditado"
                ).value === "true";


            const observacionAuditoria =
                document.getElementById(
                    "observaciones_auditoria"
                ).value.trim();


            const datosAuditoria = {

                auditado:
                    auditado,

                observaciones_auditoria:
                    observacionAuditoria

            };


            if (auditado) {

                datosAuditoria.auditado_por =
                    usuarioActual.id;

                datosAuditoria.fecha_auditoria =
                    new Date().toISOString();

                datos.estado =
                    datos.estado ===
                    "🟡 Pendiente de verificación"
                    ?
                    "🟢 Vendido"
                    :
                    datos.estado;

            } else {

                datosAuditoria.auditado_por =
                    null;

                datosAuditoria.fecha_auditoria =
                    null;

            }


            const {
                error:
                errorAuditoria
            } =
                await supabaseClient
                    .from("clientes")
                    .update(
                        datosAuditoria
                    )
                    .eq(
                        "id",
                        id
                    );


            if (errorAuditoria) {

                console.error(
                    errorAuditoria
                );

                alert(
                    "El cliente se actualizó, pero hubo un problema con la auditoría:\n" +
                    errorAuditoria.message
                );

            }

        }


        alert(
            "✅ Cliente actualizado correctamente."
        );

    }


    cerrarFormulario();

    await cargarClientes();
}


// ===============================
// EDITAR CLIENTE
// ===============================

function editarCliente(id) {

    const cliente =
        clientes.find(
            c => c.id === id
        );


    if (!cliente) {

        alert(
            "Cliente no encontrado."
        );

        return;
    }


    const puedeEditar =
        perfilActual?.rol === "admin" ||
        cliente.vendedor_id ===
        usuarioActual.id;


    if (!puedeEditar) {

        alert(
            "No tenés permiso para editar este cliente."
        );

        return;
    }


    clienteEditando =
        cliente;


    document.getElementById(
        "clienteId"
    ).value =
        cliente.id;


    document.getElementById(
        "tituloModal"
    ).textContent =
        "✏️ Editar cliente";


    document.getElementById(
        "nombre"
    ).value =
        cliente.nombre_apellido || "";


    document.getElementById(
        "telefono"
    ).value =
        cliente.telefono || "";


    document.getElementById(
        "dni"
    ).value =
        cliente.dni || "";


    document.getElementById(
        "localidad"
    ).value =
        cliente.localidad || "";


    document.getElementById(
        "direccion"
    ).value =
        cliente.calle || "";


    document.getElementById(
        "entre_calles"
    ).value =
        cliente.entre_calles || "";


    document.getElementById(
        "es_departamento"
    ).value =
        cliente.es_departamento
        ? "true"
        : "false";


    document.getElementById(
        "numero_departamento"
    ).value =
        cliente.numero_departamento || "";


    document.getElementById(
        "piso"
    ).value =
        cliente.piso || "";


    document.getElementById(
        "plan"
    ).value =
        cliente.plan || "300 Megas";


    document.getElementById(
        "medio_pago"
    ).value =
        cliente.medio_pago || "";


    document.getElementById(
        "banco"
    ).value =
        cliente.banco || "";


    document.getElementById(
        "ultimos_4_tarjeta"
    ).value =
        cliente.ultimos_4_tarjeta || "";


    document.getElementById(
        "estado"
    ).value =
        cliente.estado ||
        "🟡 Pendiente de verificación";


    document.getElementById(
        "observaciones"
    ).value =
        cliente.observaciones || "";


    document.getElementById(
        "auditado"
    ).value =
        cliente.auditado
        ? "true"
        : "false";


    document.getElementById(
        "observaciones_auditoria"
    ).value =
        cliente.observaciones_auditoria || "";


    controlarAuditoria();


    document.getElementById(
        "modal"
    ).classList.remove(
        "oculto"
    );
}


// ===============================
// ELIMINAR CLIENTE
// ===============================

async function eliminarCliente(
    id
) {

    const cliente =
        clientes.find(
            c => c.id === id
        );


    if (!cliente) return;


    const puedeEliminar =
        perfilActual?.rol === "admin" ||
        cliente.vendedor_id ===
        usuarioActual.id;


    if (!puedeEliminar) {

        alert(
            "No tenés permiso para eliminar este cliente."
        );

        return;
    }


    const confirmar =
        confirm(
            `¿Querés eliminar a ${cliente.nombre_apellido}?`
        );


    if (!confirmar) return;


    const {
        error
    } = await supabaseClient
        .from("clientes")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar:\n" +
            error.message
        );

        return;
    }


    alert(
        "🗑️ Cliente eliminado."
    );


    await cargarClientes();
}


// ===============================
// AUDITAR CLIENTE
// ===============================

async function auditarCliente(
    id
) {

    if (
        perfilActual?.rol !== "admin"
    ) {

        alert(
            "Solo administración puede auditar ventas."
        );

        return;
    }


    const cliente =
        clientes.find(
            c => c.id === id
        );


    if (!cliente) return;


    const actualmenteAuditado =
        cliente.auditado === true;


    if (actualmenteAuditado) {

        const confirmar =
            confirm(
                "¿Querés quitar la auditoría de esta venta?"
            );


        if (!confirmar) return;


        const {
            error
        } = await supabaseClient
            .from("clientes")
            .update({

                auditado: false,

                auditado_por: null,

                fecha_auditoria: null

            })
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(error);

            alert(
                "No se pudo quitar la auditoría:\n" +
                error.message
            );

            return;
        }


        alert(
            "↩️ Auditoría quitada."
        );

    } else {

        const observacion =
            prompt(
                "Observación de auditoría (opcional):"
            );


        const {
            error
        } = await supabaseClient
            .from("clientes")
            .update({

                auditado: true,

                auditado_por:
                    usuarioActual.id,

                fecha_auditoria:
                    new Date().toISOString(),

                observaciones_auditoria:
                    observacion || null

            })
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(error);

            alert(
                "No se pudo auditar la venta:\n" +
                error.message
            );

            return;
        }


        alert(
            "🔵 Venta auditada correctamente."
        );
    }


    await cargarClientes();
}


// ===============================
// ESTADÍSTICAS
// ===============================

function actualizarEstadisticas() {

    const total =
        clientes.length;


    const interesados =
        clientes.filter(
            c =>
                c.estado ===
                "🟡 Pendiente de verificación"
        ).length;


    const seguimientos =
        clientes.filter(
            c =>
                c.estado ===
                "🟠 No contesta"
        ).length;


    const ventas =
        clientes.filter(
            c =>
                c.estado ===
                "🟢 Vendido"
        ).length;


    cambiarTexto(
        "totalClientes",
        total
    );

    cambiarTexto(
        "interesados",
        interesados
    );

    cambiarTexto(
        "seguimientos",
        seguimientos
    );

    cambiarTexto(
        "ventas",
        ventas
    );


    cambiarTexto(
        "statClientes",
        total
    );

    cambiarTexto(
        "statInteresados",
        interesados
    );

    cambiarTexto(
        "statSeguimientos",
        seguimientos
    );

    cambiarTexto(
        "statVentas",
        ventas
    );
}


// ===============================
// CAMBIAR TEXTO
// ===============================

function cambiarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;
    }
}


// ===============================
// SEGUIMIENTO
// ===============================

function renderizarSeguimiento() {

    const contenedor =
        document.getElementById(
            "listaSeguimiento"
        );


    if (!contenedor) return;


    const lista =
        clientes.filter(
            c =>
                c.estado ===
                "🟠 No contesta" ||
                c.estado ===
                "🟡 Pendiente de verificación"
        );


    if (!lista.length) {

        contenedor.innerHTML = `
            <p>
                No hay clientes pendientes de seguimiento.
            </p>
        `;

        return;
    }


    contenedor.innerHTML =
        lista.map(cliente => `

            <div class="cliente-card">

                <h3>
                    ${escaparHTML(
                        cliente.nombre_apellido || ""
                    )}
                </h3>

                <p>
                    📞 ${escaparHTML(
                        cliente.telefono || "-"
                    )}
                </p>

                <p>
                    ${cliente.estado || ""}
                </p>

            </div>

        `).join("");
}


// ===============================
// VENTAS
// ===============================

function renderizarVentas() {

    const contenedor =
        document.getElementById(
            "listaVentas"
        );


    if (!contenedor) return;


    const lista =
        clientes.filter(
            c =>
                c.estado ===
                "🟢 Vendido"
        );


    if (!lista.length) {

        contenedor.innerHTML = `
            <p>
                Todavía no hay ventas realizadas.
            </p>
        `;

        return;
    }


    contenedor.innerHTML =
        lista.map(cliente => {

            const vendedor =
                obtenerNombreVendedor(
                    cliente.vendedor_id
                );


            return `

                <div class="cliente-card">

                    <h3>
                        ${escaparHTML(
                            cliente.nombre_apellido || ""
                        )}
                    </h3>

                    <p>
                        📡 Plan:
                        ${escaparHTML(
                            cliente.plan || "-"
                        )}
                    </p>

                    <p>
                        👤 Vendedor:
                        ${escaparHTML(
                            vendedor
                        )}
                    </p>

                    <p>
                        ${
                            cliente.auditado
                            ?
                            "🔵 Auditado"
                            :
                            "⚪ No auditado"
                        }
                    </p>

                </div>

            `;

        }).join("");
}


// ===============================
// CAMBIAR SECCIÓN
// ===============================

function mostrarSeccion(
    nombre
) {

    document
        .querySelectorAll(
            ".seccion"
        )
        .forEach(
            seccion => {

                seccion.classList.add(
                    "oculto"
                );

            }
        );


    const seccion =
        document.getElementById(
            nombre
        );


    if (seccion) {

        seccion.classList.remove(
            "oculto"
        );
    }


    document
        .querySelectorAll(
            ".menu"
        )
        .forEach(
            boton => {

                boton.classList.remove(
                    "active"
                );

            }
        );


    const botonActivo =
        [...document.querySelectorAll(".menu")]
            .find(
                boton =>
                    boton
                        .getAttribute("onclick")
                        ?.includes(
                            `'${nombre}'`
                        )
            );


    if (botonActivo) {

        botonActivo.classList.add(
            "active"
        );
    }
}


// ===============================
// CERRAR SESIÓN
// ===============================

async function cerrarSesion() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(error);

        alert(
            "No se pudo cerrar la sesión."
        );

        return;
    }


    window.location.href =
        "index.html";
}
