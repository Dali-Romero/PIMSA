/*
Nomenclatura:
    camel case (camelCase): llaves primaria y campos de la misma tabla.
    snake case (snake_case): llaves foraneas.
    pascal case (PascalCase): nombres de tablas.
*/

-- creacion y uso de la base de datos
CREATE DATABASE IF NOT EXISTS pimsa_db_prueba;
USE pimsa_db_prueba;

-- creacion de tablas
CREATE TABLE Usuarios(
    usuarioId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    correoElec VARCHAR(40) NOT NULL,
    contrasena VARCHAR(60) NOT NULL,
    empleado_id INT, -- llave foranea
    rol_id INT, -- llave foranea (posiblemente eliminar)
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(usuarioId)
);

CREATE TABLE Empleados(
    empleadoId INT NOT NULL AUTO_INCREMENT,
    nombreComp VARCHAR(50) NOT NULL,
    correoElec VARCHAR(40) NOT NULL,
    rol_id INT, -- llave foranea
    numeroNomina INT NOT NULL,
    salarioQuin INT NOT NULL,
    compleNomina VARCHAR(20) NOT NULL,
    fechaIngreso DATE NOT NULL,
    anosCumplir INT NOT NULL,
    area_id INT, -- llave foranea
    numeroCelu CHAR(10) NOT NULL,
    emerNombre VARCHAR(50) NOT NULL,
    emerCelu CHAR(10) NOT NULL,
    estadoCivil VARCHAR(12) NOT NULL,
    curp CHAR(18) NOT NULL,
    rfc CHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL,
    nacLugar VARCHAR(30) NOT NULL,
    nacFecha DATE NOT NULL,
    edadCumplir INT NOT NULL,
    domicilio VARCHAR(60) NOT NULL,
    nss CHAR(11) NOT NULL,
    registroPatro VARCHAR(60) NOT NULL,
    estatus VARCHAR(20) NOT NULL,
    inicioContrato DATE NOT NULL,
    finContrato DATE NOT NULL,
    activo BOOLEAN NOT NULL,
    extension VARCHAR(5),
    tipoContrato VARCHAR(20),
    PRIMARY KEY(empleadoId)
);

CREATE TABLE HistorialEmpleados(
    cambioId INT NOT NULL AUTO_INCREMENT,
    modificado_usuario_id INT, -- llave foranea
    empleado_id INT, -- llave foranea
    cambioRealizado VARCHAR(100) NOT NULL,
    fechaCambio TIMESTAMP NOT NULL DEFAULT current_timestamp,
    --
    nombreComp VARCHAR(50) NOT NULL,
    correoElec VARCHAR(40) NOT NULL,
    rol_id INT, -- llave foranea
    numeroNomina INT NOT NULL,
    salarioQuin INT NOT NULL,
    compleNomina VARCHAR(20) NOT NULL,
    fechaIngreso DATE NOT NULL,
    anosCumplir INT NOT NULL,
    area_id INT, -- llave foranea
    numeroCelu CHAR(10) NOT NULL,
    emerNombre VARCHAR(50) NOT NULL,
    emerCelu CHAR(10) NOT NULL,
    estadoCivil VARCHAR(12) NOT NULL,
    curp CHAR(18) NOT NULL,
    rfc CHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL,
    nacLugar VARCHAR(30) NOT NULL,
    nacFecha DATE NOT NULL,
    edadCumplir INT NOT NULL,
    domicilio VARCHAR(60) NOT NULL,
    nss CHAR(11) NOT NULL,
    registroPatro VARCHAR(60) NOT NULL,
    estatus VARCHAR(20) NOT NULL,
    inicioContrato DATE NOT NULL,
    finContrato DATE NOT NULL,
    activo BOOLEAN NOT NULL,
    extension VARCHAR(5),
    tipoContrato VARCHAR(10),
    PRIMARY KEY(cambioId)
);

CREATE TABLE Permisos(
    permisoId INT NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(20) NOT NULL,
    permiso VARCHAR(25),
    PRIMARY KEY(permisoId)
);

-- Tabla pivote
CREATE TABLE PermisosRoles(
    permiso_id INT, -- llave foranea
    rol_id INT -- llave foranea
);

CREATE TABLE Roles(
    rolId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(20) NOT NULL,
    activo BOOLEAN NOT NULL,
    descripcion VARCHAR(40),
    PRIMARY KEY(rolId)
);

-- Tabla pivote
CREATE TABLE AreasRoles(
    rol_id INT, -- llave foranea
    area_id INT -- llave foranea
);

CREATE TABLE Areas(
    areaId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL,
    descripcion VARCHAR(40),
    PRIMARY KEY(areaId)
);

