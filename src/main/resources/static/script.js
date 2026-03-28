'use strict';

const API_BASE = 'http://localhost:8080/vehicles';

let allVehicles = [];
let editingId = null;
let confirmCallback = null;

const CAR_BRAND_LABELS = {
  TOYOTA: 'Toyota', VOLKSWAGEN: 'Volkswagen', CHEVROLET: 'Chevrolet',
  FIAT: 'Fiat', FORD: 'Ford', HONDA: 'Honda', HYUNDAI: 'Hyundai',
  NISSAN: 'Nissan', RENAULT: 'Renault', PEUGEOT: 'Peugeot',
  CITROEN: 'Citroën', JEEP: 'Jeep', MITSUBISHI: 'Mitsubishi',
  KIA: 'Kia', BMW: 'BMW', MERCEDES_BENZ: 'Mercedes-Benz', AUDI: 'Audi',
};

const MOTO_BRAND_LABELS = {
  HONDA: 'Honda', YAMAHA: 'Yamaha', SUZUKI: 'Suzuki',
  KAWASAKI: 'Kawasaki', BMW: 'BMW', HARLEY_DAVIDSON: 'Harley-Davidson',
  DUCATI: 'Ducati', KTM: 'KTM', TRIUMPH: 'Triumph', ROYAL_ENFIELD: 'Royal Enfield',
};

const COLOR_LABELS = {
  PRETO: 'Preto', BRANCO: 'Branco', PRATA: 'Prata',
  CINZA: 'Cinza', VERMELHO: 'Vermelho', AZUL: 'Azul', OUTRA: 'Outra',
};

const COLOR_HEX = {
  PRETO: '#1a1a1a', BRANCO: '#f0f0f0', PRATA: '#b0b8c1',
  CINZA: '#6b7280', VERMELHO: '#ef4444', AZUL: '#3b82f6', OUTRA: '#a78bfa',
};

// --- Helpers ---

function getBrandLabel(vehicle) {
  if (vehicle.type === 'MOTORCYCLE') {
    return MOTO_BRAND_LABELS[vehicle.motorcycleBrand] || vehicle.motorcycleBrand;
  }
  return CAR_BRAND_LABELS[vehicle.carBrand] || vehicle.carBrand;
}

function getBrandValue(vehicle) {
  return vehicle.type === 'MOTORCYCLE' ? vehicle.motorcycleBrand : vehicle.carBrand;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMileage(value) {
  return new Intl.NumberFormat('pt-BR').format(value) + ' km';
}

// --- API ---

async function apiFetchAll() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`Erro ao buscar veículos: ${res.status}`);
  return res.json();
}

async function apiFetchById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Veículo não encontrado: ${res.status}`);
  return res.json();
}

async function apiCreate(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Erro ao criar veículo: ${res.status} — ${errBody}`);
  }
  return res.json();
}

async function apiUpdate(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Erro ao atualizar veículo: ${res.status} — ${errBody}`);
  }
  return res.json();
}

async function apiDelete(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Erro ao excluir veículo: ${res.status}`);
}

// --- Toast ---

function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icon = type === 'success' ? '✓' : '✕';
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast__icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.25s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// --- Confirm dialog ---

function openConfirmDialog(message, onConfirm) {
  confirmCallback = onConfirm;
  document.getElementById('confirm-message').textContent = message;
  const overlay = document.getElementById('confirm-overlay');
  overlay.style.display = 'flex';
  overlay.offsetHeight;
}

function closeConfirmDialog() {
  document.getElementById('confirm-overlay').style.display = 'none';
  confirmCallback = null;
}

// --- Tabela ---

