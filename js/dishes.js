/* eslint-disable no-unused-vars */
const dishes = [
    // soup
    {
        keyword: 'gazpacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        count: '350 г',
        image: 'img/soups/gazpacho.jpg',
        kind: 'veg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        count: '330 г',
        image: 'img/soups/mushroom_soup.jpg',
        kind: 'veg'
    },
    {
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        count: '330 г',
        image: 'img/soups/norwegian_soup.jpg',
        kind: 'fish'
    },
    {
        keyword: 'tom_yum',
        name: 'Том ям с креветками',
        price: 650,
        category: 'soup',
        count: '500 г',
        image: 'img/soups/tomyum.jpg',
        kind: 'fish'
    },
    {
        keyword: 'ramen',
        name: 'Рамен',
        price: 375,
        category: 'soup',
        count: '425 г',
        image: 'img/soups/ramen.jpg',
        kind: 'meat'
    },
    {
        keyword: 'chicken_soup',
        name: 'Куриный суп',
        price: 330,
        category: 'soup',
        count: '350 г',
        image: 'img/soups/chicken.jpg',
        kind: 'meat'
    },

    // main
    {
        keyword: 'potato_mushrooms',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main',
        count: '250 г',
        image: 'img/main_course/friedpotatoeswithmushrooms1.jpg',
        kind: 'veg'
    },
    {
        keyword: 'pizza_margherita',
        name: 'Пицца Маргарита',
        price: 450,
        category: 'main',
        count: '470 г',
        image: 'img/main_course/pizza.jpg',
        kind: 'veg'
    },
    {
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'main',
        count: '310 г',
        image: 'img/main_course/lasagna.jpg',
        kind: 'meat'
    },
    {
        keyword: 'chicken_cutlets',
        name: 'Котлеты из курицы с картофельным пюре',
        price: 225,
        category: 'main',
        count: '280 г',
        image: 'img/main_course/chickencutletsandmashedpotatoes.jpg',
        kind: 'meat'
    },
    {
        keyword: 'fish_cake',
        name: 'Рыбная котлета с рисом и спаржей',
        price: 320,
        category: 'main',
        count: '270 г',
        image: 'img/main_course/fishrice.jpg',
        kind: 'fish'
    },
    {
        keyword: 'shrimp_pasta',
        name: 'Паста с креветками',
        price: 340,
        category: 'main',
        count: '280 г',
        image: 'img/main_course/shrimppasta.jpg',
        kind: 'fish'
    },

    // starter
    {
        keyword: 'tuna_salad',
        name: 'Салат с тунцом',
        price: 480,
        category: 'starter',
        count: '250 г',
        image: 'img/salads_starters/tunasalad.jpg',
        kind: 'fish'
    },
    {
        keyword: 'caesar',
        name: 'Цезарь с цыпленком',
        price: 370,
        category: 'starter',
        count: '220 г',
        image: 'img/salads_starters/caesar.jpg',
        kind: 'meat'
    },
    {
        keyword: 'korean_salad',
        name: 'Корейский салат с овощами и яйцом',
        price: 330,
        category: 'starter',
        count: '250 г',
        image: 'img/salads_starters/saladwithegg.jpg',
        kind: 'veg'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе с моцареллой',
        price: 350,
        category: 'starter',
        count: '235 г',
        image: 'img/salads_starters/caprese.jpg',
        kind: 'veg'
    },
    {
        keyword: 'fries_caesar',
        name: 'Картофель фри с соусом  Цезарь',
        price: 280,
        category: 'starter',
        count: '235 г',
        image: 'img/salads_starters/frenchfries1.jpg',
        kind: 'veg'
    },
    {
        keyword: 'fries_ketchup',
        name: 'Картофель фри с кетчупом',
        price: 260,
        category: 'starter',
        count: '235 г',
        image: 'img/salads_starters/frenchfries2.jpg',
        kind: 'veg'
    },

    // drink
    {
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        count: '300 мл',
        image: 'img/beverages/orangejuice.jpg',
        kind: 'cold'
    },
    {
        keyword: 'apple_juice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'img/beverages/applejuice.jpg',
        kind: 'cold'
    },
    {
        keyword: 'carrot_juice',
        name: 'Морковный сок',
        price: 110,
        category: 'drink',
        count: '300 мл',
        image: 'img/beverages/carrotjuice.jpg',
        kind: 'cold'
    },
    {
        keyword: 'cappuccino',
        name: 'Капучино',
        price: 180,
        category: 'drink',
        count: '300 мл',
        image: 'img/beverages/cappuccino.jpg',
        kind: 'hot'
    },
    {
        keyword: 'green_tea',
        name: 'Зеленый чай',
        price: 100,
        category: 'drink',
        count: '300 мл',
        image: 'img/beverages/greentea.jpg',
        kind: 'hot'
    },
    {
        keyword: 'black_tea',
        name: 'Черный чай',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'img/beverages/tea.jpg',
        kind: 'hot'
    },

    // dessert
    {
        keyword: 'baklava',
        name: 'Пахлава',
        price: 220,
        category: 'dessert',
        count: '300 г',
        image: 'img/desserts/baklava.jpg',
        kind: 'small'
    },
    {
        keyword: 'choco_cake',
        name: 'Шоколадный торт',
        price: 270,
        category: 'dessert',
        count: '140 г',
        image: 'img/desserts/chocolatecake.jpg',
        kind: 'small'
    },
    {
        keyword: 'cheesecake',
        name: 'Чизкейк',
        price: 240,
        category: 'dessert',
        count: '125 г',
        image: 'img/desserts/checheesecake.jpg',
        kind: 'medium'
    },
    {
        keyword: 'choco_cheesecake',
        name: 'Шоколадный чизкейк',
        price: 260,
        category: 'dessert',
        count: '125 г',
        image: 'img/desserts/chocolatecheesecake.jpg',
        kind: 'medium'
    },
    {
        keyword: 'donuts_3',
        name: 'Пончики (3 штуки)',
        price: 410,
        category: 'dessert',
        count: '350 г',
        image: 'img/desserts/donuts2.jpg',
        kind: 'big'
    },
    {
        keyword: 'donuts_6',
        name: 'Пончики (6 штук)',
        price: 650,
        category: 'dessert',
        count: '700 г',
        image: 'img/desserts/donuts.jpg',
        kind: 'big'
    }
];
