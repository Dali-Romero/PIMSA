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
}