function renderRow(vehicle) {
  const colorLabel  = vehicle.color === 'OUTRA' && vehicle.customColor
      ? vehicle.customColor
      : (COLOR_LABELS[vehicle.color] || vehicle.color);
  const colorHex    = COLOR_HEX[vehicle.color] || '#a78bfa';
  const brandLabel  = getBrandLabel(vehicle);
  const typeIcon    = vehicle.type === 'MOTORCYCLE' ? '🏍️' : '🚗';
  const typeLabel   = vehicle.type === 'MOTORCYCLE' ? 'Moto' : 'Carro';
  const statusClass = vehicle.status === 'DISPONIVEL' ? 'disponivel' : 'vendido';
  const statusLabel = vehicle.status === 'DISPONIVEL' ? 'Disponível' : 'Vendido';

  return `
    <tr data-id="${vehicle.id}">
      <td>${vehicle.id}</td>
      <td>
        <span class="type-badge" title="${typeLabel}">${typeIcon} ${typeLabel}</span>
      </td>
      <td>
        <div class="vehicle-brand">
          <span class="vehicle-brand__name">${brandLabel}</span>
          <span class="vehicle-brand__model">${vehicle.model}</span>
        </div>
      </td>
      <td>${vehicle.version}</td>
      <td>${vehicle.vehicleYear}</td>
      <td>
        <div class="color-dot">
          <span class="color-dot__circle" style="background:${colorHex}"></span>
          ${colorLabel}
        </div>
      </td>
      <td class="mileage-value">${formatMileage(vehicle.mileage)}</td>
      <td><span class="price-value">${formatCurrency(vehicle.price)}</span></td>
      <td>
        <button
          class="badge badge--${statusClass}"
          data-id="${vehicle.id}"
          data-status="${vehicle.status}"
          title="Clique para alternar status"
          onclick="handleToggleStatus(${vehicle.id}, '${vehicle.status}')"
        >${statusLabel}</button>
      </td>
      <td class="td--actions">
        <div class="td-actions-inner">
          <button class="btn btn--icon btn--icon-edit" title="Editar veículo" onclick="handleEditClick(${vehicle.id})">✎</button>
          <button class="btn btn--icon btn--icon-delete" title="Excluir veículo" onclick="handleDeleteClick(${vehicle.id}, '${brandLabel} ${vehicle.model}')">✕</button>
        </div>
      </td>
    </tr>
  `;
}

function renderTable(vehicles) {
  const loading      = document.getElementById('loading');
  const emptyState   = document.getElementById('empty-state');
  const tableWrapper = document.getElementById('table-wrapper');
  const tbody        = document.getElementById('vehicles-tbody');

  loading.style.display = 'none';

  if (!vehicles || vehicles.length === 0) {
    emptyState.style.display   = 'flex';
    tableWrapper.style.display = 'none';
    return;
  }

  emptyState.style.display   = 'none';
  tableWrapper.style.display = 'block';
  tbody.innerHTML = vehicles.map(renderRow).join('');
}

function updateStats(vehicles) {
  const total      = vehicles.length;
  const cars       = vehicles.filter(v => v.type === 'CAR').length;
  const motos      = vehicles.filter(v => v.type === 'MOTORCYCLE').length;
  const disponivel = vehicles.filter(v => v.status === 'DISPONIVEL').length;
  const vendido    = vehicles.filter(v => v.status === 'VENDIDO').length;

  document.querySelector('#stat-total .stat-card__value').textContent      = total;
  document.querySelector('#stat-cars .stat-card__value').textContent       = cars;
  document.querySelector('#stat-motos .stat-card__value').textContent      = motos;
  document.querySelector('#stat-disponivel .stat-card__value').textContent = disponivel;
  document.querySelector('#stat-vendido .stat-card__value').textContent    = vendido;
}

// --- Filtros ---

function applyFilters() {
  const searchVal = document.getElementById('search-model').value.trim().toLowerCase();
  const typeVal   = document.getElementById('filter-type').value;
  const brandVal  = document.getElementById('filter-brand').value;
  const colorVal  = document.getElementById('filter-color').value;
  const statusVal = document.getElementById('filter-status').value;

  const filtered = allVehicles.filter(v => {
    const matchSearch = !searchVal || v.model.toLowerCase().includes(searchVal);
    const matchType   = !typeVal   || v.type === typeVal;
    const matchBrand  = !brandVal  || getBrandValue(v) === brandVal;
    const matchColor  = !colorVal  || v.color === colorVal;
    const matchStatus = !statusVal || v.status === statusVal;
    return matchSearch && matchType && matchBrand && matchColor && matchStatus;
  });

  renderTable(filtered);
}

function clearFilters() {
  document.getElementById('search-model').value  = '';
  document.getElementById('filter-type').value   = '';
  document.getElementById('filter-brand').value  = '';
  document.getElementById('filter-color').value  = '';
  document.getElementById('filter-status').value = '';
  renderTable(allVehicles);
}

// --- Modal / Formulário ---

function setVehicleType(type) {
  document.getElementById('field-type').value = type;

  document.getElementById('type-btn-car').classList.toggle('type-btn--active', type === 'CAR');
  document.getElementById('type-btn-moto').classList.toggle('type-btn--active', type === 'MOTORCYCLE');

  document.getElementById('group-car-brand').style.display  = type === 'CAR'        ? '' : 'none';
  document.getElementById('group-moto-brand').style.display = type === 'MOTORCYCLE' ? '' : 'none';

  // Limpa o campo da marca oposta
  if (type === 'CAR')        document.getElementById('field-moto-brand').value = '';
  if (type === 'MOTORCYCLE') document.getElementById('field-car-brand').value  = '';
}

