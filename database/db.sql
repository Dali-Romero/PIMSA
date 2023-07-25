-- creacion y uso de la base de datos
CREATE DATABASE IF NOT EXISTS pimsa_db;
USE pimsa_db;

-- creacion de tablas
CREATE TABLE users(
    userId INT NOT NULL AUTO_INCREMENT,
    name CHAR(25) NOT NULL,
    lName CHAR(25) NOT NULL,
    eMail CHAR(40) NOT NULL,
    pass BINARY(60) NOT NULL,
    ejecutivo_id INT, -- llave foranea
    rol_id INT, -- llave foranea
    PRIMARY KEY(userId)
);

CREATE TABLE empleados(
    ejecutivoId INT NOT NULL AUTO_INCREMENT,
    fullName CHAR(50) NOT NULL,
    eMail CHAR(40) NOT NULL,
    rol_id INT, -- llave foranea
    numeroNomina INT NOT NULL,
    salarioQuin INT NOT NULL,
    compleNomina CHAR(20) NOT NULL,
    fechaIngreso DATE NOT NULL,
    anoPorCumplir INT NOT NULL,
    area_id INT, -- llave foranea
    cellphone CHAR(10) NOT NULL,
    emerName CHAR(50) NOT NULL,
    emerCell CHAR(10) NOT NULL,
    estadoCivil CHAR(12) NOT NULL,
    curp CHAR(18) NOT NULL,
    rfc CHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL,
    nacLugar CHAR(30) NOT NULL,
    nacDate DATE NOT NULL,
    edadCumplir INT NOT NULL,
    domicilio CHAR(60) NOT NULL,
    nss CHAR(11) NOT NULL,
    registroPatr CHAR(60) NOT NULL,
    estatus CHAR(20) NOT NULL,
    inicioContrato DATE NOT NULL,
    finContraro DATE NOT NULL,
    PRIMARY KEY(ejecutivoId)
);

-- historial_empleado table
CREATE TABLE historialEmpleados(
    cambioId INT NOT NULL AUTO_INCREMENT,
    modificado_user_id INT, -- llave foranea
    ejecutivo_id INT, -- llave foranea
    cambioRealizado CHAR(100) NOT NULL,
    fechaCambio DATE NOT NULL,
    --
    fullName CHAR(50) NOT NULL,
    eMail CHAR(40) NOT NULL,
    rol_id INT, -- llave foranea
    numeroNomina INT NOT NULL,
    salarioQuin INT NOT NULL,
    compleNomina CHAR(20) NOT NULL,
    fechaIngreso DATE NOT NULL,
    anoPorCumplir INT NOT NULL,
    area_id INT, -- llave foranea
    cellphone CHAR(10) NOT NULL,
    emerName CHAR(50) NOT NULL,
    emerCell CHAR(10) NOT NULL,
    estadoCivil CHAR(12) NOT NULL,
    curp CHAR(18) NOT NULL,
    rfc CHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL,
    nacLugar CHAR(30) NOT NULL,
    nacDate DATE NOT NULL,
    edadCumplir INT NOT NULL,
    domicilio CHAR(60) NOT NULL,
    nss CHAR(11) NOT NULL,
    registroPatr CHAR(60) NOT NULL,
    estatus CHAR(20) NOT NULL,
    inicioContrato DATE NOT NULL,
    finContraro DATE NOT NULL,
    PRIMARY KEY(cambioId)
);

CREATE TABLE permisos(
    permisosId INT NOT NULL AUTO_INCREMENT,
    descripcion CHAR(20) NOT NULL,
    PRIMARY KEY(permisosId)
);

CREATE TABLE permisosRol(
    permisos_id INT, -- llave foranea
    rol_id INT -- llave foranea
);

CREATE TABLE rol(
    rolId INT NOT NULL AUTO_INCREMENT,
    name CHAR(20) NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY(rolId)
);

CREATE TABLE areasRoles(
    rol_id INT, -- llave foranea
    area_id INT -- llave foranea
);

CREATE TABLE areas(
    areaId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(30) NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY(areaId)
);

CREATE TABLE maquinas(
    maquinaId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(20) NOT NULL,
    descripcion CHAR(40) NOT NULL,
    tipoTinta CHAR(40) NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY(maquinaId)
);

CREATE TABLE maquinasUser(
    user_id INT, -- llave foranea
    maquina_id INT -- llave foranea
);

