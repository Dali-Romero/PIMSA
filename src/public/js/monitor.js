$(document).ready(function(){
    // ------------------------------- list file -------------------------------
    // list quotations tasks table
    $.fn.dataTable.moment('DD/MM/YYYY, HH:mm');
    new DataTable('#orders-monitor-table', {
        responsive: true,
        fixedColumns: true,
        paging: false,
        info: false,
        padding: false,
        columnDefs: [
            {
                "orderable": false,
                "targets": 3
            },
            {
                "width": "40%",
                "targets": 3
            }
        ],
        dom: "<'row pb-2'<'col-12 col-md-6 order-last order-md-first'<'float-start'f>><'col-12 col-md-6 order-first order-md-last'>>" +
                "<'row'<'col-sm-12'tr>>",
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // desplegar tareas del producto seleccionado
    $('.btnShowTasks').on('click', function(){
        const taskId = $(this).val();
        $.ajax({
            type: 'POST',
            url: '/monitor/infoTask',
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify({taskId: taskId}),
            success: function (data){
                const source = $('#info-task-added').html();
                const template = Handlebars.compile(source);
                const context = {
                    producto: data.producto,
                    tareas: data.tareas
                };
                const html= template(context);
                $('#info-task-container').html(html);
                $("#info-task-modal").unbind().modal('show');
            }
        })
    })
})