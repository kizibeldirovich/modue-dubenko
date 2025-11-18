const PRODUCTS = ['Ford Mustang', 'Chevrolet Camaro', 'Dodge Challenger', 'BMW M4', 'Audi RS5',
    'Toyota Camry', 'Honda Accord', 'BMW 5 Series', 'Mercedes E-Class', 'Audi A6',
    'Lamborghini Aventador', 'Ferrari 488 GTB', 'McLaren 720S', 'Porsche 911 Turbo S', 'Audi R8'];
const COLORS = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#dc3545', '#ffc107', '#0dcaf0', '#d63384', '#fd7e14', '#198754', '#0d6efd', '#6f42c1', '#fd7e14', '#198754', '#0dcaf0'];
const DATES = ['2025-11-10', '2025-11-11', '2025-11-12', '2025-11-13', '2025-11-14', '2025-11-15', '2025-11-16'];

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(d);
}

function drawAdminCharts() {
    const rows = [...document.querySelectorAll('#salesBody tr')];
    const data = {};
    let total = 0;
    rows.forEach(r => {
        const date = r.cells[0].textContent.trim();
        const prod = r.cells[1].textContent.trim();
        const qty = parseInt(r.cells[2].textContent) || 0;
        if (!data[date]) data[date] = {};
        data[date][prod] = qty;
        total += qty;
    });
    document.getElementById('totalQty').textContent = total;

    const dates = Object.keys(data).sort();
    const pieCont = document.getElementById('pieContainer');
    pieCont.innerHTML = '';
    dates.forEach(d => {
        const card = document.createElement('div');
        card.className = 'pie-card card shadow-sm';
        card.innerHTML = `<div class="card-body p-3">
<div class="text-center fw-semibold small mb-2">${formatDate(d)}</div>
<div id="pie_${d}" style="height:180px"></div>
</div>`;
        pieCont.appendChild(card);

        const arr = [['Автомобіль', 'Кількість']];
        PRODUCTS.forEach(p => arr.push([p, data[d][p] || 0]));
        const dt = google.visualization.arrayToDataTable(arr);
        new google.visualization.PieChart(document.getElementById(`pie_${d}`)).draw(dt, {
            colors: COLORS, legend: { position: 'bottom' }, pieSliceText: 'value',
            chartArea: { width: '90%', height: '80%' }, backgroundColor: 'transparent'
        });
    });

    // Стовпчасті діаграми
    const abs = [['Дата', ...PRODUCTS]];
    const pct = [['Дата', ...PRODUCTS]];
    dates.forEach(d => {
        const dayTotal = PRODUCTS.reduce((s, p) => s + (data[d][p] || 0), 0) || 1;
        const rowAbs = [formatDate(d)];
        const rowPct = [formatDate(d)];
        PRODUCTS.forEach(p => {
            const q = data[d][p] || 0;
            rowAbs.push(q);
            rowPct.push(q / dayTotal);
        });
        abs.push(rowAbs);
        pct.push(rowPct);
    });

    new google.visualization.ColumnChart(document.getElementById('stackedAbsolute')).draw(
        google.visualization.arrayToDataTable(abs), {
        title: 'Кількість орендованих авто (абсолютні значення)', colors: COLORS, isStacked: true,
        legend: { position: 'top' }, vAxis: { title: 'Кількість' }, hAxis: { title: 'Дата' },
        chartArea: { width: '85%', height: '70%' }
    });

    new google.visualization.ColumnChart(document.getElementById('stackedPercent')).draw(
        google.visualization.arrayToDataTable(pct), {
        title: 'Частка авто в оренді (%)', colors: COLORS, isStacked: true,
        legend: { position: 'top' }, vAxis: { format: 'percent', title: '%' }, hAxis: { title: 'Дата' },
        chartArea: { width: '85%', height: '70%' }
    });
}

window.redrawCharts = drawAdminCharts;
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawAdminCharts);
window.addEventListener('resize', drawAdminCharts);