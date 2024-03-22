const express = require('express');
const pool = require('../database.js');
const XlsxPopulate = require('xlsx-populate');
const { validationResult } = require('express-validator');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { filterOthers, filterOthersOutCatalog } = require('../lib/helpers.js');
const { validateReports, validateGraphsFilterEployees, validateGraphsFilterClients, validateGraphsFilterProducts } = require('../lib/validators.js');

const router = express.Router();

router.get('/', isLoggedIn, IsAuthorized('panel'), async (req, res)=>{
    // información para la tablas
    const cotizaciones = await pool.query('SELECT Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.total, Cotizaciones.estatus, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) ORDER BY Cotizaciones.fecha DESC LIMIT 15;');
    const ordenes = await pool.query('SELECT Ordenes.ordenId, Ordenes.fechaGen, Ordenes.terminada, Ordenes.estatus, Cotizaciones.total, Clientes.clienteId, Clientes.nombre FROM ((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) ORDER BY Ordenes.fechaGen DESC LIMIT 15;');
    
    // información para las tarjetas tareasorden
    const tarjEmpleados = await pool.query('SELECT COUNT(Empleados.empleadoId) AS total FROM Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id WHERE Usuarios.activo = 1;')
    const tarjCotizaciones = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, IF(res.total IS NULL, 0, res.total) AS total FROM months LEFT JOIN (SELECT MONTH(fecha) AS month, COUNT(cotId) AS total FROM Cotizaciones WHERE MONTH(fecha) = MONTH(NOW()) AND YEAR(fecha) = YEAR(NOW()) GROUP BY MONTH(fecha)) AS res ON months.num_month = res.month WHERE months.num_month = MONTH(NOW());');
    const tarjOrdenes = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, IF(res.total IS NULL, 0, res.total) AS total FROM months LEFT JOIN (SELECT MONTH(fechaGen) AS month, COUNT(ordenId) AS total FROM Ordenes WHERE MONTH(fechaGen) = MONTH(NOW()) AND YEAR(fechaGen) = YEAR(NOW()) GROUP BY MONTH(fechaGen)) AS res ON months.num_month = res.month WHERE months.num_month = MONTH(NOW());');
    const tarjVentas = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, IF(res.total IS NULL, 0.00, res.total) AS total FROM months LEFT JOIN (SELECT MONTH(Ordenes.fechaEnt) AS month, SUM(Cotizaciones.subtotal) AS total FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND MONTH(Ordenes.fechaEnt) = MONTH(NOW()) AND YEAR(Ordenes.fechaEnt) = YEAR(NOW()) GROUP BY MONTH(Ordenes.fechaEnt)) AS res ON months.num_month = res.month WHERE months.num_month = MONTH(NOW());');
    
    // informacion para la taza de cambio de cada tarjeta
    const cambioEmpleados = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, last_month.*, CASE WHEN last_month.total IS NULL OR 0 THEN IFNULL(actual_month.total * 100, 0.00) ELSE IFNULL(ROUND((IFNULL(actual_month.total, 0) - IFNULL(last_month.total, 0))/IFNULL(last_month.total, 0) * 100, 2), 0.00) END AS percentage FROM months LEFT JOIN (SELECT MONTH(Empleados.fechaIngreso) AS month, COUNT(Empleados.empleadoId) AS total FROM ((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Areas.activo = 1 AND Usuarios.activo = 1 AND MONTH(Empleados.fechaIngreso) = MONTH(NOW()) AND YEAR(Empleados.fechaIngreso) = YEAR(NOW()) GROUP BY MONTH(Empleados.fechaIngreso)) AS actual_month ON months.num_month = actual_month.month LEFT JOIN (SELECT MONTH(Empleados.fechaIngreso) AS month, COUNT(Empleados.empleadoId) AS total FROM ((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Areas.activo = 1 AND Usuarios.activo = 1 AND MONTH(Empleados.fechaIngreso) = MONTH(NOW() - INTERVAL 1 MONTH) AND CASE WHEN MONTH(NOW()) = "1" THEN YEAR(Empleados.fechaIngreso) = YEAR(NOW() - INTERVAL 1 YEAR) ELSE YEAR(Empleados.fechaIngreso) = YEAR(NOW()) END GROUP BY MONTH(Empleados.fechaIngreso)) AS last_month ON months.num_month = CASE WHEN last_month.month = "12" THEN last_month.month - 11 ELSE last_month.month + 1 END WHERE months.num_month = MONTH(NOW());');
    const cambioCotizaciones = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, CASE WHEN last_month.total IS NULL OR 0 THEN IFNULL(actual_month.total * 100, 0.00) ELSE IFNULL(ROUND((IFNULL(actual_month.total, 0) - IFNULL(last_month.total, 0))/IFNULL(last_month.total, 0) * 100, 2), 0.00) END AS percentage FROM months LEFT JOIN (SELECT MONTH(Cotizaciones.fecha) AS month, COUNT(Cotizaciones.cotId) AS total FROM Cotizaciones WHERE MONTH(Cotizaciones.fecha) = MONTH(NOW()) AND YEAR(Cotizaciones.fecha) = YEAR(NOW()) GROUP BY MONTH(Cotizaciones.fecha)) AS actual_month ON months.num_month = actual_month.month LEFT JOIN (SELECT MONTH(Cotizaciones.fecha) AS month, COUNT(Cotizaciones.cotId) AS total FROM Cotizaciones WHERE MONTH(Cotizaciones.fecha) = MONTH(NOW() - INTERVAL 1 MONTH) AND CASE WHEN MONTH(NOW()) = "1" THEN YEAR(Cotizaciones.fecha) = YEAR(NOW() - INTERVAL 1 YEAR) ELSE YEAR(Cotizaciones.fecha) = YEAR(NOW()) END GROUP BY MONTH(Cotizaciones.fecha)) AS last_month ON months.num_month = CASE WHEN last_month.month = "12" THEN last_month.month - 11 ELSE last_month.month + 1 END WHERE months.num_month = MONTH(NOW());');
    const cambioOrdenes = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, CASE WHEN last_month.total IS NULL OR 0 THEN IFNULL(actual_month.total * 100, 0.00) ELSE IFNULL(ROUND((IFNULL(actual_month.total, 0) - IFNULL(last_month.total, 0))/IFNULL(last_month.total, 0) * 100, 2), 0.00) END AS percentage FROM months LEFT JOIN (SELECT MONTH(Ordenes.fechaGen) AS month, COUNT(Ordenes.ordenId) AS total FROM Ordenes WHERE MONTH(Ordenes.fechaGen) = MONTH(NOW()) AND YEAR(Ordenes.fechaGen) = YEAR(NOW()) GROUP BY MONTH(Ordenes.fechaGen)) AS actual_month ON months.num_month = actual_month.month LEFT JOIN (SELECT MONTH(Ordenes.fechaGen) AS month, COUNT(Ordenes.ordenId) AS total FROM Ordenes WHERE MONTH(Ordenes.fechaGen) = MONTH(NOW() - INTERVAL 1 MONTH) AND CASE WHEN MONTH(NOW()) = "1" THEN YEAR(Ordenes.fechaGen) = YEAR(NOW() - INTERVAL 1 YEAR) ELSE YEAR(Ordenes.fechaGen) = YEAR(NOW()) END GROUP BY MONTH(Ordenes.fechaGen)) AS last_month ON months.num_month = CASE WHEN last_month.month = "12" THEN last_month.month - 11 ELSE last_month.month + 1 END WHERE months.num_month = MONTH(NOW());');
    const cambioVentas = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.*, CASE WHEN last_month.total IS NULL OR 0 THEN IFNULL(actual_month.total * 100, 0.00) ELSE IFNULL(ROUND((IFNULL(actual_month.total, 0) - IFNULL(last_month.total, 0))/IFNULL(last_month.total, 0) * 100, 2), 0.00) END AS percentage FROM months LEFT JOIN (SELECT MONTH(Ordenes.fechaEnt) AS month, SUM(Cotizaciones.subtotal) AS total FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND MONTH(Ordenes.fechaEnt) = MONTH(NOW()) AND YEAR(Ordenes.fechaEnt) = YEAR(NOW()) GROUP BY MONTH(Ordenes.fechaEnt)) AS actual_month ON months.num_month = actual_month.month LEFT JOIN (SELECT MONTH(Ordenes.fechaEnt) AS month, SUM(Cotizaciones.subtotal) AS total FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND MONTH(Ordenes.fechaEnt) = MONTH(NOW() - INTERVAL 1 MONTH) AND CASE WHEN MONTH(NOW()) = "1" THEN YEAR(Ordenes.fechaEnt) = YEAR(NOW() - INTERVAL 1 YEAR) ELSE YEAR(Ordenes.fechaEnt) = YEAR(NOW()) END GROUP BY MONTH(Ordenes.fechaEnt)) AS last_month ON months.num_month = CASE WHEN last_month.month = "12" THEN last_month.month - 11 ELSE last_month.month + 1 END WHERE months.num_month = MONTH(NOW());');

    // informacion para los filtros de las graficas
    const filtroVendedores = await pool.query('WITH months AS (SELECT "1" AS num_month, "Ene" AS name_month UNION ALL SELECT "2" AS num_month, "Feb" AS name_month UNION ALL SELECT "3" AS num_month, "Mar" AS name_month UNION ALL SELECT "4" AS num_month, "Abr" AS name_month UNION ALL SELECT "5" AS num_month, "May" AS name_month UNION ALL SELECT "6" AS num_month, "Jun" AS name_month UNION ALL SELECT "7" AS num_month, "Jul" AS name_month UNION ALL SELECT "8" AS num_month, "Ago" AS name_month UNION ALL SELECT "9" AS num_month, "Sep" AS name_month UNION ALL SELECT "10" AS num_month, "Oct" AS name_month UNION ALL SELECT "11" AS num_month, "Nov" AS name_month UNION ALL SELECT "12" AS num_month, "Dic" AS name_month) SELECT ventasMes.year, months.* FROM months LEFT JOIN (SELECT ventas.year, ventas.month FROM ((SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month FROM Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt)) UNION ALL (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt))) AS ventas GROUP BY ventas.year, ventas.month) AS ventasMes ON months.num_month = ventasMes.month WHERE ventasMes.year IS NOT NULL ORDER BY ventasMes.year DESC, ventasMes.month DESC;');
    const filtroProductos = await pool.query('WITH months AS (SELECT "1" AS num_month, "Ene" AS name_month UNION ALL SELECT "2" AS num_month, "Feb" AS name_month UNION ALL SELECT "3" AS num_month, "Mar" AS name_month UNION ALL SELECT "4" AS num_month, "Abr" AS name_month UNION ALL SELECT "5" AS num_month, "May" AS name_month UNION ALL SELECT "6" AS num_month, "Jun" AS name_month UNION ALL SELECT "7" AS num_month, "Jul" AS name_month UNION ALL SELECT "8" AS num_month, "Ago" AS name_month UNION ALL SELECT "9" AS num_month, "Sep" AS name_month UNION ALL SELECT "10" AS num_month, "Oct" AS name_month UNION ALL SELECT "11" AS num_month, "Nov" AS name_month UNION ALL SELECT "12" AS num_month, "Dic" AS name_month) SELECT res.year, months.* FROM months LEFT JOIN (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt)) AS res ON months.num_month = res.month WHERE res.year IS NOT NULL ORDER BY res.year DESC, res.month DESC;');
    const filtroClientes = await pool.query('WITH months AS (SELECT "1" AS num_month, "Ene" AS name_month UNION ALL SELECT "2" AS num_month, "Feb" AS name_month UNION ALL SELECT "3" AS num_month, "Mar" AS name_month UNION ALL SELECT "4" AS num_month, "Abr" AS name_month UNION ALL SELECT "5" AS num_month, "May" AS name_month UNION ALL SELECT "6" AS num_month, "Jun" AS name_month UNION ALL SELECT "7" AS num_month, "Jul" AS name_month UNION ALL SELECT "8" AS num_month, "Ago" AS name_month UNION ALL SELECT "9" AS num_month, "Sep" AS name_month UNION ALL SELECT "10" AS num_month, "Oct" AS name_month UNION ALL SELECT "11" AS num_month, "Nov" AS name_month UNION ALL SELECT "12" AS num_month, "Dic" AS name_month) SELECT res.year, months.* FROM months LEFT JOIN (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month FROM Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt)) AS res ON months.num_month = res.month WHERE res.year IS NOT NULL ORDER BY res.year DESC, res.month DESC;');

    // agrupar informacion de las tarjetas
    const tarjetas = {
        tarjEmpleados: tarjEmpleados[0],
        cambioEmpleados: cambioEmpleados[0],
        tarjCotizaciones: tarjCotizaciones[0],
        cambioCotizaciones: cambioCotizaciones[0],
        tarjOrdenes: tarjOrdenes[0],
        cambioOrdenes: cambioOrdenes[0],
        tarjVentas: tarjVentas[0],
        cambioVentas: cambioVentas[0]
    }

    // obtener tareas
    const tareas = await pool.query('SELECT Ordenes.ordenId, Ordenes.fechaGen, COUNT(IF(Tareas.terminada = 1, 1, NULL)) AS tareasTerminadas, COUNT(Tareas.tareaId) AS totalTareas, ROUND(((COUNT(IF(Tareas.terminada = 1, 1, NULL)) * 100) / COUNT(Tareas.tareaId)), 0) AS porcentajeTerminada  FROM Tareas INNER JOIN TareasOrden ON Tareas.tareaorden_id = TareasOrden.tareaOrdenId INNER JOIN Ordenes ON TareasOrden.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId GROUP BY Ordenes.ordenId ORDER BY Ordenes.fechaGen DESC LIMIT 7;');

    res.render('dashboard/dashboard', {cotizaciones: cotizaciones, ordenes: ordenes, tarjetas: tarjetas, filtroProductos: filtroProductos, filtroClientes: filtroClientes, filtroVendedores: filtroVendedores, tareas: tareas});
})

router.get('/graphs', isLoggedIn, IsAuthorized('panel'), async (req, res) =>{
    // informacion para las gráficas
    const infoG1 = await pool.query('SELECT Areas.nombre AS nombre, COUNT(Empleados.empleadoId) AS total FROM ((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Areas.activo = 1 AND Usuarios.activo = 1 GROUP BY Areas.nombre HAVING total > 0;');
    const infoG2 = await pool.query('SELECT estatus, COUNT(cotId) AS total FROM Cotizaciones WHERE MONTH(fecha) = MONTH(NOW()) AND YEAR(fecha) = YEAR(NOW()) GROUP BY MONTH(fecha), estatus;');
    const infoG3 = await pool.query('SELECT IF(terminada = 0, "Trabajando", "Completada") AS estatus, COUNT(ordenId) AS total FROM Ordenes WHERE MONTH(fechaGen) = MONTH(NOW()) AND YEAR(fechaGen) = YEAR(NOW()) GROUP BY MONTH(fechaGen), terminada;');
    const infoG4 = await pool.query('WITH months AS (SELECT "1" AS num_month, "Enero" AS name_month UNION ALL SELECT "2" AS num_month, "Febrero" AS name_month UNION ALL SELECT "3" AS num_month, "Marzo" AS name_month UNION ALL SELECT "4" AS num_month, "Abril" AS name_month UNION ALL SELECT "5" AS num_month, "Mayo" AS name_month UNION ALL SELECT "6" AS num_month, "Junio" AS name_month UNION ALL SELECT "7" AS num_month, "Julio" AS name_month UNION ALL SELECT "8" AS num_month, "Agosto" AS name_month UNION ALL SELECT "9" AS num_month, "Septiembre" AS name_month UNION ALL SELECT "10" AS num_month, "Octubre" AS name_month UNION ALL SELECT "11" AS num_month, "Noviembre" AS name_month UNION ALL SELECT "12" AS num_month, "Diciembre" AS name_month) SELECT months.name_month, IF(res.total IS NULL, 0.00, res.total) AS total FROM months LEFT JOIN (SELECT MONTH(Ordenes.fechaEnt) AS month, SUM(Cotizaciones.subtotal) AS total FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND YEAR(Ordenes.fechaEnt) = YEAR(NOW()) GROUP BY MONTH(Ordenes.fechaEnt)) AS res ON months.num_month = res.month WHERE months.num_month BETWEEN 1 AND MONTH(NOW());');
    const infoG5 = await pool.query('SELECT ventasMes.usuarioId, ventasMes.apellido, ventasMes.pesos_vendidos FROM (SELECT ventas.usuarioId, ventas.apellido, SUM(ventas.pesos_vendidos) AS pesos_vendidos FROM ((SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, IFNULL(SUM(ProductosCotizados.monto), 0) AS pesos_vendidos FROM Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId) UNION ALL (SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, IFNULL(SUM(FueraCatalogoCotizados.monto), 0) AS pesos_vendidos FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId)) AS ventas GROUP BY ventas.usuarioId, ventas.apellido) AS ventasMes LIMIT 10;');
    const infoG6 = await pool.query('SELECT Clientes.clienteId AS id, Clientes.nombre AS categoria, SUM(Cotizaciones.subtotal) AS compras FROM Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Clientes.clienteId LIMIT 10;');
    const infoG7 = await pool.query('SELECT * FROM ((SELECT Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');
    
    // agrupar en categoria "otros" a todos los clientes que hayan hecho compras totales menores a 1000
    const infoG6Filtrada = infoG6.reduce(filterOthers, []);

    // agrupar en categoria "Feera de catálogo" y "otros" a todos los productos fuera de catalogo y los productos con una venta menor a 1000
    const infoG7Filtrada = infoG7.reduce(filterOthersOutCatalog, []);

    // agrupar la información de todas las gráficas
    const infoGraphs = {
        infoG1,
        infoG2,
        infoG3,
        infoG4,
        infoG5,
        infoG6Filtrada,
        infoG7Filtrada
    }
    res.send({infoGraphs: infoGraphs});
})

router.post('/salesEmployeesFilter', isLoggedIn, IsAuthorized('panel'), validateGraphsFilterEployees(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const {dateFilter, unitFilter } = req.body;
        let infoFiltrada = {};
        if (dateFilter == 'global') {
            switch (unitFilter) {
                case 'Mt':
                    infoFiltrada = await pool.query('SELECT ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM (SELECT ventas.usuarioId, ventas.apellido, SUM(ventas.mt_vendidos) AS vendido FROM ((SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, IFNULL(SUM(ProductosCotizados.area * ProductosCotizados.cantidad), 0) AS mt_vendidos FROM Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId) UNION ALL (SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, IFNULL(SUM(FueraCatalogoCotizados.area * FueraCatalogoCotizados.cantidad), 0) AS mt_vendidos FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId)) AS ventas GROUP BY ventas.usuarioId, ventas.apellido) AS ventasMes ORDER BY ventasMes.usuarioId LIMIT 10;');
                    break;
                case 'Pieza':
                    infoFiltrada = await pool.query('SELECT ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM (SELECT ventas.usuarioId, ventas.apellido, SUM(ventas.piezas_vendidas) AS vendido FROM ((SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, SUM(CASE WHEN Productos.unidad = "Pieza" THEN ProductosCotizados.cantidad ELSE 0 END) AS piezas_vendidas FROM Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId) UNION ALL (SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, SUM(CASE WHEN FueraCatalogoCotizados.unidad = "Pieza" THEN FueraCatalogoCotizados.cantidad ELSE 0 END) AS piezas_vendidas FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId)) AS ventas GROUP BY ventas.usuarioId, ventas.apellido) AS ventasMes ORDER BY ventasMes.usuarioId LIMIT 10;');
                    break;
                case 'Millar':
                    infoFiltrada = await pool.query('SELECT ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM (SELECT ventas.usuarioId, ventas.apellido, SUM(ventas.millares_vendidos) AS vendido FROM ((SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, SUM(CASE WHEN Productos.unidad = "Millar" THEN ProductosCotizados.cantidad ELSE 0 END) AS millares_vendidos FROM Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId) UNION ALL (SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, SUM(CASE WHEN  FueraCatalogoCotizados.unidad = "Millar" THEN FueraCatalogoCotizados.cantidad ELSE 0 END) AS millares_vendidos FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId)) AS ventas GROUP BY ventas.usuarioId, ventas.apellido) AS ventasMes ORDER BY ventasMes.usuarioId LIMIT 10;');
                    break;
                case 'Pesos':
                    infoFiltrada = await pool.query('SELECT ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM (SELECT ventas.usuarioId, ventas.apellido, SUM(ventas.pesos_vendidos) AS vendido FROM ((SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, IFNULL(SUM(ProductosCotizados.monto), 0) AS pesos_vendidos FROM Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId) UNION ALL (SELECT Usuarios.usuarioId AS usuarioId, Usuarios.apellido AS apellido, IFNULL(SUM(FueraCatalogoCotizados.monto), 0) AS pesos_vendidos FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id RIGHT JOIN Usuarios ON Usuarios.usuarioId = Ordenes.usuario_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont GROUP BY Usuarios.usuarioId)) AS ventas GROUP BY ventas.usuarioId, ventas.apellido) AS ventasMes ORDER BY ventasMes.usuarioId LIMIT 10;');
                    break;
                default:
                    break;
            }
        } else {
            const date = dateFilter.split('-');
            switch (unitFilter) {
                case 'Mt':
                    infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num_m, "Ene" AS name_m UNION ALL SELECT "2" AS num_m, "Feb" AS name_m UNION ALL SELECT "3" AS num_m, "Mar" AS name_m UNION ALL SELECT "4" AS num_m, "Abr" AS name_m UNION ALL SELECT "5" AS num_m, "May" AS name_m UNION ALL SELECT "6" AS num_m, "Jun" AS name_m UNION ALL SELECT "7" AS num_m, "Jul" AS name_m UNION ALL SELECT "8" AS num_m, "Ago" AS name_m UNION ALL SELECT "9" AS num_m, "Sep" AS name_m UNION ALL SELECT "10" AS num_m, "Oct" AS name_m UNION ALL SELECT "11" AS num_m, "Nov" AS name_m UNION ALL SELECT "12" AS num_m, "Dic" AS name_m) SELECT ventasMes.year, months.*, ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM months LEFT JOIN (SELECT ventas.year, ventas.month, ventas.usuarioId, ventas.apellido, SUM(ventas.mt_vendidos) AS vendido FROM ((SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, IFNULL(SUM(ProCot.area * ProCot.cantidad), 0) AS mt_vendidos FROM Cotizaciones AS Cot INNER JOIN ProductosCotizados AS ProCot ON Cot.cotId = ProCot.cot_id INNER JOIN Productos ON Productos.productoId = ProCot.producto_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId) UNION ALL (SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, IFNULL(SUM(FueCatCot.area * FueCatCot.cantidad), 0) AS mt_vendidos FROM Cotizaciones AS Cot INNER JOIN FueraCatalogoCotizados AS FueCatCot ON Cot.cotId = FueCatCot.cot_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId)) AS ventas GROUP BY ventas.year, ventas.month, ventas.usuarioId, ventas.apellido) AS ventasMes ON months.num_m = ventasMes.month WHERE ventasMes.year IS NOT NULL AND ventasMes.year = ? AND ventasMes.month = ? ORDER BY ventasMes.usuarioId LIMIT 10;', [date[0], date[1]]);
                    break;
                case 'Pieza':
                    infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num, "Ene" AS name UNION ALL SELECT "2" AS num, "Feb" AS name UNION ALL SELECT "3" AS num, "Mar" AS name UNION ALL SELECT "4" AS num, "Abr" AS name UNION ALL SELECT "5" AS num, "May" AS name UNION ALL SELECT "6" AS num, "Jun" AS name UNION ALL SELECT "7" AS num, "Jul" AS name UNION ALL SELECT "8" AS num, "Ago" AS name UNION ALL SELECT "9" AS num, "Sep" AS name UNION ALL SELECT "10" AS num, "Oct" AS name UNION ALL SELECT "11" AS num, "Nov" AS name UNION ALL SELECT "12" AS num, "Dic" AS name) SELECT ventasMes.year, months.*, ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM months LEFT JOIN (SELECT ventas.year, ventas.month, ventas.usuarioId, ventas.apellido, SUM(ventas.piezas_vendidas) AS vendido FROM ((SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, SUM(CASE WHEN Pro.unidad = "Pieza" THEN ProCot.cantidad ELSE 0 END) AS piezas_vendidas FROM Cotizaciones AS Cot INNER JOIN ProductosCotizados AS ProCot ON Cot.cotId = ProCot.cot_id INNER JOIN Productos AS Pro ON Pro.productoId = ProCot.producto_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId) UNION ALL (SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, SUM(CASE WHEN FueCatCot.unidad = "Pieza" THEN FueCatCot.cantidad ELSE 0 END) AS piezas_vendidas FROM Cotizaciones AS Cot INNER JOIN FueraCatalogoCotizados AS FueCatCot ON Cot.cotId = FueCatCot.cot_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId)) AS ventas GROUP BY ventas.year, ventas.month, ventas.usuarioId, ventas.apellido) AS ventasMes ON months.num = ventasMes.month WHERE ventasMes.year IS NOT NULL AND ventasMes.year = ? AND ventasMes.month = ? ORDER BY ventasMes.usuarioId LIMIT 10;', [date[0], date[1]]);
                    break;
                case 'Millar':
                    infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num, "Ene" AS name UNION ALL SELECT "2" AS num, "Feb" AS name UNION ALL SELECT "3" AS num, "Mar" AS name UNION ALL SELECT "4" AS num, "Abr" AS name UNION ALL SELECT "5" AS num, "May" AS name UNION ALL SELECT "6" AS num, "Jun" AS name UNION ALL SELECT "7" AS num, "Jul" AS name UNION ALL SELECT "8" AS num, "Ago" AS name UNION ALL SELECT "9" AS num, "Sep" AS name UNION ALL SELECT "10" AS num, "Oct" AS name UNION ALL SELECT "11" AS num, "Nov" AS name UNION ALL SELECT "12" AS num, "Dic" AS name) SELECT ventasMes.year, months.*, ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM months LEFT JOIN (SELECT ventas.year, ventas.month, ventas.usuarioId, ventas.apellido, SUM(ventas.millares_vendidos) AS vendido FROM ((SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, SUM(CASE WHEN Pro.unidad = "Millar" THEN ProCot.cantidad ELSE 0 END) AS millares_vendidos FROM Cotizaciones AS Cot INNER JOIN ProductosCotizados AS ProCot ON Cot.cotId = ProCot.cot_id INNER JOIN Productos AS Pro ON Pro.productoId = ProCot.producto_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId) UNION ALL (SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, SUM(CASE WHEN  FueCatCot.unidad = "Millar" THEN FueCatCot.cantidad ELSE 0 END) AS millares_vendidos FROM Cotizaciones AS Cot INNER JOIN FueraCatalogoCotizados AS FueCatCot ON Cot.cotId = FueCatCot.cot_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId)) AS ventas GROUP BY ventas.year, ventas.month, ventas.usuarioId, ventas.apellido) AS ventasMes ON months.num = ventasMes.month WHERE ventasMes.year IS NOT NULL AND ventasMes.year = ? AND ventasMes.month = ? ORDER BY ventasMes.usuarioId LIMIT 10;', [date[0], date[1]]);
                    break;
                case 'Pesos':
                    infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num, "Ene" AS name UNION ALL SELECT "2" AS num, "Feb" AS name UNION ALL SELECT "3" AS num, "Mar" AS name UNION ALL SELECT "4" AS num, "Abr" AS name UNION ALL SELECT "5" AS num, "May" AS name UNION ALL SELECT "6" AS num, "Jun" AS name UNION ALL SELECT "7" AS num, "Jul" AS name UNION ALL SELECT "8" AS num, "Ago" AS name UNION ALL SELECT "9" AS num, "Sep" AS name UNION ALL SELECT "10" AS num, "Oct" AS name UNION ALL SELECT "11" AS num, "Nov" AS name UNION ALL SELECT "12" AS num, "Dic" AS name_month) SELECT ventasMes.year, months.*, ventasMes.usuarioId, ventasMes.apellido, ventasMes.vendido FROM months LEFT JOIN (SELECT ventas.year, ventas.month, ventas.usuarioId, ventas.apellido, SUM(ventas.pesos_vendidos) AS vendido FROM ((SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, IFNULL(SUM(ProCot.monto), 0) AS pesos_vendidos FROM Cotizaciones AS Cot INNER JOIN ProductosCotizados AS ProCot ON Cot.cotId = ProCot.cot_id INNER JOIN Productos AS Pro ON Pro.productoId = ProCot.producto_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId) UNION ALL (SELECT YEAR(Ord.fechaEnt) AS year, MONTH(Ord.fechaEnt) AS month, Usu.usuarioId AS usuarioId, Usu.apellido AS apellido, IFNULL(SUM(FueCatCot.monto), 0) AS pesos_vendidos FROM Cotizaciones AS Cot INNER JOIN FueraCatalogoCotizados AS FueCatCot ON Cot.cotId = FueCatCot.cot_id INNER JOIN Ordenes AS Ord ON Cot.cotId = Ord.cot_id INNER JOIN Cobranza AS Cob ON Ord.ordenId = Cob.orden_id RIGHT JOIN Usuarios AS Usu ON Usu.usuarioId = Ord.usuario_id WHERE Cob.estatus = "Cobranza realizada" AND Cob.actividadesTotal = Cob.actividadesCont AND Ord.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ord.fechaEnt), MONTH(Ord.fechaEnt), Usu.usuarioId)) AS ventas GROUP BY ventas.year, ventas.month, ventas.usuarioId, ventas.apellido) AS ventasMes ON months.num = ventasMes.month WHERE ventasMes.year IS NOT NULL AND ventasMes.year = ? AND ventasMes.month = ? ORDER BY ventasMes.usuarioId LIMIT 10;', [date[0], date[1]]);
                    break;
                default:
                    break;
            }
        }
        res.send({infoFiltrada: infoFiltrada});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
});

