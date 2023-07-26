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
    nombre CHAR(25) NOT NULL,
    apellido CHAR(25) NOT NULL,
    correoElec CHAR(40) NOT NULL,
    contrasena BINARY(60) NOT NULL,
    empleado_id INT, -- llave foranea
    rol_id INT, -- llave foranea
    PRIMARY KEY(usuarioId)
);

CREATE TABLE Empleados(
    empleadoId INT NOT NULL AUTO_INCREMENT,
    nombreComp CHAR(50) NOT NULL,
    correoElec CHAR(40) NOT NULL,
    rol_id INT, -- llave foranea
    numeroNomina INT NOT NULL,
    salarioQuin INT NOT NULL,
    compleNomina CHAR(20) NOT NULL,
    fechaIngreso DATE NOT NULL,
    anosCumplir INT NOT NULL,
    area_id INT, -- llave foranea
    numeroCelu CHAR(10) NOT NULL,
    emerNombre CHAR(50) NOT NULL,
    emerCelu CHAR(10) NOT NULL,
    estadoCivil CHAR(12) NOT NULL,
    curp CHAR(18) NOT NULL,
    rfc CHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL,
    nacLugar CHAR(30) NOT NULL,
    nacFecha DATE NOT NULL,
    edadCumplir INT NOT NULL,
    domicilio CHAR(60) NOT NULL,
    nss CHAR(11) NOT NULL,
    registroPatro CHAR(60) NOT NULL,
    estatus CHAR(20) NOT NULL,
    inicioContrato DATE NOT NULL,
    finContrato DATE NOT NULL,
    PRIMARY KEY(empleadoId)
);

CREATE TABLE HistorialEmpleados(
    cambioId INT NOT NULL AUTO_INCREMENT,
    modificado_usuario_id INT, -- llave foranea
    empleado_id INT, -- llave foranea
    cambioRealizado CHAR(100) NOT NULL,
    fechaCambio TIMESTAMP NOT NULL DEFAULT current_timestamp,
    --
    nombreComp CHAR(50) NOT NULL,
    correoElec CHAR(40) NOT NULL,
    rol_id INT, -- llave foranea
    numeroNomina INT NOT NULL,
    salarioQuin INT NOT NULL,
    compleNomina CHAR(20) NOT NULL,
    fechaIngreso DATE NOT NULL,
    anosCumplir INT NOT NULL,
    area_id INT, -- llave foranea
    numeroCelu CHAR(10) NOT NULL,
    emerNombre CHAR(50) NOT NULL,
    emerCelu CHAR(10) NOT NULL,
    estadoCivil CHAR(12) NOT NULL,
    curp CHAR(18) NOT NULL,
    rfc CHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL,
    nacLugar CHAR(30) NOT NULL,
    nacFecha DATE NOT NULL,
    edadCumplir INT NOT NULL,
    domicilio CHAR(60) NOT NULL,
    nss CHAR(11) NOT NULL,
    registroPatro CHAR(60) NOT NULL,
    estatus CHAR(20) NOT NULL,
    inicioContrato DATE NOT NULL,
    finContrato DATE NOT NULL,
    PRIMARY KEY(cambioId)
);

CREATE TABLE Permisos(
    permisoId INT NOT NULL AUTO_INCREMENT,
    descripcion CHAR(20) NOT NULL,
    PRIMARY KEY(permisoId)
);

-- Tabla pivote
CREATE TABLE PermisosRoles(
    permiso_id INT, -- llave foranea
    rol_id INT -- llave foranea
);

CREATE TABLE Roles(
    rolId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(20) NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(rolId)
);

-- Tabla pivote
CREATE TABLE AreasRoles(
    rol_id INT, -- llave foranea
    area_id INT -- llave foranea
);

CREATE TABLE Areas(
    areaId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(areaId)
);

CREATE TABLE Maquinas(
    maquinaId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(20) NOT NULL,
    descripcion CHAR(40) NOT NULL,
    tipoTinta CHAR(40) NOT NULL,
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
    concepto CHAR(50) NOT NULL,
    acabados CHAR(20) DEFAULT 'NULO',
    archivo CHAR(20) DEFAULT 'NULO',
    precio INT NOT NULL,
    medidaAlto INT NOT NULL,
    medidaAncho INT NOT NULL
);

