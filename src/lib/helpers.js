const bcrypt = require('bcryptjs');
const pdfMakePrinter = require('pdfmake');
const path = require('path');

// pdf text format functions
function formatDatePDF(date){
    date = new Date(date);
    fecha = date.toLocaleDateString('es-mx', {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric'});
    return fecha;
}

function formatNumber(n){
    let num = Number.parseFloat(n).toFixed(2);
    num = Number(num).toLocaleString(undefined, {minimumFractionDigits: 2});
    return num;
}

function formatNumberMeasure(n){
    if(Number.isInteger(n)){
        return Number(n)
    }else{
        return Number(Number.parseFloat(n).toFixed(3));
    }
}

// helpers
const helpers = {};

helpers.encryptPassword = async (password) =>{
    const salt = await bcrypt.getSalt(10);    
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helpers.matchPassword = async (password, savePassword) =>{
    try{
        return await bcrypt.compare(password, savePassword);
    }catch (err){
        console.log(err);
    }
};

helpers.moneda = (n) => {
    return Number(Number.parseFloat(n).toFixed(2));
}

helpers.dimensiones = (n) => {
    return Number(Number.parseFloat(n).toFixed(3));
}

helpers.createPdf = async (dataDb, dataCallback, endCallback) => {
    // font description
    const fontDescription = {
        Roboto: {
            normal: path.join(process.cwd(), 'src', 'public', 'fonts', 'Open_Sans', 'static', 'OpenSans_Condensed-Regular.ttf') ,
            bold: path.join(process.cwd(), 'src', 'public', 'fonts', 'Open_Sans', 'static', 'OpenSans_Condensed-Medium.ttf'),
            italics: path.join(process.cwd(), 'src', 'public', 'fonts', 'Open_Sans', 'static', 'OpenSans_Condensed-Italic.ttf'),
            bolditalics: path.join(process.cwd(), 'src', 'public', 'fonts', 'Open_Sans', 'static', 'OpenSans_Condensed-MediumItalic.ttf')
        }
    };

    // doc creation
    const printer = new pdfMakePrinter(fontDescription);

    // product structuring
    let productosEstructurados = [];
    dataDb.productos.forEach(producto => {
        productosEstructurados.push(
            {
                width: '100%',
                margin: [0, 0, 0, 20],
                stack: [
                    {
                        table: {
                            widths: ['10%', '30%', '20%', '16%', '12%', '12%'],
                            body: [
                                [
                                    {text: 'Cantidad', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [true, true, false, true], alignment: 'center', margin: [3, 0, 0, 0]}, 
                                    {text: 'Producto', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, true, false, true], alignment: 'center', margin: [3, 0, 0, 0]}, 
                                    {text: 'Precio por unidad', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, true, false, true], alignment: 'center', margin: [3, 0, 0, 0]}, 
                                    {text: 'Dimensiones', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, true, false, true], alignment: 'center', margin: [3, 0, 0, 0]}, 
                                    {text: 'Precio c/u', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, true, false, true], alignment: 'center', margin: [3, 0, 0, 0]}, 
                                    {text: 'Monto', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, true, true, true], alignment: 'center', margin: [3, 0, 0, 0]}, 
                                ],
                                [
                                    {text: producto.cantidad, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [true, false, false, true], alignment: 'center', margin: [3, 20, 0, 0]},
                                    {
                                        table: {
                                            widths: ['35%', '65%'],
                                            body: [
                                                [
                                                    {text: 'Producto:', style: 'tableContentProductBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, false], alignment: 'left', margin: [3, 0, 0, 0]},
                                                    {text: (producto.nombre) ? producto.nombre : producto.concepto, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, false], alignment: 'left', margin: [3, 0, 0, 0]},
                                                ],
                                                [
                                                    {text: 'Acabados:', style: 'tableContentProductBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, false], alignment: 'left', margin: [3, 0, 0, 0]},
                                                    {text:  producto.acabados, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, false], alignment: 'left', margin: [3, 0, 0, 0]},
                                                ],
                                                [
                                                    {text: 'Archivo:', style: 'tableContentProductBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, false], alignment: 'left', margin: [3, 0, 0, 0]},
                                                    {text:  producto.archivo, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, false], alignment: 'left', margin: [3, 0, 0, 0]},
                                                ]
                                            ]
                                        }
                                    },
                                    {text: (producto.unidad == 'Mt') ? `$${formatNumber(producto.precio)} (x ${producto.unidad}²)` : `$${formatNumber(producto.precio)} (x ${producto.unidad})`, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'center', margin: [3, 20, 0, 0]},
                                    {
                                        stack: [
                                            {text: (producto.unidad == 'Mt') ? `${formatNumberMeasure(producto.area)} mts²` : `No aplica`, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'center', margin: (producto.unidad == 'Mt') ? [3, 13, 0, 0] : [3, 20, 0, 0]},
                                            {text: (producto.unidad == 'Mt') ? `(L) ${formatNumberMeasure(producto.largo)} mts x (A) ${formatNumberMeasure(producto.ancho)} mts` : ``, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'center', margin: [3, 0, 0, 0]}
                                        ]
                                    },
                                    {text: (producto.unidad == 'Mt') ? `$${formatNumber(producto.precioCadaUno)}` : `$${formatNumber(producto.precio)}`, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'center', margin: [3, 20, 0, 0]},
                                    {text: `$${formatNumber(producto.monto)}`, style: 'tableContentProduct', colSpan: 1, fillColor: '#fff', color: '#000', border: [true, false, true, true], alignment: 'center', margin: [3, 20, 0, 0]},
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return 1;
                            },
                            hLineColor: function (i, node) {
                                return '#dee2e6';
                            },
                            vLineWidth: function (i, node) {
                                return 1;
                            },
                            vLineColor: function (i, node) {
                                return '#dee2e6';
                            },
                        }
                    }
                ]
            }
        )
    });

    // pdf content
    const docDefinition = {
        // pages settings
        pageSize: 'A4',
        pageMargins: 30,
        pageOrientation: 'portrait',

        // page content
        content: [
            {
                columns: [
                    {   
                        width: '45%',
                        stack: [
                            {image: path.join(process.cwd(), 'src', 'public', 'img', 'PIMSAlogo.png'), width: 225, height: 70, alignment: 'center', margin: [0, 0, 0, 25]},
                            {
                                table: {
                                    widths: ['45%', '55%'],
                                    body: [
                                        [{text: 'Información de la cotización', style: 'tableHeader', colSpan: 2, fillColor: '#dc3545', color: '#fff', border: [false, false, false, false], alignment: 'center'}, {}],
                                        [
                                            {text: 'No. cotización:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: `COT-${dataDb.cotizacion.cotId}`, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Fecha de generación:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: formatDatePDF(dataDb.cotizacion.fecha), style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Proyecto:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.proyecto, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Empleado:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.nombreComp, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ]
                                    ]
                                },
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return 1;
                                    },
                                    hLineColor: function (i, node) {
                                        return '#dee2e6';
                                    },
                                }
                            }
                        ]
                    },
                    {
                        width: '55%',
                        stack: [
                            {
                                table: {
                                    widths: ['30%', '28%', '25%', '17%'],
                                    body: [
                                        [{text: 'Información del cliente', style: 'tableHeader', colSpan: 4, fillColor: '#dc3545', color: '#fff', border: [false, false, false, false], alignment: 'center'}, {}, {}, {}],
                                        [
                                            {text: 'Solicitante:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.solicitante, style: 'tableContent', colSpan: 3, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {},
                                            {}
                                        ],
                                        [
                                            {text: 'Cliente:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.nombre, style: 'tableContent', colSpan: 3, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {},
                                            {}
                                        ],
                                        [
                                            {text: 'Empresa:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.razonSocial, style: 'tableContent', colSpan: 3, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {},
                                            {}
                                        ],
                                        [
                                            {text: 'RFC:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.rfc, style: 'tableContent', colSpan: 3, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {},
                                            {}
                                        ],
                                        [
                                            {text: 'Estado:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.domEstado, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {text: 'Municipio:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.domCiudad, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Colonia:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.domColonia, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {text: 'Código postal:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.domCp, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Calle:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.domCalle, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {text: 'Número:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: (dataDb.cotizacion.domNumIn) ? `${dataDb.cotizacion.domNumEx} Int. ${dataDb.cotizacion.domNumIn}`: `${dataDb.cotizacion.domNumEx}`, style: 'tableContent', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Teléfono:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: (dataDb.cotizacion.telefonoExt) ? `Ext ${dataDb.cotizacion.telefonoExt} ${dataDb.cotizacion.telefono}`: `${dataDb.cotizacion.telefono}`, style: 'tableContent', colSpan: 3, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {},
                                            {}
                                        ],
                                        [
                                            {text: 'Correo electrónico:', style: 'tableContentBold', colSpan: 1, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]}, 
                                            {text: dataDb.cotizacion.correoElec, style: 'tableContent', colSpan: 3, fillColor: '#f8f9fa', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [3, 0, 0, 0]},
                                            {},
                                            {}
                                        ]
                                    ]
                                },
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return 1;
                                    },
                                    hLineColor: function (i, node) {
                                        return '#dee2e6';
                                    },
                                }
                            }
                        ]
                    }
                ],
                columnGap: 30
            },
            {
                width: '100%',
                margin: [0, 30, 0, 0],
                stack: [
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [{text: 'Información de los productos', style: 'tableHeader', colSpan: 1, fillColor: '#dc3545', color: '#fff', border: [false, false, false, false], alignment: 'center'}]
                            ]
                        }
                    }
                ]
            },
            productosEstructurados,
            {
                columns: [
                    {
                        width: '70%',
                        stack: [
                            {text: 'Observaciones:', style: 'tableContentBold', alignment: 'left', margin: [0, 0, 0, 0]},
                            {text: dataDb.cotizacion.observaciones, style: 'tableContent', alignment: 'left', margin: [0, 0, 0, 0]}
                        ]
                    },
                    {
                        width: '30%',
                        stack: [
                            {
                                table: {
                                    widths: ['50%', '50%'],
                                    body: [
                                        [
                                            {text: 'Bruto:', style: 'tableContentBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [0, 0, 0, 0]}, 
                                            {text: `$${formatNumber(dataDb.cotizacion.totalBruto)}`, style: 'tableContent', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'right', margin: [0, 0, 0, 0]},
                                        ],
                                        [
                                            {text: `Descuento (${formatNumberMeasure(dataDb.cotizacion.porcentajeDescuento)} %):`, style: 'tableContentBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [0, 0, 0, 0]}, 
                                            {text: `- $${formatNumber(dataDb.cotizacion.descuento_cotizacion)}`, style: 'tableContent', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'right', margin: [0, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'Subtotal:', style: 'tableContentBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [0, 0, 0, 0]}, 
                                            {text: `$${formatNumber(dataDb.cotizacion.subtotal)}`, style: 'tableContent', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'right', margin: [0, 0, 0, 0]},
                                        ],
                                        [
                                            {text: 'IVA (16 %):', style: 'tableContentBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'left', margin: [0, 0, 0, 0]}, 
                                            {text: `+ $${formatNumber(dataDb.cotizacion.iva)}`, style: 'tableContent', colSpan: 1, fillColor: '#fff', color: '#000', border: [false, false, false, true], alignment: 'right', margin: [0, 0, 0, 0]},
                                        ],
                                    ]
                                },
                                layout: 'noBorders'
                            },
                            {
                                margin: [0, 10, 0, 0],
                                table: {
                                    widths: ['100%'],
                                    body: [
                                        [
                                            {text: 'Total:', style: 'tableHeaderBold', colSpan: 1, fillColor: '#fff', color: '#000', border: [true, true, true, false], alignment: 'center', margin: [0, 0, 0, 0]},
                                        ],
                                        [
                                            {text: `$${formatNumber(dataDb.cotizacion.total)}`, style: 'tableHeader', colSpan: 1, fillColor: '#fff', color: '#000', border: [true, false, true, true], alignment: 'center', margin: [0, 0, 0, 0]},
                                        ]
                                    ]
                                },
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return (i === 0 || i === node.table.body.length) ? 2 : 0;
                                    },
                                    vLineWidth: function (i, node) {
                                        return (i === 0 || i === node.table.widths.length) ? 2 : 0;
                                    },
                                    hLineColor: function (i, node) {
                                        return (i === 0 || i === node.table.body.length) ? 'black' : null;
                                    },
                                    vLineColor: function (i, node) {
                                        return (i === 0 || i === node.table.widths.length) ? 'black' : null;
                                    }
                                }
                            }
                        ]
                    }
                ],
                columnGap: 30
            }
        ],

        // pages styles
        styles: {
            tableHeaderBold: {
                fontSize: 12,
                bold: true
            },
            tableHeader: {
                fontSize: 12
            },
            tableContentBold: {
                fontSize: 10,
                bold: true
            },
            tableContent: {
                fontSize: 10
            },
            tableContentProductBold: {
                fontSize: 10,
                bold: true
            },
            tableContentProduct: {
                fontSize: 10
            }
        }
    };

    // pdf creation
    const doc = printer.createPdfKitDocument(docDefinition);

    // pdf stream (send)
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // close pdf
    doc.end();
}

helpers.filterOthers = (acumulador, arreglo) => {
    if(arreglo.compras <= 1000){
        const otros = acumulador.find(function(arreglo){
            return arreglo.categoria == 'Otros';
        })
        if(!otros){
            acumulador.push({categoria: 'Otros', compras: parseFloat(arreglo.compras), nombres: `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.categoria}\n`});
        }else{
            otros.compras += parseFloat(arreglo.compras);                        
            otros.nombres += `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.categoria}\n`;
        }
    }else{
        acumulador.push({categoria: arreglo.categoria, compras: parseFloat(arreglo.compras), nombres: arreglo.categoria});
    }
    return acumulador;
}

helpers.filterOthersOutCatalog = (acumulador, arreglo) => {
    if(arreglo.dentro == false){
        const fuera = acumulador.find(function(arreglo){
            return arreglo.categoria == 'Fuera de catálogo';
        })
        if(!fuera){
            acumulador.push({categoria: 'Fuera de catálogo', compras: parseFloat(arreglo.compras), nombres: `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`});
        }else{
            fuera.compras += parseFloat(arreglo.compras);
            if (arreglo.compras > 10000){
                fuera.nombres += `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`;
            }
        }
    }else{
        if(arreglo.compras <= 1000){
            const otros = acumulador.find(function(arreglo){
                return arreglo.categoria == 'Otros';
            })
            if(!otros){
                acumulador.push({categoria: 'Otros', compras: parseFloat(arreglo.compras), nombres: `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`});
            }else{
                otros.compras += parseFloat(arreglo.compras);                        
                otros.nombres += `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`;
            }
        }else{
            acumulador.push({categoria: arreglo.nombre_productos, compras: parseFloat(arreglo.compras), nombres: arreglo.nombre_productos});
        }
    }
    return acumulador;
}

module.exports = helpers;