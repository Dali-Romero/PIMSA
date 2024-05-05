function validarFormEmployees(form){
    let validated = false;
    form.on('submit', (event)=>{
        //Empezamos las validaciones, son un putero asi que sientate y disfruta el viaje
        //Comprobacion del nombre
        const nombreInput = $('#nombre');
        nombreInput.removeClass('border-dark');
        if (nombreInput.val().length <= 2){
            nombreInput.removeClass('is-valid');
            nombreInput.addClass('is-invalid');
            $('#invalid-feedback-nombre').text('Por favor, agregue un nombre de usuario.');
        } else {
            nombreInput.removeClass('is-invalid');
            nombreInput.addClass('is-valid');
        };

        // Lugar de nacimiento
        const lugNacimientoInput = $('#lugNacimiento');
        lugNacimientoInput.removeClass('border-dark');
        if (lugNacimientoInput.val().length <= 2){
            lugNacimientoInput.removeClass('is-valid');
            lugNacimientoInput.addClass('is-invalid');
            $('#invalid-feedback-lugNacimiento').text('Por favor, agregue el lugar de nacimiento.');
        } else{
            lugNacimientoInput.removeClass('is-invalid');
            lugNacimientoInput.addClass('is-valid');
        };

        // Fecha de nacimiento
        const fecNacInput = $('#fecNacimiento');
        fecNacInput.removeClass('border-dark');
        if (fecNacInput.val().length <= 0){
            fecNacInput.removeClass('is-valid');
            fecNacInput.addClass('is-invalid');
            $('#invalid-feedback-fecNacimiento').text('Por favor, agregue la fecha de nacimiento.');
        } else{
            fecNacInput.removeClass('is-invalid');
            fecNacInput.addClass('is-valid');
        };

        // Edad por cumplir
        const edadInput = $('#edad');
        edadInput.removeClass('border-dark');
        if(edadInput.val().length == 0){
            edadInput.removeClass('is-valid');
            edadInput.addClass('is-invalid');
            $('#invalid-feedback-edad').text('Por favor, agregue la edad del empleado.');
        } else{
            edadInput.removeClass('is-invalid');
            edadInput.addClass('is-valid');
        };

        // Numero de celular
        const celularInput = $('#numeroTelefono');
        celularInput.removeClass('border-dark');
        if (celularInput.val().length == 10){
            celularInput.removeClass('is-invalid');
            celularInput.addClass('is-valid');
        } else{
            celularInput.removeClass('is-valid');
            celularInput.addClass('is-invalid');
            $('#invalid-feedback-numeroTelefono').text('El numero de telefono debe contener 10 numeros.');
        };

        // Correo electronico
        const correoInput = $('#correo');
        correoInput.removeClass('border-dark');
        var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        if (correoInput.val().length <= 2){
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-correo').text('Por favor, agregue un correo electronico.');
        } else if (validEmail.test(correoInput.val())){
            correoInput.removeClass('is-invalid');
            correoInput.addClass('is-valid');
        } else {
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-correo').text('No es un correo valido.');
        };

        // Nombre de contacto de emergencia
        const emerNombreInput = $('#emerNombre');
        emerNombreInput.removeClass('border-dark');
        if (emerNombreInput.val().length <= 2){
            emerNombreInput.removeClass('is-valid');
            emerNombreInput.addClass('is-invalid');
            $('#invalid-feedback-emerNombre').text('Por favor, agregue un contacto de emergencia.');
        } else{
            emerNombreInput.removeClass('is-invalid');
            emerNombreInput.addClass('is-valid');
        };

        // Numero de telefono de contacto de emergencia
        const emerNumInput = $('#emerTel');
        emerNumInput.removeClass('border-dark');
        if (emerNumInput.val().length == 10){
            emerNumInput.removeClass('is-invalid');
            emerNumInput.addClass('is-valid');
        } else{
            emerNumInput.removeClass('is-valid');
            emerNumInput.addClass('is-invalid');
            $('#invalid-feedback-emerTel').text('El numero de telefono debe tener 10 caracteres.');
        }

        // Domicilio del empleado
        try{
            // Partes del formulario de "Crear nuevo empleado"
            // Codigo postal
            const codigoPostalInput = $('#codPost');
            codigoPostalInput.removeClass('border-dark');
            if (codigoPostalInput.val().length <= 2){
                codigoPostalInput.removeClass('is-valid');
                codigoPostalInput.addClass('is-invalid');
                $('#invalid-feedback-codPost').text('Por favor, agregue el codigo postal del domicilio del empleado.');
            } else{
                codigoPostalInput.removeClass('is-invalid');
                codigoPostalInput.addClass('is-valid');
            };

            // Colonia
            const coloniaInput = $('#colonia');
            coloniaInput.removeClass('border-dark');
            if (coloniaInput.val().length <= 2){
                coloniaInput.removeClass('is-valid');
                coloniaInput.addClass('is-invalid');
                $('#invalid-feedback-colonia').text('Por favor, agregue la colonia del domicilio del empleado.');
            } else{
                coloniaInput.removeClass('is-invalid');
                coloniaInput.addClass('is-valid');
            };

            // Calle
            const calleInput = $('#calle');
            calleInput.removeClass('border-dark');
            if (calleInput.val().length <= 2){
                calleInput.removeClass('is-valid');
                calleInput.addClass('is-invalid');
                $('#invalid-feedback-calle').text('Por favor, agregue la calle del domicilio del empleado.');
            } else{
                calleInput.removeClass('is-invalid');
                calleInput.addClass('is-valid');
            };

            // Numero exterior
            const numExtInput = $('#numExt');
            numExtInput.removeClass('border-dark');
            if (numExtInput.val().length == 0){
                numExtInput.removeClass('is-valid');
                numExtInput.addClass('is-invalid');
                $('#invalid-feedback-numExt').text('Por favor, agregue el numero exterior del domicilio del empleado.');
            } else{
                numExtInput.removeClass('is-invalid');
                numExtInput.addClass('is-valid');
            };

            // Numero interior
            const numIntInput = $('#numInt');
            numIntInput.removeClass('border-dark');
            numIntInput.addClass('is-valid');

        } catch{ 
            // Parte del formulario de "Editar empleado"
            // Domicilio
            const domicilioInput = $('#domicilio');
            domicilioInput.removeClass('border-dark');
            if (domicilioInput.val().length <= 2){
                domicilioInput.removeClass('is-valid');
                domicilioInput.addClass('is-invalid');
                $('#invalid-feedback-domicilio').text('Por favor, agregue el domicilio del empleado.');
            } else{
                domicilioInput.removeClass('is-invalid');
                domicilioInput.addClass('is-valid');
            };

            // Descripcion de cambios
            const descripcionInput = $('#descripcion');
            descripcionInput.removeClass('border-dark');
            if (descripcionInput.val().length == 0){
                descripcionInput.removeClass('is-valid');
                descripcionInput.addClass('is-invalid');
                $('#invalid-feedback-descripcion').text('Por favor, agregue la descripcion del cambio.');
            } else{
                descripcionInput.removeClass('is-invalid');
                descripcionInput.addClass('is-valid');
            }
        };

        // CURP
        const curpInput = $('#curp');
        curpInput.removeClass('border-dark');
        if (curpInput.val().length == 18){
            curpInput.removeClass('is-invalid');
            curpInput.addClass('is-valid');
        } else{
            curpInput.removeClass('is-valid');
            curpInput.addClass('is-invalid');
            $('#invalid-feedback-curp').text('La CURP debe tener 18 caracteres.');
        };

        // RFC
        const rfcInput = $('#rfc');
        rfcInput.removeClass('border-dark');
        if (rfcInput.val().length == 13){
            rfcInput.removeClass('is-invalid');
            rfcInput.addClass('is-valid');
        } else{
            rfcInput.removeClass('is-valid');
            rfcInput.addClass('is-invalid');
            $('#invalid-feedback-rfc').text('El RFC debe contener 13 caracteres.');
        };

        // NSS
        const nssInput = $('#nss');
        nssInput.removeClass('border-dark');
        if (nssInput.val().length == 11){
            nssInput.removeClass('is-invalid');
            nssInput.addClass('is-valid');
        } else{
            nssInput.removeClass('is-valid');
            nssInput.addClass('is-invalid');
            $('#invalid-feedback-nss').text('El Numero de Seguro Social debe contener 11 caracteres.');
        };

        // Numero de Nomina
        const nominaInput = $('#nomina');
        nominaInput.removeClass('border-dark');
        if (nominaInput.val().length == 0){
            nominaInput.removeClass('is-valid');
            nominaInput.addClass('is-invalid');
            $('#invalid-feedback-nomina').text('Por favor, agregue el numero de nomina del empleado.');
        } else{
            nominaInput.removeClass('is-invalid');
            nominaInput.addClass('is-valid');
        };

        // Salario Quincenal
        const salarioInput = $('#salario');
        salarioInput.removeClass('border-dark');
        if (salarioInput.val().length == 0){
            salarioInput.removeClass('is-valid');
            salarioInput.addClass('is-invalid');
            $('#invalid-feedback-salario').text('Por favor, agregue el salario del empleado.');
        } else{
            salarioInput.removeClass('is-invalid');
            salarioInput.addClass('is-valid');
        };

        // Fecha de ingreso
        const ingresoInput = $('#fecIngreso');
        ingresoInput.removeClass('border-dark');
        if (ingresoInput.val().length == 0){
            ingresoInput.removeClass('is-valid');
            ingresoInput.addClass('is-invalid');
            $('#invalid-feedback-fecIngreso').text('Por favor, agregue la fecha en la que el empleado entro a la empresa.');
        } else {
            var fecNac = new Date(fecNacInput.val());
            var ingresoFec = new Date(ingresoInput.val());
            if ((ingresoFec - fecNac) > 0){
                ingresoInput.removeClass('is-invalid');
                ingresoInput.addClass('is-valid');
            } else{
            ingresoInput.removeClass('is-valid');
            ingresoInput.addClass('is-invalid');
            $('#invalid-feedback-fecIngreso').text('Revise las fechas, la fecha de nacimiento no puede ser mayor o igual a la fecha de ingreso.');
            };
        };

        // Años laborales
        const anosInput = $('#anosLaborales');
        anosInput.removeClass('border-dark');
        if (anosInput.val().length == 0){
            anosInput.removeClass('is-valid');
            anosInput.addClass('is-invalid');
            $('#invalid-feedback-anosLaborales').text('Por favor, agregue cuantos años el empleado ha estado en la empresa.');
        } else{
            anosInput.removeClass('is-invalid');
            anosInput.addClass('is-valid');
        };

        // Registro Patronal
        const patronalInput = $('#patronal');
        patronalInput.removeClass('border-dark');
        if (patronalInput.val().length == 0){
            patronalInput.removeClass('is-valid');
            patronalInput.addClass('is-invalid');
            $('#invalid-feedback-patronal').text('Por favor, agregue el registro patronal.');
        } else{
            patronalInput.removeClass('is-invalid');
            patronalInput.addClass('is-valid');
        };

        // Estatus
        const estatusInput = $('#estatus');
        estatusInput.removeClass('border-dark');
        if (estatusInput.val().length == 0){
            estatusInput.removeClass('is-valid');
            estatusInput.addClass('is-invalid');
            $('#invalid-feedback-estatus').text('Por favor, agregue el estatus del empleado.');
        } else{
            estatusInput.removeClass('is-invalid');
            estatusInput.addClass('is-valid');
        };

        // Tipo de Contrato
        const contratoInput = $('#tipoContrato');
        contratoInput.removeClass('border-dark');
        if (contratoInput.val().length <= 2){
            contratoInput.removeClass('is-valid');
            contratoInput.addClass('is-invalid');
            $('#invalid-feedback-tipoContrato').text('Por favor, agregue el tipo de contrato del empleado.');
        } else{
            contratoInput.removeClass('is-invalid');
            contratoInput.addClass('is-valid');
        };

        // Inicio de Contrato
        const inContratoInput = $('#fecInContrato');
        inContratoInput.removeClass('border-dark');
        if (inContratoInput.val().length == 0){
            inContratoInput.removeClass('is-valid');
            inContratoInput.addClass('is-invalid');
            $('#invalid-feedback-fecInContrato').text('Por favor, agregue la fecha de inicio de contrato.');
        } else{
            var ingresoFec = new Date(ingresoInput.val());
            var inContrato = new Date(inContratoInput.val());
            if ((inContrato - ingresoFec) >= 0){
                inContratoInput.removeClass('is-invalid');
                inContratoInput.addClass('is-valid');
            } else{
                inContratoInput.removeClass('is-valid');
                inContratoInput.addClass('is-invalid');
                $('#invalid-feedback-fecInContrato').text('Revise las fechas, la fecha de ingreso no puede ser posterior a la fecha de inicio de contrato.');
            }
        };

        // Final de contrato
        const finContratoInput = $('#fecFinContrato');
        finContratoInput.removeClass('border-dark');
        if (finContratoInput.val().length == 0){
            finContratoInput.removeClass('is-valid');
            finContratoInput.addClass('is-invalid');
            $('#invalid-feedback-fecFinContrato').text('Por favor, agregue la fecha de fin de contrato.');
        } else{
            var inContrato = new Date(inContratoInput.val());
            var finContrato = new Date(finContratoInput.val());
            if ((finContrato - inContrato) > 0){
                finContratoInput.removeClass('is-invalid');
                finContratoInput.addClass('is-valid');
            } else{
                finContratoInput.removeClass('is-valid');
                finContratoInput.addClass('is-invalid');
                $('#invalid-feedback-fecFinContrato').text('Revise las fechas, la fecha de inicio de contrato no puede ser posterior a la de fin de contrato.');
            }
        };
 
        // Rol
        const rolInput = $('#rol');
        rolInput.removeClass('border-dark');
        rolInput.addClass('is-valid');

        // Departamento
        const areaInput = $('#area');
        areaInput.removeClass('border-dark');
        areaInput.addClass('is-valid');

        // Complemento de Nomina
        const complNominaInput = $('#complementoNomina');
        complNominaInput.removeClass('border-dark');
        complNominaInput.addClass('is-valid');

        // Extension
        const extensionInput = $('#extension');
        extensionInput.removeClass('border-dark');
        extensionInput.addClass('is-valid');

        // Sexo
        const sexoInput = $('#sexo');
        sexoInput.removeClass('border-dark');
        sexoInput.addClass('is-valid');

        // Estado civil
        const estadoCivilInput = $('#estadoCivil');
        estadoCivilInput.removeClass('border-dark');
        estadoCivilInput.addClass('is-valid');

        // Comprobacion de las validaciones
        const nonvalidatedFields = $('.is-invalid');
        if (nonvalidatedFields.length === 0){
            validated = true;
        };

        // En caso de no estar validado no se envia
        if (!validated){
            event.preventDefault()
            event.stopPropagation()
        };
    });
}

$(document).ready(function(){
    validarFormEmployees($('#form-add-employee'));
    validarFormEmployees($('#form-edit-employee'));
});