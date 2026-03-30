'use strict';

const BASE_URL = 'http://localhost:8080';

const outputEl = document.getElementById('output');

async function callApi(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const body = await response.json();
  return { status: response.status, body };
}

function printResult(title, payload) {
  outputEl.textContent = `${title}\n\n${JSON.stringify(payload, null, 2)}`;
}

document.getElementById('btn-health').addEventListener('click', async () => {
  try {
    const payload = await callApi('/health');
    printResult('Health check', payload);
  } catch (error) {
    printResult('Health check error', { message: error.message });
  }
});

document.getElementById('btn-vehicles').addEventListener('click', async () => {
  try {
    const payload = await callApi('/vehicles');
    printResult('Vehicles', payload);
  } catch (error) {
    printResult('Vehicles error', { message: error.message });
  }
});

document.getElementById('btn-motorcycles').addEventListener('click', async () => {
  try {
    const payload = await callApi('/motorcycles');
    printResult('Motorcycles', payload);
  } catch (error) {
    printResult('Motorcycles error', { message: error.message });
  }
});

document.getElementById('btn-customers').addEventListener('click', async () => {
  try {
    const payload = await callApi('/customers');
    printResult('Customers', payload);
  } catch (error) {
    printResult('Customers error', { message: error.message });
  }
});

document.getElementById('btn-sales').addEventListener('click', async () => {
  try {
    const payload = await callApi('/sales');
    printResult('Sales', payload);
  } catch (error) {
    printResult('Sales error', { message: error.message });
  }
});