router.post('/clientsFilter', isLoggedIn, IsAuthorized('panel'), validateGraphsFilterClients(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const {dateFilter } = req.body;
        let infoFiltrada = {};
        if(dateFilter === 'global'){
            infoFiltrada = await pool.query('SELECT Clientes.clienteId AS id, Clientes.nombre AS categoria, SUM(Cotizaciones.subtotal) AS compras FROM Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE cobranza.estatus = "Cobranza realizada" AND cobranza.actividadesTotal = cobranza.actividadesCont GROUP BY Clientes.clienteId ORDER BY Clientes.clienteId LIMIT 10;');
        }else{
            const date = dateFilter.split('-');
            infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num_month, "Ene" AS name_month UNION ALL SELECT "2" AS num_month, "Feb" AS name_month UNION ALL SELECT "3" AS num_month, "Mar" AS name_month UNION ALL SELECT "4" AS num_month, "Abr" AS name_month UNION ALL SELECT "5" AS num_month, "May" AS name_month UNION ALL SELECT "6" AS num_month, "Jun" AS name_month UNION ALL SELECT "7" AS num_month, "Jul" AS name_month UNION ALL SELECT "8" AS num_month, "Ago" AS name_month UNION ALL SELECT "9" AS num_month, "Sep" AS name_month UNION ALL SELECT "10" AS num_month, "Oct" AS name_month UNION ALL SELECT "11" AS num_month, "Nov" AS name_month UNION ALL SELECT "12" AS num_month, "Dic" AS name_month) SELECT months.*, res.* FROM months LEFT JOIN (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, Clientes.clienteId AS id, Clientes.nombre AS categoria, SUM(Cotizaciones.subtotal) AS compras FROM Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE cobranza.estatus = "Cobranza realizada" AND cobranza.actividadesTotal = cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), Clientes.clienteId) AS res ON months.num_month = res.month WHERE res.year = ? AND res.month = ? ORDER BY res.id LIMIT 10;', [date[0], date[1]]);
        }
        infoFiltrada = infoFiltrada.reduce(filterOthers, []);
        res.send({infoFiltrada: infoFiltrada});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
});

