const {body} = require('express-validator');

module.exports = {
// ------------------------------------------------ Archivo areas.js ------------------------------------------------
    // middleware para validar el formulario de agregar/editar área
    validateAreas(){
        return [
            // validaciones del campo "areaname" (Nombre del área)
            body('areaname')
            .exists().withMessage('Parece que el nombre del área no fue enviado.')
            .trim().notEmpty().withMessage('El nombre del área no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre del área debe contener únicamente letras.')
            .isLength({min: 1, max: 20}).withMessage('El nombre del área debe contener entre 1 y 20 caracteres.'),

            // validaciones del campo "areastatus" (Estatus del área)
            body('areastatus')
            .exists().withMessage('Parece que el status del área no fue enviado.')
            .trim().notEmpty().withMessage('Debe seleccionar un estatus para el área.')
            .isBoolean().isIn(['0', '1']).withMessage('El estatus del área debe ser activo o inactivo'),

            // validaciones del campo "areadescription" (Descripción del área)
            body('areadescription')
            .exists().withMessage('Parece que la descripción del área no fue enviada.')
            .trim().notEmpty().withMessage('La descripción del área no debe estar vacía.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('La descripción del área debe contener únicamente letras.')
            .isLength({min: 1, max: 40}).withMessage('La descripción del área debe contener entre 1 y 40 caracteres.'),
        ]
    },
// ------------------------------------------------ Archivo clients.js (pendiente) ------------------------------------------------
    // middleware para validar el formulario de agregar/editar cliente
    validateClients(){
        return [
            // validaciones del campo "executive" (Ejecuyivo)
            body('executive')
            .optional(),
            // validaciones del campo "group" (Grupo)
            body('group')
            .optional(),

            // validaciones del campo "tradename" (Nombre comercial)
            body('tradename')
            .exists().withMessage('Parece que el nombre comercial no fue enviado.')
            .trim().notEmpty().withMessage('El nombre comercial no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre comercial debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('El nombre comercial debe contener entre 1 y 30 caracteres.'),

            // validaciones del campo "contact" (Contacto)
            body('contact')
            .exists().withMessage('Parece que el contacto no fue enviado.')
            .trim().notEmpty().withMessage('El contacto no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El contacto debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('El contacto debe contener entre 1 y 30 caracteres.'),

            // validaciones del campo "rfc" (RFC)
            body('rfc')
            .exists().withMessage('Parece el RFC no fue enviado.')
            .trim().notEmpty().withMessage('El RFC no debe estar vacío.')
            .isLength({min: 13, max: 13}).withMessage('El RFC debe contener 13 caracteres.'),

            // validaciones del campo "companyname" (Razon social)
            body('companyname')
            .exists().withMessage('Parece que la razón social no fue enviada.')
            .trim().notEmpty().withMessage('La razón social no debe estar vacía.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('La razón social debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('La razón social debe contener entre 1 y 30 caracteres.'),

            // validaciones del campo "street" (calle)
            body('street')
            .exists().withMessage('Parece que el nombre de la calle no fue enviado.')
            .trim().notEmpty().withMessage('El nombre de la calle no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre de la calle debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('El nombre de la calle debe contener entre 1 y 30 caracteres.'),

            // validaciones del campo "outernumber" (Numero exterior)
            body('outernumber')
            .exists().withMessage('Parece el numero exterior no fue enviado.')
            .trim().notEmpty().withMessage('El numero exterior no debe estar vacío.')
            .isLength({min: 1, max: 5}).withMessage('El numero exterior  debe contener entre 1 y 5 caracteres.'),

            // validaciones del campo "innernumber" (Numero interior)
            body('innernumber')
            .optional()
            .isNumeric(),

            // validaciones del campo "colony" (Colonia)
            body('colony')
            .exists().withMessage('Parece que el nombre de la colonia no fue enviado.')
            .trim().notEmpty().withMessage('El nombre de la colonia no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre de la colonia debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('El nombre de la colonia debe contener entre 1 y 30 caracteres.'),

            // validaciones del campo "cp" (CP)
            body('cp')
            .exists().withMessage('Parece el cp no fue enviado.')
            .trim().notEmpty().withMessage('El cp no debe estar vacío.')
            .isLength({min: 5, max: 5}).withMessage('El cp debe contener 5 caracteres.'),

            // validaciones del campo "state" (Estado)
            body('state')
            .exists().withMessage('Parece que el nombre del estado no fue enviado.')
            .trim().notEmpty().withMessage('El nombre del estado no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre del estado debe contener únicamente letras.')
            .isLength({min: 1, max: 20}).withMessage('El nombre del estado debe contener entre 1 y 20 caracteres.'),

            // validaciones del campo "city" (Ciudad)
            body('city')
            .exists().withMessage('Parece que el nombre de la ciudad no fue enviado.')
            .trim().notEmpty().withMessage('El nombre de la ciudad no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre de la ciudad debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('El nombre de la ciudad debe contener entre 1 y 30 caracteres.'),

            // validaciones del campo "extension" (Extension)
            body('extension')
            .optional()
            .isNumeric(),

            // validaciones del campo "telephone" (Telefono)
            body('telephone')
            .exists().withMessage('Parece el numero de telefono no fue enviado.')
            .trim().notEmpty().withMessage('El numero de telefono no debe estar vacío.')
            .isLength({min: 10, max: 10}).withMessage('El numero de telefono debe contener 10 caracteres.'),

            // validaciones del campo "cell" (Celular)
            body('cell')
            .exists().withMessage('Parece el numero de celular no fue enviado.')
            .trim().notEmpty().withMessage('El numero de celular no debe estar vacío.')
            .isLength({min: 10, max: 10}).withMessage('El numero de celular debe contener 10 caracteres.'),

            // validaciones del campo "email" (Correo)
            body('email')
            .exists().withMessage('Parece el correo no fue enviado.')
            .trim().notEmpty().withMessage('El correo no debe estar vacío.')
            .isLength({min: 1, max: 20}).withMessage('El correo debe contener entre 1 y 20 caracteres.'),

            // validaciones del campo "creditlimit" (Limite de credito)
            body('creditlimit')
            .exists().withMessage('Parece el limite de credito no fue enviado.')
            .trim().notEmpty().withMessage('El limite de credito no debe estar vacío.')
            .isLength({min: 1, max: 3}).withMessage('El limite de credito debe contener entre 1 y 3 caracteres.'),

            // validaciones del campo "creditdays" (Días de credito)
            body('creditdays')
            .exists().withMessage('Parece el limite de días de credito no fue enviado.')
            .trim().notEmpty().withMessage('El limite de días de credito no debe estar vacío.')
            .isLength({min: 1, max: 3}).withMessage('El limite de  días de credito debe contener entre 1 y 3 caracteres.'),

            // validaciones del campo "descuento" (Descuento)
            body('descuento')
            .optional()
            .isNumeric(),

            // validaciones del campo "observaciones" (Observaciones)
            body('observaciones')
            .optional()
            .isString(),

            // validaciones del campo "status" (Estatus del cliente)
            body('status')
            .exists().withMessage('Parece que el status del cliente no fue enviado.')
            .trim().notEmpty().withMessage('Debe seleccionar un estatus para el cliente.')
            .isBoolean().isIn(['0', '1']).withMessage('El estatus del cliente debe ser activo o inactivo'),

        ]
    },

// ------------------------------------------------ Archivo grupos.js (pendiente) ------------------------------------------------
    // middleware para validar el formulario de ¿agregar/editar? grupos
    validateGroups(){
        return[
            // validaciones del campo "namegroup" (Nombre del grupo)
            body('namegroup')
            .exists().withMessage('Parece que el nombre del grupo no fue enviado.')
            .trim().notEmpty().withMessage('El nombre del grupo no debe estar vacío.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre del grupo debe contener únicamente letras.')
            .isLength({min: 1, max: 20}).withMessage('El nombre del grupo debe contener entre 1 y 20 caracteres.'),

            // validaciones del campo "description" (descripción del grupo)
            body('description')
            .exists().withMessage('Parece que la descripción del grupo no fue enviada.')
            .trim().notEmpty().withMessage('La descripción del grupo no debe estar vacía.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('La descripción del grupo debe contener únicamente letras.')
            .isLength({min: 1, max: 30}).withMessage('El nombre del grupo debe contener entre 1 y 30 caracteres.'),

        ]
    },

// ------------------------------------------------ Archivo cobranza.js (pendiente) ------------------------------------------------
    // middleware para validar el formulario de ¿agregar/editar? cobranza
    validateCobranza(){
        return[
            body('id_cobranza')
            .exists().withMessage('Se intento hacer cobranza a ninguna orden.')
            .trim().notEmpty().withMessage('No se puede hacer cobranza a 0 ordenes.'),

            body('forma')
            .exists().withMessage('No se puede poner forma de pago vacia.')
            .trim().notEmpty().withMessage('No se puede poner forma de pago vacia.')
            .custom( value =>{
                if (value == "none"){
                    throw new Error('No se puede usar la opcion --Seleccionar-- en forma de pago');
                } 
                return true;
            }),

            body('pago')
            .exists().withMessage('No se puede poner el estatus de pago como vacio.')
            .trim().notEmpty().withMessage('No se puede poner el estatus de pago como vacio.'),

            body('fecLiq')
            .exists().withMessage('La fecha de liquidacion esta vacia.')
            .trim().notEmpty().withMessage('Debe elegir una fecha de liquidacion.'),
        ]
    },
// ------------------------------------------------ Archivo dashboard.js --------------------------------------------
    // middleware para validar el filtro de las gráficas de ventas por empleado
    validateGraphsFilterEployees(){
        return [
            // validaciones del campo "dateFilter" (fechas del filtro)
            body('dateFilter')
            .exists().withMessage('Parece que la fecha para el filtro no fue enviada.')
            .trim().notEmpty().withMessage('Debe elegir una fecha para el filtro.'),

            // validaciones del campo "unitFilter" (unidad del filtro)
            body('unitFilter')
            .exists().withMessage('Parece que la unidad para el filtro no fue enviada.')
            .trim().notEmpty().withMessage('Debe elegir una unidad para el filtro.')
            .isIn(['Mt', 'Pieza', 'Millar', 'Pesos']).withMessage('La unidad elegida no es válida.')
        ]
    },

    // middleware para validar el filtro de las gráficas de compras por cliente
    validateGraphsFilterClients(){
        return [
            // validaciones del campo "dateFilter" (fechas del filtro)
            body('dateFilter')
            .exists().withMessage('Parece que la fecha para el filtro no fue enviada.')
            .trim().notEmpty().withMessage('Debe elegir una fecha para el filtro.'),
        ]
    },

    // middleware para validar el filtro de las gráficas de ventas por producto
    validateGraphsFilterProducts(){
        return [
            // validaciones del campo "dateFilter" (fechas del filtro)
            body('dateFilter')
            .exists().withMessage('Parece que la fecha para el filtro no fue enviada.')
            .trim().notEmpty().withMessage('Debe elegir una fecha para el filtro.'),

            // validaciones del campo "unitFilter" (unidad del filtro)
            body('unitFilter')
            .exists().withMessage('Parece que la unidad para el filtro no fue enviada.')
            .trim().notEmpty().withMessage('Debe elegir una unidad para el filtro.')
            .isIn(['Global', 'Mt', 'Pieza', 'Millar']).withMessage('La unidad elegida no es válida.')
        ]
    },

    // middleware para validar el formulario de reportes
    validateReports(){
        return [
            // validaciones del campo "sectionsReport" (Secciones del reporte)
            body('sectionsReport')
            .exists().withMessage('Parece que las secciones para el reporte no fueron enviadas.')
            .trim().notEmpty().withMessage('Debe elegir por lo menos una sección para el reporte.')
            .isIn(['areas', 'clientes', 'cotizaciones', 'empleados', 'gruposClientes', 'maquinas', 'ordenes', 'productos', 'productosCotizados', 'productosOrdenados', 'roles', 'usuarios']).withMessage('La sección elegida no es válida.')
        ]
    },

// ------------------------------------------------ Archivo extask.js ------------------------------------------------
    // middleware para validar el formulario de listar procesos
    validateExtaskListStagesProcess(){
        return [
            // validaciones del campo "cotId" (id de la cotización)
            body('cotId')
            .exists().withMessage('Parece que el id de la cotizacón no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id de la cotizacón está vacío.')
            .isInt().withMessage('Parece que el id de la cotización no es un número.')
        ]
    },

    // middleware para validar el formulario de crear orden
    validateExtaskCreateOrder(){
        return [
            body('*')
            .trim().notEmpty().withMessage('Parece que el orden o el nombre del área está vacío.')
            .if(body('*').not().isInt()).isArray().withMessage('Parece que el formato del orden-area no es correcto.')
            .if(body('*').not().isArray()).isInt().withMessage('Parece que el nombre del área o el orden no es correcto.')
        ]
    },
// ------------------------------------------------ Archivo machines.js ------------------------------------------------
    // middleware para validar el formulario de agregar/editar máquinas
    validateMachines(){
        return [
            // validaciones del campo "serialnumber" (número de serie)
            body('serialnumber')
            .exists().withMessage('Parece que el número de serie de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el número de serie de la máquina está vacío.')
            .isString().withMessage('Parece que el número de serie de la máquina no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el número de serie de la máquina cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que el número de serie de la máquina no cumple con el límite de caracteres.'),

            // validaciones del campo "brand" (marca)
            body('brand')
            .exists().withMessage('Parece que la marca de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que la marca de la máquina está vacío.')
            .isString().withMessage('Parece que la marca de la máquina no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que la marca de la máquina cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que la marca de la máquina no cumple con el límite de caracteres.'),

            // validaciones del campo "name" (nombre)
            body('name')
            .exists().withMessage('Parece que el nombre de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el nombre de la máquina está vacío.')
            .isString().withMessage('Parece que el nombre de la máquina no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el nombre de la máquina cuenta con carateres no válidos.')
            .isLength({min: 1, max: 25}).withMessage('Parece que el nombre de la máquina no cumple con el límite de caracteres.'),

            // validaciones del campo "headtype" (tipo de cabezal)
            body('headtype')
            .exists().withMessage('Parece que el tipo de cabezal de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el tipo de cabezal de la máquina está vacío.')
            .isString().withMessage('Parece que el tipo de cabezal de la máquina no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el tipo de cabezal de la máquina cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que el tipo de cabezal de la máquina no cumple con el límite de caracteres.'),

            // validaciones del campo "headnum" (número de cabezales)
            body('headnum')
            .exists().withMessage('Parece que el número de cabezales de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el número de cabezales de la máquina está vacío.')
            .isInt().withMessage('Parece que el número de cabezales de la máquina no está en un formato adecuado.'),

            // validaciones del campo "speed" (velocidad)
            body('speed')
            .exists().withMessage('Parece que la velocidad de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que la velocidad de la máquina está vacío.')
            .isInt().withMessage('Parece que la velocidad de la máquina no está en un formato adecuado.'),

            // validaciones del campo "inktype" (tipo de tinta)
            body('inktype')
            .exists().withMessage('Parece que el tipo de tinta de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el tipo de tinta de la máquina está vacío.')
            .isString().withMessage('Parece que el tipo de tinta de la máquina no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el tipo de tinta de la máquina cuenta con carateres no válidos.')
            .isLength({min: 1, max: 30}).withMessage('Parece que el tipo de tinta de la máquina no cumple con el límite de caracteres.'),

            // validaciones del campo "techcontact" (contacto del técnico)
            body('techcontact')
            .exists().withMessage('Parece que el contacto del técnico no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el contacto del técnico está vacío.')
            .isString().withMessage('Parece que el contacto del técnico no está en un formato adecuado.')
            .matches(/[0-9]{10}/).withMessage('Parece que el contacto del técnico cuenta con carateres no válidos.')
            .isLength({min: 10, max: 10}).withMessage('Parece que el contacto del técnico no cumple con el límite de caracteres.'),

            // validaciones del campo "extension" (contacto del técnico extensión)
            body('extension')
            .exists().withMessage('Parece que la extensión del contacto del técnico no fue enviada.')
            .if(body('extension').trim().notEmpty())
                .trim().notEmpty().withMessage('Parece que la extensión del contacto del técnico está vacía.')
                .isString().withMessage('Parece que la extensión del contacto del técnico no está en un formato adecuada.')
                .matches(/^[0-9]{1,10}$/).withMessage('Parece que la extensión del contacto del técnico cuenta con carateres no válidos.')
                .isLength({min: 1, max: 10}).withMessage('Parece que la extensión del contacto del técnico no cumple con el límite de caracteres.'),
            
            // validaciones del campo "status" (activo)
            body('status')
            .exists().withMessage('Parece que el status de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el status de la máquina está vacío.')
            .isBoolean().isIn(['0', '1']).withMessage('Parece que el status de la máquina presenta un valor no válido.'),

            // validaciones del campo "allowedUser" (lista de usuarios autorizados)
            body('allowedUser')
            .trim().notEmpty().withMessage('Parece que la lista de usuarios autorizados está vacía.')
            .if(body('allowedUser').not().isInt()).isArray().withMessage('Parece que el formato de la lista de usuarios autorizados no es correcto.')
            .if(body('allowedUser').not().isArray()).isInt().withMessage('Parece que el id del usuario autorizado no es correcto.')
        ]
    },

    // middleware para validar el listado de los usuarios autorizados
    validateMachinesListUsers(){
        return [
            // validaciones del campo "idMachine" (id de la máquina)
            body('idMachine')
            .exists().withMessage('Parece que el id de la máquina no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id de la máquina está vacío.')
            .isInt().withMessage('Parece que el id de la máquina no es un número.')
        ]
    },
// ------------------------------------------------ Archivo monitor.js ------------------------------------------------
    // middleware para validar el listado de las tareas
    validateMonitorInfotasks() {
        return [
            // validaciones del campo "idMachine" (id de la tarea)
            body('taskId')
            .exists().withMessage('Parece que el id de la tareas no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id de la tareas está vacío.')
            .isInt().withMessage('Parece que el id de la tareas no es un número.')
        ]
    },
// ------------------------------------------------ Archivo orders.js ------------------------------------------------
    // middleware para validar el revaluo de las ordenes
    validateOrdersRevalue() {
        return [
            // validaciones del campo "observaciones" (observaciones)
            body('data.cotizacion.observaciones')
            .exists().withMessage('Parece que las observaciones no fueron enviadas.')
            .trim().notEmpty().withMessage('Parece que las observaciones estab vacías.')
            .isString().withMessage('Parece que las observaciones no estan en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que las observaciones cuentan con carateres no válidos.')
            .isLength({min: 1, max: 100}).withMessage('Parece que las observaciones no cumplen con el límite de caracteres.'),

            // validaciones del campo "porcentajeDescuento" (porcentaje de descuento)
            body('data.cotizacion.porcentajeDescuento')
            .exists().withMessage('Parece que el porcentaje de descuento no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el porcentaje de descuento está vacío.')
            .isString().withMessage('Parece que el porcentaje de descuento no está en un formato adecuado.')
            .matches(/^\d+(\.\d{1,2})?$/).withMessage('Parece que el porcentaje de descuento cuenta con carateres no válidos.'),

            // validaciones del campo "totalBruto" (total en bruto)
            body('data.cotizacion.totalBruto')
            .exists().withMessage('Parece que el total en bruto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el total en bruto está vacío.')
            .isInt().withMessage('Parece que el total en bruto no está en un formato adecuado.'),

            // validaciones del campo "descuento" (descuento)
            body('data.cotizacion.descuento')
            .exists().withMessage('Parece que el descuento no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el descuento está vacío.')
            .isInt().withMessage('Parece que el descuento no está en un formato adecuado.'),

            // validaciones del campo "subtotal" (subtotal)
            body('data.cotizacion.subtotal')
            .exists().withMessage('Parece que el subtotal no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el subtotal está vacío.')
            .isInt().withMessage('Parece que el subtotal no está en un formato adecuado.'),

            // validaciones del campo "iva" (iva)
            body('data.cotizacion.iva')
            .exists().withMessage('Parece que el iva no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el iva está vacío.')
            .isInt().withMessage('Parece que el iva no está en un formato adecuado.'),

            // validaciones del campo "total" (total)
            body('data.cotizacion.total')
            .exists().withMessage('Parece que el total no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el total está vacío.')
            .isInt().withMessage('Parece que el total no está en un formato adecuado.'),

            // validaciones del campo "revalueproductId" (id del producto cotizado)
            body('data.productos.**.revalueproductId')
            .exists().withMessage('Parece que el id del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id del producto está vacío.')
            .isString().withMessage('Parece que el id del producto no está en un formato adecuado.')
            .not().matches(/^\d$/).withMessage('Parece que el id del producto cuenta con carateres no válidos.'),

            // validaciones del campo "revaluepriceproduct" (precio individual del producto cotizado)
            body('data.productos.**.revaluepriceproduct')
            .exists().withMessage('Parece que el precio individual del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el precio individual del producto está vacío.')
            .isString().withMessage('Parece que el precio individual del producto no está en un formato adecuado.')
            .not().matches(/^\d$/).withMessage('Parece que el precio individual del producto cuenta con carateres no válidos.'),

            // validaciones del campo "revaluepriceach" (precio del producto total)
            body('data.productos.**.revaluepriceach')
            .exists().withMessage('Parece que el precio del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el precio del producto está vacío.')
            .isInt().withMessage('Parece que el precio del producto no está en un formato adecuado.'),

            // validaciones del campo "revalueamount" (total del producto total)
            body('data.productos.**.revalueamount')
            .exists().withMessage('Parece que el total del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el total del producto está vacío.')
            .isInt().withMessage('Parece que el total del producto no está en un formato adecuado.'),

            // validaciones del campo "revalueisoutcatalog" (estatus fuera o dentro de catalogo)
            body('data.productos.**.revalueisoutcatalog')
            .exists().withMessage('Parece que el estatus en catálogo del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el estatus en catálogo del producto está vacío.')
            .isBoolean().isIn(['0', '1']).withMessage('Parece que el estatus en catálogo del producto presenta un valor no válido.'),
        ]
    },

    // middleware para validar la previsualización del revaluo de las ordenes
    validateOrdersPreview() {
        return [
            // validaciones generales de la previsualización (todos los campos)
            body('inputs.*')
            .exists().withMessage('Parece que la información del revaluo no fue enviada.')
            .trim().notEmpty().withMessage('Parece que la información del revaluo está vacía.'),
        ]
    },

    // middleware para validar el envío a producción de la orden
    validateOrdersDeadline() {
        return [
            // validaciones del campo "deadline" (fecha de entrega)
            body('deadline')
            .exists().withMessage('Parece que la fecha de entrega no fue enviada.')
            .trim().notEmpty().withMessage('Parece que la fecha de entrega está vacía.'),
        ]
    },
// ------------------------------------------------ Archivo processes.js ------------------------------------------------
    // middleware para añadir/editar procesos
    validateProcesses() {
        return [
            // validaciones del campo "processname" (nombre del proceso)
            body('processname')
            .exists().withMessage('Parece que el nombre del proceso no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el nombre del proceso está vacío.')
            .isString().withMessage('Parece que el nombre del proceso no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el nombre del proceso cuenta con carateres no válidos.')
            .isLength({min: 1, max: 30}).withMessage('Parece que el nombre del proceso no cumple con el límite de caracteres.'),

            // validaciones del campo "processdescription" (descripción del proceso)
            body('processdescription')
            .exists().withMessage('Parece que la descripción del proceso no fue enviada.')
            .trim().notEmpty().withMessage('Parece que la descripción del proceso está vacía.')
            .isString().withMessage('Parece que la descripción del proceso no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que la descripción del proceso cuenta con carateres no válidos.')
            .isLength({min: 1, max: 40}).withMessage('Parece que la descripción del proceso no cumple con el límite de caracteres.'),

            // validaciones del campo "orderProcess" (orden de las áreas)
            body('orderProcess')
            .trim().notEmpty().withMessage('Parece que el orden del área está vacío.')
            .if(body('orderProcess').not().isInt()).isArray().withMessage('Parece que el formato del orden del área no es correcto.')
            .if(body('orderProcess').not().isArray()).isInt().withMessage('Parece que el orden del área no es correcto.'),

            // validaciones del campo "areaProcess" (áreas)
            body('areaProcess')
            .trim().notEmpty().withMessage('Parece que el área está vacía.')
            .if(body('areaProcess').not().isInt()).isArray().withMessage('Parece que el formato del área no es correcto.')
            .if(body('areaProcess').not().isArray()).isInt().withMessage('Parece que el id del área no es correcto.')
        ]
    },

    // middleware para validar el listado de las etapas y la lista de productos asociados
    validateProcessesLists() {
        return [
            // validaciones del campo "processId" (id del proceso)
            body('processId')
            .exists().withMessage('Parece que el id del proceso no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id del proceso está vacío.')
            .isInt().withMessage('Parece que el id del proceso no es un número.')
        ]
    },
// --------------------------------------------------- Archivo products.js ----------------------------------------------------
    // middleware para validar el formulario de crear/editar productos
    validateProducts(){
        return [
            body('nombre')
            .exists().withMessage("El nombre de producto no esta lleno")
            .trim().notEmpty().withMessage("El nombre de producto no puede estar vacio")
            .isLength({min: 1, max: 30}).withMessage('El nombre debe tener entre 1 y 30 caracteres.'),

            body('precio')
            .exists().withMessage('El precio del producto esta vacio')
            .trim().notEmpty().withMessage('El precio del producto no puede estar vacio')
            .matches(/^\d+(\.\d+)?$/).withMessage('El precio debe contener solo digitos'),

            body('descripcion')
            .exists().withMessage('La descripcion del producto no esta lleno')
            .trim().notEmpty().withMessage('La descripcion del producto no puede estar vacio')
            .isLength({min: 1, max: 100}).withMessage('La descripcion debe tener entre 1 y 100 caracteres'),
        ]
    },
// ------------------------------------------------ Archivo quotations.js ------------------------------------------------
    // middleware para añadir/editar cotizaciones
    validateQuotations(){
        return [
            // validaciones del campo "fecha" (fecha de generación)
            body('data.cotizacion.fecha')
            .exists().withMessage('Parece que la fecha de generación no fue enviada.')
            .trim().notEmpty().withMessage('Parece que la fecha de generación está vacía.'),

            // validaciones del campo "cliente_id" (id del proceso)
            body('data.cotizacion.cliente_id')
            .exists().withMessage('Parece que el id del cliente no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id del cliente está vacío.')
            .isInt().withMessage('Parece que el id del cliente no es un número.'),

            // validaciones del campo "proyecto" (proyecto)
            body('data.cotizacion.proyecto')
            .exists().withMessage('Parece que el proyecto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el proyecto está vacío.')
            .isString().withMessage('Parece que el proyecto no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el proyecto cuenta con carateres no válidos.')
            .isLength({min: 1, max: 30}).withMessage('Parece que el proyecto no cumple con el límite de caracteres.'),

            // validaciones del campo "observaciones" (observaciones)
            body('data.cotizacion.observaciones')
            .exists().withMessage('Parece que las observaciones no fueron enviadas.')
            .trim().notEmpty().withMessage('Parece que las observaciones están vacías.')
            .isString().withMessage('Parece que las observaciones no están en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que las observaciones cuenta con carateres no válidos.')
            .isLength({min: 1, max: 100}).withMessage('Parece que las observaciones no cumple con el límite de caracteres.'),

            // validaciones del campo "porcentajeDescuento" (porcentaje de descuento)
            body('data.cotizacion.porcentajeDescuento')
            .exists().withMessage('Parece que el porcentaje de descuento no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el porcentaje de descuento está vacío.')
            .isString().withMessage('Parece que el porcentaje de descuento no está en un formato adecuado.')
            .matches(/^\d+(\.\d{1,2})?$/).withMessage('Parece que el porcentaje de descuento cuenta con carateres no válidos.'),

            // validaciones del campo "solicitante" (solicitante)
            body('data.cotizacion.solicitante')
            .exists().withMessage('Parece que el solicitante no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el solicitante está vacío.')
            .isString().withMessage('Parece que el solicitante no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el solicitante cuenta con carateres no válidos.')
            .isLength({min: 1, max: 50}).withMessage('Parece que el solicitante no cumple con el límite de caracteres.'),

            // validaciones del campo "empleado" (nombre del empleado)
            body('data.cotizacion.empleado')
            .exists().withMessage('Parece que el empleado no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el empleado está vacío.')
            .isString().withMessage('Parece que el empleado no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el empleado cuenta con carateres no válidos.')
            .isLength({min: 1, max: 50}).withMessage('Parece que el empleado no cumple con el límite de caracteres.'),

            // validaciones del campo "estatus" (estatus de la cotización)
            body('data.cotizacion.estatus')
            .exists().withMessage('Parece que el estatus no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el estatus está vacío.')
            .isString().withMessage('Parece que el estatus no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el estatus cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que el estatus no cumple con el límite de caracteres.')
            .isIn(['Generada', 'Cancelada', 'Orden cancelada', 'Ordenada', 'Enviada', 'Recotizada']).withMessage('Parece que el estatus presenta un valor no válido.'),
            
            // validaciones del campo "totalBruto" (totalBruto)
            body('data.cotizacion.totalBruto')
            .exists().withMessage('Parece que el total bruto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el total bruto está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el total bruto presenta un formato no válido'),

            // validaciones del campo "descuento" (descuento)
            body('data.cotizacion.descuento')
            .exists().withMessage('Parece que el descuento no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el descuento está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el descuento presenta un formato no válido'),

            // validaciones del campo "subtotal" (subtotal)
            body('data.cotizacion.subtotal')
            .exists().withMessage('Parece que el subtotal no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el subtotal está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el subtotal presenta un formato no válido'),

            // validaciones del campo "iva" (iva)
            body('data.cotizacion.iva')
            .exists().withMessage('Parece que el iva no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el iva está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el iva presenta un formato no válido'),

            // validaciones del campo "total" (total)
            body('data.cotizacion.total')
            .exists().withMessage('Parece que el total no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el total está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el total presenta un formato no válido'),

            //-------------------------------------- Validaciones de los productos cotizados --------------------------------------

            // validaciones del campo "productId" (id del producto cotizado)
            body('data.productos.**.productId')
            .exists().withMessage('Parece que el id del producto no fue enviado.')
            .if(body('data.productos.**.isoutcatalog').equals('0'))
                .trim().notEmpty().withMessage('Parece que el id del producto en catálogo está vacío.')
                .isString().withMessage('Parece que el id del producto no está en un formato adecuado.')
                .matches(/^\d$/).withMessage('Parece que el id del producto cuenta con carateres no válidos.'),

            // validaciones del campo "nameproduct" (nombre del producto cotizado)
            body('data.productos.**.nameproduct')
            .exists().withMessage('Parece que el nombre del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el nombre del producto está vacío.')
            .isString().withMessage('Parece que el nombre del producto no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el nombre del producto cuenta con carateres no válidos.')
            .isLength({min: 1, max: 50}).withMessage('Parece que el nombre del producto no cumple con el límite de caracteres.'),

            // validaciones del campo "isoutcatalog" (estatus fuera o dentro de catálogo)
            body('data.productos.**.isoutcatalog')
            .exists().withMessage('Parece que el estatus en catálogo del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el estatus en catálogo del producto está vacío.')
            .isBoolean().isIn(['0', '1']).withMessage('Parece que el estatus en catálogo del producto presenta un valor no válido.'),

            // validaciones del campo "unitproduct" (unidad del producto)
            body('data.productos.**.unitproduct')
            .exists().withMessage('Parece que la unidad del producto no fue enviada.')
            .trim().notEmpty().withMessage('Parece que la unidad del producto está vacía.')
            .isString().withMessage('Parece que la unidad del producto no está en un formato adecuado.')
            .isLength({min: 1, max: 10}).withMessage('Parece que la unidad del producto no cumple con el límite de caracteres.')
            .isIn(['Mt', 'Pieza', 'Millar']).withMessage('Parece que la unidad del producto presenta un valor no válido.'),

            // validaciones del campo "priceproduct" (precio del producto)
            body('data.productos.**.priceproduct')
            .exists().withMessage('Parece que el precio del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el precio del producto está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el total presenta un formato no válido'),

            // validaciones del campo "quantityproduct" (cantidad de productos)
            body('data.productos.**.quantityproduct')
            .exists().withMessage('Parece que cantidad de productos no fue enviada.')
            .trim().notEmpty().withMessage('Parece que cantidad de productos está vacía.')
            .isInt().withMessage('Parece que cantidad de productos no es un número.'),

            // validaciones del campo "coatingproduct" (acabados del producto cotizado)
            body('data.productos.**.coatingproduct')
            .exists().withMessage('Parece que los acabados del producto no fueron enviados.')
            .trim().notEmpty().withMessage('Parece que los acabados del producto están vacíos.')
            .isString().withMessage('Parece que los acabados del producto no están en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que los acabados del producto cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que los acabados del producto no cumplen con el límite de caracteres.'),

            // validaciones del campo "fileproduct" (archivo del producto cotizado)
            body('data.productos.**.fileproduct')
            .exists().withMessage('Parece que el archivo del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el archivo del producto está vacío.')
            .isString().withMessage('Parece que el archivo del producto no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el archivo del producto cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que el archivo del producto no cumple con el límite de caracteres.'),

            // validaciones del campo "lengthproduct" (largo del producto)
            body('data.productos.**.lengthproduct')
            .exists().withMessage('Parece que el largo del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el largo del producto está vacío.')
            .isDecimal({decimal_digits: "3"}).withMessage('Parece que el largo del producto no está en un formato adecuado.'),

            // validaciones del campo "widthproduct" (ancho del producto)
            body('data.productos.**.widthproduct')
            .exists().withMessage('Parece que el ancho del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el ancho del producto está vacío.')
            .isDecimal({decimal_digits: "3"}).withMessage('Parece que el ancho del producto no está en un formato adecuado.'),

            // validaciones del campo "measure" (área del producto)
            body('data.productos.**.measure')
            .exists().withMessage('Parece que el área del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el área del producto está vacío.')
            .isDecimal({decimal_digits: "3"}).withMessage('Parece que el área del producto no está en un formato adecuado.'),

            // validaciones del campo "priceach" (precio del producto)
            body('data.productos.**.priceach')
            .exists().withMessage('Parece que el precio del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el precio del producto está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el precio del producto no está en un formato adecuado.'),

            // validaciones del campo "amount" (total del producto)
            body('data.productos.**.amount')
            .exists().withMessage('Parece que el total del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el total del producto está vacío.')
            .isDecimal({decimal_digits: "2"}).withMessage('Parece que el total del producto no está en un formato adecuado.'),
        ]
    },

    // middleware para validar la información de los productos por cotizados
    validateQuotationsInfoProduct() {
        return [
            // validaciones del campo "idProduct" (id del producto)
            body('idProduct')
            .exists().withMessage('Parece que el id del producto no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id del producto está vacío.')
            .isInt().withMessage('Parece que el id del producto no es un número.')
        ]
    },

    // middleware para validar el descuento del cliente en la cotización
    validateQuotationsDiscountClient() {
        return [
            // validaciones del campo "clientid" (id del cliente)
            body('clientid')
            .exists().withMessage('Parece que el id del cliente no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id del cliente está vacío.')
            .isInt().withMessage('Parece que el id del cliente no es un número.')
        ]
    },

    // middleware para validar el email del cliente en la cotización
    validateQuotationsEmialClient() {
        return [
            // validaciones del campo "inputEmailClient" (email del cliente)
            body('inputEmailClient')
            .exists().withMessage('Parece que el email del cliente no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el email del cliente está vacío.')
            .isEmail().withMessage('Parece que el email del cliente no es un correo electrónico.')
            .isLength({min: 1, max: 40}).withMessage('Parece que el email del cliente no cumple con el límite de caracteres.'),
        ]
    },
// ------------------------------------------------ Archivo roles.js ------------------------------------------------
    // middleware para añadir/editar roles
    validateRoles() {
        return [
            // validaciones del campo "rolename" (nombre del rol)
            body('rolename')
            .exists().withMessage('Parece que el nombre del rol no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el nombre del rol está vacío.')
            .isString().withMessage('Parece que el nombre del rol no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que el nombre del rol cuenta con carateres no válidos.')
            .isLength({min: 1, max: 20}).withMessage('Parece que el nombre del rol no cumple con el límite de caracteres.'),

            // validaciones del campo "roledescription" (descripción del rol)
            body('roledescription')
            .exists().withMessage('Parece que la descripción del rol no fue enviada.')
            .trim().notEmpty().withMessage('Parece que la descripción del rol está vacía.')
            .isString().withMessage('Parece que la descripción del rol no está en un formato adecuado.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('Parece que la descripción del rol cuenta con carateres no válidos.')
            .isLength({min: 1, max: 40}).withMessage('Parece que la descripción del rol no cumple con el límite de caracteres.'),

            // validaciones del campo "rolestatus" (estatus del rol)
            body('rolestatus')
            .exists().withMessage('Parece que el status del rol no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el status del rol está vacío.')
            .isBoolean().isIn(['0', '1']).withMessage('Parece que el status del rol presenta un valor no válido.'),

            // validaciones del campo "permissions" (permisos del rol)
            body('permissions')
            .exists().withMessage('Parece que los permisos del rol no fueron enviados.')
            .trim().notEmpty().withMessage('Parece que los permisos del rol estan vacíos.')
            .if(body('permissions').not().isInt()).isArray().withMessage('Parece que el formato de los permisos del rol no son correctos.')
            .if(body('permissions').not().isArray()).isInt().withMessage('Parece que el id de los permisos del rol no son correctos.')
        ]
    },

    // middleware para validar el listado de los usuarios asignado y la lista de permisos
    validateRolesLists() {
        return [
            // validaciones del campo "idRole" (id del rol)
            body('idRole')
            .exists().withMessage('Parece que el id del rol no fue enviado.')
            .trim().notEmpty().withMessage('Parece que el id del rol está vacío.')
            .isInt().withMessage('Parece que el id del rol no es un número.')
        ]
    },
// --------------------------------------------------- Archivo tareas.js --------------------------------------------------------
    // middleware para validar el formulario de terminar / regresar tareas
    validateTareas(){
        return[
            body('descripcion')
            .exists().withMessage("La descripcion no esta llena")
            .trim().notEmpty().withMessage('La descripcion no puede estar vacia'),

            body('*')
            .trim().notEmpty().withMessage('La maquina o el usuario tienen valores vacios'),
        ]
    },
// ---------------------------------------------- Archivo usuario.js --------------------------------------------------
    // middleware para validar el formulario de crear usuarios
    validateCreateUser(){
        return [
            body('nombre')
            .exists().withMessage('El nombre no esta lleno.')
            .trim().notEmpty().withMessage('El nombre esta vacio.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre del usuario debe contener únicamente letras.')
            .isLength({min: 1, max: 25}).withMessage('El nombre del usuario debe contener entre 1 y 25 caracteres.'),

            body('apellido')
            .exists().withMessage('El apellido no esta lleno.')
            .trim().notEmpty().withMessage('El apellido esta vacio.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El apellido del usuario debe contener únicamente letras.')
            .isLength({min: 1, max: 25}).withMessage('El apellido del usuario debe contener entre 1 y 25 caracteres.'),

            body('correo')
            .exists().withMessage('El correo no esta lleno.')
            .trim().notEmpty().withMessage('El correo esta vacio.')
            .matches(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/).withMessage('El correo no tiene el formato requerido.'),

            body('pass')
            .exists().withMessage('La contraseña no puede estar vacia')
            .trim().notEmpty().withMessage('La contraseña no puede estar vacia'),

            body('confirmPass')
            .exists().withMessage('La confirmacion de contraseña no puede estar vacia')
            .trim().notEmpty().withMessage('La confirmacion de contraseña no puede estar vacia')
            .custom( (value, { req }) =>{
                if (value != req.body.pass){
                    throw new Error('Las contraseñas no coinciden');
                } 
                return true;
            }),
        ]
    },

    // middleware para validar el formulario de editar usuarios
    validateEditUser(){
        return [
            body('nombre')
            .exists().withMessage('El nombre no esta lleno.')
            .trim().notEmpty().withMessage('El nombre esta vacio.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre del usuario debe contener únicamente letras.')
            .isLength({min: 1, max: 25}).withMessage('El nombre del usuario debe contener entre 1 y 25 caracteres.'),

            body('apellido')
            .exists().withMessage('El apellido no esta lleno.')
            .trim().notEmpty().withMessage('El apellido esta vacio.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El apellido del usuario debe contener únicamente letras.')
            .isLength({min: 1, max: 25}).withMessage('El apellido del usuario debe contener entre 1 y 25 caracteres.'),

            body('correo')
            .exists().withMessage('El correo no esta lleno.')
            .trim().notEmpty().withMessage('El correo esta vacio.')
            .matches(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/).withMessage('El correo no tiene el formato requerido.'),
        ]
    },

// --------------------------------------------------- Archivo products.js ----------------------------------------------------
    // middleware para validar el formulario de crear/editar productos
    validateProducts(){
        return [
            body('nombre')
            .exists().withMessage("El nombre de producto no esta lleno")
            .trim().notEmpty().withMessage("El nombre de producto no puede estar vacio")
            .isLength({min: 1, max: 30}).withMessage('El nombre debe tener entre 1 y 30 caracteres.'),

            body('precio')
            .exists().withMessage('El precio del producto esta vacio')
            .trim().notEmpty().withMessage('El precio del producto no puede estar vacio')
            .matches(/^\d+(\.\d+)?$/).withMessage('El precio debe contener solo digitos'),

            body('descripcion')
            .exists().withMessage('La descripcion del producto no esta lleno')
            .trim().notEmpty().withMessage('La descripcion del producto no puede estar vacio')
            .isLength({min: 1, max: 100}).withMessage('La descripcion debe tener entre 1 y 100 caracteres'),
        ]
    },

// --------------------------------------------------- Archivo tareas.js --------------------------------------------------------
    // middleware para validar el formulario de terminar / regresar tareas
    validateTareas(){
        return[
            body('descripcion')
            .exists().withMessage("La descripcion no esta llena")
            .trim().notEmpty().withMessage('La descripcion no puede estar vacia'),

            body('*')
            .trim().notEmpty().withMessage('La maquina o el usuario tienen valores vacios'),
        ]
    },

// -------------------------------------------------- Archivo cobranza.js ------------------------------------------------------
    // middleware para validar el formulario de gestion de cobranza
    validateCobranza(){
        return[
            body('id_cobranza')
            .exists().withMessage('Se intento hacer cobranza a ninguna orden.')
            .trim().notEmpty().withMessage('No se puede hacer cobranza a 0 ordenes.'),

            body('forma')
            .exists().withMessage('No se puede poner forma de pago vacia.')
            .trim().notEmpty().withMessage('No se puede poner forma de pago vacia.')
            .custom( value =>{
                if (value == "none"){
                    throw new Error('No se puede usar la opcion --Seleccionar-- en forma de pago');
                } 
                return true;
            }),

            body('pago')
            .exists().withMessage('No se puede poner el estatus de pago como vacio.')
            .trim().notEmpty().withMessage('No se puede poner el estatus de pago como vacio.'),

            body('fecLiq')
            .exists().withMessage('La fecha de liquidacion esta vacia.')
            .trim().notEmpty().withMessage('Debe elegir una fecha de liquidacion.'),
        ]
    },

// ----------------------------------------------------- Archivo employees.js --------------------------------------------------
    // middleware para validar el formulario de creacion de empleados
    validateCreateEmployees(){
        return[
            body('nombre')
            .exists().withMessage('Parece que el nombre esta vacio.')
            .trim().notEmpty().withMessage('El nombre no puede estar vacio.')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre solo puede contener letras.'),

            body('lugNacimiento')
            .exists().withMessage('Parece que el lugar de nacimiento esta vacio')
            .trim().notEmpty().withMessage('El lugar de nacimiento no puede estar vacio'),

            body('fecNacimiento')
            .exists().withMessage('Parece que la fecha de nacimiento esta vacia')
            .trim().notEmpty().withMessage('La fecha de nacimiento no puede estar vacia'),

            body('edad')
            .exists().withMessage('Parece que la edad esta vacia')
            .trim().notEmpty().withMessage('La edad no puede estar vacia')
            .matches(/^\d+(\.\d+)?$/).withMessage('La edad debe contener solo numeros'),

            body('numeroTelefono')
            .exists().withMessage('El numero de telefono parece estar vacia')
            .trim().notEmpty().withMessage('El numero de telefono no puede estar vacio')
            .matches(/^\d+(\.\d+)?$/).withMessage('El numero de telefono debe contener solo numeros')
            .isLength({min:10, max:10}).withMessage('El numero debe tener exactamente 10 caracteres'),

            body('correo')
            .exists().withMessage('El correo electronico parece estar vacio')
            .trim().notEmpty().withMessage('El correo electronico no puede estar vacio')
            .matches(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/).withMessage('El correo no tiene el formato requerido.'),

            body('emerNombre')
            .exists().withMessage('El nombre del contacto de emergencia parece estar vacio')
            .trim().notEmpty().withMessage('El nombre del contacto de emergencia no puede estar vacio')
            .not().matches(/[^a-zA-ZÀ-ÿ0-9\sñÑ]/).withMessage('El nombre del contacto de emergencia solo puede contener letras'),

            body('emerTel')
            .exists().withMessage('El telefono del contacto de emergencia parece estar vacio')
            .trim().notEmpty().withMessage('El telefono del contacto de emergencia no puede estar vacio')
            .matches(/^\d+(\.\d+)?$/).withMessage('El telefono del contacto de emergencia debe contener solo numeros')
            .isLength({min:10, max:10}).withMessage('El telefono del contacto de emergencia debe tener exactamente 10 caracteres'),

            body('curp')
            .exists().withMessage('La CURP parece estar vacia')
            .trim().notEmpty().withMessage('La CURP no puede estar vacia')
            .isLength({min:18, max:18}).withMessage('La CURP debe tener exactamente 18 caracteres'),

            body('rfc')
            .exists().withMessage('El RFC parece estar vacio')
            .trim().notEmpty().withMessage('El RFC no puede estar vacio')
            .isLength({min:12, max:13}).withMessage('El RFC debe tener entre 12 y 13 caracteres'),

            body('nss')
            .exists().withMessage('El NSS parece estar vacio')
            .trim().notEmpty().withMessage('El NSS no puede estar vacio')
            .isLength({min:11, max:11}).withMessage('El NSS debe contener exactamente 11 caracteres'),

            body('nomina')
            .exists().withMessage('El numero de nomina parece estar vacio')
            .trim().notEmpty().withMessage('El numero de nomina no puede estar vacio'),

            body('salario')
            .exists().withMessage('El salario parece estar vacio')
            .trim().notEmpty().withMessage('El salario no puede estar vacio')
            .matches(/^\d+(\.\d+)?$/).withMessage('El salario solo puede estar conformado por numeros'),

            body('fecIngreso')
            .exists().withMessage('La fecha de ingreso parece estar vacia')
            .trim().notEmpty().withMessage('La fecha de ingreso no puede estar vacia'),

            body('anosLaborales')
            .exists().withMessage('Los años laborales parecen estar vacios')
            .trim().notEmpty().withMessage('Los años laborales no pueden estar vacios')
            .matches(/^\d+(\.\d+)?$/).withMessage('Los años laborales solo pueden estar conformados por numeros'),

            body('patronal')
            .exists().withMessage('El registro patronal parece estar vacio')
            .trim().notEmpty().withMessage('El registro patronal no puede estar vacio'),

            body('estatus')
            .exists().withMessage('El estatus del empleado parece estar vacio')
            .trim().notEmpty().withMessage('El estatus del empleado no puede estar vacio'),

            body('tipoContrato')
            .exists().withMessage('El tipo de contrato parece estar vacio')
            .trim().notEmpty().withMessage('El tipo de contrato no puede estar vacio'),

            body('fecInContrato')
            .exists().withMessage('La fecha de inicio de contrato parece estar vacia')
            .trim().notEmpty().withMessage('La fecha de inicio de contrato no puede estar vacia'),

            body('fecFinContrato')
            .exists().withMessage('La fecha de fin de contrato parece estar vacia')
            .trim().notEmpty().withMessage('La fecha de fin de contrato no puede estar vacia'),

            body('edit')
            .exists().withMessage('No existe informacion de si es editado o nuevo')
            .custom( (value, { req }) =>{
                const errors = []
                if (value == 0){
                    if (typeof req.body.codPost === 'undefined' || req.body.codPost === null || req.body.codPost.trim() === ''){
                        errors.push('El codigo postal esta vacio.');
                    }
                    if (typeof req.body.colonia === 'undefined' || req.body.colonia === null || req.body.colonia.trim() === ''){
                        errors.push('La colonia esta vacia.');
                    }
                    if (typeof req.body.calle === 'undefined' || req.body.calle === null || req.body.calle.trim() === ''){
                        errors.push('La calle esta vacia.');
                    }
                    if (typeof req.body.numExt === 'undefined' || req.body.numExt === null || req.body.numExt.trim() === ''){
                        errors.push('El numero exterior no puede estar vacio.');
                    }
                } else{
                    if (typeof req.body.domicilio === 'undefined' || req.body.domicilio === null || req.body.domicilio.trim() === ''){
                        errors.push('El domicilio no puede estar vacio.');
                    }
                    if (typeof req.body.descripcion === 'undefined' || req.body.descripcion === null || req.body.descripcion.trim() === ''){
                        errors.push('La descripcion del cambio no puede estar vacio.');
                    }
                }
                
                if (errors.length > 0){
                    throw new Error(errors.join('\n'));
                }

                return true;
            }),
        ]
    },
}