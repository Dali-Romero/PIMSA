const express = require('express');
const pool = require('../database');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, IsAuthorized('seeListEmployees'), async (req, res) =>{
    const employees = await pool.query('SELECT * FROM empleados ORDER BY numeroNomina AND activo desc');
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    let activos = 0
    let inactivos = 0
    for(let i in employees){
        if (employees[i].activo){
            activos++;
        }else{
            inactivos++;
        }
    }
    res.render('../views/employees/allEmployees', {employees, rol, area, activos, inactivos});
});

router.get('/add', isLoggedIn, IsAuthorized('addEmployees'), async (req, res) =>{
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    res.render('../views/employees/newEmployee', {rol, area});
});

router.post('/add', isLoggedIn, IsAuthorized('addEmployees'), async (req, res)=>{
    const employee = req.body;
    const datos = await pool.query('SELECT * FROM empleados WHERE curp = ? OR rfc = ? OR nss = ? OR numeroNomina = ?', [employee.curp, employee.rfc, employee.nss, employee.nomina]);
    if (datos.length >= 1){
        const errorUser = employee;
        const rol = await pool.query('SELECT * FROM roles');
        const area = await pool.query('SELECT * FROM areas');
        res.render('../views/employees/newEmployee', {errorUser, rol, area});
    } else{ 
        var newEmployee = {
            nombreComp: employee.nombre,
            sexo: employee.sexo,
            estadoCivil: employee.estadoCivil,
            nacLugar: employee.lugNacimiento,
            nacFecha: employee.fecNacimiento,
            edadCumplir: employee.edad,
            extension: employee.extension,
            numeroCelu: employee.numeroTelefono,
            correoElec: employee.correo,
            emerNombre: employee.emerNombre,
            emerCelu: employee.emerTel,
            domicilio: employee.calle + employee.numExt + employee.numInt + employee.colonia + employee.codPost,
            estatus: employee.estatus,
            curp: employee.curp,
            rfc: employee.rfc,
            nss: employee.nss,
            numeroNomina: employee.nomina,
            salarioQuin: employee.salario,
            compleNomina: employee.complementoNomina,
            fechaIngreso: employee.fecIngreso,
            anosCumplir: employee.anosLaborales,
            area_id: employee.area,
            rol_id: employee.rol,
            registroPatro: employee.patronal,
            tipoContrato: employee.tipoContrato,
            inicioContrato: employee.fecInContrato,
            finContrato: employee.fecFinContrato,
            activo: employee.activo 
        };
        await pool.query('INSERT INTO empleados SET ?', [newEmployee]);
        const empleado = await pool.query('SELECT * FROM empleados WHERE numeroNomina = ?', [employee.nomina]);
        const today = new Date();
        console.log(today);
        newEmployee = {
            modificado_usuario_id: req.user.usuarioId,
            empleado_id: empleado[0].empleadoId,
            cambioRealizado: "Se ha creado el empleado",
            fechaCambio: today,
    
            nombreComp: employee.nombre,
            sexo: employee.sexo,
            estadoCivil: employee.estadoCivil,
            nacLugar: employee.lugNacimiento,
            nacFecha: employee.fecNacimiento,
            edadCumplir: employee.edad,
            extension: employee.extension,
            numeroCelu: employee.numeroTelefono,
            correoElec: employee.correo,
            emerNombre: employee.emerNombre,
            emerCelu: employee.emerTel,
            domicilio: employee.calle + " " + employee.numExt + " " + employee.numInt + " " + employee.colonia + " " + employee.codPost,
            estatus: employee.estatus,
            curp: employee.curp,
            rfc: employee.rfc,
            nss: employee.nss,
            numeroNomina: employee.nomina,
            salarioQuin: employee.salario,
            compleNomina: employee.complementoNomina,
            fechaIngreso: employee.fecIngreso,
            anosCumplir: employee.anosLaborales,
            area_id: employee.area,
            rol_id: employee.rol,
            registroPatro: employee.patronal,
            tipoContrato: employee.tipoContrato,
            inicioContrato: employee.fecInContrato,
            finContrato: employee.fecFinContrato,
            activo: employee.activo
        }
        await pool.query('INSERT INTO historialempleados SET ?', [newEmployee]);
        req.flash('success', 'El empleado ha sido registrado con exito.');
        res.redirect('/employees');
    }
});

router.get('/edit/:id', isLoggedIn, IsAuthorized('editEmployees'), async (req, res) =>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    var employees = await pool.query('SELECT * FROM empleados WHERE empleadoId = ?', [id]);
    console.log(employees)
    employees[0].nacFecha = employees[0].nacFecha.toLocaleDateString("en-CA"),
    employees[0].fechaIngreso = employees[0].fechaIngreso.toLocaleDateString("en-CA"),
    employees[0].inicioContrato = employees[0].inicioContrato.toLocaleDateString("en-CA"),
    employees[0].finContrato = employees[0].finContrato.toLocaleDateString("en-CA")
    res.render('../views/employees/editEmployee', {employee: employees[0], rol, area});
});

