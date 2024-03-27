function validarFormTareas(form){
    let validated = false;
    form.on('submit', (event)=>{
        // Validacion de maquinas
        const maquinasInput = $('#maquina');
        maquinasInput.removeClass('border-dark');
        maquinasInput.addClass('is-valid'); 

        // Validacion de usuarios
        const empleadosInput = $('#usuario');
        empleadosInput.removeClass('border-dark');
        empleadosInput.addClass('is-valid');

        // Validacion de notes
        const notesInput = $('#descripcion');
        notesInput.removeClass('border-dark');
        if (notesInput.val().length <= 2){
            notesInput.removeClass('is-valid');
            notesInput.addClass('is-invalid');
            $('#invalid-feedback-descripcion').text('Por favor, agregue una descripcion.');
        } else if (notesInput.val().length > 40){
            notesInput.removeClass('is-valid');
            notesInput.addClass('is-invalid');
            $('#invalid-feedback-descripcion').text('El limite de caracteres es 40.');
        } else{
            notesInput.removeClass('is-invalid');
            notesInput.addClass('is-valid');
        }

        // Comprobacion de las validaciones
        const nonvalidatedFields = $('.is-invalid');
        if (nonvalidatedFields.length === 0){
            validated = true;
        }

        // En caso de no estar validada no envia
        if (!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

$(document).ready(function(){
    validarFormTareas($('#form-return-tareas'));
    validarFormTareas($('#form-finish-tareas'));
});