function openModal(mode, vehicle = null) {
  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const btnText = document.getElementById('btn-submit-text');

  resetForm();

  if (mode === 'edit' && vehicle) {
    editingId = vehicle.id;
    title.textContent   = 'Editar Veículo';
    btnText.textContent = 'Salvar Alterações';

    const type = vehicle.type || 'CAR';
    setVehicleType(type);

    document.getElementById('vehicle-id').value    = vehicle.id;
    document.getElementById('field-model').value   = vehicle.model;
    document.getElementById('field-version').value = vehicle.version;
    document.getElementById('field-year').value    = vehicle.vehicleYear;
    document.getElementById('field-price').value   = vehicle.price;
    document.getElementById('field-mileage').value = vehicle.mileage;
    document.getElementById('field-color').value   = vehicle.color;
    document.getElementById('field-status').value  = vehicle.status;

    if (type === 'CAR')        document.getElementById('field-car-brand').value  = vehicle.carBrand  || '';
    if (type === 'MOTORCYCLE') document.getElementById('field-moto-brand').value = vehicle.motorcycleBrand || '';

    if (vehicle.color === 'OUTRA') {
      document.getElementById('custom-color-group').style.display = 'flex';
      document.getElementById('field-custom-color').value = vehicle.customColor || '';
    }
  } else {
    editingId = null;
    title.textContent   = 'Novo Veículo';
    btnText.textContent = 'Salvar Veículo';
    setVehicleType('CAR');
  }

  overlay.classList.add('is-open');
  document.getElementById('field-model').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('is-open');
  resetForm();
  editingId = null;
}

