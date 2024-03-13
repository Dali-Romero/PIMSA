function validarMachinesForm(form){
    let validated = false;
    form.on('submit', (event)=>{
        // Validacion del numero de serie
        const patternserialNumber = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const serialNumberInput = $('#serialnumber');
        const invalidFeedbackSerialNumber = $('#invalid-feedback-serialnumber');
        serialNumberInput.removeClass('border-dark');
        if (serialNumberInput.val().length === 0) {
            serialNumberInput.removeClass('is-valid');
            serialNumberInput.addClass('is-invalid');
            invalidFeedbackSerialNumber.text('Por favor, agregue un número de serie');
        } else if (patternserialNumber.test(serialNumberInput.val())){
            serialNumberInput.removeClass('is-valid');
            serialNumberInput.addClass('is-invalid');
            invalidFeedbackSerialNumber.text('El número de serie debe contener únicamente número o letras');
        }else if (serialNumberInput.val().length < 1 || serialNumberInput.val().length > 20){
            serialNumberInput.removeClass('is-valid');
            serialNumberInput.addClass('is-invalid');
            invalidFeedbackSerialNumber.text('El número de serie debe contener entre 1 y 20 caracteres');
        } else{
            serialNumberInput.removeClass('is-invalid');
            serialNumberInput.addClass('is-valid');
        };
        
        // Validacion de la marca
        const patternBrand = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const brandInput = $('#brand');
        const invalidFeedbackBrand = $('#invalid-feedback-brand');
        brandInput.removeClass('border-dark');
        if (brandInput.val().length === 0) {
            brandInput.removeClass('is-valid');
            brandInput.addClass('is-invalid');
            invalidFeedbackBrand.text('Por favor, agregue una marca');
        } else if (patternBrand.test(brandInput.val())){
            brandInput.removeClass('is-valid');
            brandInput.addClass('is-invalid');
            invalidFeedbackBrand.text('La marca debe contener únicamente número o letras');
        }else if (brandInput.val().length < 1 || brandInput.val().length > 20){
            brandInput.removeClass('is-valid');
            brandInput.addClass('is-invalid');
            invalidFeedbackBrand.text('La marca debe contener entre 1 y 20 caracteres');
        } else{
            brandInput.removeClass('is-invalid');
            brandInput.addClass('is-valid');
        };

        // Validacion del nombre
        const patternNameMachine = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameMachineInput = $('#name');
        const invalidFeedbackNameMachine =  $('#invalid-feedback-name');
        if (nameMachineInput.val().length === 0) {
            nameMachineInput.removeClass('is-valid');
            nameMachineInput.addClass('is-invalid');
            invalidFeedbackNameMachine.text('Por favor, agregue un nombre');
        } else if (patternNameMachine.test(nameMachineInput.val())){
            nameMachineInput.removeClass('is-valid');
            nameMachineInput.addClass('is-invalid');
            invalidFeedbackNameMachine.text('El nombre debe contener únicamente número o letras');
        }else if (nameMachineInput.val().length < 1 || nameMachineInput.val().length > 25){
            nameMachineInput.removeClass('is-valid');
            nameMachineInput.addClass('is-invalid');
            invalidFeedbackNameMachine.text('El nombre debe contener entre 1 y 25 caracteres');
        } else{
            nameMachineInput.removeClass('is-invalid');
            nameMachineInput.addClass('is-valid');
        };

        // validacion del tipo de tinta
        const inkTypeSelect = $('#inktype');
        inkTypeSelect.removeClass('border-dark');
        if (inkTypeSelect.val().length === 0){
            inkTypeSelect.removeClass('is-valid');
            inkTypeSelect.addClass('is-invalid');
        }else{
            inkTypeSelect.removeClass('is-invalid');
            inkTypeSelect.addClass('is-valid');
        };

        // validacion del tipo de cabezal
        const headTypeSelect = $('#headtype');
        headTypeSelect.removeClass('border-dark');
        if (headTypeSelect.val().length === 0){
            headTypeSelect.removeClass('is-valid');
            headTypeSelect.addClass('is-invalid');
        }else{
            headTypeSelect.removeClass('is-invalid');
            headTypeSelect.addClass('is-valid');
        }

        // Validacion del numero de cabezales
        const patternHeadNum = /[^0-9]/;
        const headNumInput = $('#headnum');
        const invalidFeedbackHeadNum =  $('#invalid-feedback-headnum');
        headNumInput.removeClass('border-dark');
        if (headNumInput.val().length === 0) {
            headNumInput.removeClass('is-valid');
            headNumInput.addClass('is-invalid');
            invalidFeedbackHeadNum.text('Por favor, agregue un número de cabezales');
        }else if(patternHeadNum.test(headNumInput.val())){
            headNumInput.removeClass('is-valid');
            headNumInput.addClass('is-invalid');
            invalidFeedbackHeadNum.text('El número de cabezales solo debe contener números enteros');
        }else if (headNumInput.val() < 1 || headNumInput.val() > 99){
            headNumInput.removeClass('is-valid');
            headNumInput.addClass('is-invalid');
            invalidFeedbackHeadNum.text('El número de cabezales debe ser mayor a 1 y menor a 100');
        }else{
            headNumInput.removeClass('is-invalid');
            headNumInput.addClass('is-valid');
        };

        // Validacion de la velocidad
        const patternSpeed = /^\d+(\.\d{1,3})?$/;
        const speedInput = $('#speed');
        const invalidFeedbackSpeed =  $('#invalid-feedback-speed');
        speedInput.removeClass('border-dark');
        if (speedInput.val().length === 0) {
            speedInput.removeClass('is-valid');
            speedInput.addClass('is-invalid');
            invalidFeedbackSpeed.text('Por favor, agregue una velocidad');
        }else if (!patternSpeed.test(speedInput.val())){
            speedInput.removeClass('is-valid');
            speedInput.addClass('is-invalid');
            invalidFeedbackSpeed.text('La velocidad solo debe contener números (máximo 3 decimales)');
        }else if (speedInput.val() < 1){
            speedInput.removeClass('is-valid');
            speedInput.addClass('is-invalid');
            invalidFeedbackSpeed.text('La velocidad debe ser mayor a 0');
        }else{
            speedInput.removeClass('is-invalid');
            speedInput.addClass('is-valid');
        };

        // Validacion de la extension del contacto del tecnico
        const patternContactExtension = /^[0-9]{1,10}$/;
        const contactExtensionInput = $('#extension');
        const invalidFeedbackContactExtension =  $('#invalid-feedback-extension');
        const validFeedbackContactExtension =  $('#valid-feedback-extension');
        contactExtensionInput.removeClass('border-dark');
        if (contactExtensionInput.val().length > 0) {
            if (!patternContactExtension.test(contactExtensionInput.val())){
                contactExtensionInput.removeClass('is-valid');
                contactExtensionInput.addClass('is-invalid');
                invalidFeedbackContactExtension.text('La extensión debe contener únicamente números (entre 1 y 10 dígitos)');
            } else{
                contactExtensionInput.removeClass('is-invalid');
                contactExtensionInput.addClass('is-valid');
                validFeedbackContactExtension.text('¡Perfecto!');
            };
        } else {
            contactExtensionInput.removeClass('is-invalid');
            contactExtensionInput.addClass('is-valid');
            validFeedbackContactExtension.text('Este campo es opcional');
        }

        // validacion del numero telefonico del tecnico
        const patterntechContact= /^[0-9]{10}$/;
        const techContactInput = $('#techcontact');
        const invalidFeedbacktechContact =  $('#invalid-feedback-techcontact')
        techContactInput.removeClass('border-dark');
        if (techContactInput.val().length === 0) {
            techContactInput.removeClass('is-valid');
            techContactInput.addClass('is-invalid');
            invalidFeedbacktechContact.text('Por favor, agregue un número de contacto para el técnico');
        } else if (!patterntechContact.test(techContactInput.val())){
            techContactInput.removeClass('is-valid');
            techContactInput.addClass('is-invalid');
            invalidFeedbacktechContact.text('La número de contacto debe contener únicamente números (10 dígitos)');
        } else {
            techContactInput.removeClass('is-invalid');
            techContactInput.addClass('is-valid');
        };

        // validacion de los usuarios seleccionados
        const allowedUser = $('input[name="allowedUser"][type="checkbox"]:checked');
        const invalidFeedbackAllowedUser = $('#invalid-feedback-allowedUser');
        if (allowedUser.length === 0){
            invalidFeedbackAllowedUser.removeClass('is-valid');
            invalidFeedbackAllowedUser.addClass('is-invalid');
            invalidFeedbackAllowedUser.removeClass('text-success');
            invalidFeedbackAllowedUser.addClass('text-danger');
            invalidFeedbackAllowedUser.text('Por favor, seleccione un usuario');
        }else{
            invalidFeedbackAllowedUser.removeClass('is-invalid');
            invalidFeedbackAllowedUser.addClass('is-valid');
            invalidFeedbackAllowedUser.removeClass('text-danger');
            invalidFeedbackAllowedUser.addClass('text-success');
            invalidFeedbackAllowedUser.text('¡Perfecto!');
        }

        // Comprobacion de las validaciones
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        // En caso de no estar validado no se envia
        if (!validated){
            event.preventDefault()
            event.stopPropagation()
        }
    });
}

