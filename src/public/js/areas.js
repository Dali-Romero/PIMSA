function validateForm(form){
    let validated = false;
    form.on('submit', function(event){
        const patternNameArea = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameArea = $('areaname');
        const invalidFeedbackNameArea = $('#invalid-feedback-areaname');
        nameArea.removeClass('border-dark');
        if (nameArea.val().length === 0) {
            nameArea.removeClass('is-valid');
            nameArea.addClass('is-invalid');
            invalidFeedbackNameArea.text('Por favor, agregue un nombre');
        }else if (patternNameArea.test(nameArea.val())){
            nameArea.removeClass('is-valid');
            nameArea.addClass('is-invalid');
            invalidFeedbackNameArea.text('El nombre del área debe contener únicamente letras');
        }else if (nameArea.val().length < 1 || nameArea.val().length > 20){
            nameArea.removeClass('is-valid');
            nameArea.addClass('is-invalid');
            invalidFeedbackNameArea.text('El nombre del área debe contener entre 1 y 20 caracteres');
        }else{
            nameArea.removeClass('is-invalid');
            nameArea.addClass('is-valid');
        };

        const patternDescArea = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const descArea = $('#areadescription');
        const invalidFeedbackDescArea = $('#invalid-feedback-areadescription');
        descArea.removeClass('border-dark');
        if (descArea.val().length === 0) {
            descArea.removeClass('is-valid');
            descArea.addClass('is-invalid');
            invalidFeedbackDescArea.text('Por favor, agregue una descripción');
        }else if (patternDescArea.test(descArea.val())){
            descArea.removeClass('is-valid');
            descArea.addClass('is-invalid');
            invalidFeedbackDescArea.text('La descripción del área debe contener únicamente letras');
        }else if (descArea.val().length < 1 || descArea.val().length > 40){
            descArea.removeClass('is-valid');
            descArea.addClass('is-invalid');
            invalidFeedbackDescArea.text('La descripción del área debe contener entre 1 y 40 caracteres');
        }else{
            descArea.removeClass('is-invalid');
            descArea.addClass('is-valid');
        };

        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        if(!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    })
}

$(document).ready(function(){
    const table = new DataTable('#areas-table', {
        paging: false,
        info: false,
        padding: false,
        order: [],
        columnDefs: [
            {
                "orderable": false,
                "targets": 3
            }
        ],
        dom: '<"float-start pb-2"f><"button-add-area pb-2"B>', 
        fnInitComplete: function(){
            $('div.button-add-area').html('<a href="/areas/add" class="btn btn-outline-success border-success border-2 float-end" role="button"><i class="bi bi-patch-plus"></i> Añadir área</a>');
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    // validate add area form
    validateForm($('#addAreaForm'));

    // validate edit area form
    validateForm($('#editAreaForm'));
})