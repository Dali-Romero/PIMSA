$(document).ready(function(){
    const processTable = new DataTable('#processes-table', {
        paging: false,
        info: false,
        padding: false,
        columnDefs: [
            {
                "orderable": false,
                "targets": 4
            }
        ],
        dom: '<"float-start pb-2"f><"button-add-process pb-2"B>', 
        fnInitComplete: function(){
            $('div.button-add-process').html('<a href="/processes/add" class="btn btn-outline-success border-success border-2 float-end" role="button"><i class="bi bi-bezier"></i> Añadir proceso</a>');
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    $('#processes-table tbody').on('click', '#btnExpandStages', function () {
        const tr = $(this).closest('tr');
        const row = processTable.row(tr);
        const proccessId = $(this).val();
        if (tr.hasClass('ProductsIsShowing')) {
            row.child.hide();
            tr.removeClass('ProductsIsShowing');
            tr.find('button#btnExpandProducts').removeClass('active');
        }
        if (row.child.isShown()) {
            $('div.processes-stages-slider', row.child()).slideUp(function () {
                row.child.hide();
                tr.removeClass('StagesIsShowing');
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/processes/listStages',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({proccessId: proccessId}),
                success: function(data){
                    const sourceProcess = $('#processes-stages-expand').html();
                    const templateProcess = Handlebars.compile(sourceProcess);
                    const contextProcess = {
                        proceso: data.proceso,
                        etapas: data.etapas
                    };
                    const htmlProcess = templateProcess(contextProcess);
                    row.child(htmlProcess, 'p-0' ).show();
                    $('div.processes-stages-slider', row.child()).slideDown();
                    tr.addClass('StagesIsShowing');
                }
            });
        }
    });

    $('#processes-table tbody').on('click', '#btnExpandProducts', function () {
        const tr = $(this).closest('tr');
        const row = processTable.row(tr);
        const processId = $(this).val();
        if (tr.hasClass('StagesIsShowing')) {
            row.child.hide();
            tr.removeClass('StagesIsShowing');
            tr.find('button#btnExpandStages').removeClass('active');
        }
        if (row.child.isShown()) {
            $('div.processes-products-slider', row.child()).slideUp(function () {
                row.child.hide();
                tr.removeClass('ProductsIsShowing');
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/processes/listProducts',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({processId: processId}),
                success: function(data){
                    const sourceProducts = $('#processes-products-expand').html();
                    const templateProducts = Handlebars.compile(sourceProducts);
                    const contextProducts = {
                        productos: data.productos,
                        proceso: data.proceso
                    };
                    const htmlProducts = templateProducts(contextProducts);
                    row.child(htmlProducts, 'p-0' ).show();
                    $('div.processes-products-slider', row.child()).slideDown();
                    tr.addClass('ProductsIsShowing');
                }
            });
        }
    });

    // ------------------------------- Add file -------------------------------
    // add process area
    $('#addStage').on('click', function(){
        const inputGroup = $(this).parents().eq(2).children().eq(2).children().eq(0); //$(this).parents().eq(3).children().eq(1).children().eq(1).children().eq(0);
        const cardsContainer = $(this).parents().eq(3).find('#stagesContainer');
        const inputGroupClone = inputGroup.clone();
        inputGroupClone.find('div.d-none').removeClass('d-none');
        inputGroupClone.find('select').removeClass('is-invalid');
        inputGroupClone.find('select').removeClass('is-valid');
        inputGroupClone.find('select').addClass('border-dark');
        inputGroupClone.appendTo(cardsContainer);
    
        $('.remove-process-select').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).parents().eq(1).removeClass('py-3');
            $(this).parents().eq(1).hide('slow', ()=>{
                $(this).parents().eq(1).remove();
            })
        })
    })
})