$(document).ready(function(){
    // ------------------------------- List file -------------------------------
    var table = new DataTable('#machines-table', {
        paging: false,
        info: false,
        padding: false,
        order: [],
        dom: '<"row pb-2"<"col-12 col-md-6 order-last order-md-first"<"float-start"f>><"col-12 col-md-6 order-first order-md-last"<"button-add-machine"B>>><"row"<"col-sm-12"tr>>',
        columnDefs: [
            {
                "orderable": false,
                "targets": 9
            }
        ],
        fnInitComplete: function(){
            // añadir boton para agregar roles
            const addRolebtn = $('#machines-add-button').clone().removeClass('d-none');
            $('div.button-add-machine').html(addRolebtn);
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });
    
    $('#machines-table tbody').on('click', '#btnExpandUsers', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const idMachine = $(this).val();
        if (row.child.isShown()) {
            $('div.machines-users-slider', row.child()).slideUp(function () {
                row.child.hide();
            });
        }else {
            $.ajax({
                type: 'POST',
                url: '/machines/listUsers',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idMachine: idMachine}),
                success: function(data){
                    const sourceAssignedUsers = $('#machines-users-expand').html();
                    const templateAssignedUsers = Handlebars.compile(sourceAssignedUsers);
                    const contextAssignedUsers = {
                        machine: data.machine,
                        assignedUsers: data.assignedUsers,
                        permissions: data.permissions
                    };
                    const htmlAssignedUsers = templateAssignedUsers(contextAssignedUsers);
                    row.child(htmlAssignedUsers, 'p-0' ).show();
                    $('div.machines-users-slider', row.child()).slideDown();

                    // crear tooltips para esta tabla
                    if ($('#machines-table tbody span[data-bs-toggle="tooltip"]').is(':not(:empty)')){
                        new bootstrap.Tooltip('#machines-table tbody', {selector: 'span[data-bs-toggle="tooltip"]'});
                    }
                },
                error: function(){
                    window.location.reload();
                }
            });
        }
    });

    // ------------------------------- Add file -------------------------------
    // active row when check
    $('#table-users-add').on('click', 'tbody tr', function() {
        $(this).toggleClass('table-active');
        const checkBox = $(this).find('input[name="allowedUser"]');
        if (checkBox.is(':checked')) {
            checkBox.prop('checked', false);
        } else {
            checkBox.prop('checked', true);
        }
    });

    // // validate add machine form
    validarMachinesForm($('#form-add-machine'));

    // ------------------------------- Edit file -------------------------------
    // active rows cheked
    const checkBox =$('input[name="allowedUser"]:checked');
    checkBox.each(function(){
        $(this).parents().eq(2).addClass('table-active');
    })

    console.log(checkBox)

    // validate edit machine form
    validarMachinesForm($('#form-edit-machine'));
});
