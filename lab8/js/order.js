'use strict';

const MEAL_API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood';
const DRINK_API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic';
const STORAGE_KEY = 'food-construct-order';

const SUBMIT_URL = 'https://httpbin.org'; 

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
            ids[category] = selectedDishes[category].keyword;
        }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function restoreSelection() {
    const ids = loadOrderIds();
    CATEGORIES.forEach((category) => {
        selectedDishes[category] = dishes.find(
            (dish) => dish.category === category && dish.keyword === ids[category]
        ) ?? null;
    });
}

function renderOrderDishes() {
    const grid = document.getElementById('order-dishes');
    const empty = document.getElementById('order-dishes-empty');
    if (!grid || !empty) return;

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

    const emptyTextBlock = document.getElementById('order-empty');
    const totalTextBlock = document.getElementById('order-total');
    
    if (emptyTextBlock) emptyTextBlock.hidden = hasSelection;
    if (totalTextBlock) totalTextBlock.hidden = !hasSelection;

    CATEGORIES.forEach((category) => {
        const dish = selectedDishes[category];
        const block = document.querySelector(`.order-category[data-category="${category}"]`);

        if (block) {
            block.hidden = !hasSelection;
            block.querySelector('.order-dish').textContent = dish
                ? `${dish.name} ${dish.price}₽`
                : EMPTY_TEXT[category];
        }

        if (dish) total += dish.price;
    });

    const totalPriceElement = document.getElementById('order-total-price');
    if (totalPriceElement) totalPriceElement.textContent = `${total}₽`;
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
    if (notification) notification.remove();
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

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function loadDishes() {
    try {
        const [mealsResponse, drinksResponse] = await Promise.all([
            fetch(MEAL_API_URL),
            fetch(DRINK_API_URL)
        ]);

        if (!mealsResponse.ok || !drinksResponse.ok) {
            throw new Error('Ошибка загрузки данных с внешнего API');
        }

        const mealsData = await mealsResponse.json();
        const drinksData = await drinksResponse.json();
        const rawDishes = [];
        const foodCategories = ['soup', 'main', 'starter', 'dessert'];
        const foodKinds = ['meat', 'fish', 'veg'];
        const dessertSizes = ['small', 'medium', 'big'];

        const limitedMeals = (mealsData.meals || []).slice(0, 15);

        limitedMeals.forEach((meal, index) => {
            const category = foodCategories[index % foodCategories.length];
            
            const kind = category === 'dessert' 
                ? dessertSizes[index % dessertSizes.length] 
                : foodKinds[index % foodKinds.length];

            rawDishes.push({
                id: parseInt(meal.idMeal),
                keyword: meal.idMeal,
                name: meal.strMeal,
                image: meal.strMealThumb,
                category: category,
                kind: kind,
                price: getRandomInt(180, 450),
                count: `${getRandomInt(15, 35) * 10} г`
            });
        });

        const drinkKinds = ['hot', 'cold'];
        const limitedDrinks = (drinksData.drinks || []).slice(0, 8);

        limitedDrinks.forEach((drink, index) => {
            rawDishes.push({
                id: parseInt(drink.idDrink),
                keyword: drink.idDrink,
                name: drink.strDrink,
                image: drink.strDrinkThumb,
                category: 'drink',
                kind: drinkKinds[index % drinkKinds.length],
                price: getRandomInt(80, 180),
                count: `${getRandomInt(2, 4) * 100} мл`
            });
        });
        dishes = rawDishes;

    } catch (error) {
        console.error(error);
        showNotification('Не удалось загрузить состав заказа. Попробуйте позже');
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
    if (elements.delivery_type.value !== 'by_time') return null;
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
    const response = await fetch(`${SUBMIT_URL}/post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
    return await response.json();
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
        clearOrder(form);
        showNotification('Заказ успешно оформлен!');
    } catch (sendError) {
        console.error(sendError);
        showNotification(`Не удалось оформить заказ. ${sendError.message}`);
    } finally {
        submitButton.disabled = false;
    }
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
        if (event.target.name === 'delivery_type') updateDeliveryTime(form);
    });
    form.addEventListener('reset', () => {
        form.elements.delivery_time.required = false;
    });
    form.addEventListener('submit', handleOrderSubmit);
});