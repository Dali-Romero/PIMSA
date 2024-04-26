// Global variables
let productsCounter = 0; // products counter
let productsGenerated = 0; // products generated counter 1
let maxClientDiscount = 0; // max discount per client

// function to validate the quoter
function validateQuotationsForm(form, url){
    let validated = false;
    form.on('submit', (event)=>{
        // avoid default form behavior
        event.preventDefault();
        event.stopPropagation();

        // client name select validation
        const nameClientSelect = $('#clientid');
        nameClientSelect.removeClass('border-dark');
        if (nameClientSelect.val().length === 0){
            nameClientSelect.removeClass('is-valid');
            nameClientSelect.addClass('is-invalid');
        }else{
            nameClientSelect.removeClass('is-invalid');
            nameClientSelect.addClass('is-valid');
        }

        // applicant name field validation
        const patternNameApplicant = /[^a-zA-ZÀ-ÿ\sñÑ]/;
        const nameApplicant = $('#nameapplicant');
        const invalidFeedbackNameApplicant = $('#invalid-feedback-nameapplicant');
        nameApplicant.removeClass('border-dark');
        if (nameApplicant.val().length === 0) {
            nameApplicant.removeClass('is-valid');
            nameApplicant.addClass('is-invalid');
            invalidFeedbackNameApplicant.text('Por favor, agregue un nombre');
        }else if (patternNameApplicant.test(nameApplicant.val())){
            nameApplicant.removeClass('is-valid');
            nameApplicant.addClass('is-invalid');
            invalidFeedbackNameApplicant.text('El nombre del solicitante debe contener únicamente letras');
        }else if (nameApplicant.val().length < 1 || nameApplicant.val().length > 30){
            nameApplicant.removeClass('is-valid');
            nameApplicant.addClass('is-invalid');
            invalidFeedbackNameApplicant.text('El nombre del solicitante debe contener entre 1 y 30 caracteres');
        }else{
            nameApplicant.removeClass('is-invalid');
            nameApplicant.addClass('is-valid');
        };

        // proyect name field validation
        const patternNameProyect = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameProyect = $('#nameproyect');
        const invalidFeedbackNameProyect = $('#invalid-feedback-nameproyect');
        nameProyect.removeClass('border-dark');
        if (nameProyect.val().length === 0) {
            nameProyect.removeClass('is-valid');
            nameProyect.addClass('is-invalid');
            invalidFeedbackNameProyect.text('Por favor, agregue un nombre');
        }else if (patternNameProyect.test(nameProyect.val())){
            nameProyect.removeClass('is-valid');
            nameProyect.addClass('is-invalid');
            invalidFeedbackNameProyect.text('El nombre del proyecto debe contener únicamente letras y números');
        }else if (nameProyect.val().length < 1 || nameProyect.val().length > 30){
            nameProyect.removeClass('is-valid');
            nameProyect.addClass('is-invalid');
            invalidFeedbackNameProyect.text('El nombre del proyecto debe contener entre 1 y 30 caracteres');
        }else{
            nameProyect.removeClass('is-invalid');
            nameProyect.addClass('is-valid');
        };

        // discount field validation
        const patternNumDiscount = /^\d+(\.\d{1,2})?$/;
        const numDiscount = $('#numdiscount');
        const invalidFeedbackNumDiscount = $('#invalid-feedback-numdiscount');
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
        }else if (nameClientSelect.val().length !== 0 && numDiscount.val() > maxClientDiscount){
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text(`Este cliente no puede tener un descuento mayor a ${maxClientDiscount} %`);
        }else{
            numDiscount.removeClass('is-invalid');
            numDiscount.addClass('is-valid');
        }

        // observations field validation
        const patternObservations = /^(\r|\t|\s|[^a-zA-ZÀ-ÿ0-9ñÑ()¿?¡!])/;
        const observations = $('#observations');
        const invalidFeedbackObservations = $('#invalid-feedback-observations');
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

        // product name select validation
        const nameProductSelect = $('#nameproduct');
        nameProductSelect.removeClass('border-dark');
        if (productsCounter === 0){
            nameProductSelect.removeClass('is-valid');
            nameProductSelect.addClass('is-invalid');
        }else{
            nameProductSelect.removeClass('is-invalid');
            nameProductSelect.addClass('is-valid');
        }

        // quantity product validation
        const patternAmountProducts= /[^0-9]/;
        const amountProducts = $('.quantityproduct');
        amountProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            if ($(this).val().length === 0) {
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Por favor, agregue una cantidad');
            }else if(patternAmountProducts.test($(this).val())){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('La cantidad solo debe contener números enteros');
            }else if ($(this).val() < 1 || $(this).val() > 999){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('La cantidad debe ser mayor a 0 y menor a 1000');
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            };
        })

        // coating product field validation
        const patterncoatingProducts =  /[^a-zA-ZÀ-ÿ0-9\s._ñÑ]/;
        const coatingProducts = $('.coatingproduct');
        coatingProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            if ($(this).val().length === 0) {
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Por favor, agregue un acabado');
            }else if ($(this).val().length < 1 || $(this).val().length > 20){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Los acabados deben contener entre 1 y 20 caracteres');
            }else if (patterncoatingProducts.test($(this).val())){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Los acabados no deben contener caracteres especiales');
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            };
        })

        // file product field validation
        const patternFileProducts =  /[^a-zA-ZÀ-ÿ0-9\s._ñÑ]/;
        const fileProducts = $('.fileproduct');
        fileProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            if ($(this).val().length === 0) {
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Por favor, agregue un archivo');
            }else if ($(this).val().length < 1 || $(this).val().length > 20){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('El nombre del archivo deben contener entre 1 y 20 caracteres');
            }else if (patternFileProducts.test($(this).val())){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('El nombre del archivo no deben contener caracteres especiales');
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            };
        })

        // lenght product field validation
        const patternLenghtProducts = /^\d+(\.\d{1,3})?$/;
        const lenghtProducts = $('.lengthproduct');
        lenghtProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            const unitProduct = $(this).parents().eq(6).children().eq(1).children().eq(0).children().eq(0).children().eq(0).children().find('input:checked').val();
            if (unitProduct === 'Mt'){
                if ($(this).val().length === 0) {
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('Por favor, agregue una medida para el largo');
                }else if (!patternLenghtProducts.test($(this).val())){
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('La medida del largo solo debe contener números');
                }else if (!($(this).val() > 0 && $(this).val() <= 100)){
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('La medida del largo debe ser mayor a 0Mt y menor a 100Mt');
                }else{
                    $(this).removeClass('is-invalid');
                    $(this).addClass('is-valid');
                };
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            }
        })

        // width product field validation
        const patternWidthProducts = /^\d+(\.\d{1,3})?$/;
        const widthproductProducts = $('.widthproduct');
        widthproductProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            const unitProduct = $(this).parents().eq(6).children().eq(1).children().eq(0).children().eq(0).children().eq(0).children().find('input:checked').val()
            if (unitProduct === 'Mt'){
                if ($(this).val().length === 0) {
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('Por favor, agregue una medida para el ancho');
                }else if (!patternWidthProducts.test($(this).val())){
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('La medida del ancho solo debe contener números');
                }else if (!($(this).val() > 0 && $(this).val() <= 100)){
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('La medida del ancho debe ser mayor a 0Mt y menor a 100Mt');
                }else{
                    $(this).removeClass('is-invalid');
                    $(this).addClass('is-valid');
                };
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            }
        })

        // product out catalog name field validation
        const patternOutProduct = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameOutProducts= $('.nameoutproduct');
        nameOutProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            if ($(this).val().length === 0) {
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(3).text('Por favor, agregue un nombre');
            }else if (patternOutProduct.test($(this).val())){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(3).text('El nombre del producto solo debe contener solo números y letras');
            }else if ($(this).val().length < 1 || $(this).val().length > 30){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(3).text('El nombre del producto deben contener entre 1 y 30 caracteres');
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            };
        })

        // price product validation
        const patternPriceOutProducts = /^\d+(\.\d{1,2})?$/;
        const priceOutProducts = $('.priceoutproduct');
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
            }else if (!($(this).val() >= 0 && $(this).val() <= 10000)){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('El precio debe ser mayor o igual a 0 y menor a 10,000');
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
            $('#numdiscount').prop('disabled', false);

            // enabling unit selects to send
            const unitProducts = $('.unitproduct');
            unitProducts.each(function(i, obj){
                const nameRadio = $(this).attr('name');
                ($(`input[name="${nameRadio}"]`)).prop('disabled', false);
            })
            
            // enabling coating product field to send
            coatingProducts.each(function(i, obj){
                $(this).prop('disabled', false);
            })
            
            // enabling coating product field to send
            fileProducts.each(function(i, obj){
                $(this).prop('disabled', false);
            })

            const inputsValues = {};
            const inputs = form.find(':input');
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
                url: '/quotations/preview',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({inputs: inputsValues}),
                success: function(data){
                    const sourcePreview = $('#preview').html();
                    const templatePreview = Handlebars.compile(sourcePreview);
                    const contextPreview = {
                        cotizacion: data.cotizacion,
                        cliente: data.cliente,
                        productos: data.productos
                    };
                    const htmlPreview = templatePreview(contextPreview);
                    $('#preview-container').html(htmlPreview);
                    $("#preview-modal").unbind().modal('show');

                    // disable discount field
                    if ($('#discountop2').is(':checked')){
                        $('#numdiscount').prop('disabled', true);
                    }

                    // disabling unit selects to send
                    const unitProducts = $('.unitproduct');
                    unitProducts.each(function(i, obj){
                        const nameRadio = $(this).attr('name');
                        ($(`input[name="${nameRadio}"]`)).prop('disabled', true);
                    })

                    // enabling coating product field to send
                    coatingProducts.each(function(i, obj){
                        if($(this).val() === 'Sin acabados'){
                            $(this).prop('disabled', true);
                        }
                    })
            
                    // enabling coating product field to send
                    fileProducts.each(function(i, obj){
                        if($(this).val() === 'Sin archivo'){
                            $(this).prop('disabled', true);
                        }
                    })

                    // get and send all form data inputs
                    const formData = {
                        cotizacion: contextPreview.cotizacion,
                        productos: contextPreview.productos
                    }
                    $('#send-quotation').unbind().on('click', function(e){
                        e.preventDefault();
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
                }
            })
        }
    });
}

