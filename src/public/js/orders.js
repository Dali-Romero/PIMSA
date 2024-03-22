// function to validate the revalue
function validateOrderRevalueForm(form, url){
    let validated = false;
    form.on('submit', function (event){
        // avoid default form behavior
        event.preventDefault();
        event.stopPropagation();

        // discount field validation
        const patternNumDiscount = /^\d+(\.\d{1,2})?$/;
        const nameClientSelect = $('#revalueclientid');
        const numDiscount = $('#revaluenumdiscount');
        const maxDiscount = numDiscount.attr('data-maxDiscount');
        const invalidFeedbackNumDiscount = $('#invalid-feedback-revaluenumdiscount');
        numDiscount.removeClass('border-dark');
        if (numDiscount.val().length === 0) {
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text('Por favor, agregue un porcentaje de descuento');
        }else if (!patternNumDiscount.test(numDiscount.val())){
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text('El formato ingresado no es válido');
        }else if (numDiscount.val() < 0 || numDiscount.val() > 100){
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text('El porcentaje debe ser entre 0% y 100%');
        }else if (nameClientSelect.val().length !== 0 && numDiscount.val() > maxDiscount){
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text(`Este cliente no puede tener un descuento mayor a % ${maxDiscount}`);
        }else{
            numDiscount.removeClass('is-invalid');
            numDiscount.addClass('is-valid');
        }

        // observations field validation
        const patternObservations = /^(\r|\t|\s|[^a-zA-Z0-9ñÑ])/;
        const observations = $('#revalueobservations');
        const invalidFeedbackObservations = $('#invalid-feedback-revalueobservations');
        observations.removeClass('border-dark');
        if (observations.val().length === 0) {
            observations.removeClass('is-valid');
            observations.addClass('is-invalid');
            invalidFeedbackObservations.text('Por favor, agregue alguna observación');
        }else if(observations.val().length < 1 || observations.val().length > 100) {
            observations.removeClass('is-valid');
            observations.addClass('is-invalid');
            invalidFeedbackObservations.text('Las observaciones deben contener entre 1 y 100 caracteres');
        }else if (patternObservations.test(observations.val())){
            observations.removeClass('is-valid');
            observations.addClass('is-invalid');
            invalidFeedbackObservations.text('Las observaciones no deben iniciar con un carácter especial');
        }else{
            observations.removeClass('is-invalid');
            observations.addClass('is-valid');
        }

        // price product validation
        const patternPriceOutProducts = /^\d+(\.\d{1,2})?$/;
        const priceOutProducts = $('.revaluepriceoutproduct');
        priceOutProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            if ($(this).val().length === 0) {
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Por favor, agregue un precio');
            }else if(!patternPriceOutProducts.test($(this).val())){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('El precio solo debe contener números');
            }else if (!($(this).val() > 0 && $(this).val() <= 10000)){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('El precio debe ser mayor a 0 y menor a 10,000');
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            };
        })

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        // If it is not validated, it is not sent
        if (validated){
            // enabling  discount input field to send
            $('#revaluenumdiscount').prop('disabled', false);

            const inputsValues = {};
            const inputs = form.find('input:not(:button)');
            inputs.each(function(){
                if ($(this).is(':radio')){
                    if($(this).is(':checked')){
                        inputsValues[$(this).attr('name')] = $(this).val();
                    }
                }else{
                    inputsValues[$(this).attr('name')] = $(this).val();
                } 
            })

            $.ajax({
                type: 'POST',
                url: '/orders/preview',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({inputs: inputsValues}),
                success: function(data){
                    const sourcePreview = $('#revalue-preview').html();
                    const templatePreview = Handlebars.compile(sourcePreview);
                    const contextPreview = {
                        cotizacion: data.cotizacion,
                        cliente: data.cliente,
                        productos: data.productos
                    };
                    const htmlPreview = templatePreview(contextPreview);
                    $('#revalue-preview-container').html(htmlPreview);
                    $("#revalue-preview-modal").unbind().modal('show');

                    // disable discount field
                    if ($('#revaluediscountop2').is(':checked')){
                        $('#revaluenumdiscount').prop('disabled', true);
                    }

                    $('#send-revalue').unbind().on('click', function(e){
                        e.preventDefault();

                        // get all form data inputs
                        const formData = {
                            cotizacion: contextPreview.cotizacion,
                            productos: contextPreview.productos
                        };
                        
                        // send all form data inputs
                        $.ajax({
                            type: 'POST',
                            url: url,
                            headers: {'Content-Type': 'application/json'},
                            data: JSON.stringify({data: formData}),
                            success: function (data) {
                                window.location.replace(data.url);
                            },
                            error: function(){
                                window.location.reload();
                            }
                        })
                    })
                },
                error: function(){
                    window.location.reload();
                }
            })
        }
    });
}

function validateSendProductionForm (form){
    let validated = false;
    form.on('submit', function (event) {
        // Adjust deadline's date
        const dateToday = new Date().setHours(0, 0, 0, 0);

        //adjust entered date
        let deadlineDate =new Date($('#deadline').val());
        deadlineDate = new Date(deadlineDate.getTime() - deadlineDate.getTimezoneOffset() * -60000).setHours(0,0,0,0);

        // dateline field validation
        const deadline = $('#deadline');
        const invalidFeedbackDeadLine = $('#invalid-feedback-deadline');
        deadline.removeClass('border-dark');
        if (deadline.val().length === 0) {
            deadline.removeClass('is-valid');
            deadline.addClass('is-invalid');
            invalidFeedbackDeadLine.text('Por favor, agregue una fecha');
        } else if (deadlineDate < dateToday) {
            deadline.removeClass('is-valid');
            deadline.addClass('is-invalid');
            invalidFeedbackDeadLine.text('La fecha de entrega debe ser mayor o igual al día de hoy');
        } else {
            deadline.removeClass('is-invalid');
            deadline.addClass('is-valid');
        };

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        // avoid default form behavior if is not valid
        if(!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    })
}

$(document).ready(function(){
    // ------------------------------- list file -------------------------------
    // list quotations table
    $.fn.dataTable.moment('DD/MM/YYYY, HH:mm');
    new DataTable('#orders-table', {
        paging: false,
        info: false,
        padding: false,
        order: [[1, 'Desc'], [0, 'Desc']],
        dom: '<"float-start pb-2"f>',
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // ------------------------------- info file -------------------------------
    // enable discount field
    $('#revaluediscountop1').on('click', ()=>{
        $('#revaluenumdiscount').prop('disabled', false);
        $('#revaluenumdiscount').val('');
    });

    // disable discount field
    $('#revaluediscountop2').on('click', ()=>{
        $('#revaluenumdiscount').prop('disabled', true);
        $('#revaluenumdiscount').val('0.00');
    });

    // show cancel quotation warning
    $('#cancel-order').on('click', function(){
        const toast = new bootstrap.Toast($('#cancel-order-toast'), {});
        toast.show();
    })

    // quoter validation
    validateOrderRevalueForm($('#form-revalue-quotation'), $('#form-revalue-quotation').attr('action'));

    // deadline validation
    validateSendProductionForm($('#add-deadline-order-form'));
});