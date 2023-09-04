// Global variables
let productsCounter = 0; // products counter
let productsGenerated = 1; // products generated counter
let maxClientDiscount = 0; // max discount per client

// Handlebars front-end helpers
Handlebars.registerHelper('equal', function(v1, v2, options){
    if (v1 === v2){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

Handlebars.registerHelper('formatNumber', function(v1, options){
    return Number(v1).toLocaleString();
});

Handlebars.registerHelper('formatDate', function(v1, options){
    date = new Date(v1);
    fechaCotizacion = date.toLocaleDateString('es-mx', {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric'});
    return fechaCotizacion;
});

// function to validate the quoter
function validateQuotationsForm(form){
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
        const patternNameApplicant = /[^a-zA-Z\sñÑ]/;
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
        const patternNameProyect = /[^a-zA-Z0-9\sñÑ]/;
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
        const patternNumDiscount = /^\d+(\.\d+)?$/;
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
            invalidFeedbackNumDiscount.text('El porcentaje solo debe contener números');
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
        const patternObservations = /^(\r|\t|\s|[^a-zA-Z0-9ñÑ])/;
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
            }else{
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            };
        })

        // file product field validation
        const patternFileProducts =  /[^a-zA-Z0-9\s_ñÑ]/;
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
        const patternLenghtProducts = /^\d+(\.\d+)?$/;
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
        const patternWidthProducts = /^\d+(\.\d+)?$/;
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
        const patternOutProduct = /[^a-zA-Z0-9\sñÑ]/;
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
        const patternPriceOutProducts = /[^0-9.]/;
        const priceOutProducts = $('.priceoutproduct');
        priceOutProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            if ($(this).val().length === 0) {
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('Por favor, agregue un precio');
            }else if(patternPriceOutProducts.test($(this).val())){
                $(this).removeClass('is-valid');
                $(this).addClass('is-invalid');
                $(this).siblings().eq(2).text('El precio solo debe contener números');
            }else if ($(this).val() < 1 || $(this).val() > 9999){
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
                    $("#preview-modal").modal('show');

                    // disable discount field
                    if ($('#discountop2').is(':checked')){
                        $('#numdiscount').prop('disabled', true);
                    }

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

                    $('#send-quotation').on('click', function(){
                        $.ajax({
                            type: 'POST',
                            url: '/quotations/add',
                            headers: {'Content-Type': 'application/json'},
                            data: JSON.stringify({data: contextPreview}),
                            success: function (data) {
                                window.location.replace(data.url);
                            }
                        })
                    })
                }
            })
            
        }
    });
}

$(document).ready(function(){
    // list quotations table
    var table = new DataTable('#quotations-table', {
        paging: false,
        info: false,
        padding: false,
        order: [],
        dom: '<"float-start pb-2"f><"button-add-quotation pb-2"B>', 
        columnDefs: [
            {className: "dt-center", targets: "_all"},
        ],
        fnInitComplete: function(){
            $('div.button-add-quotation').html('<a href="/quotations/add" class="btn btn-outline-success border-success border-2 float-end" role="button"><i class="bi bi-bag-plus"></i> Cotizar</a>');
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // enable discount field
    $('#discountop1').on('click', ()=>{
        $('#numdiscount').prop('disabled', false);
        $('#numdiscount').val('');
    });

    // disable discount field
    $('#discountop2').on('click', ()=>{
        $('#numdiscount').prop('disabled', true);
        $('#numdiscount').val('0');
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
                }
            })
        }
    })

    // add product out catalog
    $('#outCatalog').on('click', function(){
        const cardsContainer = $('#products-cards-container');
        const sourceOutCatalogProduct = $('#products-outCatalog-card-added').html();
        const templateOutProduct = Handlebars.compile(sourceOutCatalogProduct);
        const data ={
            producto: {
                contadorProducto: productsGenerated
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
                }
            })
        }
    })

    // quoter validation
    validateQuotationsForm($('#form-add-quotation'));
});