// function to validate the client's email
function validateQuotationEmailForm(form) {
    let validated = false;
    form.on('submit', (event)=>{
        // email validation
        const patternEmailClient= /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        const inputEmailClient = $('#inputEmailClient');
        const invalidFeedbackEmailClient = $('.invalid-feedback-emailClient');
        inputEmailClient.removeClass('border-dark');
        if (inputEmailClient.val().length === 0) {
            inputEmailClient.removeClass('is-valid');
            inputEmailClient.addClass('is-invalid');
            invalidFeedbackEmailClient.text('Por favor, agregue un correo electrónico');
        }else if (!(patternEmailClient.test(inputEmailClient.val()))){
            inputEmailClient.removeClass('is-valid');
            inputEmailClient.addClass('is-invalid');
            invalidFeedbackEmailClient.text('El formato del correo electrónico no es válido');
        }else if (inputEmailClient.val().length < 1 || inputEmailClient.val().length > 40){
            inputEmailClient.removeClass('is-valid');
            inputEmailClient.addClass('is-invalid');
            invalidFeedbackEmailClient.text('El correo electrónico debe contener entre 1 y 40 caracteres');
        }else{
            inputEmailClient.removeClass('is-invalid');
            inputEmailClient.addClass('is-valid');
        };

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length === 0){
            validated = true;
        }else{
            validated = false;
        }

        // If it is not validated, it is not sent
        if(!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    })
}

