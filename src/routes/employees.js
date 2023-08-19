const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, async (req, res) =>{
    const employees = await pool.query('SELECT * FROM empleados');
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

router.get('/add', isLoggedIn, async (req, res) =>{
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    res.render('../views/employees/newEmployee', {rol, area});
});

router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    var employees = await pool.query('SELECT * FROM empleados WHERE empleadoId = ?', [id]);
    console.log(employees)
    res.render('../views/employees/editEmployee', {employee: employees[0], rol, area});
});

router.get('/info/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    const employees = await pool.query('SELECT * FROM empleados WHERE empleadoId = ?', [id]);
    res.render('../views/employees/completeInfoEmployee', {employee: employees[0], rol, area});
});

router.get('/history/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    const employees = await pool.query('SELECT * FROM historialempleados WHERE empleado_id = ?', [id]);
    const nombreComp = await pool.query('SELECT nombreComp FROM empleados WHERE empleadoId = ?', [id]);
    const total = employees.length;
    res.render('../views/employees/history', {total, nombreComp: nombreComp[0].nombreComp, employees, rol, area});
});

router.get('/history/:id/view/:idHistory', isLoggedIn, async (req, res)=>{
    const {id, idHistory} = req.params;
    const rol = await pool.query('SELECT * FROM roles');
    const area = await pool.query('SELECT * FROM areas');
    const employees = await pool.query('SELECT * FROM historialempleados WHERE empleado_id = ? AND cambioId = ?', [id, idHistory]);
    res.render('../views/employees/viewHistory', {employee: employees[0], rol, area});
});

router.get('/history/:id/view/:idHistory/restore', isLoggedIn, async (req, res)=>{
    const {id, idHistory} = req.params;
    const employeeHistory = await pool.query('SELECT * FROM historialempleados WHERE empleado_id = ? AND cambioId = ?', [id, idHistory]);
    const employeeAct = await pool.query('SELECT * FROM empeados WHERE empleado_id = ?', [id]);
    const today = new Date();
    const employee = {
        modificado_empleado_id: 0, //Editar para ver cual es el usuario activo
        empleado_id: id,
        cambioRealizado: "Se restauro la version con id " + idHistory,
        fechaCambio: today.getDate(),
        nombreComp: employeeAct.nombreComp
    }
});

module.exports = router;