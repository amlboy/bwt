'use strict';

const API_URL = window.API_CONFIG.url;
const API_KEY = window.API_CONFIG.key;
const STORAGE_KEY = 'food-construct-order';

const CATEGORY_ALIASES = {
    'main-course': 'main',
    main_course: 'main',
    salad: 'starter'
};
const KIND_ALIASES = {
    large: 'big'
};

const CATEGORIES = ['soup', 'main', 'starter', 'drink', 'dessert'];

const ORDER_FIELDS = {
    soup: 'soup_id',
    main: 'main_course_id',
    starter: 'salad_id',
    drink: 'drink_id',
    dessert: 'dessert_id'
};

const EMPTY_TEXT = {
    soup: 'Не выбран',
    main: 'Не выбрано',
    starter: 'Не выбран',
    drink: 'Не выбран',
    dessert: 'Не выбран'
};

const ORDER_MESSAGES = {
    nothing: 'Ничего не выбрано. Выберите блюда для заказа',
    drink: 'Выберите напиток',
    mainOrStarter: 'Выберите главное блюдо/салат/стартер',
    soupOrMain: 'Выберите суп или главное блюдо',
    main: 'Выберите главное блюдо'
};

let dishes = [];

const selectedDishes = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

function createTextElement(className, text) {
    const element = document.createElement('p');
    element.className = className;
    element.textContent = text;
    return element;
}

function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.dataset.category = dish.category;

    const image = document.createElement('img');
    image.className = 'dish-img';
    image.src = dish.image;
    image.alt = dish.name;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-delete';
    button.textContent = 'Удалить';

    card.append(
        image,
        createTextElement('dish-price', `${dish.price}₽`),
        createTextElement('dish-name', dish.name),
        createTextElement('dish-count', dish.count),
        button
    );
    return card;
}

function getOrderError() {
    const soup = selectedDishes.soup !== null;
    const main = selectedDishes.main !== null;
    const starter = selectedDishes.starter !== null;
    const drink = selectedDishes.drink !== null;
    const dessert = selectedDishes.dessert !== null;

    if (!soup && !main && !starter && !drink && !dessert) {
        return ORDER_MESSAGES.nothing;
    }

    if (drink && (main || (soup && starter))) {
        return null;
    }

    if (soup && !main && !starter) {
        return ORDER_MESSAGES.mainOrStarter;
    }
    if (starter && !soup && !main) {
        return ORDER_MESSAGES.soupOrMain;
    }
    if (!soup && !main && !starter) {
        return ORDER_MESSAGES.main;
    }
    return ORDER_MESSAGES.drink;
}

function loadOrderIds() {
    try {
        const ids = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return ids !== null && typeof ids === 'object' ? ids : {};
    } catch {
        return {};
    }
}

