// Global variables
let productsCounter = 0; // products counter
let productsGenerated = 1; // products generated counter

// Handlebars front-end helpers
Handlebars.registerHelper('equal', function(v1, v2, options){
    if (v1 === v2){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

// function to validate the quoter
function validateQuotationsForm(form){
    let validated = false;
    form.on('submit', (event)=>{

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
        const patternNameApplicant = /[^a-zA-Z\s]/g;
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
        const patternNameProyect = /[^a-zA-Z0-9\s]/g;
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
        const patternNumDiscount = /[^0-9.]/g;
        const numDiscount = $('#numdiscount');
        const invalidFeedbackNumDiscount = $('#invalid-feedback-numdiscount');
        numDiscount.removeClass('border-dark');
        if (numDiscount.val().length === 0) {
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text('Por favor, agregue un porcentaje de descuento');
        }else if (patternNumDiscount.test(numDiscount.val())){
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text('El porcentaje solo debe contener números');
        }else if (numDiscount.val() < 0 || numDiscount.val() > 100){
            numDiscount.removeClass('is-valid');
            numDiscount.addClass('is-invalid');
            invalidFeedbackNumDiscount.text('El porcentaje debe ser entre 0% y 100%');
        }else{
            numDiscount.removeClass('is-invalid');
            numDiscount.addClass('is-valid');
        }

        // observations field validation
        const patternObservations = /^(\r|\t|\s|[^a-zA-Z0-9])/g;
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

        // client name select validation
        const nameProductSelect = $('#nameproduct');
        nameProductSelect.removeClass('border-dark');
        if (productsCounter === 0){
            nameProductSelect.removeClass('is-valid');
            nameProductSelect.addClass('is-invalid');
        }else{
            nameProductSelect.removeClass('is-invalid');
            nameProductSelect.addClass('is-valid');
        }

        // amount product validation
        const patternAmountProducts= /[^0-9]/g;
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
        const patternFileProducts =  /[^a-zA-Z0-9\s_]/g;
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

        // width product field validation
        const patternWidthProducts = /[^0-9.]/g;
        const widthProducts = $('.lengthproduct');
        widthProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            const unitProduct = $(this).parents().eq(6).children().eq(1).children().eq(0).children().eq(0).children().eq(0).children().find('input:checked').val()
            if (unitProduct === 'Mt'){
                if ($(this).val().length === 0) {
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('Por favor, agregue una medida para el largo');
                }else if (patternWidthProducts.test($(this).val())){
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

        // height product field validation
        const patternHeightProducts = /[^0-9.]/g;
        const heightproductProducts = $('.widthproduct');
        heightproductProducts.each(function(i, obj){
            $(this).removeClass('border-dark');
            const unitProduct = $(this).parents().eq(6).children().eq(1).children().eq(0).children().eq(0).children().eq(0).children().find('input:checked').val()
            if (unitProduct === 'Mt'){
                if ($(this).val().length === 0) {
                    $(this).removeClass('is-valid');
                    $(this).addClass('is-invalid');
                    $(this).siblings().eq(1).text('Por favor, agregue una medida para el ancho');
                }else if (patternHeightProducts.test($(this).val())){
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
        const patternOutProduct = /[^a-zA-Z0-9\s]/g;
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

        // amount product validation
        const patternPriceOutProducts = /[^0-9.]/g;
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
        if (nonValidatedFields.length === 0){
            // enabling  discount input field to send
            $('#numdiscount').prop('disabled', false);

            // enabling unit selects to send
            const unitProducts = $('.unitproduct');
            unitProducts.each(function(i, obj){
                const nameRadio = $(this).attr('name');
                ($(`input[name="${nameRadio}"]`)).prop('disabled', false);
            })
            
            // enabling price fields to send
            const priceProducts = $('.priceproduct');
            priceProducts.each(function(i, obj){
                $(this).prop('disabled', false);
            })
            
            // enabling coating product field to send
            coatingProducts.each(function(i, obj){
                $(this).prop('disabled', false);
            })
            
            // enabling coating product field to send
            fileProducts.each(function(i, obj){
                $(this).prop('disabled', false);
            })

            validated = true;
        }

        // If it is not validated, it is not sent
        if (!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

$(document).ready(function(){
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
                    data.product.countProduct = productsGenerated;
                    const contextProduct = {
                        product: data.product
                    };
                    const htmlProduct = templateProduct(contextProduct);
                    $(htmlProduct).hide().appendTo(cardsContainer).show('slow');
                    //cardsContainer.append(htmlProduct);

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
            product: {
                countProduct: productsGenerated
            }
        }
        const contextOutProduct = {
            product: data.product
        };
        const htmlOutProduct = templateOutProduct(contextOutProduct);
        //cardsContainer.append(htmlOutProduct);
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

    // quoter validation
    validateQuotationsForm($('#form-add-quotation'));
});