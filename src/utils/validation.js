const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SKU_RE = /^[A-Za-z0-9-]+$/;
const PHONE_RE = /^[\d\s+().-]{7,20}$/;

export function validateProductForm(form) {
  const errors = {};
  const name = form.name?.trim() || '';
  const sku = form.sku?.trim() || '';

  if (!name) errors.name = 'Product name is required.';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (name.length > 200) errors.name = 'Name must be 200 characters or less.';

  if (!sku) errors.sku = 'SKU is required.';
  else if (sku.length < 2) errors.sku = 'SKU must be at least 2 characters.';
  else if (!SKU_RE.test(sku)) errors.sku = 'SKU may only contain letters, numbers, and hyphens.';

  if (form.price === '' || form.price == null) errors.price = 'Price is required.';
  else {
    const price = parseFloat(form.price);
    if (Number.isNaN(price)) errors.price = 'Enter a valid price.';
    else if (price <= 0) errors.price = 'Price must be greater than zero.';
    else if (price > 999999) errors.price = 'Price is too large.';
  }

  if (form.quantity === '' || form.quantity == null) errors.quantity = 'Stock is required.';
  else {
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || Number.isNaN(qty)) errors.quantity = 'Stock must be a whole number.';
    else if (qty < 0) errors.quantity = 'Stock cannot be negative.';
  }

  return errors;
}

export function validateCustomerForm(form) {
  const errors = {};
  const fullName = form.full_name?.trim() || '';
  const email = form.email?.trim() || '';
  const phone = form.phone?.trim() || '';

  if (!fullName) errors.full_name = 'Full name is required.';
  else if (fullName.length < 2) errors.full_name = 'Name must be at least 2 characters.';
  else if (fullName.length > 200) errors.full_name = 'Name must be 200 characters or less.';

  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';

  if (phone && !PHONE_RE.test(phone)) {
    errors.phone = 'Enter a valid phone number (7–20 digits/symbols).';
  }

  return errors;
}

export function validateOrderForm(customerId, items, products) {
  const errors = {};

  if (!customerId) errors.customer_id = 'Select a customer.';

  if (!items.length) {
    errors.items = 'Add at least one item to the order.';
    return errors;
  }

  const itemErrors = {};
  items.forEach((item, idx) => {
    const fieldErr = {};
    const product = products.find((p) => p.id === item.product_id);

    if (!item.product_id) fieldErr.product_id = 'Select a product.';

    const qty = parseInt(item.quantity, 10);
    if (item.quantity === '' || item.quantity == null) fieldErr.quantity = 'Quantity is required.';
    else if (Number.isNaN(qty) || qty < 1) fieldErr.quantity = 'Quantity must be at least 1.';
    else if (product && qty > product.quantity) {
      fieldErr.quantity = `Only ${product.quantity} available in stock.`;
    }

    if (Object.keys(fieldErr).length) itemErrors[idx] = fieldErr;
  });

  if (Object.keys(itemErrors).length) errors.itemErrors = itemErrors;

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function collectErrorMessages(errors) {
  if (!errors || typeof errors !== 'object') return [];

  const messages = [];

  Object.entries(errors).forEach(([key, value]) => {
    if (key === 'itemErrors' && value && typeof value === 'object') {
      Object.values(value).forEach((itemErr) => {
        if (itemErr && typeof itemErr === 'object') {
          Object.values(itemErr).forEach((msg) => {
            if (typeof msg === 'string') messages.push(msg);
          });
        }
      });
      return;
    }
    if (typeof value === 'string') messages.push(value);
  });

  return messages;
}
