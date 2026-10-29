'use strict';

const MEAL_API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood';
const DRINK_API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic';
const STORAGE_KEY = 'food-construct-order';

const CATEGORY_ALIASES = {
    'main-course': 'main',
    main_course: 'main',
    salad: 'starter'
};
const KIND_ALIASES = {
    large: 'big'
};

let dishes = [];

const CATEGORIES = ['soup', 'main', 'starter', 'drink', 'dessert'];

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
    image.src = dish.image;
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

function updateCheckoutPanel() {
    const panel = document.getElementById('checkout-panel');
    const link = document.getElementById('checkout-link');
    if (!panel || !link) return;

    const selected = CATEGORIES
        .map((category) => selectedDishes[category])
        .filter((dish) => dish !== null);
    const total = selected.reduce((sum, dish) => sum + dish.price, 0);
    const available = getOrderError() === null;

    panel.hidden = selected.length === 0;
    document.getElementById('checkout-total').textContent = `${total}₽`;
    link.classList.toggle('disabled', !available);
}

function selectDish(keyword) {
    const dish = findDish(keyword);
    if (!dish) {
        return;
    }

    selectedDishes[dish.category] = dish;
    highlightSelectedCard(dish.category);
    saveOrderIds();
    updateCheckoutPanel();
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
        showNotification('Не удалось загрузить меню. Попробуйте обновить страницу позже');
        return;
    }
    restoreSelection();
    CATEGORIES.forEach(renderCategory);
    updateCheckoutPanel();
}

document.addEventListener('DOMContentLoaded', () => {
    loadDishes();

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

    document.getElementById('checkout-link').addEventListener('click', (event) => {
        const error = getOrderError();
        if (error) {
            event.preventDefault();
            showNotification(error);
        }
    });
});