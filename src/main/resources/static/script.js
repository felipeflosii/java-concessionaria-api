'use strict';

const API = {
  vehicles: '/vehicles',
  cars: '/cars',
  motorcycles: '/motorcycles',
  customers: '/customers',
  sales: '/sales'
};

const qs = (s) => document.querySelector(s);
const byId = (id) => document.getElementById(id);

function showToast(message, isError = false) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.className = `toast show ${isError ? 'error' : 'success'}`;
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function output(data) {
  byId('api-output').textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const text = await res.text();
  const body = text ? JSON.parse(text || '{}') : null;

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }
  return body;
}

function getVehiclePayload() {
  const type = byId('vehicle-type').value;
  return {
    type,
    model: byId('vehicle-model').value.trim(),
    version: byId('vehicle-version').value.trim(),
    vehicleYear: Number(byId('vehicle-year').value),
    price: Number(byId('vehicle-price').value),
    mileage: Number(byId('vehicle-mileage').value),
    color: byId('vehicle-color').value,
    customColor: byId('vehicle-custom-color').value.trim() || null,
    status: byId('vehicle-status').value,
    carBrand: type === 'CAR' ? (byId('vehicle-car-brand').value || null) : null,
    motorcycleBrand: type === 'MOTORCYCLE' ? (byId('vehicle-moto-brand').value || null) : null
  };
}

function fillVehicleForm(v) {
  byId('vehicle-id').value = v.id || '';
  byId('vehicle-type').value = v.type || 'CAR';
  byId('vehicle-model').value = v.model || '';
  byId('vehicle-version').value = v.version || '';
  byId('vehicle-year').value = v.vehicleYear || '';
  byId('vehicle-price').value = v.price || '';
  byId('vehicle-mileage').value = v.mileage || '';
  byId('vehicle-color').value = v.color || 'PRETO';
  byId('vehicle-custom-color').value = v.customColor || '';
  byId('vehicle-status').value = v.status || 'DISPONIVEL';
  byId('vehicle-car-brand').value = v.carBrand || '';
  byId('vehicle-moto-brand').value = v.motorcycleBrand || '';
}

function clearVehicleForm() {
  fillVehicleForm({});
}