function resetForm() {
  document.getElementById('vehicle-form').reset();
  document.getElementById('vehicle-id').value = '';
  document.getElementById('custom-color-group').style.display = 'none';
  document.getElementById('field-custom-color').value = '';
  setVehicleType('CAR');
  clearFieldErrors();
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.input.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

function setFieldError(fieldId, errId, message) {
  const el = document.getElementById(fieldId);
  if (el) el.classList.add('is-invalid');
  const errEl = document.getElementById(errId);
  if (errEl) errEl.textContent = message;
}

function validateForm() {
  clearFieldErrors();
  let valid = true;

  const type    = document.getElementById('field-type').value;
  const carBrand  = document.getElementById('field-car-brand').value;
  const motoBrand = document.getElementById('field-moto-brand').value;
  const model   = document.getElementById('field-model').value.trim();
  const version = document.getElementById('field-version').value.trim();
  const year    = document.getElementById('field-year').value;
  const price   = document.getElementById('field-price').value;
  const mileage = document.getElementById('field-mileage').value;
  const color   = document.getElementById('field-color').value;
  const custom  = document.getElementById('field-custom-color').value.trim();
  const status  = document.getElementById('field-status').value;

  if (type === 'CAR' && !carBrand) {
    setFieldError('field-car-brand', 'err-car-brand', 'Selecione a marca.'); valid = false;
  }
  if (type === 'MOTORCYCLE' && !motoBrand) {
    setFieldError('field-moto-brand', 'err-moto-brand', 'Selecione a marca.'); valid = false;
  }

  if (!model)   { setFieldError('field-model',   'err-model',   'Informe o modelo.');        valid = false; }
  if (!version) { setFieldError('field-version', 'err-version', 'Informe a versão.');        valid = false; }

  if (!year) {
    setFieldError('field-year', 'err-year', 'Informe o ano.'); valid = false;
  } else if (Number(year) < 1900 || Number(year) > 2099) {
    setFieldError('field-year', 'err-year', 'Ano inválido (1900–2099).'); valid = false;
  }

  if (!price || Number(price) <= 0) {
    setFieldError('field-price', 'err-price', 'Informe um preço válido.'); valid = false;
  }

  if (mileage === '' || Number(mileage) < 0) {
    setFieldError('field-mileage', 'err-mileage', 'Informe a quilometragem.'); valid = false;
  }

  if (!color)  { setFieldError('field-color',  'err-color',  'Selecione a cor.'); valid = false; }

  if (color === 'OUTRA' && !custom) {
    setFieldError('field-custom-color', 'err-custom-color', 'Informe a cor personalizada.'); valid = false;
  }

  if (!status) { setFieldError('field-status', 'err-status', 'Selecione o status.'); valid = false; }

  if (!valid) return null;

  const data = {
    type,
    model,
    version,
    vehicleYear: Number(year),
    price:       Number(price),
    mileage:     Number(mileage),
    color,
    status,
  };

  if (type === 'CAR')        data.carBrand        = carBrand;
  if (type === 'MOTORCYCLE') data.motorcycleBrand = motoBrand;
  if (color === 'OUTRA')     data.customColor     = custom;

  return data;
}

// --- Carregamento ---

async function loadVehicles() {
  const loading      = document.getElementById('loading');
  const tableWrapper = document.getElementById('table-wrapper');
  const emptyState   = document.getElementById('empty-state');

  loading.style.display      = 'flex';
  tableWrapper.style.display = 'none';
  emptyState.style.display   = 'none';

  try {
    allVehicles = await apiFetchAll();
    updateStats(allVehicles);
    applyFilters();
  } catch (err) {
    console.error(err);
    loading.style.display = 'none';
    showToast('Não foi possível carregar os veículos. Verifique se o backend está rodando.', 'error', 5000);
  }
}

// --- Handlers ---

async function handleEditClick(id) {
  try {
    const vehicle = await apiFetchById(id);
    openModal('edit', vehicle);
  } catch (err) {
    console.error(err);
    showToast('Erro ao carregar os dados do veículo.', 'error');
  }
}

function handleDeleteClick(id, label) {
  openConfirmDialog(
      `Tem certeza que deseja excluir "${label}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          await apiDelete(id);
          allVehicles = allVehicles.filter(v => v.id !== id);
          updateStats(allVehicles);
          applyFilters();
          showToast('Veículo excluído com sucesso.', 'success');
        } catch (err) {
          console.error(err);
          showToast('Erro ao excluir o veículo.', 'error');
        } finally {
          closeConfirmDialog();
        }
      }
  );
}

async function handleToggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'DISPONIVEL' ? 'VENDIDO' : 'DISPONIVEL';
  const label     = newStatus === 'DISPONIVEL' ? 'Disponível' : 'Vendido';
  try {
    const vehicle = await apiFetchById(id);
    const updated = { ...vehicle, status: newStatus };
    await apiUpdate(id, updated);
    const idx = allVehicles.findIndex(v => v.id === id);
    if (idx !== -1) allVehicles[idx].status = newStatus;
    updateStats(allVehicles);
    applyFilters();
    showToast(`Status alterado para ${label}.`, 'success');
  } catch (err) {
    console.error(err);
    showToast('Erro ao alterar o status.', 'error');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const data = validateForm();
  if (!data) return;

  const btn     = document.getElementById('btn-submit-form');
  const btnText = document.getElementById('btn-submit-text');
  btn.disabled  = true;
  btnText.textContent = 'Salvando...';

  try {
    if (editingId) {
      const updated = await apiUpdate(editingId, data);
      const idx = allVehicles.findIndex(v => v.id === editingId);
      if (idx !== -1) allVehicles[idx] = updated;
      showToast('Veículo atualizado com sucesso!', 'success');
    } else {
      const created = await apiCreate(data);
      allVehicles.push(created);
      showToast('Veículo cadastrado com sucesso!', 'success');
    }
    updateStats(allVehicles);
    applyFilters();
    closeModal();
  } catch (err) {
    console.error(err);
    showToast(`Erro: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btnText.textContent = editingId ? 'Salvar Alterações' : 'Salvar Veículo';
  }
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('btn-open-modal').addEventListener('click', () => openModal('create'));
  document.getElementById('btn-open-modal-empty').addEventListener('click', () => openModal('create'));
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-form').addEventListener('click', closeModal);

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Botões de tipo de veículo
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setVehicleType(btn.dataset.value); });
  });

  document.getElementById('vehicle-form').addEventListener('submit', handleFormSubmit);

  document.getElementById('field-color').addEventListener('change', (e) => {
    const group = document.getElementById('custom-color-group');
    if (e.target.value === 'OUTRA') {
      group.style.display = 'flex';
      document.getElementById('field-custom-color').focus();
    } else {
      group.style.display = 'none';
      document.getElementById('field-custom-color').value = '';
      document.getElementById('field-custom-color').classList.remove('is-invalid');
      document.getElementById('err-custom-color').textContent = '';
    }
  });

  document.getElementById('search-model').addEventListener('input', applyFilters);
  document.getElementById('filter-type').addEventListener('change', applyFilters);
  document.getElementById('filter-brand').addEventListener('change', applyFilters);
  document.getElementById('filter-color').addEventListener('change', applyFilters);
  document.getElementById('filter-status').addEventListener('change', applyFilters);
  document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);

  document.getElementById('btn-confirm-ok').addEventListener('click', () => {
    if (typeof confirmCallback === 'function') confirmCallback();
  });
  document.getElementById('btn-confirm-cancel').addEventListener('click', closeConfirmDialog);
  document.getElementById('confirm-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('confirm-overlay')) closeConfirmDialog();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('confirm-overlay').style.display === 'flex') {
        closeConfirmDialog();
      } else if (document.getElementById('modal-overlay').classList.contains('is-open')) {
        closeModal();
      }
    }
  });

  loadVehicles();
});
