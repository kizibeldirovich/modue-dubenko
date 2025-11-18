const DATES = ['2025-11-10', '2025-11-11', '2025-11-12', '2025-11-13', '2025-11-14', '2025-11-15', '2025-11-16'];

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(d);
}

function drawProfitCharts() {
    const rows = [...document.querySelectorAll('#profitTable tbody tr')];
    let totalRev = 0, totalProf = 0;
    const carStats = {};

    rows.forEach(r => {
        const qty = Number(r.cells[2].textContent);
        const price = Number(r.cells[3].textContent);
        const unitProfit = Number(r.cells[4].textContent);
        const rev = qty * price;
        const prof = qty * unitProfit;

        r.cells[5].textContent = rev.toLocaleString('uk-UA');
        r.cells[6].textContent = prof.toLocaleString('uk-UA');

        totalRev += rev;
        totalProf += prof;

        const car = r.cells[1].textContent.trim();
        carStats[car] = carStats[car] || { rev: 0, prof: 0 };
        carStats[car].rev += rev;
        carStats[car].prof += prof;
    });

    document.getElementById('totalRev').textContent = totalRev.toLocaleString('uk-UA');
    document.getElementById('totalProf').textContent = totalProf.toLocaleString('uk-UA');

    const top6 = Object.entries(carStats)
        .sort((a, b) => b[1].prof - a[1].prof)
        .slice(0, 6)
        .map(e => e[0]);

    const top6Set = new Set(top6);

    const TOP_COLORS = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#dc3545', '#ffc107'];

    const revenueData = [['Дата', ...top6, 'Загальна виручка', 'Інші (виручка)']];
    const profitData = [['Дата', ...top6, 'Загальний прибуток', 'Інші (прибуток)']];

    DATES.forEach(date => {
        const dayRows = rows.filter(r => r.cells[0].textContent.trim() === date);

        const dayMap = {};
        let dayTotalRev = 0;
        let dayTotalProf = 0;

        dayRows.forEach(r => {
            const car = r.cells[1].textContent.trim();
            const rev = Number(r.cells[5].textContent.replace(/\s/g, ''));
            const prof = Number(r.cells[6].textContent.replace(/\s/g, ''));
            dayMap[car] = { rev, prof };
            dayTotalRev += rev;
            dayTotalProf += prof;
        });

        const revRow = [formatDate(date)];
        const profRow = [formatDate(date)];

        let othersRev = dayTotalRev;
        let othersProf = dayTotalProf;

        top6.forEach(car => {
            const val = dayMap[car] || { rev: 0, prof: 0 };
            revRow.push(val.rev);
            profRow.push(val.prof);
            othersRev -= val.rev;
            othersProf -= val.prof;
        });

        revRow.push(dayTotalRev);
        revRow.push(Math.max(0, othersRev));
        profRow.push(dayTotalProf);
        profRow.push(Math.max(0, othersProf));

        revenueData.push(revRow);
        profitData.push(profRow);
    });

    const makeSeries = () => {
        const s = {};
        top6.forEach((_, i) => {
            s[i] = { lineWidth: 3, pointSize: 5 };
        });
        s[top6.length] = { lineWidth: 6, pointSize: 8 };
        s[top6.length + 1] = { lineWidth: 2, lineDashStyle: [6, 4], pointSize: 0 };
        return s;
    };

    const revenueSeries = makeSeries();
    const profitSeries = makeSeries();

    top6.forEach((_, i) => {
        revenueSeries[i] = {
            lineWidth: 3,
            pointSize: 4,
            lineDashStyle: [8, 5]
        };
    });

    const commonOptions = {
        legend: { position: 'top', alignment: 'center', maxLines: 4 },
        chartArea: { width: '85%', height: '70%' },
        vAxis: { format: '#,### ₴', titleTextStyle: { italic: false } },
        hAxis: { title: 'Дата' },
        curveType: 'function',
        pointsVisible: true,
        tooltip: { isHtml: true }
    };

    new google.visualization.LineChart(document.getElementById('lineRevenue')).draw(
        google.visualization.arrayToDataTable(revenueData),
        {
            ...commonOptions,
            title: 'Виручка по днях',
            colors: [...TOP_COLORS, '#0c4128', '#999999'],
            series: revenueSeries,
            vAxis: { title: 'Виручка, грн' }
        }
    );

    new google.visualization.LineChart(document.getElementById('lineProfit')).draw(
        google.visualization.arrayToDataTable(profitData),
        {
            ...commonOptions,
            title: 'Прибуток по днях',
            colors: [...TOP_COLORS, '#0c4128', '#999999'],
            series: profitSeries,
            vAxis: { title: 'Прибуток, грн' }
        }
    );
}

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawProfitCharts);
window.redrawCharts = drawProfitCharts;
window.addEventListener('resize', () => setTimeout(drawProfitCharts, 100));