CREATE TABLE Maquinas(
    maquinaId INT NOT NULL AUTO_INCREMENT,
    numSerie VARCHAR(20) NOT NULL,
    marca VARCHAR(20) NOT NULL,
    nombre VARCHAR(25) NOT NULL,
    tipoCabezal VARCHAR(20) NOT NULL,
    numCabezales INT NOT NULL,
    velocidad INT NOT NULL,
    tipoTinta VARCHAR(30) NOT NULL,
    conTecnico VARCHAR(10) NOT NULL,
    conTecnicoExt VARCHAR(10) DEFAULT 'NULO',
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(maquinaId)
);

-- Tabla pivote
CREATE TABLE MaquinasUsuarios(
    usuario_id INT, -- llave foranea
    maquina_id INT -- llave foranea
);

CREATE TABLE FueraCatalogoCotizados(
    cot_id INT, -- llave foranea
    cantidad INT NOT NULL,
    concepto VARCHAR(50) NOT NULL,
    acabados VARCHAR(20) DEFAULT 'NULO',
    archivo VARCHAR(20) DEFAULT 'NULO',
    precio DECIMAL(11,2) NOT NULL,
    unidad VARCHAR(10) NOT NULL,
    largo DECIMAL(7,3) NOT NULL,
    ancho DECIMAL(7,3) NOT NULL,
    area DECIMAL(7,3) NOT NULL,
    precioCadaUno DECIMAL(11,2) NOT NULL,
    monto DECIMAL(11,2) NOT NULL,
    fueraCotizadoId INT NOT NULL AUTO_INCREMENT,
    proceso_id INT NOT NULL, -- llave foranea
    PRIMARY KEY(fueraCotizadoId)
);

CREATE TABLE Ordenes(
    ordenId INT NOT NULL AUTO_INCREMENT,
    fechaGen TIMESTAMP NOT NULL DEFAULT current_timestamp,
    fechaEnt DATE NOT NULL,
    cot_id INT, -- llave foranea
    usuario_id INT, -- llave foranea
    area_id INT, -- llave foranea
    terminada BOOLEAN NOT NULL,
    estatus VARCHAR(20) NOT NULL,
    PRIMARY KEY(ordenId)
);

CREATE TABLE Cobranza(
    cobranzaId INT NOT NULL AUTO_INCREMENT,
    orden_id INT, -- llave foranea
    tipoPago VARCHAR(10) NOT NULL,
    estatus VARCHAR(25) NOT NULL,
    fechaPago DATE NOT NULL,
    actividadesTotal INT NOT NULL,
    actividadesCont INT NOT NULL,
    folio VARCHAR(25),
    estatusPago VARCHAR(15),
    PRIMARY KEY(cobranzaId)
);

CREATE TABLE Tareas(
    tareaId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(25) NOT NULL,
    orden_id INT, -- llave foranea
    usuario_id INT, -- llave foranea
    area_id INT, -- llave foranea
    maquina_id INT, -- llave foranea
    terminada BOOLEAN NOT NULL,
    check BOOLEAN NOT NULL,
    activa BOOLEAN NOT NULL,
    sucesion INT NOT NULL,
    notes VARCHAR(40),
    tareaorden_id INT, -- llave foranea
    PRIMARY KEY(tareaId)
);

CREATE TABLE TareasOrden(
    tareaOrdenId INT NOT NULL AUTO_INCREMENT,
    orden_id INT, -- Llave foranea
    fueracatalogo BOOLEAN NOT NULL,
    cotizadoId INT, -- Llave foranea
    PRIMARY KEY(tareaOrdenId)
);

CREATE TABLE Grupos(
    grupoId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(30) NOT NULL,
    PRIMARY KEY(grupoId)
);

CREATE TABLE Cotizaciones(
    cotId INT NOT NULL AUTO_INCREMENT,
    fecha TIMESTAMP NOT NULL DEFAULT current_timestamp,
    cliente_id INT, -- llave foranea
    proyecto VARCHAR(30) NOT NULL,
    observaciones VARCHAR(100) NOT NULL,
    porcentajeDescuento DECIMAL(5,2) NOT NULL,
    solicitante VARCHAR(50) NOT NULL,
    empleado VARCHAR(50) NOT NULL,
    usuario_id INT, -- llave foranea
    estatus VARCHAR(20) NOT NULL,
    totalBruto DECIMAL(11,2) NOT NULL,
    descuento DECIMAL(11,2) NOT NULL,
    subtotal DECIMAL(11,2) NOT NULL,
    iva DECIMAL(11,2) NOT NULL,
    total DECIMAL(11,2) NOT NULL,
    PRIMARY KEY (cotId)
);

