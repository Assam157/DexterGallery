export function setupUI() {
  return {
    az: document.getElementById('az'),
    alt: document.getElementById('alt'),
    localTime: document.getElementById('localTime'),
    nearest: document.getElementById('nearest'),
    skyInfo: document.getElementById('skyInfo')
  };
}

export function updateUI(ui, data) {
  ui.az.textContent = data.az.toFixed(1);
  ui.alt.textContent = data.alt.toFixed(1);
  ui.localTime.textContent = data.localTime;
  ui.nearest.textContent = data.nearest || '--';
  ui.skyInfo.textContent = data.skyInfo || 'Target: --';
}
