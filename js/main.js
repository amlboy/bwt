/* global dishes */

// состояние фильтров
const activeFilters = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

// состояние заказа
const currentOrder = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

// генерация карточки блюда
function createCardElement(dish) {
    const card = document.createElement('div');
    card.classList.add('dish-card');
    card.setAttribute('data-dish', dish.keyword);

    if (currentOrder[dish.category] && currentOrder[dish.category].keyword === dish.keyword) {
        card.style.borderColor = 'tomato';
    }

    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <div class="dish-info">
            <p class="dish-price">${dish.price}₽</p>
            <p class="dish-title">${dish.name}</p>
            <p class="dish-volume">${dish.count}</p>
        </div>
        <button type="button" class="btn-add">Добавить</button>
    `;

    // обраб добавления
    card.querySelector('.btn-add').addEventListener('click', (e) => {
        e.preventDefault();
        selectDish(dish, card);
    });

    return card;
}

// показ меню
function renderMenu() {
    const categories = ['soup', 'main', 'starter', 'drink', 'dessert'];

    categories.forEach(cat => {
        const grid = document.getElementById(`${cat}-grid`);
        if (!grid) return;
        grid.innerHTML = '';
        
        // фильтрация
        let filteredDishes = dishes.filter(d => d.category === cat);
        if (activeFilters[cat] && activeFilters[cat] !== 'all') {
            filteredDishes = filteredDishes.filter(d => d.kind === activeFilters[cat]);
        }
        // алфавит
        filteredDishes.sort((a, b) => a.name.localeCompare(b.name));

        filteredDishes.forEach(dish => {
            grid.appendChild(createCardElement(dish));
        });
    });
}

// добавление в корзину
function selectDish(dish, cardElement) {
    const cat = dish.category;

    cardElement.parentElement.querySelectorAll('.dish-card').forEach(c => {
        c.style.borderColor = 'transparent';
    });
    cardElement.style.borderColor = 'tomato';
    currentOrder[cat] = dish;
    updateOrderDisplay();
}

// обновление корзины
function updateOrderDisplay() {
    let totalPrice = 0;
    let hasAnySelection = false;

    const categories = ['soup', 'main', 'starter', 'drink', 'dessert'];
    const summaryBlock = document.getElementById('order-summary-content');
    const costSection = document.getElementById('order-cost-section');
    const nothingSelectedText = document.getElementById('nothing-selected-hint');

    // пустышки
    const emptyLabels = {
        soup: 'Суп не выбран',
        main: 'Главное блюдо не выбрано',
        starter: 'Салат или стартер не выбран',
        drink: 'Напиток не выбран',
        dessert: 'Десерт не выбран'
    };

    categories.forEach(cat => {
        const item = currentOrder[cat];
        const displaySpan = document.getElementById(`summary-${cat}`);
        const hiddenInput = document.getElementById(`hidden-${cat}`);

        if (item) {
            hasAnySelection = true;
            totalPrice += item.price;
            
            // имя+цена в "ваш заказ"
            if (displaySpan) displaySpan.innerHTML = `${item.name} ${item.price}₽`;
            // скрытая запись keyword для отправки на сервер
            if (hiddenInput) hiddenInput.value = item.keyword;
        } else {
            if (displaySpan) displaySpan.innerHTML = emptyLabels[cat];
            if (hiddenInput) hiddenInput.value = '';
        }
    });

    // видимость
    if (!hasAnySelection) {
        if (summaryBlock) summaryBlock.style.display = 'none';
        if (costSection) costSection.style.display = 'none';
        if (nothingSelectedText) nothingSelectedText.style.display = 'block';
    } else {
        if (summaryBlock) summaryBlock.style.display = 'block';
        if (costSection) costSection.style.display = 'block';
        if (nothingSelectedText) nothingSelectedText.style.display = 'none';
        
        const priceValue = document.getElementById('total-price-value');
        if (priceValue) priceValue.innerText = `${totalPrice}₽`;
    }
}

// кнопки фильтры
function initFilters() {
    document.querySelectorAll('.filters-container').forEach(container => {
        const category = container.getAttribute('data-category');
        
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const kind = btn.getAttribute('data-kind');

                if (btn.classList.contains('active') && kind !== 'all') {
                    btn.classList.remove('active');
                    container.querySelectorAll('.filter-btn').forEach(b => {
                        if (b.getAttribute('data-kind') === 'all') b.classList.add('active');
                    });
                    activeFilters[category] = 'all';
                } else {
                    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeFilters[category] = kind;
                }

                renderMenu();
            });
        });
    });
}

// кнопка сброса
function initResetButton() {
    const resetBtn = document.getElementById('form-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const categories = ['soup', 'main', 'starter', 'drink', 'dessert'];
            categories.forEach(cat => {
                currentOrder[cat] = null;
            });

            document.getElementById('hidden-soup').value = '';
            document.getElementById('hidden-main').value = '';
            document.getElementById('hidden-starter').value = '';
            document.getElementById('hidden-drink').value = '';
            document.getElementById('hidden-dessert').value = '';

            updateOrderDisplay();

            document.querySelectorAll('.filters-container').forEach(container => {
                const category = container.getAttribute('data-category');
                activeFilters[category] = 'all';
                container.querySelectorAll('.filter-btn').forEach(b => {
                    if (b.getAttribute('data-kind') === 'all') b.classList.add('active');
                    else b.classList.remove('active');
                });
            });

            renderMenu();
        });
    }
}

// увед
function showCustomAlert(message) {
    const existingModal = document.querySelector('.custom-modal-overlay');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';

    overlay.innerHTML = `
        <div class="custom-modal">
            <p>${message}</p>
            <button type="button" class="custom-modal-btn">Окей</button>
        </div>
    `;

    overlay.querySelector('.custom-modal-btn').addEventListener('click', () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);
}

// проверка состава
const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        // проверка на наличие выбранных элементов 
        const s = currentOrder.soup !== null;
        const m = currentOrder.main !== null;
        const st = currentOrder.starter !== null;
        const d = currentOrder.drink !== null;

        const hasAnySelection = Object.values(currentOrder).some(item => item !== null);
        if (!hasAnySelection) {
            e.preventDefault();
            showCustomAlert('Ничего не выбрано. Выберите блюда для заказа');
            return;
        }


        const isCombo1 = s && m && st && d;     // soup + main_course + starter + drink
        const isCombo2 = s && m && !st && d;    // soup + main_course + drink
        const isCombo3 = s && !m && st && d;    // soup + starter + drink
        const isCombo4 = !s && m && st && d;    // main_course + starter + drink
        const isCombo5 = !s && m && !st && d;   //  main_course + drink

        const isValidCombo = isCombo1 || isCombo2 || isCombo3 || isCombo4 || isCombo5;

        // неверное комбо
        if (!isValidCombo) {
            e.preventDefault();

            if (!d) {
                showCustomAlert('Выберите напиток');
            } else if (s && !m && !st) {
                showCustomAlert('Выберите главное блюдо/салат/стартер');
            } else if (st && !s && !m) {
                showCustomAlert('Выберите суп или главное блюдо');
            } else if (!m) {
                showCustomAlert('Выберите главное блюдо');
            } else if (!s && !m && !st && !d) {
                showCustomAlert('Ничего не выбрано. Выберите блюда для заказа');    
            } else {
                showCustomAlert('Проверьте комплектацию вашего комбо-обеда');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initResetButton();
    renderMenu();
    updateOrderDisplay();
});