-- Tabla pivote
CREATE TABLE ProductosCotizados(
    prodCotizadoId INT NOT NULL AUTO_INCREMENT,
    cot_id INT, -- llave foranea
    cantidad INT NOT NULL,
    producto_id INT, -- llave foranea
    acabados VARCHAR(20) DEFAULT 'NULO',
    archivo VARCHAR(20) DEFAULT 'NULO',
    largo DECIMAL(7,3) NOT NULL,
    ancho DECIMAL(7,3) NOT NULL,
    area DECIMAL(7,3) NOT NULL,
    precioCadaUno DECIMAL(11,2) NOT NULL,
    monto DECIMAL(11,2) NOT NULL,
    precio DECIMAL(11,2) NOT NULL,
    PRIMARY KEY (prodCotizadoId)
);

-- Tabla pivote
CREATE TABLE ProcesosOrdenes(
    area_id INT, -- llave foranea
    proceso_id INT, -- llave foranea
    orden INT NOT NULL,
    procesoOrdenId INT NOT NULL
);

CREATE TABLE Procesos(
    procesoId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(40),
    PRIMARY KEY(procesoId)
);

CREATE TABLE Clientes(
    clienteId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    usuario_id INT, -- llave foranea
    grupo_id INT, -- llave foranea
    contacto VARCHAR(40) NOT NULL,
    razonSocial VARCHAR(50) NOT NULL,
    rfc CHAR(13) NOT NULL,
    domCalle VARCHAR(30) NOT NULL,
    domNumEx VARCHAR(5) NOT NULL,
    domNumIn VARCHAR(5) DEFAULT 'NULO',
    domColonia VARCHAR(30) NOT NULL,
    domCp INT NOT NULL,
    domEstado VARCHAR(20) NOT NULL,
    domCiudad VARCHAR(30) NOT NULL,
    telefono VARCHAR(10) NOT NULL,
    telefonoExt VARCHAR(10) DEFAULT 'NULO',
    celular VARCHAR(10) NOT NULL,
    correoElec VARCHAR(40) NOT NULL,
    correoElecAlt VARCHAR(40) DEFAULT 'NULO',
    limiteCredito INT NOT NULL,
    diasCredito INT NOT NULL,
    descuento INT NOT NULL,
    observaciones VARCHAR(200) NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(clienteId)
);

CREATE TABLE Productos(
    productoId INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    unidad VARCHAR(10) NOT NULL,
    precio DECIMAL(11,2) NOT NULL,
    aplicarDescuento BOOLEAN NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL, 
    proceso_id INT, -- llave foranea
    PRIMARY KEY(productoId)
);

-- asignacion de llaves foraneas
ALTER TABLE Usuarios
    ADD CONSTRAINT fk_usuarios_empleados FOREIGN KEY (empleado_id) REFERENCES Empleados(empleadoId),
    ADD CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES Roles(rolId);

ALTER TABLE Empleados
    ADD CONSTRAINT fk_empleados_roles FOREIGN KEY (rol_id) REFERENCES Roles(rolId),
    ADD CONSTRAINT fk_empleados_areas FOREIGN KEY (area_id) REFERENCES Areas(areaId);

ALTER TABLE HistorialEmpleados
    ADD CONSTRAINT fk_historial_usuarios FOREIGN KEY (modificado_usuario_id) REFERENCES Usuarios(usuarioId),
    ADD CONSTRAINT fk_historial_empleados FOREIGN KEY (empleado_id) REFERENCES Empleados(empleadoId),
    ADD CONSTRAINT fk_historial_roles FOREIGN KEY (rol_id) REFERENCES Roles(rolId),
    ADD CONSTRAINT fk_historial_areas FOREIGN KEY (area_id) REFERENCES Areas(areaId);

-- Tabla pivote
ALTER TABLE PermisosRoles
    ADD CONSTRAINT fk_permisosRoles_permisos FOREIGN KEY (permiso_id) REFERENCES Permisos(permisoId),
    ADD CONSTRAINT fk_permisosRoles_roles FOREIGN KEY (rol_id) REFERENCES Roles(rolId);

-- Tabla pivote
ALTER TABLE AreasRoles
    ADD CONSTRAINT fk_areasRoles_roles FOREIGN KEY (rol_id) REFERENCES Roles(rolId),
    ADD CONSTRAINT fk_areasRoles_areas FOREIGN KEY (area_id) REFERENCES Areas(areaId);

-- Tabla pivote
ALTER TABLE MaquinasUsuarios
    ADD CONSTRAINT fk_maquinasUsuarios_usuarios FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuarioId),
    ADD CONSTRAINT fk_maquinasUsuarios_maquinas FOREIGN KEY (maquina_id) REFERENCES Maquinas(maquinaId);

