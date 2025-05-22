function renderProducts() {
  document.getElementById('product-blocks').innerHTML = '';
}
let productRowCount = 0;
function addProductRow() {
  const container = document.getElementById('product-blocks');

  // 加入標題欄
  if (productRowCount === 0) {
    const header = document.createElement('div');
    header.className = 'row fw-bold mb-2';
    header.innerHTML = `
      <div class="col-md-2">分類</div>
      <div class="col-md-2">商品</div>
      <div class="col-md-1">單位</div>
      <div class="col-md-1">單價</div>
      <div class="col-md-1">數量</div>
      <div class="col-md-2">小計</div>
      <div class="col-md-1">操作</div>
    `;
    container.appendChild(header);
  }

  const row = document.createElement('div');
  row.className = 'row align-items-end mb-2 product-row';

  // 分類
  const colCategory = document.createElement('div');
  colCategory.className = 'col-md-2';
  const categorySelect = document.createElement('select');
  categorySelect.className = 'form-select';
  categorySelect.innerHTML = `<option value="">選分類</option>` +
    Object.keys(productData).map(cat => `<option value="${cat}">${cat}</option>`).join('');
  colCategory.appendChild(categorySelect);

  // 商品
  const colProduct = document.createElement('div');
  colProduct.className = 'col-md-2';
  const productSelect = document.createElement('select');
  productSelect.className = 'form-select';
  productSelect.name = 'product';
  productSelect.disabled = true;
  colProduct.appendChild(productSelect);

  // 單位
  const colUnit = document.createElement('div');
  colUnit.className = 'col-md-1';
  const unitSelect = document.createElement('select');
  unitSelect.className = 'form-select';
  unitSelect.disabled = true;
  colUnit.appendChild(unitSelect);

  // 單價
  const colPrice = document.createElement('div');
  colPrice.className = 'col-md-1';
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.className = 'form-control';
  priceInput.readOnly = true;
  colPrice.appendChild(priceInput);

  // 數量
  const colQty = document.createElement('div');
  colQty.className = 'col-md-1';
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.className = 'form-control';
  qtyInput.placeholder = '數量';
  colQty.appendChild(qtyInput);

  // 小計
  const colSubtotal = document.createElement('div');
  colSubtotal.className = 'col-md-2';
  const subtotalDisplay = document.createElement('input');
  subtotalDisplay.type = 'text';
  subtotalDisplay.className = 'form-control';
  subtotalDisplay.readOnly = true;
  subtotalDisplay.value = '0';
  colSubtotal.appendChild(subtotalDisplay);

  // 刪除按鈕
  const colDelete = document.createElement('div');
  colDelete.className = 'col-md-1';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger w-100';
  deleteBtn.textContent = '刪除';
  deleteBtn.onclick = () => {
    row.remove();
    productRowCount--;
    if (productRowCount === 0) {
        container.innerHTML = '';
    } else {
        refreshProductOptions(); // ⬅️ 刪除後刷新選單
    }
  };
  colDelete.appendChild(deleteBtn);

  row.append(colCategory, colProduct, colUnit, colPrice, colQty, colSubtotal, colDelete);
  container.appendChild(row);

  // ===== 事件邏輯 =====

  categorySelect.addEventListener('change', function () {
    const category = this.value;
    if (!category || !productData[category]) return;

    const selected = getSelectedProductNames();
    const options = Object.keys(productData[category])
      .filter(name => !selected.includes(name))
      .map(name => `<option value="${name}">${name}</option>`)
      .join('');

    productSelect.innerHTML = `<option value="">選商品</option>${options}`;
    productSelect.disabled = false;
    unitSelect.disabled = true;
    unitSelect.innerHTML = '';
    priceInput.value = '';
    qtyInput.value = '';
    subtotalDisplay.value = '0';
  });

  productSelect.addEventListener('change', function () {
    const category = categorySelect.value;
    const name = this.value;
    if (!name || !productData[category]?.[name]) return;

    const units = productData[category][name].units;
    unitSelect.innerHTML = Object.keys(units)
      .map(u => `<option value="${u}">${u}</option>`)
      .join('');
    unitSelect.disabled = false;

    // 預設第一個單位與價格
    unitSelect.value = Object.keys(units)[0];
    priceInput.value = units[unitSelect.value];
    updateSubtotal();
  });

  unitSelect.addEventListener('change', function () {
    const category = categorySelect.value;
    const product = productSelect.value;
    const unit = this.value;
    if (!product || !productData[category]?.[product]?.units?.[unit]) return;

    priceInput.value = productData[category][product].units[unit];
    updateSubtotal();
  });

  qtyInput.addEventListener('input', updateSubtotal);

  function updateSubtotal() {
    const qty = parseFloat(qtyInput.value);
    const price = parseFloat(priceInput.value);
    subtotalDisplay.value = (!isNaN(qty) && !isNaN(price)) ? (qty * price).toFixed(2) : '0';
  }

  productRowCount++;
}

function calculateTotal() {
  const rows = document.querySelectorAll('.product-row');
  const resultTable = document.getElementById('result-table');
  let total = 0;
  let html = `<table class="table table-bordered"><thead><tr><th>品名</th><th>單位</th><th>單價</th><th>數量</th><th>小計</th></tr></thead><tbody>`;

  rows.forEach(row => {
    const selects = row.querySelectorAll('select');
    const inputs = row.querySelectorAll('input');
    const name = selects[1].value;
    const unit = selects[2].value;
    const price = parseFloat(inputs[0].value);
    const qty = parseFloat(inputs[1].value);

    if (name && unit && !isNaN(price) && !isNaN(qty)) {
      const subtotal = price * qty;
      total += subtotal;
      html += `<tr><td>${name}</td><td>${unit}</td><td>${price}</td><td>${qty}</td><td>${subtotal}</td></tr>`;
    }
  });

  html += `<tr><td colspan="4" class="text-end"><strong>總計</strong></td><td><strong>${total}元</strong></td></tr></tbody></table>`;
  resultTable.innerHTML = html;
}

function refreshProductOptions() {
  const rows = document.querySelectorAll('.product-row');
  const selected = getSelectedProductNames();

  rows.forEach(row => {
    const categorySelect = row.querySelector('select');
    const productSelect = row.querySelector('select[name="product"]');
    const currentCategory = categorySelect.value;
    const currentProduct = productSelect.value;

    if (!currentCategory || !productData[currentCategory]) return;

    const options = Object.keys(productData[currentCategory])
      .filter(name => !selected.includes(name) || name === currentProduct) // ⬅️ 保留自己
      .map(name => `<option value="${name}">${name}</option>`)
      .join('');

    productSelect.innerHTML = `<option value="">選商品</option>${options}`;
    productSelect.value = currentProduct;
  });
}


function getSelectedProductNames() {
  const selects = document.querySelectorAll('.product-row select[name="product"]');
  return Array.from(selects).map(s => s.value).filter(Boolean);
}
