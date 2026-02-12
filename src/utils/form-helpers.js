/* ===== Form Helpers ===== */

// Collect all form data from a container
export function collectFormData(container) {
    const data = {};
    const inputs = container.querySelectorAll('[data-field]');
    inputs.forEach(input => {
        const field = input.dataset.field;
        data[field] = input.value || '';
    });
    return data;
}

// Collect repeater data
export function collectRepeaterData(container, repeaterName) {
    const items = container.querySelectorAll(`[data-repeater="${repeaterName}"] .repeater-item`);
    const data = [];
    items.forEach(item => {
        const itemData = {};
        const inputs = item.querySelectorAll('[data-field]');
        inputs.forEach(input => {
            itemData[input.dataset.field] = input.value || '';
        });
        data.push(itemData);
    });
    return data;
}

// Create a form group HTML
export function formGroup(label, fieldName, type = 'text', placeholder = '', required = false, value = '') {
    const req = required ? '<span class="required">*</span>' : '';
    if (type === 'textarea') {
        return `
      <div class="form-group">
        <label class="form-label">${label}${req}</label>
        <textarea class="form-textarea" data-field="${fieldName}" placeholder="${placeholder}">${value}</textarea>
      </div>`;
    }
    return `
    <div class="form-group">
      <label class="form-label">${label}${req}</label>
      <input type="${type}" class="form-input" data-field="${fieldName}" placeholder="${placeholder}" value="${value}" />
    </div>`;
}

// Create a select group
export function selectGroup(label, fieldName, options, required = false) {
    const req = required ? '<span class="required">*</span>' : '';
    const optionsHtml = options.map(o =>
        typeof o === 'string'
            ? `<option value="${o}">${o}</option>`
            : `<option value="${o.value}">${o.label}</option>`
    ).join('');
    return `
    <div class="form-group">
      <label class="form-label">${label}${req}</label>
      <select class="form-select" data-field="${fieldName}">
        <option value="">Select...</option>
        ${optionsHtml}
      </select>
    </div>`;
}

// Create a form row
export function formRow(...groups) {
    return `<div class="form-row">${groups.join('')}</div>`;
}

export function formRow3(...groups) {
    return `<div class="form-row-3">${groups.join('')}</div>`;
}

// Add repeater item functionality
export function initRepeater(container, repeaterName, renderItem, maxItems = 20) {
    const repeater = container.querySelector(`[data-repeater="${repeaterName}"]`);
    if (!repeater) return;

    const addBtn = repeater.querySelector('.repeater-add');
    let count = repeater.querySelectorAll('.repeater-item').length;

    addBtn?.addEventListener('click', () => {
        if (count >= maxItems) return;
        count++;
        const itemHtml = renderItem(count);
        const temp = document.createElement('div');
        temp.innerHTML = itemHtml;
        const newItem = temp.firstElementChild;
        addBtn.parentElement.insertBefore(newItem, addBtn);
        initRemoveButtons(repeater);
    });

    initRemoveButtons(repeater);
}

function initRemoveButtons(repeater) {
    repeater.querySelectorAll('.repeater-remove').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.repeater-item').remove();
            renumberItems(repeater);
        };
    });
}

function renumberItems(repeater) {
    repeater.querySelectorAll('.repeater-item-number').forEach((el, i) => {
        el.textContent = el.textContent.replace(/\d+/, i + 1);
    });
}

// Show toast notification
export function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${type === 'success' ? '✓' : '✗'} ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Auto-save to localStorage
export function autoSave(key, container) {
    const data = collectFormData(container);
    localStorage.setItem(`docforge_${key}`, JSON.stringify(data));
}

// Load from localStorage
export function autoLoad(key, container) {
    const saved = localStorage.getItem(`docforge_${key}`);
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([field, value]) => {
            const input = container.querySelector(`[data-field="${field}"]`);
            if (input) input.value = value;
        });
    } catch (e) { /* ignore */ }
}