router.post('/edit/:id', isLoggedIn, IsAuthorized('editEmployees'), async (req, res) =>{
    const {id} = req.params;
    const employee = req.body;
    var newEmployee = {
        nombreComp: employee.nombre,
        sexo: employee.sexo,
        estadoCivil: employee.estadoCivil,
        nacLugar: employee.lugNacimiento,
        nacFecha: employee.fecNacimiento,
        edadCumplir: employee.edad,
        extension: employee.extension,
        numeroCelu: employee.numeroTelefono,
        correoElec: employee.correo,
        emerNombre: employee.emerNombre,
        emerCelu: employee.emerTel,
        domicilio: employee.domicilio,
        estatus: employee.estatus,
        curp: employee.curp,
        rfc: employee.rfc,
        nss: employee.nss,
        numeroNomina: employee.nomina,
        salarioQuin: employee.salario,
        compleNomina: employee.complementoNomina,
        fechaIngreso: employee.fecIngreso,
        anosCumplir: employee.anosLaborales,
        area_id: employee.area,
        rol_id: employee.rol, 
        registroPatro: employee.patronal,
        tipoContrato: employee.tipoContrato,
        inicioContrato: employee.fecInContrato,
        finContrato: employee.fecFinContrato,
        activo: employee.activo
    };
    console.log(newEmployee)
    await pool.query('UPDATE empleados SET ? WHERE empleadoId = ?', [newEmployee, id]);
    const today = new Date();
    editEmployee = {
        modificado_usuario_id: req.user.usuarioId,
        empleado_id: id,
        cambioRealizado: employee.descripcion,
        fechaCambio: today,

        nombreComp: employee.nombre,
        sexo: employee.sexo,
        estadoCivil: employee.estadoCivil,
        nacLugar: employee.lugNacimiento,
        nacFecha: employee.fecNacimiento,
        edadCumplir: employee.edad,
        extension: employee.extension,
        numeroCelu: employee.numeroTelefono,
        correoElec: employee.correo,
        emerNombre: employee.emerNombre,
        emerCelu: employee.emerTel,
        domicilio: employee.domicilio,
        estatus: employee.estatus,
        curp: employee.curp,
        rfc: employee.rfc,
        nss: employee.nss,
        numeroNomina: employee.nomina,
        salarioQuin: employee.salario, 
        compleNomina: employee.complementoNomina,
        fechaIngreso: employee.fecIngreso,
        anosCumplir: employee.anosLaborales,
        area_id: employee.area,
        rol_id: employee.rol,
        registroPatro: employee.patronal,
        tipoContrato: employee.tipoContrato,
        inicioContrato: employee.fecInContrato,
        finContrato: employee.fecFinContrato,
        activo: employee.activo
    }
    await pool.query('INSERT INTO historialempleados SET ?', [editEmployee]);
    req.flash('success', 'El empleado ha sido editado con exito.');
    res.redirect('/employees/info/'+id);
});

router.get('/info/:id', isLoggedIn, IsAuthorized('seeListEmployees'), async (req, res)=>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    const employees = await pool.query('SELECT * FROM empleados WHERE empleadoId = ?', [id]);
    const fechas = {
        fecNac: employees[0].nacFecha.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        fechaIngreso: employees[0].fechaIngreso.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        inicioContrato: employees[0].inicioContrato.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        finContrato: employees[0].finContrato.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'})
    }
    res.render('../views/employees/completeInfoEmployee', {employee: employees[0], rol, area, fechas});
}); 

router.get('/history/:id', isLoggedIn, IsAuthorized('seeListEmployees'), async (req, res)=>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    const users = await pool.query('SELECT * FROM usuarios');
    var employees = await pool.query('SELECT * FROM historialempleados WHERE empleado_id = ? ORDER BY cambioId DESC', [id]);
    const nombreComp = await pool.query('SELECT nombreComp FROM empleados WHERE empleadoId = ?', [id]);
    const total = employees.length;
    for (i=0; i < employees.length; i++){
        employees[i].hora = employees[i].fechaCambio.toLocaleTimeString('en-US');
        employees[i].fechaCambio = employees[i].fechaCambio.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    };
    res.render('../views/employees/history', {total, nombreComp: nombreComp[0].nombreComp, employees, rol, area, users});
});

