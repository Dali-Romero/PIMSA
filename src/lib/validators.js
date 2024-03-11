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
            // validaciones del campo "date" (Fecha)
            body('date')
            .optional()
            .isDate(),
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

            // validaciones del campo "emailAlt" (Correo alterno)
            body('emailAlt')
            .optional
            .isEmail(),

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
    validateGroup(){
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
        return [
            
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
// ------------------------------------------------ Archivo employees.js (pendiente) ------------------------------------------------
    // middleware para validar el formulario de agregar/editar empleado
    validateEmployees(){
        return [
            
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
            .isInt().withMessage('Parece que el id de la cotizacón no es un número.')
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
}