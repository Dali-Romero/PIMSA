$(document).ready(function(){
    // list dashboard quotations table
    var quotationsTable = new DataTable('#dashboard-quotations-table', {
        paging: false,
        info: false,
        ordering: false,
        padding: false,
        filter: false,
        scrollCollapse: true,
        scrollY: 628,
        scrollX: true,
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // list dashboard orders table
    var ordersTable = new DataTable('#dashboard-orders-table', {
        paging: false,
        info: false,
        ordering: false,
        padding: false,
        filter: false,
        scrollCollapse: true,
        scrollY: 628,
        scrollX: true,
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // header width recalculation
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        //DataTable.tables({ visible: true, api: true }).columns.adjust();
        quotationsTable.columns.adjust().draw();
        ordersTable.columns.adjust().draw();
    });

    // charts containers (1-7)
    const ctx1 = $('#chart1');
    const ctx2 = $('#chart2');
    const ctx3 = $('#chart3');
    const ctx4 = $('#chart4');
    const ctx5 = $('#chart5');
    const ctx6 = $('#chart6');

    // pluging for empty doughnut chart
    const emptyChart = {
        id: 'emptyDoughnut',
        afterDraw(chart, args, options) {
            const {datasets} = chart.data;
            const {color, width, radiusDecrease} = options;
            let hasData = false;
        
            for (let i = 0; i < datasets.length; i += 1) {
                const dataset = datasets[i];
                hasData |= dataset.data.length > 0;
            }
        
            if (!hasData) {
                const {chartArea: {left, top, right, bottom}, ctx} = chart;
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                const r = Math.min(right - left, bottom - top) / 2;

                ctx.beginPath();
                ctx.lineWidth = width || 2;
                ctx.strokeStyle = color || 'rgba(255, 128, 0, 0.5)';
                ctx.arc(centerX, centerY, (r - radiusDecrease || 0), 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    }

    // pluging for show text inside doughnut chart
    const doughnutLabel = {
        id: 'doughnutLabel',
        beforeDatasetsDraw(chart, args, pluginOptions){
            const {ctx, data, chartArea: {left, top, right, bottom}} = chart;
            //const month = $('#clients-month').text().trim();

            ctx.save();
            if(chart.getDatasetMeta(0).data.length > 0){
                const xCoor = chart.getDatasetMeta(0).data[0].x;
                const yCoor = chart.getDatasetMeta(0).data[0].y;

                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.textAlign = 'center';
                ctx.textBaseLine = 'middle';
                ctx.fillText(`${data.labels.length}`, xCoor, yCoor);

                ctx.font = '20px sans-serif';
                ctx.fillText(`Clientes`, xCoor, yCoor*1.15); 
            }else{
                const xCoor = (left + right) / 2;
                const yCoor = (top + bottom) / 2;

                ctx.font = 'bold 25px sans-serif';
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.textAlign = 'center';
                ctx.textBaseLine = 'middle';
                ctx.fillText(`${data.labels.length}`, xCoor, yCoor);

                ctx.font = '20px sans-serif';
                ctx.fillText(`Clientes`, xCoor, yCoor*1.15);
            }
        }
    }

    // charts render
    $.ajax({
        type: 'GET',
        url: '/dashboard/graphs',
        headers: {'Content-Type': 'application/json'},
        success: function(info){
            // build chart 1 (radar chart -> employees)
            new Chart(ctx1, {
                type: 'radar',
                data: {
                    labels: info.infoGraphs.infoG1.map(function(area){return area.nombre}),
                    datasets: [{
                        data: info.infoGraphs.infoG1.map(function(area){return area.total}),
                    }],
                    fill: true
                },
                options: {
                    //maintainAspectRatio: false,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            caretSize: 0,
                            callbacks: {
                                label: function(context){
                                    let label = ` ${context.parsed.r}`;
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            },
                            pointLabels: {
                                display: false
                            },
                            grid: {
                                circular: true
                            }
                        }
                    }
                }
            })

            // build chart 2 (pie chart -> quotations)
            new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: info.infoGraphs.infoG2.map(function(cot){return cot.estatus}),
                    datasets: [{
                        data: info.infoGraphs.infoG2,
                        backgroundColor: [
                            'rgb(13, 202, 240)',
                            'rgb(220, 53, 69)',
                            'rgb(25, 135, 84)',
                            'rgb(255, 193, 7)'
                        ]
                    }]
                },
                options: {
                    //maintainAspectRatio: false,
                    maintainAspectRatio: false,
                    parsing: {
                        key: 'total'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            caretSize: 0,
                            callbacks: {
                                label: function(context){
                                    let label = ` ${context.parsed}`;
                                    return label;
                                }
                            }
                        },
                        emptyDoughnut: {
                            color: 'rgba(255, 128, 0, 0.5)',
                            width: 5,
                            radiusDecrease: 5
                        }
                    }
                },
                plugins: [emptyChart]
            })

            // build chart 3 (pie chart -> orders)
            new Chart(ctx3, {
                type: 'pie',
                data: {
                    labels: info.infoGraphs.infoG3.map(function(ord){return ord.estatus}),
                    datasets: [{
                        data: info.infoGraphs.infoG3,
                        backgroundColor: [
                            'rgb(220, 53, 69)',
                            'rgb(25, 135, 84)'
                        ]
                    }]
                },
                options: {
                    //maintainAspectRatio: false,
                    maintainAspectRatio: false,
                    parsing: {
                        key: 'total'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            caretSize: 0,
                            callbacks: {
                                label: function(context){
                                    let label = ` ${context.parsed}`;
                                    return label;
                                }
                            }
                        },
                        emptyDoughnut: {
                            color: 'rgba(255, 128, 0, 0.5)',
                            width: 5,
                            radiusDecrease: 5
                        }
                    }
                },
                plugins: [emptyChart]
            })

            // build chart 4 (line chart -> sales)
            new Chart(ctx4, {
                type: 'line',
                data: {
                    datasets: [{
                        data: info.infoGraphs.infoG4,
                        fill: true
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            caretSize: 0,
                            callbacks: {
                                label: function(context){
                                    console.log(context)
                                    let amount = Number.parseFloat(context.raw.total).toFixed(2);
                                    amount = Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
                                    let label = `$ ${amount}`;
                                    return label;
                                }
                            }
                        },
                    },
                    parsing: {
                        xAxisKey: 'name_month',
                        yAxisKey: 'total'
                    },
                    scales: {
                        x: {
                            border: {
                                color: 'black',
                            },
                            grid: {
                                display: false
                            },
                            ticks: {
                                display: false,
                                callback: function(label){
                                    if(this.getLabelForValue(label).length > 5){
                                        return this.getLabelForValue(label).substring(0,5) + '...';
                                    }else{
                                        return this.getLabelForValue(label)
                                    }
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            border: {
                                color: 'black',
                            },
                            grid: {
                                display: false
                            },
                            ticks: {
                                display: false
                            }
                        }
                    }
                }
            })

            // build chart 5 (line chart -> products)
            const chart5 = new Chart(ctx5, {
                type: 'bar',
                data: {
                    datasets: [{
                        data: info.infoGraphs.infoG5Filtrada,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(201, 203, 207, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    parsing: {
                        xAxisKey: 'categoria',
                        yAxisKey: 'compras'
                    },
                    scales: {
                        x: {
                            grid:{
                                color: 'rgba(0, 0, 0, 0.2)'
                            },
                            ticks: {
                                callback: function(label){
                                    if(this.getLabelForValue(label).length > 10){
                                        return this.getLabelForValue(label).substring(0,10) + '...';
                                    }else{
                                        return this.getLabelForValue(label)
                                    }
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.2)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            caretSize: 0,
                            callbacks: {
                                beforeLabel: function(context){
                                    let nombres = context.raw.nombres;
                                    if(nombres === context.raw.categoria){
                                        return '';
                                    }else{
                                        return nombres;
                                    }
                                },
                                label: function(context){
                                    let amount = Number.parseFloat(context.raw.compras).toFixed(2);
                                    amount = Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
                                    let label = `$ ${amount}`;
                                    return label;
                                }
                            }
                        }
                    }
                }
            })

            // build chart 6 (doughnut chart -> clients)
            const chart6 = new Chart(ctx6, {
                type: 'doughnut',
                data: {
                    labels: info.infoGraphs.infoG6Filtrada.map(function(cliente){return cliente.categoria}),
                    datasets: [{
                        data: info.infoGraphs.infoG6Filtrada,
                        cutout: '75%',
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    parsing: {
                        key: 'compras'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                filter: function(legendItem, data){
                                    let labels = data.labels;
                                    for (let i = 0; i < labels.length; i++) {
                                        if(labels[i].indexOf(legendItem.text) != -1){
                                            let label = legendItem.text;
                                            //if(label.length > 10){
                                            //    legendItem.text = label.substring(0, 10) + '...';
                                            //}else{
                                            //    legendItem.text = label;
                                            //}
                                            legendItem.text = label;
                                            break;
                                        }
                                    }
                                    return legendItem;
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                beforeLabel: function(context){
                                    let nombres = context.raw.nombres;
                                    if(nombres === context.raw.categoria){
                                        return '';
                                    }else{
                                        return nombres;
                                    }
                                },
                                label: function(context){
                                    let amount = Number.parseFloat(context.parsed).toFixed(2);
                                    amount = Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
                                    let label = `$ ${amount}`;
                                    return label;
                                }
                            }
                        },
                        emptyDoughnut: {
                            color: 'rgba(255, 128, 0, 0.5)',
                            width: 5,
                            radiusDecrease: 5
                        }
                    }
                },
                plugins: [doughnutLabel, emptyChart]
            })

            // filter chart 5 (line chart -> products)
            $('#filter-chart5').on('change', function(){
                const typeChart = 'bar';
                const date = $(this).val();
                $.ajax({
                    type: 'POST',
                    url: '/dashboard/graphsFilter',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify({typeChart: typeChart, dateFilter: date}),
                    success: function(info){
                        chart5.data.datasets[0].data = info.infoFiltrada;
                        chart5.update();
                    }
                })
            })

            // filter chart 6 (doughnut chart -> clients)
            $('#filter-chart6').on('change', function(){
                const typeChart = 'doughnut';
                const date = $(this).val();
                $.ajax({
                    type: 'POST',
                    url: '/dashboard/graphsFilter',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify({typeChart: typeChart, dateFilter: date}),
                    success: function(info){
                        chart6.data.datasets[0].data = info.infoFiltrada;
                        chart6.update();
                    }
                })
            })
        }
    })

    
})