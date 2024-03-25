function validateProcessForm(form){
    let validated = false;
    form.on('submit', function (event) {
        // process name field validation
        const patternNameProcess = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameProcess = $('#processname');
        const invalidFeedbackNameProcess = $('#invalid-feedback-processname');
        nameProcess.removeClass('border-dark');
        if (nameProcess.val().length === 0) {
            nameProcess.removeClass('is-valid');
            nameProcess.addClass('is-invalid');
            invalidFeedbackNameProcess.text('Por favor, agregue un nombre');
        }else if (patternNameProcess.test(nameProcess.val())){
            nameProcess.removeClass('is-valid');
            nameProcess.addClass('is-invalid');
            invalidFeedbackNameProcess.text('El nombre del proceso debe contener únicamente letras');
        }else if (nameProcess.val().length < 1 || nameProcess.val().length > 30){
            nameProcess.removeClass('is-valid');
            nameProcess.addClass('is-invalid');
            invalidFeedbackNameProcess.text('El nombre del proceso debe contener entre 1 y 30 caracteres');
        }else{
            nameProcess.removeClass('is-invalid');
            nameProcess.addClass('is-valid');
        };

        // process description field validation
        const patternDescProcess = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const descProcess = $('#processdescription');
        const invalidFeedbackDescProcess = $('#invalid-feedback-processdescription');
        descProcess.removeClass('border-dark');
        if (descProcess.val().length === 0) {
            descProcess.removeClass('is-valid');
            descProcess.addClass('is-invalid');
            invalidFeedbackDescProcess.text('Por favor, agregue una descripción');
        }else if (patternDescProcess.test(descProcess.val())){
            descProcess.removeClass('is-valid');
            descProcess.addClass('is-invalid');
            invalidFeedbackDescProcess.text('La descripción del proceso debe contener únicamente letras');
        }else if (descProcess.val().length < 1 || descProcess.val().length > 40){
            descProcess.removeClass('is-valid');
            descProcess.addClass('is-invalid');
            invalidFeedbackDescProcess.text('La descripción del proceso debe contener entre 1 y 40 caracteres');
        }else{
            descProcess.removeClass('is-invalid');
            descProcess.addClass('is-valid');
        };

        // validate that the order is sequential
        let orderSelectsValues = [];
        const orderSelects = $('.orderProcess');
        orderSelects.each(function(){
            orderSelectsValues.push($(this).val())
        })
        
        let sequencial = [];
        let selectsSorted = orderSelectsValues.sort();
        let selectsLength = selectsSorted.length;
        let selectsMin = selectsSorted[0];
        if(selectsLength > 1){
            if(selectsMin == 1){
                sequencial.push(true);
                for (let i = 0; i < selectsLength-1; i++) {
                    if(selectsSorted[i+1] - selectsSorted[i] == 0){
                        sequencial.push(true);
                    }else if(selectsSorted[i+1] - selectsSorted[i] == 1 || selectsSorted[i+1] - selectsSorted[i] == -1){
                        sequencial.push(true);
                    }else{
                        sequencial.push(false);
                    }
                }
            }else{
                sequencial.push(false);
            }
        }else{
            if(selectsMin == 1){
                sequencial.push(true);
            }else{
                sequencial.push(false);
            }
        }

        // show which element of the sequence is wrong
        const invalidFeedbackOrderProcess = $('.invalid-feedback-process-order');
        if(sequencial.length > 0){
            orderSelects.each(function(i){
                $(this).removeClass('border-dark');
                if(sequencial[i] == true){
                    $(this).removeClass('is-invalid');
                    $(this).addClass('is-valid');
                }else{
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    invalidFeedbackOrderProcess.eq(i).text('El orden de las áreas no es válido');
                }
            })
        }

        // area process validation
        let areaSelectsValues = [];
        const areaSelects = $('.areaProcess');
        areaSelects.each(function(){
            areaSelectsValues.push($(this).val())
        })

        let duplicates = [];
        let indexDuplicates = [];
        areaSelectsValues.filter(function(val, i){
            if(areaSelectsValues.indexOf(val) !== i){
                duplicates.push(true);
                indexDuplicates.push(i);
            }else{
                duplicates.push(false);
                indexDuplicates.push(i);
            }
        })

        const invalidFeedbackAreaProcess = $('.invalid-feedback-process-area');
        if(duplicates.length > 0){
            areaSelects.each(function(i){
                $(this).removeClass('border-dark');
                if(duplicates[i] == false){
                    $(this).removeClass('is-invalid');
                    $(this).addClass('is-valid');
                }else{
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    invalidFeedbackAreaProcess.eq(i).text('Por favor, evite duplicar áreas');
                }
            })
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
    // ------------------------------- List file -------------------------------
    const processTable = new DataTable('#processes-table', {
        responsive: true,
        fixedColumns: true,
        paging: false,
        info: false,
        padding: false,
        columnDefs: [
            {
                "orderable": false,
                "targets": 4
            },
            {
                "width": "40%",
                "targets": 2
            }
        ],
        dom: '<"row pb-2"<"col-12 col-md-6 order-last order-md-first"<"float-start"f>><"col-12 col-md-6 order-first order-md-last"<"button-add-process"B>>><"row"<"col-sm-12"tr>>',
        fnInitComplete: function(){
            // añadir boton para agregar procesos
            const addProcessbtn = $('#processes-add-button').clone().removeClass('d-none');
            $('div.button-add-process').html(addProcessbtn);
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    $('.btnExpandStages').on('click', function(){
        const processId = $(this).val();
        $.ajax({
            type: 'POST',
            url: '/processes/listStages',
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify({processId: processId}),
            success: function (data){
                const source = $('#info-stages-added').html();
                const template = Handlebars.compile(source);
                const context = {
                    proceso: data.proceso,
                    etapasPosibles: data.etapasPosibles
                };
                const html= template(context);
                $('#info-stages-container').html(html);
                $("#info-stages-modal").unbind().modal('show');
            },
            error: function(){
                window.location.reload();
            }
        })
    })

    $('#processes-table tbody').on('click', '#btnExpandProducts', function () {
        const tr = $(this).closest('tr');
        const row = processTable.row(tr);
        const processId = $(this).val();
        if (row.child.isShown()) {
            $('div.processes-products-slider', row.child()).slideUp(function () {
                row.child.hide();
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
                },
                error: function(){
                    window.location.reload();
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

    // validate add role form
    validateProcessForm($('#addProcessForm'));

    // ------------------------------- Edit file -------------------------------
    $('.remove-process-select').on('click', function(e){
        e.stopPropagation();
        e.stopImmediatePropagation();
        $(this).parents().eq(1).removeClass('py-3');
        $(this).parents().eq(1).hide('slow', ()=>{
            $(this).parents().eq(1).remove();
        })
    })

    // validate add role form
    validateProcessForm($('#editProcessForm'));
})