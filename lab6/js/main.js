/* global dishes */
'use strict';

const CATEGORIES = ['soup', 'main', 'starter', 'drink', 'dessert'];

const EMPTY_TEXT = {
    soup: 'Блюдо не выбрано',
    main: 'Блюдо не выбрано',
    starter: 'Блюдо не выбрано',
    drink: 'Напиток не выбран',
    dessert: 'Блюдо не выбрано'
};

const selectedDishes = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

const activeFilters = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

function findDish(keyword) {
    return dishes.find((dish) => dish.keyword === keyword);
}

function createTextElement(className, text) {
    const element = document.createElement('p');
    element.className = className;
    element.textContent = text;
    return element;
}

function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.dataset.dish = dish.keyword;

    const image = document.createElement('img');
    image.className = 'dish-img';
    image.src = `img/${dish.image}.jpg`;
    image.alt = dish.name;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-add';
    button.textContent = 'Добавить';

    card.append(
        image,
        createTextElement('dish-price', `${dish.price}₽`),
        createTextElement('dish-name', dish.name),
        createTextElement('dish-count', dish.count),
        button
    );
    return card;
}

function highlightSelectedCard(category) {
    const selected = selectedDishes[category];
    const cards = document.querySelectorAll(`.dishes-grid[data-category="${category}"] .dish-card`);

    cards.forEach((card) => {
        card.classList.toggle('selected', selected !== null && card.dataset.dish === selected.keyword);
    });
}

function renderCategory(category) {
    const grid = document.querySelector(`.dishes-grid[data-category="${category}"]`);
    if (!grid) {
        return;
    }

    const kind = activeFilters[category];
    const categoryDishes = dishes
        .filter((dish) => dish.category === category && (kind === null || dish.kind === kind))
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    grid.replaceChildren(...categoryDishes.map(createDishCard));
    highlightSelectedCard(category);
}

function toggleFilter(button) {
    const container = button.closest('.filters');
    const category = container.dataset.category;
    const wasActive = button.classList.contains('active');

    container.querySelectorAll('.filter-btn').forEach((filterButton) => {
        filterButton.classList.remove('active');
    });

    if (wasActive) {
        activeFilters[category] = null;
    } else {
        button.classList.add('active');
        activeFilters[category] = button.dataset.kind;
    }

    renderCategory(category);
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

        document.getElementById(`${category}-input`).value = dish ? dish.keyword : '';

        if (dish) {
            total += dish.price;
        }
    });

    document.getElementById('order-total-price').textContent = `${total}₽`;
}

function selectDish(keyword) {
    const dish = findDish(keyword);
    if (!dish) {
        return;
    }

    selectedDishes[dish.category] = dish;
    highlightSelectedCard(dish.category);
    updateOrderSummary();
}

function clearOrder() {
    CATEGORIES.forEach((category) => {
        selectedDishes[category] = null;
        highlightSelectedCard(category);
    });
    updateOrderSummary();
}

const ORDER_MESSAGES = {
    nothing: 'Ничего не выбрано. Выберите блюда для заказа',
    drink: 'Выберите напиток',
    mainOrStarter: 'Выберите главное блюдо/салат/стартер',
    soupOrMain: 'Выберите суп или главное блюдо',
    main: 'Выберите главное блюдо'
};

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

function handleOrderSubmit(event) {
    const error = getOrderError();
    if (error) {
        event.preventDefault();
        showNotification(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    CATEGORIES.forEach(renderCategory);
    updateOrderSummary();

    document.querySelector('main').addEventListener('click', (event) => {
        const filterButton = event.target.closest('.filter-btn');
        if (filterButton) {
            toggleFilter(filterButton);
            return;
        }

        const addButton = event.target.closest('.btn-add');
        if (addButton) {
            selectDish(addButton.closest('.dish-card').dataset.dish);
        }
    });

    const form = document.querySelector('.order-form');
    form.addEventListener('reset', clearOrder);

    form.addEventListener('submit', handleOrderSubmit);
});