// function to validate the assignment of areas (processes)
function validateQuotationProcessesForm(form) {
    let validated = false;
    form.on('submit', function(event){
        // get products cards
        const cardsProducts = $(this).children().find('div.card');

        // form an matrix with the values of the selects
        let selectsOrder = {};
        let selectOrderValue = [];
        let selectsOrderValues = [];
        cardsProducts.each(function(){
            selectsOrder = $(this).find('.orderProcess');
            selectsOrder.each(function(){
                selectOrderValue.push($(this).val());
            })
            selectsOrderValues.push(selectOrderValue);
            selectOrderValue = [];
        });

        // validate that the order is sequential
        let sequencial = [];
        let sequencialTemp = [];
        let length = 0;
        let min = 0;
        let selectsSorted = [];
        selectsOrderValues.forEach((selects,i) => {
            selectsSorted = selects.sort();
            length = selectsSorted.length;
            min = Math.min.apply(Math, selectsSorted);
            if (length > 1){
                if(min === 1){
                    sequencialTemp.push(true);
                    for (let j = 0; j < length-1; j++) {
                        if(selectsSorted[j+1] - selectsSorted[j] === 0){
                            sequencialTemp.push(true);
                        }else if(selectsSorted[j+1] - selectsSorted[j] === 1 || selectsSorted[j+1] - selectsSorted[j] === -1){
                            sequencialTemp.push(true);
                        }else{
                            sequencialTemp.push(false);
                        }
                    }
                    sequencial.push(sequencialTemp);
                    sequencialTemp = [];
                }else{
                    sequencial.push([false]);
                }
            }else{
                if(min === 1){
                    sequencial.push([true]);
                }else{
                    sequencial.push([false]);
                }
            }
        });

        // show which element of the sequence is wrong
        const invalidFeedbackOrderProcess = $('.invalid-feedback-process-order');
        if (sequencial.length > 0){
            sequencial.forEach((card, i) => {
                card.forEach((select, j) => {
                    $(this).children().find('div.card').eq(i).find('.orderProcess').eq(j).removeClass('border-dark');
                    if (select === false){
                        $(this).children().find('div.card').eq(i).find('.orderProcess').eq(j).removeClass('border-success');
                        $(this).children().find('div.card').eq(i).find('.orderProcess').eq(j).addClass('border-danger');
                    } else {
                        $(this).children().find('div.card').eq(i).find('.orderProcess').eq(j).removeClass('border-danger');
                        $(this).children().find('div.card').eq(i).find('.orderProcess').eq(j).addClass('border-success');
                    }
                });
                if($(this).children().find('div.card').eq(i).find('select.border-danger').length === 0){
                    invalidFeedbackOrderProcess.eq(i).removeClass('is-invalid');
                    invalidFeedbackOrderProcess.eq(i).addClass('is-valid');
                    invalidFeedbackOrderProcess.eq(i).removeClass('text-danger');
                    invalidFeedbackOrderProcess.eq(i).addClass('text-success');
                    invalidFeedbackOrderProcess.eq(i).text('¡Perfecto! el orden de las areas es válido');
                }else{
                    invalidFeedbackOrderProcess.eq(i).removeClass('is-valid');
                    invalidFeedbackOrderProcess.eq(i).addClass('is-invalid');
                    invalidFeedbackOrderProcess.eq(i).removeClass('text-success');
                    invalidFeedbackOrderProcess.eq(i).addClass('text-danger');
                    invalidFeedbackOrderProcess.eq(i).text('El orden de las áreas no es válido');
                }
            });
        }

        // area process validation
        let selectsArea = {};
        let selectAreaValue = [];
        let selectsAreaValues = [];
        cardsProducts.each(function(){
            selectsArea = $(this).find('.areaProcess');
            selectsArea.each(function(){
                selectAreaValue.push($(this).val());
            })
            selectsAreaValues.push(selectAreaValue);
            selectAreaValue = [];
        });

        let duplicates = [];
        let duplicatesTemp = [];
        let indexDuplicatesTemp = [];
        let indexDuplicates = [];
        selectsAreaValues.forEach((selects,i) => {
            selects.filter((val, j)=>{
                if(selects.indexOf(val) !== j){
                    duplicatesTemp.push(true);
                    indexDuplicatesTemp.push(j);
                }else{
                    duplicatesTemp.push(false);
                    indexDuplicatesTemp.push(j);
                }
            })
            duplicates.push(duplicatesTemp);
            indexDuplicates.push(indexDuplicatesTemp);
            duplicatesTemp = [];
            indexDuplicatesTemp = [];
        });

        if(duplicates.length > 0){
            duplicates.forEach((card, i) => {
                card.forEach((select,j) => {
                    $(this).children().find('div.card').eq(i).find('.areaProcess').eq(j).removeClass('border-dark');
                    if (select === true){
                        $(this).children().find('div.card').eq(i).find('.areaProcess').eq(j).removeClass('is-valid');
                        $(this).children().find('div.card').eq(i).find('.areaProcess').eq(j).addClass('is-invalid');
                        $(this).children().find('div.card').eq(i).find('.invalid-feedback-process-area').text('Por favor, evite duplicar áreas');
                    }else{
                        $(this).children().find('div.card').eq(i).find('.areaProcess').eq(j).removeClass('is-invalid');
                        $(this).children().find('div.card').eq(i).find('.areaProcess').eq(j).addClass('is-valid');
                        
                    }
                });
            });
        }

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length === 0){
            validated = true;
        }else{
            validated = false;
        }

        // If it is not validated, it is not sent
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
    new DataTable('#quotations-table', {
        paging: false,
        info: false,
        padding: false,
        order: [[1, 'Desc']],
        columnDefs: [
            {
                "width": "30%",
                "targets": 2
            }
        ],
        dom: '<"row pb-2"<"col-12 col-md-6 order-last order-md-first"<"float-start"f>><"col-12 col-md-6 order-first order-md-last"<"button-add-quotation"B>>><"row"<"col-sm-12"tr>>',
        fnInitComplete: function(){
            // añadir boton para agregar roles
            const addQuotationbtn = $('#quotations-add-button').clone().removeClass('d-none');
            $('div.button-add-quotation').html(addQuotationbtn);
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // ------------------------------- add file -------------------------------
    // enable discount field
    $('#discountop1').on('click', ()=>{
        $('#numdiscount').prop('disabled', false);
        $('#numdiscount').val('');
    });

    // disable discount field
    $('#discountop2').on('click', ()=>{
        $('#numdiscount').prop('disabled', true);
        $('#numdiscount').val('0.00');
    });

    // add product
    $('#cotbtn').on('click', function(){
        const idProduct = $('#nameproduct').val();
        const cardsContainer = $('#products-cards-container');
        if (idProduct.length !== 0){
            $.ajax({
                type: 'POST',
                url: '/quotations/listProducts',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idProduct: idProduct}),
                success: function(data){
                    const sourceProduct = $('#products-card-added').html();
                    const templateProduct = Handlebars.compile(sourceProduct);
                    data.producto.contadorProducto = productsGenerated;
                    data.producto.fueraCatalogo = '0';
                    const contextProduct = {
                        producto: data.producto
                    };
                    const htmlProduct = templateProduct(contextProduct);
                    $(htmlProduct).hide().appendTo(cardsContainer).show('slow');

                    // increase products counter
                    productsCounter++;
                    productsGenerated++;
                    
                    // enable/disable coating (acabados) field
                    $('.coatingproduct-toggle').on('click', function(e){
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        $(this).children().toggleClass('bi bi-toggle2-on bi bi-toggle2-off')
                        $(this).siblings().prop('disabled', function(_, pv){
                            if (!$(this).is(':disabled')){
                                $(this).val('Sin acabados');
                            }else{
                                $(this).val('');
                            }
                            return !pv;
                        });
                    })

                    // enable/disable file (archivo) field
                    $('.fileproduct-toggle').on('click', function(e){
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        $(this).children().toggleClass('bi bi-toggle2-on bi bi-toggle2-off')
                        $(this).siblings().prop('disabled', function(_, pv){
                            if (!$(this).is(':disabled')){
                                $(this).val('Sin archivo');
                            }else{
                                $(this).val('');
                            }
                            return !pv;
                        });
                    })

                    //remove product
                    $('.remove-product-button').on('click', function(e){
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        $(this).parents().eq(5).hide('slow', ()=>{
                            $(this).parents().eq(5).remove();
                            // decrease counter
                            productsCounter--;
                        });
                    });

                    // crear todas las tooltips de los descuentos
                    if ($('span[data-bs-toggle="tooltip"].productDiscount').is(':not(:empty)')){
                        new bootstrap.Tooltip('body', {selector: 'span[data-bs-toggle="tooltip"].productDiscount'});
                    }

                    $('.priceoutproduct').on('change', function(){
                        // ocultar badge con el simbolo de porcentaje
                        $(this).parents().eq(0).children().eq(0).children().eq(1).addClass('d-none');

                        // deshabilitar tooltip de información sobre el descuento
                        const tooltip = bootstrap.Tooltip.getInstance($(this).parents().eq(0).children().eq(0))
                        tooltip.disable();
                    })
                },
                error: function(){
                    window.location.reload();
                }
            })
        }
    })

    // add product out catalog
    $('#outCatalog').on('click', function(){
        const cardsContainer = $('#products-cards-container');
        const sourceOutCatalogProduct = $('#products-card-added').html();
        const templateOutProduct = Handlebars.compile(sourceOutCatalogProduct);
        const data ={
            producto: {
                contadorProducto: productsGenerated,
                fueraCatalogo: '1'
            }
        }
        const contextOutProduct = {
            producto: data.producto
        };
        const htmlOutProduct = templateOutProduct(contextOutProduct);
        $(htmlOutProduct).hide().appendTo(cardsContainer).show('slow');

        // increase products counter
        productsCounter++;
        productsGenerated++;

        // enable/disable coating (acabados) field
        $('.coatingproduct-toggle').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).children().toggleClass('bi bi-toggle2-on bi bi-toggle2-off')
            $(this).siblings().prop('disabled', function(_, pv){
                if (!$(this).is(':disabled')){
                    $(this).val('Sin acabados');
                }else{
                    $(this).val('');
                }
                return !pv;
            });
        })

        // enable/disable file (archivo) field
        $('.fileproduct-toggle').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).children().toggleClass('bi bi-toggle2-on bi bi-toggle2-off')
            $(this).siblings().prop('disabled', function(_, pv){
                if (!$(this).is(':disabled')){
                    $(this).val('Sin archivo');
                }else{
                    $(this).val('');
                }
                return !pv;
            });
        })

        // show/hide width input field
        $('.unitoutproduct1, .unitoutproduct2, .unitoutproduct3').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            if ($(this).val() === 'Mt'){
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(0).children().eq(1).children().eq(0).val('');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(1).children().eq(1).children().eq(0).val('');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).show();
            }else{
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(0).children().eq(1).children().eq(0).val('0');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(1).children().eq(1).children().eq(0).val('0');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).hide();
            }
        })

        //remove product
        $('.remove-product-button').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).parents().eq(5).hide('slow', ()=>{
                $(this).parents().eq(5).remove();
                // decrease counter
                productsCounter--;
            });
        });
    })

    // get discount client
    $('#clientid').on('change', function(){
        const clientid = $(this).val();
        if(clientid.length !== 0){
            $.ajax({
                type: 'POST',
                url: '/quotations/discountClient',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({clientid: clientid}),
                success: function(data){
                    maxClientDiscount = data.descuento.descuento;
                },
                error: function(){
                    window.location.reload();
                }
            })
        }
    })

    // quoter validation
    validateQuotationsForm($('#form-add-quotation'), '/quotations/add');

    // ------------------------------- info file -------------------------------
    // show cancel quotation warning
    $('#cancel-quotation').on('click', function(){
        const toast = new bootstrap.Toast(document.getElementById('cancelToast'), {});
        toast.show();
    })

    // add client email
    let emailClient = $('#inputEmailClient').val();
    $('#checkClient').on('click', ()=>{
        $('#inputEmailClient').val(emailClient);
    });
    
    // delete client email
    $('#checkAnother').on('click', ()=>{
        $('#inputEmailClient').val('');
    });

    // validate email send
    validateQuotationEmailForm($('#emailClientForm'));

    // add process area
    $('.addArea').on('click', function(){
        const inputGroup = $(this).parents().eq(3).find('div.input-group:first'); //$(this).parents().eq(3).children().eq(1).children().eq(1).children().eq(0);
        const cardsContainer = $(this).parents().eq(3).find('#cardsProcessContainer');
        const inputGroupClone = inputGroup.clone();
        inputGroupClone.find('div.d-none').removeClass('d-none');
        inputGroupClone.find('select').removeClass('is-invalid');
        inputGroupClone.find('select').removeClass('is-valid');
        inputGroupClone.find('select').addClass('border-dark');
        inputGroupClone.appendTo(cardsContainer);

        $('.remove-process-select').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).parents().eq(2).hide('slow', ()=>{
                $(this).parents().eq(2).remove();
            })
        })
    })

    // validate validate assignment of areas (processes)
    validateQuotationProcessesForm($('#form-add-process'));

    // ------------------------------- Edit file -------------------------------
    // count products
    productsCounter = $('#products-cards-container').children().length;
    productsGenerated = $('#products-cards-container').children().length;
    if($('#clientid').length){
        if($('#clientid').val().length !== 0){
            const clientid = $('#clientid').val();
            $.ajax({
                type: 'POST',
                url: '/quotations/discountClient',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({clientid: clientid}),
                success: function(data){
                    maxClientDiscount = data.descuento.descuento;
                },
                error: function(){
                    window.location.reload();
                }
            })
        }
    }

    // enable/disable coating (acabados) field
    if ($('.coatingproduct-toggle').length){
        $('.coatingproduct-toggle').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).children().toggleClass('bi bi-toggle2-on bi bi-toggle2-off')
            $(this).siblings().prop('disabled', function(_, pv){
                if (!$(this).is(':disabled')){
                    $(this).val('Sin acabados');
                }else{
                    $(this).val('');
                }
                return !pv;
            });
        })
    }

    // enable/disable file (archivo) field
    if ($('.fileproduct-toggle').length){
        $('.fileproduct-toggle').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).children().toggleClass('bi bi-toggle2-on bi bi-toggle2-off')
            $(this).siblings().prop('disabled', function(_, pv){
                if (!$(this).is(':disabled')){
                    $(this).val('Sin archivo');
                }else{
                    $(this).val('');
                }
                return !pv;
            });
        })
    }

    //remove product
    if ($('.remove-product-button').length){
        $('.remove-product-button').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            $(this).parents().eq(5).hide('slow', ()=>{
                $(this).parents().eq(5).remove();
                // decrease counter
                productsCounter--;
            });
        });
    }

    // show/hide width input field
    if ($('.unitoutproduct1, .unitoutproduct2, .unitoutproduct3').length){
        $('.unitoutproduct1, .unitoutproduct2, .unitoutproduct3').on('click', function(e){
            e.stopPropagation();
            e.stopImmediatePropagation();
            if ($(this).val() === 'Mt'){
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(0).children().eq(1).children().eq(0).val('');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(1).children().eq(1).children().eq(0).val('');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).removeClass('d-none');
            }else{
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(0).children().eq(1).children().eq(0).val('0');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).children().eq(1).children().eq(1).children().eq(0).val('0');
                $(this).parents().eq(4).children().eq(1).children().eq(2).children().eq(0).addClass('d-none');
            }
        })
    }

    // quoter validation
    let formEditUrl = $('#form-edit-quotation').attr('action');
    validateQuotationsForm($('#form-edit-quotation'), formEditUrl);
});