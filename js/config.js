let productData = {}; // 共用記憶體資料

document.addEventListener('DOMContentLoaded', () => {
  loadProducts(); // 頁面載入時先載入 localStorage 或 JSON

  // 點設定 tab 時產生動態欄位
  document.querySelector('a[href="#tab-settings"]').addEventListener('click', renderSettingsTable);

  // 新增商品表單提交
  document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const category = document.getElementById('category').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const unit = document.getElementById('unit').value.trim();
    const price = parseFloat(document.getElementById('price').value);

    if (!category || !name || !unit || isNaN(price)) return;

    if (!productData[category]) productData[category] = {};
    if (!productData[category][name]) productData[category][name] = { units: {} };
    productData[category][name].units[unit] = price;

    this.reset(); // 清空表單
    renderSettingsTable(); // 更新設定顯示（但不存 local）
  });

  // 匯入 JSON 檔案
  document.getElementById('upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        productData = JSON.parse(event.target.result); // 只更新記憶體
        renderSettingsTable();
        showImportAlert();
      } catch {
        alert("JSON 格式錯誤");
      }
    };
    reader.readAsText(file);
  });
});
function showImportAlert() {
  const alertPlaceholder = document.getElementById('import-alert-placeholder');
  alertPlaceholder.innerHTML = `
    <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
      已匯入商品設定，請確認內容後點 <strong>「儲存設定」</strong> 才會保存在瀏覽器。
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

// 動態產生設定表格與儲存按鈕
function renderSettingsTable() {
  const tab = document.getElementById('tab-settings');
  let container = document.getElementById('settings-table');
  if (!container) {
    container = document.createElement('div');
    container.id = 'settings-table';
    tab.appendChild(container);
  }
  container.innerHTML = ''; // 清空舊內容

  Object.entries(productData).forEach(([category, items]) => {
    Object.entries(items).forEach(([name, detail]) => {
      Object.entries(detail.units).forEach(([unit, price]) => {
        container.appendChild(createEditableRow(category, name, unit, price));
      });
    });
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary mt-3';
  saveBtn.textContent = '儲存設定';
  saveBtn.onclick = saveSettingsFromInputs;
  container.appendChild(saveBtn);
}

// 建立每列可編輯欄位
function createEditableRow(category, name, unit, price) {
  const row = document.createElement('div');
  row.className = 'row g-2 align-items-center mb-2 setting-row';

  row.innerHTML = `
    <div class="col-md-2"><input type="text" class="form-control category" value="${category}"></div>
    <div class="col-md-3"><input type="text" class="form-control name" value="${name}"></div>
    <div class="col-md-2"><input type="text" class="form-control unit" value="${unit}"></div>
    <div class="col-md-2"><input type="number" class="form-control price" value="${price}"></div>
    <div class="col-md-3"><button type="button" class="btn btn-danger btn-remove w-100">刪除</button></div>
  `;

  // 刪除按鈕功能
  row.querySelector('.btn-remove').onclick = () => row.remove();

  return row;
}

// 儲存所有設定（更新 localStorage）
function saveSettingsFromInputs() {
  const newData = {};
  const rows = document.querySelectorAll('.setting-row');

  rows.forEach(row => {
    const category = row.querySelector('.category').value.trim();
    const name = row.querySelector('.name').value.trim();
    const unit = row.querySelector('.unit').value.trim();
    const price = parseFloat(row.querySelector('.price').value);

    if (!category || !name || !unit || isNaN(price)) return;

    if (!newData[category]) newData[category] = {};
    if (!newData[category][name]) newData[category][name] = { units: {} };
    newData[category][name].units[unit] = price;
  });

  productData = newData;
  saveProducts(); // 寫入 localStorage
  alert('設定已儲存');
}

// 存進 localStorage
function saveProducts() {
  localStorage.setItem('productData', JSON.stringify(productData));
}

// 讀 localStorage 或 fallback 載入 JSON
function loadProducts() {
  const saved = localStorage.getItem('productData');
  if (saved) {
    try {
      productData = JSON.parse(saved);
    } catch {
      fetchAndInitDefault();
    }
  } else {
    fetchAndInitDefault();
  }
}

// fallback 從 products.json 載入
function fetchAndInitDefault() {
  fetch('data/products.json')
    .then(res => res.json())
    .then(data => {
      productData = data;
    })
    .catch(err => console.error("無法載入預設商品資料", err));
}

// 匯出 JSON 檔案
function downloadProducts() {
  const blob = new Blob([JSON.stringify(productData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product-settings.json";
  a.click();
  URL.revokeObjectURL(url);
}