CREATE TABLE outOfCatalogCotizado(
    cot_id INT, -- llave foranea
    cantidad INT NOT NULL,
    concepto CHAR(50) NOT NULL,
    acabados CHAR(20) NOT NULL,
    archivo CHAR(20) NOT NULL,
    precio INT NOT NULL,
    medidaAlt INT NOT NULL,
    medidaAnch INT NOT NULL
);

CREATE TABLE orden(
    ordenId INT NOT NULL AUTO_INCREMENT,
    genDate DATE NOT NULL,
    deliveryDate DATE NOT NULL,
    cot_id INT, -- llave foranea
    user_id INT, -- llave foranea
    area_id INT, -- llave foranea
    finished BOOLEAN NOT NULL,
    PRIMARY KEY(ordenId)
);

CREATE TABLE cobranza(
    cobranzaId INT NOT NULL AUTO_INCREMENT,
    orden_id INT, -- llave foranea
    tipoPago CHAR(10) NOT NULL,
    estatus CHAR(11) NOT NULL,
    fechaPago DATE NOT NULL,
    PRIMARY KEY(cobranzaId)
);

CREATE TABLE tareas(
    tareaId INT NOT NULL AUTO_INCREMENT,
    orden_id INT, -- llave foranea
    user_id INT, -- llave foranea
    areaAct_id INT, -- llave foranea
    maquina_id INT, -- llave foranea
    finished BOOLEAN NOT NULL,
    PRIMARY KEY(tareaId)
);

CREATE TABLE grupos(
    grupoId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(20) NOT NULL,
    PRIMARY KEY(grupoId)
);

CREATE TABLE cotizados(
    cotId INT NOT NULL AUTO_INCREMENT,
    fecha DATE NOT NULL,
    client_id INT, -- llave foranea
    descuento INT NOT NULL,
    proyecto CHAR(30) NOT NULL,
    observaciones CHAR(100) NOT NULL,
    PRIMARY KEY (cotId)
);

CREATE TABLE productoCotizado(
    prodCotizadoId INT NOT NULL AUTO_INCREMENT,
    cot_id INT, -- llave foranea
    cantidad INT NOT NULL,
    codigo_id INT, -- llave foranea
    acabados CHAR(20) NOT NULL,
    archivos CHAR(20) NOT NULL,
    precioMt2 INT NOT NULL,
    precioPieza INT NOT NULL,
    medidaAlt INT NOT NULL,
    medidaAnch INT NOT NULL,
    PRIMARY KEY (prodCotizadoId)
);

CREATE TABLE procesosOrden(
    area_id INT, -- llave foranea
    proceso_id INT, -- llave foranea
    orden INT NOT NULL
);

CREATE TABLE procesos(
    procesoId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(30) NOT NULL,
    PRIMARY KEY(procesoId)
);

CREATE TABLE clients(
    clientId INT NOT NULL AUTO_INCREMENT,
    name CHAR(50) NOT NULL,
    user_id INT, -- llave foranea
    group_id INT, -- llave foranea
    contact CHAR(40) NOT NULL,
    razonSocial CHAR(50) NOT NULL,
    rfc CHAR(13) NOT NULL,
    domCalle CHAR(30) NOT NULL,
    domNumEx CHAR(5) NOT NULL,
    domNumIn CHAR(5),
    domColonia CHAR(30) NOT NULL,
    domCp INT NOT NULL,
    domEstado CHAR(20) NOT NULL,
    domCiudad CHAR(30) NOT NULL,
    telefono INT NOT NULL,
    telefonoExt INT,
    celular INT NOT NULL,
    eMail CHAR(40) NOT NULL,
    eMailAlt CHAR(40),
    limiteCredito INT NOT NULL,
    diasCredito INT NOT NULL,
    descuento INT NOT NULL,
    observaciones CHAR(200) NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY(clientId)
);

CREATE TABLE producto(
    codigoId INT NOT NULL AUTO_INCREMENT,
    nombre CHAR(30) NOT NULL,
    descripcion CHAR(100) NOT NULL,
    unidad CHAR(10) NOT NULL,
    precio INT NOT NULL,
    applyDiscount BOOLEAN NOT NULL,
    proceso_id INT, -- llave foranea
    PRIMARY KEY(codigoId)
);