router.get('/history/:id/view/:idHistory', isLoggedIn, IsAuthorized('seeListEmployees'), async (req, res)=>{
    const {id, idHistory} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    const users = await pool.query('SELECT * FROM usuarios');
    const employees = await pool.query('SELECT * FROM historialempleados WHERE empleado_id = ? AND cambioId = ?', [id, idHistory]);
    const fechas = {
        fecNac: employees[0].nacFecha.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        fechaIngreso: employees[0].fechaIngreso.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        inicioContrato: employees[0].inicioContrato.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        finContrato: employees[0].finContrato.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'}),
        hora: employees[0].fechaCambio.toLocaleTimeString('en-US'),
        fechaCambio: employees[0].fechaCambio.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'})
    };
    res.render('../views/employees/viewHistory', {employee: employees[0], fechas, rol, area, users});
});

router.get('/history/:id/view/:idHistory/restore', isLoggedIn, IsAuthorized('editEmployees'), async (req, res)=>{
    const {id, idHistory} = req.params;
    const employeeHistory = await pool.query('SELECT * FROM historialempleados WHERE empleado_id = ? AND cambioId = ?', [id, idHistory]);
    const employeeAct = await pool.query('SELECT * FROM empleados WHERE empleadoId = ?', [id]);
    const today = new Date();
    const employee = {
        modificado_usuario_id: req.user.usuarioId, 
        empleado_id: id,
        cambioRealizado: "Se restauro la version con id " + idHistory,
        fechaCambio: today,

        nombreComp: employeeAct[0].nombreComp,
        sexo: employeeAct[0].sexo,
        estadoCivil: employeeAct[0].estadoCivil,
        nacLugar: employeeAct[0].nacLugar,
        nacFecha: employeeAct[0].nacFecha,
        edadCumplir: employeeAct[0].edadCumplir,
        extension: employeeAct[0].extension,
        numeroCelu: employeeAct[0].numeroCelu,
        correoElec: employeeAct[0].correoElec,
        emerNombre: employeeAct[0].emerNombre,
        emerCelu: employeeAct[0].emerCelu,
        domicilio: employeeAct[0].domicilio,
        estatus: employeeAct[0].estatus,
        curp: employeeAct[0].curp,
        rfc: employeeAct[0].rfc,
        nss: employeeAct[0].nss,
        numeroNomina: employeeAct[0].numeroNomina,
        salarioQuin: employeeAct[0].salarioQuin, 
        compleNomina: employeeAct[0].compleNomina,
        fechaIngreso: employeeAct[0].fechaIngreso,
        anosCumplir: employeeAct[0].anosCumplir,
        area_id: employeeAct[0].area_id,
        rol_id: employeeAct[0].rol_id,
        registroPatro: employeeAct[0].registroPatro,
        tipoContrato: employeeAct[0].tipoContrato,
        inicioContrato: employeeAct[0].inicioContrato,
        finContrato: employeeAct[0].finContrato,
        activo: employeeAct[0].activo
    };
    await pool.query('INSERT INTO historialempleados SET ?', [employee]);

    const editEmployee = {
        nombreComp: employeeHistory[0].nombreComp,
        sexo: employeeHistory[0].sexo,
        estadoCivil: employeeHistory[0].estadoCivil,
        nacLugar: employeeHistory[0].nacLugar,
        nacFecha: employeeHistory[0].nacFecha,
        edadCumplir: employeeHistory[0].edadCumplir,
        extension: employeeHistory[0].extension,
        numeroCelu: employeeHistory[0].numeroCelu,
        correoElec: employeeHistory[0].correoElec,
        emerNombre: employeeHistory[0].emerNombre,
        emerCelu: employeeHistory[0].emerCelu,
        domicilio: employeeHistory[0].domicilio,
        estatus: employeeHistory[0].estatus,
        curp: employeeHistory[0].curp,
        rfc: employeeHistory[0].rfc,
        nss: employeeHistory[0].nss,
        numeroNomina: employeeHistory[0].numeroNomina,
        salarioQuin: employeeHistory[0].salarioQuin, 
        compleNomina: employeeHistory[0].compleNomina,
        fechaIngreso: employeeHistory[0].fechaIngreso,
        anosCumplir: employeeHistory[0].anosCumplir,
        area_id: employeeHistory[0].area_id,
        rol_id: employeeHistory[0].rol_id,
        registroPatro: employeeHistory[0].registroPatro,
        tipoContrato: employeeHistory[0].tipoContrato,
        inicioContrato: employeeHistory[0].inicioContrato,
        finContrato: employeeHistory[0].finContrato,
        activo: employeeHistory[0].activo
    };
    await pool.query('UPDATE empleados SET ? WHERE empleadoId = ?', [editEmployee, id]);
    req.flash('success', 'La version '+idHistory+ ' ha sido restaurada con exito.');
    res.redirect('/employees/info/'+id);
}); 

module.exports = router;