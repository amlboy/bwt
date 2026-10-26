/* eslint-disable-next-line no-unused-vars */
const dishes = [
    {
        keyword: 'gazpacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        count: '350 г',
        image: 'soups/gazpacho',
        kind: 'veg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        count: '330 г',
        image: 'soups/mushroom_soup',
        kind: 'veg'
    },
    {
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        count: '330 г',
        image: 'soups/norwegian_soup',
        kind: 'fish'
    },
    {
        keyword: 'tom_yum',
        name: 'Том ям с креветками',
        price: 650,
        category: 'soup',
        count: '500 г',
        image: 'soups/tomyum',
        kind: 'fish'
    },
    {
        keyword: 'ramen',
        name: 'Рамен',
        price: 375,
        category: 'soup',
        count: '425 г',
        image: 'soups/ramen',
        kind: 'meat'
    },
    {
        keyword: 'chicken_soup',
        name: 'Куриный суп',
        price: 330,
        category: 'soup',
        count: '350 г',
        image: 'soups/chicken',
        kind: 'meat'
    },

    {
        keyword: 'fried_potatoes_with_mushrooms',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main',
        count: '250 г',
        image: 'main_course/friedpotatoeswithmushrooms1',
        kind: 'veg'
    },
    {
        keyword: 'pizza_margherita',
        name: 'Пицца Маргарита',
        price: 450,
        category: 'main',
        count: '470 г',
        image: 'main_course/pizza',
        kind: 'veg'
    },
    {
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'main',
        count: '310 г',
        image: 'main_course/lasagna',
        kind: 'meat'
    },
    {
        keyword: 'chicken_cutlets_with_mashed_potatoes',
        name: 'Котлеты из курицы с картофельным пюре',
        price: 225,
        category: 'main',
        count: '280 г',
        image: 'main_course/chickencutletsandmashedpotatoes',
        kind: 'meat'
    },
    {
        keyword: 'fish_cake',
        name: 'Рыбная котлета с рисом и спаржей',
        price: 320,
        category: 'main',
        count: '270 г',
        image: 'main_course/fishrice',
        kind: 'fish'
    },
    {
        keyword: 'shrimp_pasta',
        name: 'Паста с креветками',
        price: 340,
        category: 'main',
        count: '280 г',
        image: 'main_course/shrimppasta',
        kind: 'fish'
    },

    {
        keyword: 'tuna_salad',
        name: 'Салат с тунцом',
        price: 480,
        category: 'starter',
        count: '250 г',
        image: 'salads_starters/tunasalad',
        kind: 'fish'
    },
    {
        keyword: 'caesar',
        name: 'Цезарь с цыпленком',
        price: 370,
        category: 'starter',
        count: '220 г',
        image: 'salads_starters/caesar',
        kind: 'meat'
    },
    {
        keyword: 'korean_salad',
        name: 'Корейский салат с овощами и яйцом',
        price: 330,
        category: 'starter',
        count: '250 г',
        image: 'salads_starters/saladwithegg',
        kind: 'veg'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе с моцареллой',
        price: 350,
        category: 'starter',
        count: '235 г',
        image: 'salads_starters/caprese',
        kind: 'veg'
    },
    {
        keyword: 'fries_caesar',
        name: 'Картофель фри с соусом Цезарь',
        price: 280,
        category: 'starter',
        count: '235 г',
        image: 'salads_starters/frenchfries1',
        kind: 'veg'
    },
    {
        keyword: 'fries_ketchup',
        name: 'Картофель фри с кетчупом',
        price: 260,
        category: 'starter',
        count: '235 г',
        image: 'salads_starters/frenchfries2',
        kind: 'veg'
    },

    {
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/orangejuice',
        kind: 'cold'
    },
    {
        keyword: 'apple_juice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/applejuice',
        kind: 'cold'
    },
    {
        keyword: 'carrot_juice',
        name: 'Морковный сок',
        price: 110,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/carrotjuice',
        kind: 'cold'
    },
    {
        keyword: 'cappuccino',
        name: 'Капучино',
        price: 180,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/cappuccino',
        kind: 'hot'
    },
    {
        keyword: 'green_tea',
        name: 'Зеленый чай',
        price: 100,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/greentea',
        kind: 'hot'
    },
    {
        keyword: 'black_tea',
        name: 'Черный чай',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/tea',
        kind: 'hot'
    },

    {
        keyword: 'cheesecake',
        name: 'Чизкейк',
        price: 240,
        category: 'dessert',
        count: '125 г',
        image: 'desserts/checheesecake',
        kind: 'small'
    },
    {
        keyword: 'choco_cheesecake',
        name: 'Шоколадный чизкейк',
        price: 260,
        category: 'dessert',
        count: '125 г',
        image: 'desserts/chocolatecheesecake',
        kind: 'small'
    },
    {
        keyword: 'choco_cake',
        name: 'Шоколадный торт',
        price: 270,
        category: 'dessert',
        count: '140 г',
        image: 'desserts/chocolatecake',
        kind: 'small'
    },
    {
        keyword: 'baklava',
        name: 'Пахлава',
        price: 220,
        category: 'dessert',
        count: '300 г',
        image: 'desserts/baklava',
        kind: 'medium'
    },
    {
        keyword: 'donuts_3',
        name: 'Пончики (3 штуки)',
        price: 410,
        category: 'dessert',
        count: '350 г',
        image: 'desserts/donuts2',
        kind: 'medium'
    },
    {
        keyword: 'donuts_6',
        name: 'Пончики (6 штук)',
        price: 650,
        category: 'dessert',
        count: '700 г',
        image: 'desserts/donuts',
        kind: 'big'
    }
];