function validateRolesForm(form){
    let validated = false;
    form.on('submit', function(event){
        // role name field validation
        const patternNameRole = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameRole = $('#rolename');
        const invalidFeedbackNameRole = $('#invalid-feedback-rolename');
        nameRole.removeClass('border-dark');
        if (nameRole.val().length === 0) {
            nameRole.removeClass('is-valid');
            nameRole.addClass('is-invalid');
            invalidFeedbackNameRole.text('Por favor, agregue un nombre');
        }else if (patternNameRole.test(nameRole.val())){
            nameRole.removeClass('is-valid');
            nameRole.addClass('is-invalid');
            invalidFeedbackNameRole.text('El nombre del rol debe contener únicamente letras');
        }else if (nameRole.val().length < 1 || nameRole.val().length > 20){
            nameRole.removeClass('is-valid');
            nameRole.addClass('is-invalid');
            invalidFeedbackNameRole.text('El nombre del rol debe contener entre 1 y 20 caracteres');
        }else{
            nameRole.removeClass('is-invalid');
            nameRole.addClass('is-valid');
        };

        // role description field validation
        const patternDescRole = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const descRole = $('#roledescription');
        const invalidFeedbackDescRole = $('#invalid-feedback-roledescription');
        descRole.removeClass('border-dark');
        if (descRole.val().length === 0) {
            descRole.removeClass('is-valid');
            descRole.addClass('is-invalid');
            invalidFeedbackDescRole.text('Por favor, agregue una descripción');
        }else if (patternDescRole.test(descRole.val())){
            descRole.removeClass('is-valid');
            descRole.addClass('is-invalid');
            invalidFeedbackDescRole.text('La descripción del rol debe contener únicamente letras');
        }else if (descRole.val().length < 1 || descRole.val().length > 40){
            descRole.removeClass('is-valid');
            descRole.addClass('is-invalid');
            invalidFeedbackDescRole.text('La descripción del rol debe contener entre 1 y 40 caracteres');
        }else{
            descRole.removeClass('is-invalid');
            descRole.addClass('is-valid');
        };

        // role permissions select validation
        const permissions = $('input[name="permissions"][type="checkbox"]:checked');
        const invalidFeedbackPermissions = $('#invalid-feedback-permissions');
        if (permissions.length === 0){
            invalidFeedbackPermissions.removeClass('is-valid');
            invalidFeedbackPermissions.addClass('is-invalid');
            invalidFeedbackPermissions.removeClass('text-success');
            invalidFeedbackPermissions.addClass('text-danger');
            invalidFeedbackPermissions.text('Por favor, seleccione un permiso');
        }else{
            invalidFeedbackPermissions.removeClass('is-invalid');
            invalidFeedbackPermissions.addClass('is-valid');
            invalidFeedbackPermissions.removeClass('text-danger');
            invalidFeedbackPermissions.addClass('text-success');
            invalidFeedbackPermissions.text('¡Perfecto!');
        }

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        // avoid default form behavior
        if(!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    })
}

$(document).ready(function(){
    // ------------------------------- List file -------------------------------
    const table = new DataTable('#roles-table', {
        paging: false,
        info: false,
        padding: false,
        order: [],
        columnDefs: [
            {
                "orderable": false,
                "targets": 5
            }
        ],
        dom: '<"float-start pb-2"f><"button-add-role pb-2"B>', 
        fnInitComplete: function(){
            $('div.button-add-role').html('<a href="/roles/add" class="btn btn-outline-success border-success border-2 float-end" role="button"><i class="bi bi-shield-lock"></i> Añadir rol</a>');
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    $('#roles-table tbody').on('click', '#btnExpandAssignedUsers', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const idRole = $(this).val();
        if (tr.hasClass('PermissionsIsShowing')) {
            row.child.hide();
            tr.removeClass('PermissionsIsShowing');
        }
        if (row.child.isShown()) {
            $('div.roles-users-slider', row.child()).slideUp(function () {
                row.child.hide();
                tr.removeClass('UsersIsShowing');
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/roles/listAssignedUsers',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idRole: idRole}),
                success: function(data){
                    const sourceAssignedUsers = $('#roles-users-expand').html();
                    const templateAssignedUsers = Handlebars.compile(sourceAssignedUsers);
                    const contextAssignedUsers = {
                        assignedUsers: data.usuariosAsignados,
                        role: data.rol
                    };
                    const htmlAssignedUsers = templateAssignedUsers(contextAssignedUsers);
                    row.child(htmlAssignedUsers, 'p-0' ).show();
                    $('div.roles-users-slider', row.child()).slideDown();
                    tr.addClass('UsersIsShowing');
                }
            });
        }
    });

    $('#roles-table tbody').on('click', '#btnExpandPermissions', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const idRole = $(this).val();
        if (tr.hasClass('UsersIsShowing')) {
            row.child.hide();
            tr.removeClass('UsersIsShowing');
        }
        if (row.child.isShown()) {
            $('div.roles-permissions-slider', row.child()).slideUp(function () {
                row.child.hide();
                tr.removeClass('PermissionsIsShowing');
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/roles/listPermissions',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idRole: idRole}),
                success: function(data){
                    const sourcePermissions = $('#roles-permissions-expand').html();
                    const templatePermissions = Handlebars.compile(sourcePermissions);
                    const contextPermissions = {
                        permissions: data.permisos,
                        role: data.rol
                    };
                    const htmlPermissions = templatePermissions(contextPermissions);
                    row.child(htmlPermissions, 'p-0' ).show();
                    $('div.roles-permissions-slider', row.child()).slideDown();
                    tr.addClass('PermissionsIsShowing');
                }
            });
        }
    });

    // ------------------------------- Add/Edit file -------------------------------
    // check/uncheck all permissions
    $('#selectAllRoles').on('change', function(){
        if ($(this).is(':checked')){
            $('input[name="permissions"][type="checkbox"]').prop('checked', true);
        }else{
            $('input[name="permissions"][type="checkbox"]').prop('checked', false);
        }
    })

    // validate if all permissions are selected
    const num_permisos = $('#selectAllRoles').parents().eq(3).children().eq(2).children().length;
    const num_permisos_seleccionados = $('input[name="permissions"][type="checkbox"]:checked').length;
    if(num_permisos_seleccionados === num_permisos){
        $('#selectAllRoles').prop('checked', true)
    }else{
        $('#selectAllRoles').prop('checked', false)
    }

    // validate add role form
    validateRolesForm($('#addRoleForm'));

    // validate edit role form
    validateRolesForm($('#editRoleForm'));
})