CREATE TABLE Ordenes(
    ordenId INT NOT NULL AUTO_INCREMENT,
    fechaGen TIMESTAMP NOT NULL DEFAULT current_timestamp,
    fechaEnt DATE NOT NULL,
    cot_id INT, -- llave foranea
    usuario_id INT, -- llave foranea
    area_id INT, -- llave foranea
    terminada BOOLEAN NOT NULL,
    PRIMARY KEY(ordenId)
);

CREATE TABLE Cobranza(
    cobranzaId INT NOT NULL AUTO_INCREMENT,
    orden_id INT, -- llave foranea
    tipoPago CHAR(10) NOT NULL,
    estatus CHAR(11) NOT NULL,
    fechaPago DATE NOT NULL,
    PRIMARY KEY(cobranzaId)
);

CREATE TABLE Tareas(
    tareaId INT NOT NULL AUTO_INCREMENT,
    orden_id INT, -- llave foranea
    usuario_id INT, -- llave foranea
    area_id INT, -- llave foranea
    maquina_id INT, -- llave foranea
    terminada BOOLEAN NOT NULL,
    PRIMARY KEY(tareaId)
);

CREATE TABLE Grupos(
    grupoId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(20) NOT NULL,
    PRIMARY KEY(grupoId)
);

CREATE TABLE Cotizaciones(
    cotId INT NOT NULL AUTO_INCREMENT,
    fecha TIMESTAMP NOT NULL DEFAULT current_timestamp,
    cliente_id INT, -- llave foranea
    descuento INT NOT NULL,
    proyecto CHAR(30) NOT NULL,
    observaciones CHAR(100) NOT NULL,
    PRIMARY KEY (cotId)
);

CREATE TABLE ProductosCotizados(
    prodCotizadoId INT NOT NULL AUTO_INCREMENT,
    cot_id INT, -- llave foranea
    cantidad INT NOT NULL,
    producto_id INT, -- llave foranea
    acabados CHAR(20) DEFAULT 'NULO',
    archivo CHAR(20) DEFAULT 'NULO',
    precioMtCuad INT NOT NULL,
    precioPieza INT NOT NULL,
    medidaAlto INT NOT NULL,
    medidaAncho INT NOT NULL,
    PRIMARY KEY (prodCotizadoId)
);

-- Tabla pivote
CREATE TABLE ProcesosOrdenes(
    area_id INT, -- llave foranea
    proceso_id INT, -- llave foranea
    orden INT NOT NULL
);

CREATE TABLE Procesos(
    procesoId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(30) NOT NULL,
    PRIMARY KEY(procesoId)
);

CREATE TABLE Clientes(
    clienteId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(50) NOT NULL,
    usuario_id INT, -- llave foranea
    grupo_id INT, -- llave foranea
    contacto CHAR(40) NOT NULL,
    razonSocial CHAR(50) NOT NULL,
    rfc CHAR(13) NOT NULL,
    domCalle CHAR(30) NOT NULL,
    domNumEx CHAR(5) NOT NULL,
    domNumIn CHAR(5) DEFAULT 'NULO',
    domColonia CHAR(30) NOT NULL,
    domCp INT NOT NULL,
    domEstado CHAR(20) NOT NULL,
    domCiudad CHAR(30) NOT NULL,
    telefono CHAR(10) NOT NULL,
    telefonoExt CHAR(10) DEFAULT 'NULO',
    celular CHAR(10) NOT NULL,
    correoElec CHAR(40) NOT NULL,
    correoElecAlt CHAR(40) DEFAULT 'NULO',
    limiteCredito INT NOT NULL,
    diasCredito INT NOT NULL,
    descuento INT NOT NULL,
    observaciones CHAR(200) NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(clienteId)
);

CREATE TABLE Productos(
    productoId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(30) NOT NULL,
    descripcion CHAR(100) NOT NULL,
    unidad CHAR(10) NOT NULL,
    precio INT NOT NULL,
    aplicarDescuento BOOLEAN NOT NULL,
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