router.post('/productsFilter', isLoggedIn, IsAuthorized('panel'), validateGraphsFilterProducts(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const {dateFilter, unitFilter } = req.body;
        let infoFiltrada = {};
        if (dateFilter == 'global') {
            switch (unitFilter) {
                case 'Global':
                    infoFiltrada = await pool.query('SELECT * FROM ((SELECT Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');
                    break;
                case 'Mt':
                    infoFiltrada = await pool.query('SELECT * FROM ((SELECT Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Productos.unidad = "Mt" GROUP BY Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND FueraCatalogoCotizados.unidad = "Mt" GROUP BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');
                    break;
                case 'Pieza':
                    infoFiltrada = await pool.query('SELECT * FROM ((SELECT Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Productos.unidad = "Pieza" GROUP BY Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND FueraCatalogoCotizados.unidad = "Pieza" GROUP BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');
                    break
                case 'Millar':
                    infoFiltrada = await pool.query('SELECT * FROM ((SELECT Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Productos.unidad = "Millar" GROUP BY Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND FueraCatalogoCotizados.unidad = "Millar" GROUP BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');
                    break
                default:
                    break;
            }
        } else {
            const date = dateFilter.split('-');
            switch (unitFilter) {
                case 'Global':
                  infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num, "Ene" AS name UNION ALL SELECT "2" AS num, "Feb" AS name UNION ALL SELECT "3" AS num, "Mar" AS name UNION ALL SELECT "4" AS num, "Abr" AS name UNION ALL SELECT "5" AS num, "May" AS name UNION ALL SELECT "6" AS num, "Jun" AS name UNION ALL SELECT "7" AS num, "Jul" AS name UNION ALL SELECT "8" AS num, "Ago" AS name UNION ALL SELECT "9" AS num, "Sep" AS name UNION ALL SELECT "10" AS num, "Oct" AS name UNION ALL SELECT "11" AS num, "Nov" AS name UNION ALL SELECT "12" AS num, "Dic" AS name) SELECT months.*, res.* FROM months LEFT JOIN (SELECT ventas.year AS year, ventas.month AS month, ventas.id AS id, ventas.nombre_productos AS nombre_productos, ventas.dentro AS dentro, ventas.compras AS compras FROM ((SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), FueraCatalogoCotizados.fueraCotizadoId ORDER BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id) AS res ON months.num = res.month WHERE res.year = ? AND res.month = ? ORDER BY res.id;', [date[0], date[1]]);
                  break;
                case 'Mt':
                  infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num, "Ene" AS name UNION ALL SELECT "2" AS num, "Feb" AS name UNION ALL SELECT "3" AS num, "Mar" AS name UNION ALL SELECT "4" AS num, "Abr" AS name UNION ALL SELECT "5" AS num, "May" AS name UNION ALL SELECT "6" AS num, "Jun" AS name UNION ALL SELECT "7" AS num, "Jul" AS name UNION ALL SELECT "8" AS num, "Ago" AS name UNION ALL SELECT "9" AS num, "Sep" AS name UNION ALL SELECT "10" AS num, "Oct" AS name UNION ALL SELECT "11" AS num, "Nov" AS name UNION ALL SELECT "12" AS num, "Dic" AS name) SELECT months.*, res.* FROM months LEFT JOIN (SELECT ventas.year AS year, ventas.month AS month, ventas.id AS id, ventas.nombre_productos AS nombre_productos, ventas.dentro AS dentro, ventas.compras AS compras FROM ((SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Productos.unidad = "Mt" AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND FueraCatalogoCotizados.unidad = "Mt" AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), FueraCatalogoCotizados.fueraCotizadoId ORDER BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id) AS res ON months.num = res.month WHERE res.year = ? AND res.month = ? ORDER BY res.id;', [date[0], date[1]]);
                  break;
                case 'Pieza':
                  infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num_month, "Ene" AS name_month UNION ALL SELECT "2" AS num_month, "Feb" AS name_month UNION ALL SELECT "3" AS num_month, "Mar" AS name_month UNION ALL SELECT "4" AS num_month, "Abr" AS name_month UNION ALL SELECT "5" AS num_month, "May" AS name_month UNION ALL SELECT "6" AS num_month, "Jun" AS name_month UNION ALL SELECT "7" AS num_month, "Jul" AS name_month UNION ALL SELECT "8" AS num_month, "Ago" AS name_month UNION ALL SELECT "9" AS num_month, "Sep" AS name_month UNION ALL SELECT "10" AS num_month, "Oct" AS name_month UNION ALL SELECT "11" AS num_month, "Nov" AS name_month UNION ALL SELECT "12" AS num_month, "Dic" AS name_month) SELECT months.*, res.* FROM months LEFT JOIN (SELECT ventas.year AS year, ventas.month AS month, ventas.id AS id, ventas.nombre_productos AS nombre_productos, ventas.dentro AS dentro, ventas.compras AS compras FROM ((SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId WHERE Ordenes.terminada = 0 AND Productos.unidad = "Pieza" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId WHERE Ordenes.terminada = 0 AND FueraCatalogoCotizados.unidad = "Pieza" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), FueraCatalogoCotizados.fueraCotizadoId ORDER BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id) AS res ON months.num_month = res.month WHERE res.year = ? AND res.month = ? ORDER BY res.id;', [date[0], date[1]]);
                  break
                case 'Millar':
                  infoFiltrada = await pool.query('WITH months AS (SELECT "1" AS num, "Ene" AS name UNION ALL SELECT "2" AS num, "Feb" AS name UNION ALL SELECT "3" AS num, "Mar" AS name UNION ALL SELECT "4" AS num, "Abr" AS name UNION ALL SELECT "5" AS num, "May" AS name UNION ALL SELECT "6" AS num, "Jun" AS name UNION ALL SELECT "7" AS num, "Jul" AS name UNION ALL SELECT "8" AS num, "Ago" AS name UNION ALL SELECT "9" AS num, "Sep" AS name UNION ALL SELECT "10" AS num, "Oct" AS name UNION ALL SELECT "11" AS num, "Nov" AS name UNION ALL SELECT "12" AS num, "Dic" AS name) SELECT months.*, res.* FROM months LEFT JOIN (SELECT ventas.year AS year, ventas.month AS month, ventas.id AS id, ventas.nombre_productos AS nombre_productos, ventas.dentro AS dentro, ventas.compras AS compras FROM ((SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, Productos.productoId AS id, Productos.nombre AS nombre_productos, 1 AS dentro, SUM(ProductosCotizados.monto) AS compras FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND Productos.unidad = "Pieza" AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), Productos.productoId ORDER BY Productos.productoId) UNION ALL (SELECT YEAR(Ordenes.fechaEnt) AS year, MONTH(Ordenes.fechaEnt) AS month, FueraCatalogoCotizados.fueraCotizadoId AS id, FueraCatalogoCotizados.concepto AS nombre_productos, 0 AS dentro, SUM(FueraCatalogoCotizados.monto) AS compras FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Cobranza ON Ordenes.ordenId = Cobranza.orden_id WHERE Cobranza.estatus = "Cobranza realizada" AND Cobranza.actividadesTotal = Cobranza.actividadesCont AND FueraCatalogoCotizados.unidad = "Pieza" AND Ordenes.fechaEnt <> "2001-01-01" GROUP BY YEAR(Ordenes.fechaEnt), MONTH(Ordenes.fechaEnt), FueraCatalogoCotizados.fueraCotizadoId ORDER BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id) AS res ON months.num = res.month WHERE res.year = ? AND res.month = ? ORDER BY res.id;', [date[0], date[1]]);
                  break
                default:
                  break;
            }
        }
        infoFiltrada = infoFiltrada.reduce(filterOthersOutCatalog, []);
        res.send({infoFiltrada: infoFiltrada});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
});