async function renderVehiclesTable() {
  try {
    const items = await api(API.vehicles);
    const tbody = byId('vehicles-tbody');
    tbody.innerHTML = items.map(v => `
      <tr>
        <td>${v.id}</td>
        <td>${v.type || ''}</td>
        <td>${v.carBrand || v.motorcycleBrand || '-'}</td>
        <td>${v.model || ''}</td>
        <td>${v.vehicleYear || ''}</td>
        <td>${v.price || ''}</td>
        <td>${v.status || ''}</td>
        <td>
          <button data-edit-vehicle="${v.id}">Editar</button>
          <button class="danger" data-del-vehicle="${v.id}">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    showToast(`Falha ao listar vehicles: ${e.message}`, true);
  }
}

function getCustomerPayload() {
  return {
    name: byId('customer-name').value.trim(),
    cpf: byId('customer-cpf').value.trim(),
    email: byId('customer-email').value.trim(),
    phone: byId('customer-phone').value.trim() || null
  };
}

function fillCustomerForm(c) {
  byId('customer-id').value = c.id || '';
  byId('customer-name').value = c.name || '';
  byId('customer-cpf').value = c.cpf || '';
  byId('customer-email').value = c.email || '';
  byId('customer-phone').value = c.phone || '';
}

async function renderCustomersTable() {
  try {
    const items = await api(API.customers);
    byId('customers-tbody').innerHTML = items.map(c => `
      <tr>
        <td>${c.id}</td><td>${c.name || ''}</td><td>${c.cpf || ''}</td><td>${c.email || ''}</td><td>${c.phone || ''}</td>
        <td>
          <button data-edit-customer="${c.id}">Editar</button>
          <button class="danger" data-del-customer="${c.id}">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    showToast(`Falha ao listar customers: ${e.message}`, true);
  }
}

function getSalePayload() {
  return {
    vehicleId: Number(byId('sale-vehicle-id').value),
    customerId: Number(byId('sale-customer-id').value),
    finalPrice: Number(byId('sale-final-price').value)
  };
}

function fillSaleForm(s) {
  byId('sale-id').value = s.id || '';
  byId('sale-vehicle-id').value = s.vehicle?.id || s.vehicleId || '';
  byId('sale-customer-id').value = s.customer?.id || s.customerId || '';
  byId('sale-final-price').value = s.finalPrice || '';
}

async function renderSalesTable() {
  try {
    const items = await api(API.sales);
    byId('sales-tbody').innerHTML = items.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.vehicle?.id ?? '-'}</td>
        <td>${s.customer?.id ?? '-'}</td>
        <td>${s.finalPrice ?? ''}</td>
        <td>${s.saleDate ?? ''}</td>
        <td>
          <button data-edit-sale="${s.id}">Editar</button>
          <button class="danger" data-del-sale="${s.id}">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    showToast(`Falha ao listar sales: ${e.message}`, true);
  }
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      byId(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

function bindVehicleActions() {
  byId('vehicle-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = byId('vehicle-id').value;
    try {
      const payload = getVehiclePayload();
      const data = id
        ? await api(`${API.vehicles}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await api(API.vehicles, { method: 'POST', body: JSON.stringify(payload) });
      output(data);
      showToast(`Vehicle ${id ? 'atualizado' : 'criado'} com sucesso.`);
      clearVehicleForm();
      await renderVehiclesTable();
    } catch (err) {
      output(err.message);
      showToast(`Erro em vehicle: ${err.message}`, true);
    }
  });

  byId('vehicle-reset').addEventListener('click', clearVehicleForm);
  byId('btn-list-vehicles').addEventListener('click', async () => output(await api(API.vehicles)));
  byId('btn-list-cars').addEventListener('click', async () => output(await api(API.cars)));
  byId('btn-list-motorcycles').addEventListener('click', async () => output(await api(API.motorcycles)));

  byId('btn-get-vehicle').addEventListener('click', async () => output(await api(`${API.vehicles}/${byId('vehicle-get-id').value}`)));
  byId('btn-get-car').addEventListener('click', async () => output(await api(`${API.cars}/${byId('vehicle-get-id').value}`)));
  byId('btn-get-motorcycle').addEventListener('click', async () => output(await api(`${API.motorcycles}/${byId('vehicle-get-id').value}`)));
  byId('btn-delete-vehicle').addEventListener('click', async () => {
    await api(`${API.vehicles}/${byId('vehicle-get-id').value}`, { method: 'DELETE' });
    showToast('Vehicle excluído com sucesso.');
    await renderVehiclesTable();
  });

  byId('vehicles-tbody').addEventListener('click', async (e) => {
    const editId = e.target.dataset.editVehicle;
    const delId = e.target.dataset.delVehicle;
    if (editId) {
      const item = await api(`${API.vehicles}/${editId}`);
      fillVehicleForm(item);
      output(item);
    }
    if (delId) {
      await api(`${API.vehicles}/${delId}`, { method: 'DELETE' });
      showToast('Vehicle excluído com sucesso.');
      await renderVehiclesTable();
    }
  });
}

function bindCustomerActions() {
  byId('customer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = byId('customer-id').value;
    const payload = getCustomerPayload();
    try {
      const data = id
        ? await api(`${API.customers}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await api(API.customers, { method: 'POST', body: JSON.stringify(payload) });
      output(data);
      showToast(`Customer ${id ? 'atualizado' : 'criado'} com sucesso.`);
      fillCustomerForm({});
      await renderCustomersTable();
    } catch (err) {
      output(err.message);
      showToast(`Erro em customer: ${err.message}`, true);
    }
  });

  byId('customer-reset').addEventListener('click', () => fillCustomerForm({}));
  byId('btn-list-customers').addEventListener('click', async () => output(await api(API.customers)));
  byId('btn-get-customer').addEventListener('click', async () => output(await api(`${API.customers}/${byId('customer-get-id').value}`)));
  byId('btn-delete-customer').addEventListener('click', async () => {
    await api(`${API.customers}/${byId('customer-get-id').value}`, { method: 'DELETE' });
    showToast('Customer excluído com sucesso.');
    await renderCustomersTable();
  });

  byId('customers-tbody').addEventListener('click', async (e) => {
    const editId = e.target.dataset.editCustomer;
    const delId = e.target.dataset.delCustomer;
    if (editId) {
      const item = await api(`${API.customers}/${editId}`);
      fillCustomerForm(item);
      output(item);
    }
    if (delId) {
      await api(`${API.customers}/${delId}`, { method: 'DELETE' });
      showToast('Customer excluído com sucesso.');
      await renderCustomersTable();
    }
  });
}

function bindSaleActions() {
  byId('sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = byId('sale-id').value;
    const payload = getSalePayload();
    try {
      const data = id
        ? await api(`${API.sales}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await api(API.sales, { method: 'POST', body: JSON.stringify(payload) });
      output(data);
      showToast(`Sale ${id ? 'atualizada' : 'criada'} com sucesso.`);
      fillSaleForm({});
      await renderSalesTable();
    } catch (err) {
      output(err.message);
      showToast(`Erro em sale: ${err.message}`, true);
    }
  });

  byId('sale-reset').addEventListener('click', () => fillSaleForm({}));
  byId('btn-list-sales').addEventListener('click', async () => output(await api(API.sales)));
  byId('btn-get-sale').addEventListener('click', async () => output(await api(`${API.sales}/${byId('sale-get-id').value}`)));
  byId('btn-delete-sale').addEventListener('click', async () => {
    await api(`${API.sales}/${byId('sale-get-id').value}`, { method: 'DELETE' });
    showToast('Sale excluída com sucesso.');
    await renderSalesTable();
  });

  byId('sales-tbody').addEventListener('click', async (e) => {
    const editId = e.target.dataset.editSale;
    const delId = e.target.dataset.delSale;
    if (editId) {
      const item = await api(`${API.sales}/${editId}`);
      fillSaleForm(item);
      output(item);
    }
    if (delId) {
      await api(`${API.sales}/${delId}`, { method: 'DELETE' });
      showToast('Sale excluída com sucesso.');
      await renderSalesTable();
    }
  });
}

async function init() {
  initTabs();
  bindVehicleActions();
  bindCustomerActions();
  bindSaleActions();
  await Promise.allSettled([renderVehiclesTable(), renderCustomersTable(), renderSalesTable()]);
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch(err => {
    output(err.message);
    showToast(err.message, true);
  });
});