function saveOrderIds() {
    const ids = {};

    CATEGORIES.forEach((category) => {
        if (selectedDishes[category] !== null) {
            ids[category] = selectedDishes[category].id;
        }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function restoreSelection() {
    const ids = loadOrderIds();

    CATEGORIES.forEach((category) => {
        selectedDishes[category] = dishes.find(
            (dish) => dish.category === category && dish.id === ids[category]
        ) ?? null;
    });
}

function renderOrderDishes() {
    const grid = document.getElementById('order-dishes');
    const empty = document.getElementById('order-dishes-empty');
    const selected = CATEGORIES
        .map((category) => selectedDishes[category])
        .filter((dish) => dish !== null);

    grid.replaceChildren(...selected.map(createDishCard));
    grid.hidden = selected.length === 0;
    empty.hidden = selected.length !== 0;
}

function updateOrderSummary() {
    const hasSelection = CATEGORIES.some((category) => selectedDishes[category] !== null);
    let total = 0;

    document.getElementById('order-empty').hidden = hasSelection;
    document.getElementById('order-total').hidden = !hasSelection;

    CATEGORIES.forEach((category) => {
        const dish = selectedDishes[category];
        const block = document.querySelector(`.order-category[data-category="${category}"]`);

        block.hidden = !hasSelection;
        block.querySelector('.order-dish').textContent = dish
            ? `${dish.name} ${dish.price}₽`
            : EMPTY_TEXT[category];

        if (dish) {
            total += dish.price;
        }
    });

    document.getElementById('order-total-price').textContent = `${total}₽`;
}

function renderOrder() {
    renderOrderDishes();
    updateOrderSummary();
}

function removeDish(category) {
    selectedDishes[category] = null;
    saveOrderIds();
    renderOrder();
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

function normalizeDish(dish) {
    return {
        ...dish,
        category: CATEGORY_ALIASES[dish.category] ?? dish.category,
        kind: KIND_ALIASES[dish.kind] ?? dish.kind
    };
}

async function loadDishes() {
    try {
        const response = await fetch(`${API_URL}/dishes`);
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }
        const data = await response.json();
        dishes = data
            .map(normalizeDish)
            .filter((dish) => CATEGORIES.includes(dish.category));
    } catch (error) {
        console.error(error);
        showNotification('Не удалось загрузить состав заказа. Попробуйте обновить страницу позже');
        return;
    }

    restoreSelection();
    renderOrder();
}

function updateDeliveryTime(form) {
    const byTime = form.elements.delivery_type.value === 'by_time';
    form.elements.delivery_time.required = byTime;
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getDeliveryError(form) {
    const elements = form.elements;
    if (elements.delivery_type.value !== 'by_time') {
        return null;
    }
    if (elements.delivery_time.value < getCurrentTime()) {
        return 'Время доставки не может быть раньше текущего времени';
    }
    return null;
}

function buildOrderData(form) {
    const elements = form.elements;
    const data = {
        full_name: elements.full_name.value.trim(),
        email: elements.email.value.trim(),
        subscribe: elements.subscribe.checked ? 1 : 0,
        phone: elements.phone.value.trim(),
        delivery_address: elements.delivery_address.value.trim(),
        delivery_type: elements.delivery_type.value,
        comment: elements.comment.value.trim()
    };

    if (data.delivery_type === 'by_time') {
        data.delivery_time = elements.delivery_time.value;
    }

    CATEGORIES.forEach((category) => {
        if (selectedDishes[category] !== null) {
            data[ORDER_FIELDS[category]] = selectedDishes[category].id;
        }
    });

    return data;
}

async function sendOrder(data) {
    const response = await fetch(`${API_URL}/orders?api_key=${encodeURIComponent(API_KEY)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.error) {
        throw new Error(result.error || `Ошибка ${response.status}`);
    }
    return result;
}

function clearOrder(form) {
    localStorage.removeItem(STORAGE_KEY);
    CATEGORIES.forEach((category) => {
        selectedDishes[category] = null;
    });
    form.reset();
    renderOrder();
}

async function handleOrderSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const error = getOrderError() || getDeliveryError(form);
    if (error) {
        showNotification(error);
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        await sendOrder(buildOrderData(form));
    } catch (sendError) {
        console.error(sendError);
        showNotification(`Не удалось оформить заказ.`);
        return;
    } finally {
        submitButton.disabled = false;
    }

    clearOrder(form);
    showNotification('Заказ успешно оформлен!');
}

document.addEventListener('DOMContentLoaded', () => {
    loadDishes();

    document.getElementById('order-dishes').addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            removeDish(deleteButton.closest('.dish-card').dataset.category);
        }
    });

    const form = document.querySelector('.order-form');

    form.addEventListener('change', (event) => {
        if (event.target.name === 'delivery_type') {
            updateDeliveryTime(form);
        }
    });

    form.addEventListener('reset', () => {
        form.elements.delivery_time.required = false;
    });

    form.addEventListener('submit', handleOrderSubmit);
});