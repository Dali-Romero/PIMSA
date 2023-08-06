function search(){
    const sourceMachinesList = document.getElementById('machines-template').innerHTML;
    const sourceMachinesTotal = document.getElementById('machines-total-template').innerHTML;
    const templateMachinesList = Handlebars.compile(sourceMachinesList);
    const templateMachinesTotal = Handlebars.compile(sourceMachinesTotal);
    document.getElementById('machine-search-bar').addEventListener('keyup', async function(){
        const selectMachineSearch = document.getElementById('machine-search-field').value;
        document.getElementById('table-orderby').innerHTML = 'Todas';
        const key = this.value;
        const response = await fetch('/machines/search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({keys: key, fieldSearch: selectMachineSearch})
        });
        if (!response.ok){
            throw new Error('HTTP error. Status: ', response.status)
        }
        const searchResult = await response.json();
        let activas = 0
        let inactivas = 0
        for(let i in searchResult){
            for(let j in searchResult[i]){
                if (searchResult[i][j].activo){
                    activas++;
                }else{
                    inactivas++;
                }
            }
        }
        const contextMachinesList = {
            machines: searchResult
        };
        const contextMachinesTotal = {
            activas: activas,
            inactivas: inactivas
        }
        const htmlMachinesList = templateMachinesList(contextMachinesList.machines);
        const htmlMachinesTotal = templateMachinesTotal(contextMachinesTotal);
        document.getElementById('table-machines').innerHTML = htmlMachinesList;
        document.getElementById('machines-total').innerHTML = htmlMachinesTotal;
    });
}

async function ordering(order, field, spanOrder){
    const source = document.getElementById('machines-template').innerHTML;
    const template = Handlebars.compile(source);
    const response = await fetch('/machines/orderby', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({field: field, order: order})
    });
    if (!response.ok){
        throw new Error('HTTP error. Status: ', response.status)
    }
    const sortResult = await response.json();
    const context = {
        machines: sortResult
    };
    const html = template(context.machines);
    document.getElementById('table-orderby').innerHTML = spanOrder;
    document.getElementById('table-machines').innerHTML = html;
}

function filters(){
    document.getElementById('machine-order-all').addEventListener('click', function(){ordering('todas', 'todas', 'Todas')});
    document.getElementById('machine-order-serialNumber-asc').addEventListener('click', function(){ordering('ASC', 'numSerie', 'No. Serie (A a la Z)')});
    document.getElementById('machine-order-serialNumber-desc').addEventListener('click', function(){ordering('DESC', 'numSerie', 'No. Serie (Z a la A)')});
    document.getElementById('machine-order-brand-asc').addEventListener('click', function(){ordering('ASC', 'marca', 'Marca (A a la Z)')});
    document.getElementById('machine-order-brand-desc').addEventListener('click', function(){ordering('DESC', 'marca', 'Marca (Z a la A)')});
    document.getElementById('machine-order-name-asc').addEventListener('click', function(){ordering('ASC', 'nombre', 'Nombre (A a la Z)')});
    document.getElementById('machine-order-name-desc').addEventListener('click', function(){ordering('DESC', 'nombre', 'Nombre (Z a la A)')});
    document.getElementById('machine-order-headType-asc').addEventListener('click', function(){ordering('ASC', 'tipoCabezal', 'Tipo cabezal (A a la Z)')});
    document.getElementById('machine-order-headType-desc').addEventListener('click', function(){ordering('DESC', 'tipoCabezal', 'Tipo cabezal (Z a la A)')});
    document.getElementById('machine-order-headNum-asc').addEventListener('click', function(){ordering('ASC', 'numCabezales', 'No. Cabezales (Menor a mayor)')});
    document.getElementById('machine-order-headNum-desc').addEventListener('click', function(){ordering('DESC', 'numCabezales', 'No. Cabezales (Mayor a menor)')});
    document.getElementById('machine-order-speed-asc').addEventListener('click', function(){ordering('ASC', 'velocidad', 'Velocidad (Lento a rápido)')});
    document.getElementById('machine-order-speed-desc').addEventListener('click', function(){ordering('DESC', 'velocidad', 'Velocidad (Rápido a lento)')});
    document.getElementById('machine-order-inkType-asc').addEventListener('click', function(){ordering('ASC', 'tipoTinta', 'Tipo tinta (A a la Z)')});
    document.getElementById('machine-order-inkType-desc').addEventListener('click', function(){ordering('DESC', 'tipoTinta', 'Tipo tinta (Z a la A)')});
    document.getElementById('machine-order-status-asc').addEventListener('click', function(){ordering('activa', 'activa', 'Estatus (Solo activas)')});
    document.getElementById('machine-order-status-desc').addEventListener('click', function(){ordering('inactiva', 'inactiva', 'Estatus (Solo inactivas)')});
}

document.addEventListener('DOMContentLoaded', function(){
    search();
    filters();
});