document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const update = () => {
    const dark = document.body.getAttribute('data-bs-theme') === 'dark';
    btn.innerHTML = dark
      ? '<i class="bi bi-sun-fill"></i> Світла'
      : '<i class="bi bi-moon-fill"></i> Темна';
  };
  btn.addEventListener('click', () => {
    const dark = document.body.getAttribute('data-bs-theme') === 'dark';
    document.body.setAttribute('data-bs-theme', dark ? 'light' : 'dark');
    update();
    if (typeof redrawCharts === 'function') redrawCharts();
  });
  update();
});
