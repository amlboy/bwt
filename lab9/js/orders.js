'use strict';

const API_URL = window.API_CONFIG.url;
const API_KEY = window.API_CONFIG.key;

const DISH_FIELDS = [
    { field: 'soup_id', label: 'Суп' },
    { field: 'main_course_id', label: 'Основное блюдо' },
    { field: 'salad_id', label: 'Салат/стартер' },
    { field: 'drink_id', label: 'Напиток' },
    { field: 'dessert_id', label: 'Десерт' }
];

const TEXT_FIELDS = ['full_name', 'email', 'phone', 'delivery_address', 'comment'];

const ASAP_TEXT = 'Как можно скорее (с 7:00 до 23:00)';

let dishesById = new Map();
let orders = [];
let currentOrder = null;

function createTextElement(className, text) {
    const element = document.createElement('p');
    element.className = className;
    element.textContent = text;
    return element;
}

function closeNotification() {
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.remove();
    }
}

function showNotification(text) {
    closeNotification();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'notification-btn';
    button.textContent = 'Окей 👌';
    button.addEventListener('click', closeNotification);

    notification.append(createTextElement('notification-text', text), button);
    document.body.append(notification);
    button.focus();
}

function ordersUrl(id) {
    const path = id === undefined ? '/orders' : `/orders/${id}`;
    return `${API_URL}${path}?api_key=${encodeURIComponent(API_KEY)}`;
}

async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok || (result && result.error)) {
        throw new Error((result && result.error) || `Ошибка ${response.status}`);
    }
    return result;
}

function parseDate(value) {
    return new Date(String(value).replace(' ', 'T'));
}

function pad(number) {
    return String(number).padStart(2, '0');
}

function formatDate(value) {
    const date = parseDate(value);
    if (Number.isNaN(date.getTime())) {
        return String(value ?? '');
    }
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTime(value) {
    return value ? String(value).slice(0, 5) : '';
}

function getCurrentTime() {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function getDeliveryText(order) {
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        return formatTime(order.delivery_time);
    }
    return ASAP_TEXT;
}

function getOrderDishes(order) {
    return DISH_FIELDS
        .filter(({ field }) => order[field] !== null && order[field] !== undefined && order[field] !== '')
        .map(({ field, label }) => ({ label, dish: dishesById.get(Number(order[field])) ?? null }));
}

function getDishName(dish) {
    return dish ? dish.name : 'Блюдо недоступно';
}

function getOrderPrice(order) {
    return getOrderDishes(order).reduce((sum, { dish }) => sum + (dish ? Number(dish.price) : 0), 0);
}

function compareOrders(a, b) {
    return (parseDate(b.created_at) - parseDate(a.created_at)) || (b.id - a.id);
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function createActionButton(action, icon, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-btn';
    button.dataset.action = action;
    button.title = label;
    button.setAttribute('aria-label', label);

    const iconElement = document.createElement('i');
    iconElement.className = `bi ${icon}`;
    iconElement.setAttribute('aria-hidden', 'true');

    button.append(iconElement);
    return button;
}

function createOrderRow(order, index) {
    const row = document.createElement('tr');
    row.dataset.id = order.id;

    const names = getOrderDishes(order)
        .map(({ dish }) => getDishName(dish))
        .join(', ');

    const actions = document.createElement('td');
    actions.className = 'orders-actions';
    actions.append(
        createActionButton('view', 'bi-eye', 'Подробнее'),
        createActionButton('edit', 'bi-pencil-square', 'Редактирование'),
        createActionButton('delete', 'bi-trash', 'Удаление')
    );

    row.append(
        createCell(String(index + 1)),
        createCell(formatDate(order.created_at)),
        createCell(names),
        createCell(`${getOrderPrice(order)}₽`),
        createCell(getDeliveryText(order)),
        actions
    );
    return row;
}

function renderOrders(failed = false) {
    document.getElementById('orders-body').replaceChildren(...orders.map(createOrderRow));
    document.getElementById('orders-table-wrap').hidden = orders.length === 0;
    document.getElementById('orders-empty').hidden = failed || orders.length !== 0;
    document.getElementById('orders-error').hidden = !failed;
}

async function loadOrders() {
    const data = await request(ordersUrl());
    orders = data.slice().sort(compareOrders);
    renderOrders();
}

async function reloadOrders() {
    try {
        await loadOrders();
    } catch (error) {
        console.error(error);
        showNotification(`Не удалось обновить список заказов.`);
    }
}

async function loadPage() {
    try {
        const [dishes, data] = await Promise.all([
            request(`${API_URL}/dishes`),
            request(ordersUrl())
        ]);
        dishesById = new Map(dishes.map((dish) => [Number(dish.id), dish]));
        orders = data.slice().sort(compareOrders);
        renderOrders();
    } catch (error) {
        console.error(error);
        orders = [];
        renderOrders(true);
        showNotification(`Не удалось загрузить историю заказов.`);
    }
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
        modal.hidden = true;
    });
    document.body.classList.remove('modal-open');
}