router.post('/report', isLoggedIn, IsAuthorized('reportes'), validateReports(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const body = req.body;
        let secciones = body.sectionsReport;
        let resultado = [];
        let informacion = [];
        let totalFilas = 0;

        // checar si llego una sola seccion (convertirla en arreglo en caso de no ser un arreglo)
        if (!Array.isArray(secciones)) {
            secciones = new Array(secciones);
        }

        // crear archivo excel
        const workBook = await XlsxPopulate.fromBlankAsync();

        // crear hojas del archivo excel
        for await (const seccion of secciones) {
            switch (seccion) {
                case 'areas':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Areas');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT areaId AS ID, nombre AS Nombre, IF(activo = 1, "Activa", "Inactiva") AS Estatus FROM Areas;')

                    if (resultado.length > 0) {
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Areas').cell('A1').value(informacion);
                    } else {
                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Areas').cell('A1').value([['ID', 'Nombre', 'Estatus']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Areas').range('A1:C1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Areas').range(`A2:C${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'clientes':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Clientes');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Clientes.clienteId AS ID, Clientes.nombre AS Nombre, IFNULL("Sin grupo", Grupos.nombre) AS Grupo, Clientes.contacto AS Contacto, Clientes.razonSocial AS "Razon Social", Clientes.rfc AS RFC, IF(Clientes.domNumIn IS NULL, CONCAT(Clientes.domCalle, " #", Clientes.domNumEx), CONCAT(Clientes.domCalle, " #", Clientes.domNumEx, " INT.", Clientes.domNumIn)) AS Direccion, Clientes.domColonia AS Colonia, Clientes.domCp AS "C.P.", Clientes.domCiudad AS Ciudad, Clientes.domEstado AS Estado, IF(Clientes.telefonoExt IS NULL, Clientes.telefono, CONCAT(Clientes.telefono, ",", Clientes.telefonoExt)) AS "No. Teléfono", Clientes.celular AS "No. Celular", Clientes.correoElec AS "Correo electrónico", Clientes.correoElecAlt AS "Correo electrónico alterno", Clientes.limiteCredito AS "Límite de Crédito", Clientes.diasCredito AS "Días de Crédito", CONCAT(Clientes.descuento, "%") AS "Descuento máximo", Clientes.observaciones AS Observaciones, IF(Clientes.activo = 1, "Activo", "Inactivo") AS Estatus FROM Clientes LEFT JOIN Grupos ON Clientes.grupo_id = Grupos.grupoId;');

                    if (resultado.length > 0) {
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Clientes').cell('A1').value(informacion);
                    } else {
                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Clientes').cell('A1').value([['ID', 'Nombre', 'Grupo', 'Contacto', 'Razon Social', 'RFC', 'Direccion', 'Colonia', 'C.P.', 'Ciudad', 'Estado', 'No. Teléfono', 'No. Celular', 'Correo electrónico', 'Correo electrónico alterno', 'Límite de Crédito', 'Días de Crédito', 'Descuento máximo', 'Observaciones', 'Estatus']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Clientes').range('A1:T1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Clientes').range(`A2:T${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Clientes').range(`P2:P${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'cotizaciones':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Cotizaciones');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Cot.cotId AS ID, Cot.fecha AS Fecha, Clientes.nombre AS Cliente, Cot.proyecto AS Proyecto, Cot.observaciones AS Observaciones, CONCAT(Cot.porcentajeDescuento, "%") AS "Descuento (%)", Cot.solicitante AS Solicitante, Cot.empleado AS Empleado, Cot.estatus AS Estatus, Cot.totalBruto AS "Total bruto", Cot.descuento AS "Descuento ($)", Cot.subtotal AS Subtotal, Cot.iva AS IVA, Cot.total AS Total FROM Cotizaciones AS Cot INNER JOIN Clientes ON Cot.cliente_id = Clientes.clienteId;');

                    if (resultado.length > 0) {
                        // ajustar tipo de datos
                        resultado.forEach((objeto, i) => {
                            objeto["Total bruto"] = parseFloat(objeto["Total bruto"]);
                            objeto["Descuento ($)"] = parseFloat(objeto["Descuento ($)"]);
                            objeto["Subtotal"] = parseFloat(objeto["Subtotal"]);
                            objeto["IVA"] = parseFloat(objeto["IVA"]);
                            objeto["Total"] = parseFloat(objeto["Total"]);
                        });

                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Cotizaciones').cell('A1').value(informacion);
                    } else {
                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Cotizaciones').cell('A1').value([['ID', 'Fecha', 'Cliente', 'Proyecto', 'Observaciones', 'Descuento (%)', 'Solicitante', 'Empleado', 'Estatus', 'Total bruto', 'Descuento ($)', 'Subtotal', 'IVA', 'Total']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Cotizaciones').range('A1:N1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Cotizaciones').range(`A2:N${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Cotizaciones').range(`B2:B${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy hh:mm:ss");
                    workBook.sheet('Cotizaciones').range(`J2:N${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'empleados':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Empleados');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Emp.empleadoId AS ID, Emp.nombreComp AS Nombre, Emp.correoElec AS "Correo electrónico", Roles.nombre AS Rol, Emp.numeroNomina AS "Número de Nomina", Emp.salarioQuin AS Salario, Emp.compleNomina AS "Complemento de Nomina", Emp.fechaIngreso AS "Fecha de Ingreso", Emp.anosCumplir AS "Años Trabajando", Areas.nombre AS Area, Emp.numeroCelu AS "No. Celular", CONCAT(Emp.emerNombre, " #", Emp.emerCelu) AS "Contacto emergencia", Emp.estadoCivil AS "Estado Civil", Emp.curp AS CURP, Emp.rfc AS RFC, IF(Emp.sexo = "H", "Maculino", "Femenino") AS Sexo, Emp.nacLugar AS "Lugar de Nacimiento", Emp.nacFecha AS "Fecha de Nacimiento", Emp.edadCumplir AS Edad, Emp.domicilio AS Domicilio, Emp.nss AS NSS, Emp.registroPatro AS "Registro Patronal", Emp.estatus AS Estatus, Emp.inicioContrato AS "Inicio de Contrato", Emp.finContrato AS "Fin de Contrato" FROM Empleados AS Emp INNER JOIN Roles ON Emp.rol_id = Roles.rolId INNER JOIN Areas ON Emp.area_id = Areas.areaId;');

                    if (resultado.length > 0) {
                        // ajustar tipo de datos
                        resultado.forEach((objeto, i) => {
                            objeto["Salario"] = parseFloat(objeto["Salario"]);
                            objeto["Años Trabajando"] = parseFloat(objeto["Años Trabajando"]);
                            objeto["Edad"] = parseFloat(objeto["Edad"]);
                        });

                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Empleados').cell('A1').value(informacion);
                    } else {
                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Empleados').cell('A1').value([['ID', 'Nombre', 'Correo electrónico', 'Rol', 'Número de Nomina', 'Salario', 'Complemento de Nomina', 'Fecha de Ingreso', 'Años Trabajando', 'Area', 'No. Celular', 'Contacto emergencia', 'Estado Civil', 'CURP', 'RFC', 'Sexo', 'Lugar de Nacimiento', 'Fecha de Nacimiento', 'Edad', 'Domicilio', 'NSS', 'Registro Patronal', 'Estatus', 'Inicio de Contrato', 'Fin de Contrato']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Empleados').range('A1:Y1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Empleados').range(`A2:Y${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Empleados').range(`H2:H${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy");
                    workBook.sheet('Empleados').range(`R2:R${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy");
                    workBook.sheet('Empleados').range(`X2:X${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy");
                    workBook.sheet('Empleados').range(`Y2:Y${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy");
                    workBook.sheet('Empleados').range(`F2:F${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'gruposClientes':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Grupos de clientes');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT grupoId AS ID, nombre AS Nombre FROM Grupos;');

                    if (resultado.length > 0){
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Grupos de clientes').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Grupos de clientes').cell('A1').value([["ID", "Nombre"]]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Grupos de clientes').range('A1:B1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Grupos de clientes').range(`A2:B${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'maquinas':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Máquinas');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT maquinaId AS ID, numSerie AS "No. Serie", marca AS Marca, nombre AS Nombre, tipoCabezal AS "Tipo de Cabezal", numCabezales AS "Número de Cabezales", velocidad AS Velocidad, tipoTinta AS "Tipo de Tinta", IF(conTecnicoExt IS NULL, conTecnico, CONCAT(conTecnico, ",", conTecnicoExt)) AS "Contacto del Técnico", IF(activo = 1, "Activa", "Inactiva") AS Estatus FROM Maquinas;');

                    if (resultado.length > 0){
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Máquinas').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Máquinas').cell('A1').value([['ID', 'No. Serie', 'Marca', 'Nombre', 'Tipo de Cabezal', 'Número de Cabezales', 'Velocidad', 'Tipo de Tinta', 'Contacto del Técnico', 'Estatus']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Máquinas').range('A1:J1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Máquinas').range(`A2:J${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'ordenes':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Órdenes');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Ordenes.ordenId AS ID, Ordenes.fechaGen AS "Fecha de Generación", IF(DATE(Ordenes.fechaGen) = Ordenes.fechaEnt, "Sin asignar", Ordenes.fechaEnt) AS "Fecha de Entrega", CONCAT("COT-", Cotizaciones.cotId) AS "Cotización", CONCAT(Usuarios.apellido, " ", Usuarios.nombre) AS "Empleado encargado", IF(Ordenes.terminada = 1, "Terminada", "En proceso") AS Estatus FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Usuarios ON Ordenes.usuario_id = Usuarios.usuarioId ORDER BY Ordenes.ordenId;');

                    if (resultado.length > 0){
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Órdenes').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Órdenes').cell('A1').value([['ID', 'Fecha de Generación', 'Fecha de Entrega', 'Cotización', 'Empleado encargado', 'Estatus']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Órdenes').range('A1:F1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Órdenes').range(`A2:F${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Órdenes').range(`B2:B${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy hh:mm:ss");
                    workBook.sheet('Órdenes').range(`C2:C${totalFilas + 1}`).style("numberFormat", "dd/mm/yyyy");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'productos':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Productos');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Prod.productoId AS ID, Prod.nombre AS Nombre, Prod.descripcion AS "Descripción", Prod.unidad AS Unidad, Prod.precio AS Precio, Procesos.nombre AS Proceso FROM Productos AS Prod INNER JOIN Procesos ON Prod.proceso_id = Procesos.procesoId;');

                    if (resultado.length > 0){
                        // ajustar tipo de datos
                        resultado.forEach((objeto, i) => {
                            objeto["Precio"] = parseFloat(objeto["Precio"]);
                        });

                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Productos').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Productos').cell('A1').value([[ 'ID', 'Nombre', 'Descripción', 'Unidad', 'Precio', 'Proceso' ]]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Productos').range('A1:F1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Productos').range(`A2:F${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Productos').range(`E2:E${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'productosCotizados':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Productos cotizados');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT * FROM ((SELECT ProductosCotizados.prodCotizadoId AS ID, CONCAT("COT-", ProductosCotizados.cot_id) AS "Cotización", ProductosCotizados.cantidad AS Cantidad, Productos.nombre AS Producto, Productos.unidad AS "Unidad de Medida", "Si" AS "¿Está en catálogo?", ProductosCotizados.acabados AS Acabados, ProductosCotizados.archivo AS Archivo, ProductosCotizados.largo AS Largo, ProductosCotizados.ancho AS Ancho, ProductosCotizados.area AS "Área", ProductosCotizados.precio AS "Precio unitario", ProductosCotizados.precioCadaUno AS Subtotal, ProductosCotizados.monto AS Total FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId WHERE Cotizaciones.estatus <> "Ordenada" ORDER BY ProductosCotizados.prodCotizadoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS ID, CONCAT("COT-", FueraCatalogoCotizados.cot_id) AS "Cotización", FueraCatalogoCotizados.cantidad AS Cantidad, FueraCatalogoCotizados.concepto AS Producto, FueraCatalogoCotizados.unidad AS "Unida de Medida", "No" AS "¿Está en catálogo?", FueraCatalogoCotizados.acabados AS Acabados, FueraCatalogoCotizados.archivo AS Archivo, FueraCatalogoCotizados.largo AS Largo, FueraCatalogoCotizados.ancho AS Ancho, FueraCatalogoCotizados.area AS "Área", FueraCatalogoCotizados.precio AS "Precio Unitario", FueraCatalogoCotizados.precioCadaUno AS Subtotal, FueraCatalogoCotizados.monto AS Total FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId WHERE Cotizaciones.estatus <> "Ordenada" ORDER BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');

                    if (resultado.length > 0){
                        // ajustar tipo de datos
                        resultado.forEach((objeto, i) => {
                            objeto["Precio unitario"] = parseFloat(objeto["Precio unitario"]);
                            objeto["Subtotal"] = parseFloat(objeto["Subtotal"]);
                            objeto["Total"] = parseFloat(objeto["Total"]);
                        });

                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Productos cotizados').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Productos cotizados').cell('A1').value([['ID', 'Cotización', 'Cantidad', 'Producto', 'Unidad de Medida', '¿Está en catálogo?', 'Acabados', 'Archivo', 'Largo', 'Ancho', 'Área', 'Precio unitario', 'Subtotal', 'Total']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Productos cotizados').range('A1:N1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Productos cotizados').range(`A2:N${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Productos cotizados').range(`L2:L${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");
                    workBook.sheet('Productos cotizados').range(`M2:M${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");
                    workBook.sheet('Productos cotizados').range(`N2:N${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'productosOrdenados':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Productos ordenados');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT * FROM ((SELECT ProductosCotizados.prodCotizadoId AS ID, CONCAT("COT-", ProductosCotizados.cot_id) AS "Cotización", ProductosCotizados.cantidad AS Cantidad, Productos.nombre AS Producto, Productos.unidad AS "Unidad de Medida", "Si" AS "¿Está en catálogo?", ProductosCotizados.acabados AS Acabados, ProductosCotizados.archivo AS Archivo, ProductosCotizados.largo AS Largo, ProductosCotizados.ancho AS Ancho, ProductosCotizados.area AS "Área", ProductosCotizados.precio AS "Precio unitario", ProductosCotizados.precioCadaUno AS Subtotal, ProductosCotizados.monto AS Total FROM ProductosCotizados INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId INNER JOIN Cotizaciones ON ProductosCotizados.cot_id = Cotizaciones.cotId WHERE Cotizaciones.estatus = "Ordenada" ORDER BY ProductosCotizados.prodCotizadoId) UNION ALL (SELECT FueraCatalogoCotizados.fueraCotizadoId AS ID, CONCAT("COT-", FueraCatalogoCotizados.cot_id) AS "Cotización", FueraCatalogoCotizados.cantidad AS Cantidad, FueraCatalogoCotizados.concepto AS Producto, FueraCatalogoCotizados.unidad AS "Unida de Medida", "No" AS "¿Está en catálogo?", FueraCatalogoCotizados.acabados AS Acabados, FueraCatalogoCotizados.archivo AS Archivo, FueraCatalogoCotizados.largo AS Largo, FueraCatalogoCotizados.ancho AS Ancho, FueraCatalogoCotizados.area AS "Área", FueraCatalogoCotizados.precio AS "Precio Unitario", FueraCatalogoCotizados.precioCadaUno AS Subtotal, FueraCatalogoCotizados.monto AS Total FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON FueraCatalogoCotizados.cot_id = Cotizaciones.cotId WHERE Cotizaciones.estatus = "Ordenada" ORDER BY FueraCatalogoCotizados.fueraCotizadoId)) AS ventas ORDER BY ventas.id;');

                    if (resultado.length > 0){
                        // ajustar tipo de datos
                        resultado.forEach((objeto, i) => {
                            objeto["Precio unitario"] = parseFloat(objeto["Precio unitario"]);
                            objeto["Subtotal"] = parseFloat(objeto["Subtotal"]);
                            objeto["Total"] = parseFloat(objeto["Total"]);
                        });

                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Productos ordenados').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Productos ordenados').cell('A1').value([['ID', 'Cotización', 'Cantidad', 'Producto', 'Unidad de Medida', '¿Está en catálogo?', 'Acabados', 'Archivo', 'Largo', 'Ancho', 'Área', 'Precio unitario', 'Subtotal', 'Total']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Productos ordenados').range('A1:N1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Productos ordenados').range(`A2:N${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Productos ordenados').range(`L2:L${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");
                    workBook.sheet('Productos ordenados').range(`M2:M${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");
                    workBook.sheet('Productos ordenados').range(`N2:N${totalFilas + 1}`).style("numberFormat", "$#,##0.00;-$#,##0.00");

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'roles':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Roles');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Roles.rolId AS ID, Roles.nombre AS Nombre, IF(Roles.activo = 1, "Activo", "Inactivo") AS Estatus, Roles.descripcion AS "Descripción", COUNT(PermisosRoles.permiso_id) AS "Total Permisos", GROUP_CONCAT(Permisos.descripcion SEPARATOR ", ") AS Permisos FROM Roles INNER JOIN PermisosRoles ON Roles.rolId = PermisosRoles.rol_id INNER JOIN Permisos ON PermisosRoles.permiso_id = Permisos.permisoId GROUP BY Roles.rolId;');

                    if (resultado.length > 0){
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Roles').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Roles').cell('A1').value([['ID', 'Nombre', 'Estatus', 'Descripción', 'Total Permisos', 'Permisos']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Roles').range('A1:F1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Roles').range(`A2:E${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });
                    workBook.sheet('Roles').range(`F2:F${totalFilas + 1}`).style({
                        verticalAlignment: 'center'
                    });

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                case 'usuarios':
                    // crear hoja en el archivo de excel
                    workBook.addSheet('Usuarios');

                    // obtener informacion de la tabla
                    resultado = await pool.query('SELECT Usuarios.usuarioId AS ID, Usuarios.nombre AS Nombre, Usuarios.apellido AS Apellido, Usuarios.correoElec AS "Correo Electrónico", Roles.nombre AS Rol, IF(Usuarios.activo = 1, "Activo", "Inactivo") AS Estatus FROM Usuarios INNER JOIN Roles ON Usuarios.rol_id = Roles.rolId;');

                    if (resultado.length > 0){
                        // obtener los valores en filas y los encabezados
                        resultado.forEach((fila, i) => {
                            totalFilas += 1;
                            if(i === 0){
                                informacion.push(Object.keys(fila));
                                informacion.push(Object.values(fila));
                            }else{
                                informacion.push(Object.values(fila));
                            }
                        });

                        // almacenar valores en la hoja correspondiente
                        workBook.sheet('Usuarios').cell('A1').value(informacion);
                    }else{
                        // almacenar valores por defecto en la hoja correspondiente
                        workBook.sheet('Usuarios').cell('A1').value([['ID', 'Nombre', 'Apellido', 'Correo Electrónico', 'Rol', 'Estatus']]);
                    }

                    // aplicar estilos (encabezado)
                    workBook.sheet('Usuarios').range('A1:F1').style({
                        bold: true,
                        fill: 'dc3545',
                        fontColor: 'ffffff',
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // aplicar estilos (resto de la tabla)
                    workBook.sheet('Usuarios').range(`A2:F${totalFilas + 1}`).style({
                        horizontalAlignment: 'center',
                        verticalAlignment: 'center'
                    });

                    // limpiar variables
                    resultado = [];
                    informacion = [];
                    totalFilas = 0;
                    break;
                default:
                    break;
            }
        }

        // eliminar la primera hoja (predeterminada)
        workBook.deleteSheet("Sheet1");

        // generar archivo de salida
        const salida = await workBook.outputAsync();

        // generar el nombre del archivo
        const fecha = new Date();
        const fechaEnFormato = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
        const nombreArchivo = `reporte_${fechaEnFormato}.xlsx`;

        // enviar archivo
        res.attachment(nombreArchivo);
        res.send(salida);
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/dashboard');
    }
})

module.exports = router;