ALTER TABLE FueraCatalogoCotizados
    ADD CONSTRAINT fk_fuera_cotizaciones FOREIGN KEY (cot_id) REFERENCES Cotizaciones(cotId);

ALTER TABLE Ordenes
    ADD CONSTRAINT fk_ordenes_cotizaciones FOREIGN KEY (cot_id) REFERENCES Cotizaciones(cotId),
    ADD CONSTRAINT fk_ordenes_usuarios FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuarioId),
    ADD CONSTRAINT fk_ordenes_areas FOREIGN KEY (area_id) REFERENCES Areas(areaId);

ALTER TABLE Cobranza
    ADD CONSTRAINT fk_cobranza_ordenes FOREIGN KEY (orden_id) REFERENCES Ordenes(ordenId);

ALTER TABLE Tareas
    ADD CONSTRAINT fk_tareas_ordenes FOREIGN KEY (orden_id) REFERENCES Ordenes(ordenId),
    ADD CONSTRAINT fk_tareas_usuarios FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuarioId),
    ADD CONSTRAINT fk_tareas_areas FOREIGN KEY (area_id) REFERENCES Areas(areaId),
    ADD CONSTRAINT fk_tareas_maquinas FOREIGN KEY (maquina_id) REFERENCES Maquinas(maquinaId);

ALTER TABLE Cotizaciones
    ADD CONSTRAINT fk_cotizaciones_clientes FOREIGN KEY (cliente_id) REFERENCES Clientes(clienteId);

ALTER TABLE ProductosCotizados
    ADD CONSTRAINT fk_productosCotizados_cotizaciones FOREIGN KEY (cot_id) REFERENCES Cotizaciones(cotId),
    ADD CONSTRAINT fk_productosCotizados_productos FOREIGN KEY (producto_id) REFERENCES Productos(productoId);

-- Tabla pivote
ALTER TABLE ProcesosOrdenes
    ADD CONSTRAINT fk_procesosOrdenes_areas FOREIGN KEY (area_id) REFERENCES Areas(areaId),
    ADD CONSTRAINT fk_procesosOrdenes_procesos FOREIGN KEY (proceso_id) REFERENCES Procesos(procesoId);

ALTER TABLE Clientes
    ADD CONSTRAINT fk_clientes_usuarios FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuarioId),
    ADD CONSTRAINT fk_clientes_grupos FOREIGN KEY (grupo_id) REFERENCES Grupos(grupoId);

ALTER TABLE Productos
    ADD CONSTRAINT fk_productos_procesos FOREIGN KEY (proceso_id) REFERENCES Procesos(procesoId);

INSERT INTO Permisos (descripcion, permiso)
    VALUES
        ("Ver lista de áreas", "seeListAreas"),
        ("Agregar áreas", "addAreas"),
        ("Editar áreas", "editAreas"),
        ("Ver lista de clientes", "seeListClients"),
        ("Agregar clientes", "addClients"),
        ("Editar clientes", "editClients"),
        ("Ver lista de cotizaciones", "seeListQuotations"),
        ("Agregar cotizaciones", "addQuotations"),
        ("Editar cotizaciones", "editQuotations"),
        ("Ver lista de empleados", "seeListEmployees"),
        ("Agregar empleados", "addEmployees"),
        ("Editar empleados", "editEmployees"),
        ("Ver lista grupos de clientes", "seeListClientsGroups"),
        ("Agregar grupos de clientes", "addClientsGroups"),
        ("Editar grupos de clientes", "editClientsGroups"),
        ("Ver lista de máquinas", "seeListMachines"),
        ("Agregar máquinas", "addMachines"),
        ("Editar máquinas", "editMachines"),
        ("Ver lista de ordenes", "seeListOrders"),
        ("Agregar ordenes", "addOrders"),
        ("Editar ordenes", "editOrders"),
        ("Ver lista de procesos", "seeListProcesses"),
        ("Agregar procesos", "addProcesses"),
        ("Editar procesos", "editProcesses"),
        ("Ver lista de productos", "seeListProducts"),
        ("Agregar productos", "addProducts"),
        ("Editar productos", "editProducts"),
        ("Ver lista de roles", "seeListRoles"),
        ("Agregar roles", "addRoles"),
        ("Editar roles", "editRoles"),
        ("Ver lista de usuarios", "seeListUsers"),
        ("Agregar usuarios", "addUsers"),
        ("Editar usuarios", "editUsers"),
        ("Tareas empleado de ventas", "tasksSalesExecutives"),
        ("Tareas empleado de área", "tasksEmployees"),
        ("Cobranza", "collection"),
        ("Monitor", "monitor"),
        ("Panel", "panel"),
        ("Reportes", "reporte");