function openModal(id) {
    closeModals();
    document.getElementById(id).hidden = false;
    document.body.classList.add('modal-open');
    document.querySelector(`#${id} .modal-close`).focus();
}

function createInfoRow(label, value) {
    const row = document.createElement('div');
    row.className = 'modal-row';
    row.append(createTextElement('modal-label', label), createTextElement('modal-value', value));
    return row;
}

function renderDishList(containerId, priceId, order) {
    document.getElementById(containerId).replaceChildren(
        ...getOrderDishes(order).map(({ label, dish }) => createInfoRow(
            label,
            dish ? `${dish.name} (${dish.price}₽)` : getDishName(dish)
        ))
    );
    document.getElementById(priceId).textContent = `${getOrderPrice(order)}₽`;
}

function openView(order) {
    document.getElementById('view-created').textContent = formatDate(order.created_at);
    document.getElementById('view-full-name').textContent = order.full_name;
    document.getElementById('view-address').textContent = order.delivery_address;
    document.getElementById('view-time').textContent = getDeliveryText(order);
    document.getElementById('view-phone').textContent = order.phone;
    document.getElementById('view-email').textContent = order.email;
    document.getElementById('view-comment').textContent = order.comment || '—';
    renderDishList('view-dishes', 'view-price', order);
    openModal('view-modal');
}

function updateEditTime(form) {
    form.elements.delivery_time.required = form.elements.delivery_type.value === 'by_time';
}

function openEdit(order) {
    const form = document.getElementById('edit-form');
    form.reset();

    document.getElementById('edit-created').textContent = formatDate(order.created_at);
    TEXT_FIELDS.forEach((name) => {
        form.elements[name].value = order[name] ?? '';
    });
    form.elements.delivery_type.value = order.delivery_type;
    form.elements.delivery_time.value = order.delivery_type === 'by_time' ? formatTime(order.delivery_time) : '';
    updateEditTime(form);

    renderDishList('edit-dishes', 'edit-price', order);
    openModal('edit-modal');
}

function getChangedFields(form, order) {
    const elements = form.elements;
    const data = {};

    TEXT_FIELDS.forEach((name) => {
        const value = elements[name].value.trim();
        if (value !== String(order[name] ?? '')) {
            data[name] = value;
        }
    });

    const type = elements.delivery_type.value;
    const time = elements.delivery_time.value;
    const typeChanged = type !== order.delivery_type;

    if (typeChanged) {
        data.delivery_type = type;
    }
    if (type === 'by_time' && (typeChanged || time !== formatTime(order.delivery_time))) {
        data.delivery_time = time;
    }

    return data;
}

async function handleEditSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const order = currentOrder;
    const data = getChangedFields(form, order);

    if (data.delivery_time && data.delivery_time < getCurrentTime()) {
        showNotification('Время доставки не может быть раньше текущего времени');
        return;
    }

    if (Object.keys(data).length === 0) {
        closeModals();
        showNotification('Изменений нет');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        await request(ordersUrl(order.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error(error);
        showNotification(`Не удалось изменить заказ.`);
        return;
    } finally {
        submitButton.disabled = false;
    }

    closeModals();
    showNotification('Заказ успешно изменён');
    await reloadOrders();
}

async function handleDelete(button) {
    const order = currentOrder;
    button.disabled = true;

    try {
        await request(ordersUrl(order.id), { method: 'DELETE' });
    } catch (error) {
        console.error(error);
        showNotification(`Не удалось удалить заказ.`);
        return;
    } finally {
        button.disabled = false;
    }

    closeModals();
    showNotification('Заказ успешно удалён');
    await reloadOrders();
}

document.addEventListener('DOMContentLoaded', () => {
    loadPage();

    document.getElementById('orders-body').addEventListener('click', (event) => {
        const button = event.target.closest('.action-btn');
        if (!button) {
            return;
        }

        const id = button.closest('tr').dataset.id;
        const order = orders.find((item) => String(item.id) === id);
        if (!order) {
            return;
        }

        currentOrder = order;
        if (button.dataset.action === 'view') {
            openView(order);
        } else if (button.dataset.action === 'edit') {
            openEdit(order);
        } else {
            openModal('delete-modal');
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-close]') || event.target.classList.contains('modal-overlay')) {
            closeModals();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModals();
        }
    });

    const form = document.getElementById('edit-form');

    form.addEventListener('change', (event) => {
        if (event.target.name === 'delivery_type') {
            updateEditTime(form);
        }
    });

    form.addEventListener('submit', handleEditSubmit);

    document.getElementById('delete-confirm').addEventListener('click', (event) => {
        handleDelete(event.currentTarget);
    });
});