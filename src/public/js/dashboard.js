function validateReportsForm (form){
    let validated = false;
    form.on('submit', function (event){
        // repart sections check validation
        const sections = $('input[name="sectionsReport"][type="checkbox"]:checked');
        const invalidFeedbackSections = $('#invalid-feedback-sectionsReport');
        if (sections.length === 0){
            invalidFeedbackSections.removeClass('is-valid');
            invalidFeedbackSections.addClass('is-invalid');
            invalidFeedbackSections.removeClass('text-success');
            invalidFeedbackSections.addClass('text-danger');
            invalidFeedbackSections.text('Por favor, elija una sección');
        }else{
            invalidFeedbackSections.removeClass('is-invalid');
            invalidFeedbackSections.addClass('is-valid');
            invalidFeedbackSections.removeClass('text-danger');
            invalidFeedbackSections.addClass('text-success');
            invalidFeedbackSections.text('¡Perfecto!');
        }

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        // avoid default form behavior
        if(!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    })
}

$(document).ready(function(){
    // list dashboard quotations table
    var quotationsTable = new DataTable('#dashboard-quotations-table', {
        paging: false,
        info: false,
        ordering: false,
        padding: false,
        filter: false,
        scrollCollapse: true,
        scrollY: 628, // 628
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
    const ctx7 = $('#chart7');

    // pluging for show data values in polar chart
    const segmentTextCloud = {
        id: 'segmentTextCloud',
        afterDatasetsDraw(chart){
            const {ctx, data, scales: {r}} = chart;
            const xCenter = chart.getDatasetMeta(0).data[0].x;
            const yCenter = chart.getDatasetMeta(0).data[0].y;
            const radius = r.drawingArea + 22;
            let amount = 0;

            if (radius > 120) {
                chart.legend.legendItems.forEach((legend, index) => {
                    if (legend.hidden === false) {
                        const startAngle = chart.getDatasetMeta(0).data[index].startAngle;
                        const endAngle = chart.getDatasetMeta(0).data[index].endAngle;
                        const centerAngle = (startAngle + endAngle) / 2;
                        const xCoordinate = xCenter + (radius * Math.cos(centerAngle));
                        const yCoordinate = yCenter + (radius * Math.sin(centerAngle));
    
                        ctx.save();
                        ctx.translate(xCoordinate, yCoordinate);
    
                        ctx.font = 'bold 10px sans-serif';
                        const textWidth = ctx.measureText(data.datasets[0].data[index]).width + 32;
    
                        ctx.beginPath();
                        ctx.fillStyle = data.datasets[0].backgroundColor[index].replace('0.5', '0.8')
                        ctx.roundRect(0 - (textWidth / 2), 0 - 10, textWidth, 20, 10);
                        ctx.fill();
    
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        if (data.datasets[0].label == 'Piezas') {
                            ctx.fillText(`${data.datasets[0].data[index]} pza`, 0, 4);
                        } else if (data.datasets[0].label == 'Millares'){
                            ctx.fillText(`${data.datasets[0].data[index]} mil`, 0, 4);
                        } else if (data.datasets[0].label == '$') {
                            amount = Number.parseFloat(data.datasets[0].data[index]).toFixed(2);
                            amount = Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
                            ctx.fillText(`${data.datasets[0].label} ${amount}`, 0, 4);
                        } else {
                            ctx.fillText(`${data.datasets[0].data[index]} ${data.datasets[0].label}`, 0, 4);
                        }

                        ctx.restore();
                    }
                })
            }
        }
    }

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
    if(ctx1.length !== 0){
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

                // chart 5 (doughnut chart -> sales per employee)
                const chart5 = new Chart(ctx5, {
                    type: 'polarArea',
                    data: {
                        labels: info.infoGraphs.infoG5.map(function(vendedor){return vendedor.apellido}),
                        datasets: [{
                            label: '$',
                            data: info.infoGraphs.infoG5.map(function(vendedor){return vendedor.pesos_vendidos}),
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 28,
                                bottom: 28,
                                left: 5
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: "right",
                                labels: {
                                    filter: function(legendItem, data){
                                        let labels = data.labels;
                                        for (let i = 0; i < labels.length; i++) {
                                            if(labels[i].indexOf(legendItem.text) != -1){
                                                let label = legendItem.text;
                                                if(label.length > 7){
                                                    return legendItem.text = label.substring(0, 7) + '...';
                                                }else{
                                                    return legendItem.text = label;
                                                }
                                            }
                                        }
                                        return legendItem;
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context){
                                        let label = '';
                                        let amount = Number.parseFloat(context.raw).toFixed(2);
                                        amount = Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
                                        if (context.dataset.label == '$') {
                                            label = ` ${context.dataset.label} ${amount}`;
                                        } else {
                                            label = ` ${context.formattedValue} ${context.dataset.label}`;
                                        } 
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                pointLabels: {
                                    display: false,
                                    centerPointLabels: false,
                                    callback: function(label){
                                        return label;
                                    }
                                }
                            }
                        }
                    },
                    plugins: [segmentTextCloud] 
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
                                                if(label.length > 7){
                                                    return legendItem.text = label.substring(0, 7) + '...';
                                                }else{
                                                    return legendItem.text = label;
                                                }
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

                // build chart 7 (bar chart -> products)
                const chart7 = new Chart(ctx7, {
                    type: 'bar',
                    data: {
                        datasets: [{
                            data: info.infoGraphs.infoG7Filtrada,
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

                // filter chart 5 (polar area chart -> sales per employee)
                $('#filter-chart5').on('change', function(){
                    const date = $(this).val();
                    const unit = $(this).parents().eq(3).find($('input[type="radio"]:checked')).val();
                    $.ajax({
                        type: 'POST',
                        url: '/dashboard/salesEmployeesFilter',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify({dateFilter: date, unitFilter: unit}),
                        success: function(info){
                            chart5.data.labels = info.infoFiltrada.map(function(vendedor){return vendedor.apellido});
                            chart5.data.datasets[0].data = info.infoFiltrada.map(function(vendedor){return vendedor.vendido});
                            if (unit === 'Pieza'){
                                chart5.data.datasets[0].label = 'Piezas';
                            } else if (unit === 'Millar'){
                                chart5.data.datasets[0].label = 'Millares';
                            } else if (unit === 'Pesos'){
                                chart5.data.datasets[0].label = '$';
                            } else{
                                chart5.data.datasets[0].label = 'm²';
                            }
                            chart5.update();
                        }
                    })
                })

                $('input[name="filter-unit-chart5"]').on('change', function(){
                    const date = $('#filter-chart5').val();
                    const unit = $(this).val();
                    $.ajax({
                        type: 'POST',
                        url: '/dashboard/salesEmployeesFilter',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify({dateFilter: date, unitFilter: unit}),
                        success: function(info){
                            chart5.data.labels = info.infoFiltrada.map(function(vendedor){return vendedor.apellido});
                            chart5.data.datasets[0].data = info.infoFiltrada.map(function(vendedor){return vendedor.vendido});
                            if (unit === 'Pieza'){
                                chart5.data.datasets[0].label = 'Piezas';
                            } else if (unit === 'Millar'){
                                chart5.data.datasets[0].label = 'Millares';
                            } else if (unit === 'Pesos'){
                                chart5.data.datasets[0].label = '$';
                            } else{
                                chart5.data.datasets[0].label = 'm²';
                            }
                            chart5.update();
                        }
                    })
                });

                // filter chart 6 (doughnut chart -> clients)
                $('#filter-chart6').on('change', function(){
                    const date = $(this).val();
                    $.ajax({
                        type: 'POST',
                        url: '/dashboard/clientsFilter',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify({dateFilter: date}),
                        success: function(info){
                            chart6.data.labels = info.infoFiltrada.map(function(cliente){return cliente.categoria});
                            chart6.data.datasets[0].data = info.infoFiltrada.map(function(cliente){return cliente.compras});
                            chart6.update();
                        }
                    })
                })

                // filter chart 7 (line chart -> products)
                $('#filter-chart7').on('change', function(){
                    const date = $(this).val();
                    const unit = $(this).parents().eq(3).find($('input[type="radio"]:checked')).val();
                    $.ajax({
                        type: 'POST',
                        url: '/dashboard/productsFilter',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify({dateFilter: date, unitFilter: unit}),
                        success: function(info){
                            chart7.data.datasets[0].data = info.infoFiltrada;
                            chart7.update();
                        }
                    })
                })

                $('input[name="filter-unit-chart7"]').on('change', function(){
                    const date = $('#filter-chart7').val();
                    const unit = $(this).val();
                    $.ajax({
                        type: 'POST',
                        url: '/dashboard/productsFilter',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify({dateFilter: date, unitFilter: unit}),
                        success: function(info){
                            chart7.data.datasets[0].data = info.infoFiltrada;
                            chart7.update();
                        }
                    })
                });
            }
        })
    }

    // check/uncheck all sections
    $('#selectAllSectionsReport').on('change', function(){
        if ($(this).is(':checked')){
            $('input[name="sectionsReport"][type="checkbox"]').prop('checked', true);
        }else{
            $('input[name="sectionsReport"][type="checkbox"]').prop('checked', false);
        }
    })

    // validated reports form
    validateReportsForm($('#ReportsForm'));
})