-- asignacion de llaves foraneas
ALTER TABLE users
    ADD CONSTRAINT fk_users_empleados FOREIGN KEY (ejecutivo_id) REFERENCES empleados(ejecutivoId),
    ADD CONSTRAINT fk_users_rol FOREIGN KEY (rol_id) REFERENCES rol(rolId);

ALTER TABLE empleados
    ADD CONSTRAINT fk_empleados_rol FOREIGN KEY (rol_id) REFERENCES rol(rolId),
    ADD CONSTRAINT fk_empleados_areas FOREIGN KEY (area_id) REFERENCES areas(areaId);

ALTER TABLE historialEmpleados
    ADD CONSTRAINT fk_historial_users FOREIGN KEY (modificado_user_id) REFERENCES users(userId),
    ADD CONSTRAINT fk_historial_empleados FOREIGN KEY (ejecutivo_id) REFERENCES empleados(ejecutivoId),
    ADD CONSTRAINT fk_historial_rol FOREIGN KEY (rol_id) REFERENCES rol(rolId),
    ADD CONSTRAINT fk_historial_area FOREIGN KEY (area_id) REFERENCES areas(areaId);

ALTER TABLE permisosRol
    ADD CONSTRAINT fk_permisosRol_permisos FOREIGN KEY (permisos_id) REFERENCES permisos(permisosId),
    ADD CONSTRAINT fk_permisosRol_rol FOREIGN KEY (rol_id) REFERENCES rol(rolId);

ALTER TABLE areasRoles
    ADD CONSTRAINT fk_areasRoles_rol FOREIGN KEY (rol_id) REFERENCES rol(rolId),
    ADD CONSTRAINT fk_areasRoles_area FOREIGN KEY (area_id) REFERENCES areas(areaId);

ALTER TABLE maquinasUser
    ADD CONSTRAINT fk_maquinasUser_user FOREIGN KEY (user_id) REFERENCES users(userId),
    ADD CONSTRAINT fk_maquinasUser_maquina FOREIGN KEY (maquina_id) REFERENCES maquinas(maquinaId);

ALTER TABLE outOfCatalogCotizado
    ADD CONSTRAINT fk_outCatalogo_cotizacion FOREIGN KEY (cot_id) REFERENCES cotizados(cotId);

ALTER TABLE orden
    ADD CONSTRAINT fk_orden_cotizacion FOREIGN KEY (cot_id) REFERENCES cotizados(cotId),
    ADD CONSTRAINT fk_orden_user FOREIGN KEY (user_id) REFERENCES users(userId),
    ADD CONSTRAINT fk_orden_area FOREIGN KEY (area_id) REFERENCES areas(areaId);

ALTER TABLE cobranza
    ADD CONSTRAINT fk_cobranza_orden FOREIGN KEY (orden_id) REFERENCES orden(ordenId);

ALTER TABLE tareas
    ADD CONSTRAINT fk_tareas_orden FOREIGN KEY (orden_id) REFERENCES orden(ordenId),
    ADD CONSTRAINT fk_tareas_user FOREIGN KEY (user_id) REFERENCES users(userId),
    ADD CONSTRAINT fk_tareas_areaAct FOREIGN KEY (areaAct_id) REFERENCES areas(areaId),
    ADD CONSTRAINT fk_tareas_maquina FOREIGN KEY (maquina_id) REFERENCES maquinas(maquinaId);

ALTER TABLE cotizados
    ADD CONSTRAINT fk_cotizados_client FOREIGN KEY (client_id) REFERENCES clients(clientId);

ALTER TABLE productoCotizado
    ADD CONSTRAINT fk_productoCotizado_cotizacion FOREIGN KEY (cot_id) REFERENCES cotizados(cotId),
    ADD CONSTRAINT fk_productoCotizado_producto FOREIGN KEY (codigo_id) REFERENCES producto(codigoId);

ALTER TABLE procesosOrden
    ADD CONSTRAINT fk_procesosOrden_area FOREIGN KEY (area_id) REFERENCES areas(areaId),
    ADD CONSTRAINT fk_procesosOrden_proceso FOREIGN KEY (proceso_id) REFERENCES procesos(procesoId);

ALTER TABLE clients
    ADD CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(userId),
    ADD CONSTRAINT fk_clients_group FOREIGN KEY (group_id) REFERENCES grupos(grupoId);

ALTER TABLE producto
    ADD CONSTRAINT fk_producto_proceso FOREIGN KEY (proceso_id) REFERENCES procesos(procesoId);