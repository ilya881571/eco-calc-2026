// Данные для расчетов экологического следа
const ECO_DATA = {
    // Коэффициенты выбросов CO2 (кг на единицу)
    coefficients: {
        car: 0.12,          // кг CO2 на км
        publicTransport: 0.05, // кг CO2 на час
        meat: 5,            // кг CO2 на порцию в неделю
        electricity: 0.4,   // кг CO2 на кВт·ч
        water: 0.0005,      // кг CO2 на литр
        plasticBottle: 0.5  // кг CO2 на бутылку
    },
    
    // Уровни пищевых отходов
    wasteLevels: {
        low: 0.5,
        medium: 1,
        high: 2
    },
    
    // Средние показатели по стране
    averages: {
        carKm: 150,         // км в неделю
        publicTransport: 6, // часов в неделю
        meat: 5,            // порций в неделю
        electricity: 250,   // кВт·ч в месяц
        showerTime: 12,     // минут в день
        bottles: 8          // штук в неделю
    },
    
    // Цели на 2030 год
    goals: {
        total: 150          // кг CO2 в месяц
    },
    
    // Эквиваленты
    equivalents: {
        treeAbsorption: 21,     // кг CO2 в год на одно дерево
        poolVolume: 80000,      // литров в бассейне
        carEmission: 0.12       // кг CO2 на км
    },
    
    // Рекомендации по категориям
    recommendations: {
        transport: [
            "Пересядьте на общественный транспорт 2 раза в неделю",
            "Рассмотрите возможность каршеринга",
            "Планируйте маршруты заранее, чтобы избежать пробок",
            "Раз в месяц пользуйтесь велосипедом или ходите пешком"
        ],
        food: [
            "Замените красное мясо на курицу или рыбу 1-2 раза в неделю",
            "Покупайте местные сезонные продукты",
            "Сократите пищевые отходы, планируя покупки",
            "Используйте многоразовые контейнеры"
        ],
        energy: [
            "Замените лампочки на светодиодные",
            "Выключайте приборы из розетки, когда не используете",
            "Установите программируемый термостат",
            "Стирайте одежду в холодной воде"
        ],
        water: [
            "Установите водосберегающую насадку для душа",
            "Выключайте воду, когда чистите зубы",
            "Собирайте дождевую воду для полива растений",
            "Используйте многоразовую бутылку для воды"
        ]
    }
};

// Функции расчета
const CALCULATIONS = {
    // Расчет выбросов от транспорта
    calculateTransport: (carKm, publicTransport) => {
        return (carKm * ECO_DATA.coefficients.car) + 
               (publicTransport * ECO_DATA.coefficients.publicTransport);
    },
    
    // Расчет выбросов от питания
    calculateFood: (meat, wasteLevel) => {
        const wasteMultiplier = ECO_DATA.wasteLevels[wasteLevel] || 1;
        return (meat * ECO_DATA.coefficients.meat) * wasteMultiplier;
    },
    
    // Расчет выбросов от энергии
    calculateEnergy: (electricity, renewable) => {
        const renewableDiscount = renewable ? 0.7 : 1; // Скидка 30% при использовании ВИЭ
        return electricity * ECO_DATA.coefficients.electricity * renewableDiscount;
    },
    
    // Расчет выбросов от воды
    calculateWater: (showerTime, bottles) => {
        const waterPerShower = 9; // литров в минуту
        const showerWater = showerTime * waterPerShower * 30; // за месяц
        const showerEmissions = showerWater * ECO_DATA.coefficients.water;
        const bottleEmissions = bottles * ECO_DATA.coefficients.plasticBottle * 4; // за месяц
        
        return showerEmissions + bottleEmissions;
    },
    
    // Расчет общего следа
    calculateTotal: (categories) => {
        return Object.values(categories).reduce((sum, value) => sum + value, 0);
    },
    
    // Получение категории по значению
    getCategory: (score) => {
        if (score < 100) return { 
            name: "Отлично!", 
            color: "#4CAF50",
            description: "Ваш экологический след ниже среднего! Продолжайте в том же духе." 
        };
        if (score < 200) return { 
            name: "Хорошо", 
            color: "#8BC34A",
            description: "Вы на правильном пути, но есть куда стремиться." 
        };
        if (score < 300) return { 
            name: "Средне", 
            color: "#FFC107",
            description: "Ваш след соответствует средним показателям. Время для улучшений!" 
        };
        if (score < 400) return { 
            name: "Высоко", 
            color: "#FF9800",
            description: "Ваше воздействие на планету выше среднего. Рекомендуем изменения." 
        };
        return { 
            name: "Очень высоко", 
            color: "#F44336",
            description: "Требуются значительные изменения в образе жизни." 
        };
    },
    
    // Расчет эквивалентов
    calculateEquivalents: (totalScore) => {
        return {
            trees: Math.ceil(totalScore / (ECO_DATA.equivalents.treeAbsorption / 12)),
            pools: Math.ceil((totalScore * 1000) / ECO_DATA.equivalents.poolVolume), // переводим в литры
            carKm: Math.ceil(totalScore / ECO_DATA.equivalents.carEmission)
        };
    },
    
    // Получение рекомендаций
    getRecommendations: (categories) => {
        const recs = [];
        
        // Определяем самые проблемные категории
        const sortedCategories = Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2);
        
        sortedCategories.forEach(([category]) => {
            if (ECO_DATA.recommendations[category]) {
                recs.push(...ECO_DATA.recommendations[category]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2));
            }
        });
        
        // Добавляем общие рекомендации
        recs.push(
            "Участвуйте в местных экологических инициативах",
            "Расскажите друзьям о своем опыте сокращения следа"
        );
        
        return [...new Set(recs)].slice(0, 4); // Уникальные рекомендации, максимум 4
    }
};