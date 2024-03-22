// function to validate the assignment of areas (processes)
function validateExtasksProcessesForm(form) {
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
        //let min = 0;
        let selectsSorted = [];
        selectsOrderValues.forEach((selects, i) => {
            selectsSorted = selects.sort();
            length = selectsSorted.length;
            //min = Math.min.apply(Math, selectsSorted);
            min = selectsSorted[0];
            if (length > 1){
                if(min == 1){
                    sequencialTemp.push(true);
                    for (let j = 0; j < length-1; j++) {
                        if(selectsSorted[j+1] - selectsSorted[j] == 0){
                            sequencialTemp.push(true);
                        }else if(selectsSorted[j+1] - selectsSorted[j] == 1 || selectsSorted[j+1] - selectsSorted[j] == -1){
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
                if(min == 1){
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
                if($(this).children().find('div.card').eq(i).find('select.border-danger').length == 0){
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
                if(selects.indexOf(val) != j){
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
        if (nonValidatedFields.length == 0){
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
    $('.createOrderExtasks').on('click', function(){
        const cotId = $(this).val();
        $.ajax({
            type: 'POST',
            url: '/extask/listStagesProcess',
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify({cotId: cotId}),
            success: function (data){
                const source = $('#stagesProcess-extask').html();
                const template = Handlebars.compile(source);
                const context = {
                    cotizacion: cotId,
                    procesosEnCatalogo: data.procesosEnCatalogo,
                    productosFueraCatalogo: data.productosFueraCatalogo,
                    orden: data.orden,
                    areas: data.areas
                };
                const html= template(context);
                $('#stagesProcess-extask-container').html(html);
                $("#modalExtasksGenerateOrder").unbind().modal('show');

                // add process area
                $('.addAreaExtaks').on('click', function(){
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
                validateExtasksProcessesForm($('#form-add-process-extasks'));
            },
            error: function(){
                window.location.reload();
            }
        })
    })
});
