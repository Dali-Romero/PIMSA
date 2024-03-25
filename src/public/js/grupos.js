function validarGrupos(form){
    let validated = false;
    form.on('submit', (event)=>{
        //validacion del nombre del grupo
        const nameGroupInput = $('#namegroup');
        nameGroupInput.removeClass('border-dark');
        if (nameGroupInput.val().length == 0){
            nameGroupInput.removeClass('is-valid');
            nameGroupInput.addClass('is-invalid');
            $('invalid-feedback-tradename').text('Por favor, agregue un nombre al grupo');
        }else{
            nameGroupInput.removeClass('is-invalid');
            nameGroupInput.addClass('is-valid');
        };

        //validacion de la descripcion
        const descriptionInput = $('#description');
        descriptionInput.removeClass('border-dark');
        if (descriptionInput.val().length == 0){
            descriptionInput.removeClass('is-valid');
            descriptionInput.addClass('is-invalid');
            $('#invalid-feedback-contact').text('Por favor, ingresa la descripción del grupo');
        }else{
            descriptionInput.removeClass('is-invalid');
            descriptionInput.addClass('is-valid');
        };

        //comprobacion de las validaciones
        const nonvalidateFields = $('.is-invalid');
        if (nonvalidateFields.length === 0){
            validated = true;
        }

        //en caso de no estar validado no se envia
        if (!validated){
            event.preventDefault()
            event.stopPropagation()
        }
    });
}

$(document).ready(function(){
    
    validarGrupos($('#form-add-group'));
    validarGrupos($('#form-edit-group'));
});