// Основной файл с логикой калькулятора
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена. Инициализация калькулятора...');
    
    // Элементы DOM
    const form = document.getElementById('ecoCalculator');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveLocalBtn = document.getElementById('saveLocalBtn');
    const downloadPlanBtn = document.getElementById('downloadPlanBtn');
    const themeToggle = document.getElementById('themeToggle');
    const closeModal = document.getElementById('closeModal');
    const modal = document.getElementById('saveModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    // ========== ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ МОДАЛЬНОГО ОКНА ==========
    modal.classList.add('hidden');
    modal.style.display = 'none';
    // ================================================================
    
    // Элементы для отображения значений слайдеров
    const sliderElements = {
        carKm: { slider: document.getElementById('carKm'), value: document.getElementById('carKmValue') },
        publicTransport: { slider: document.getElementById('publicTransport'), value: document.getElementById('publicTransportValue') },
        meatConsumption: { slider: document.getElementById('meatConsumption'), value: document.getElementById('meatConsumptionValue') },
        electricity: { slider: document.getElementById('electricity'), value: document.getElementById('electricityValue') },
        showerTime: { slider: document.getElementById('showerTime'), value: document.getElementById('showerTimeValue') },
        bottles: { slider: document.getElementById('bottles'), value: document.getElementById('bottlesValue') }
    };
    
    // Инициализация слайдеров
    Object.entries(sliderElements).forEach(([key, elements]) => {
        elements.slider.addEventListener('input', function() {
            elements.value.textContent = this.value;
        });
    });
    
    // Обработка кнопок пищевых отходов
    const wasteButtons = document.querySelectorAll('.waste-btn');
    let selectedWaste = 'medium';
    
    wasteButtons.forEach(button => {
        button.addEventListener('click', function() {
            wasteButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedWaste = this.dataset.value;
        });
    });
    
    // Переключатель ВИЭ
    const renewableCheckbox = document.getElementById('renewableEnergy');
    const renewableLabel = document.getElementById('renewableLabel');
    
    renewableCheckbox.addEventListener('change', function() {
        renewableLabel.textContent = this.checked ? 'Да' : 'Нет';
    });
    
    // Расчет экологического следа
    calculateBtn.addEventListener('click', function() {
        console.log('Запуск расчета экологического следа...');
        
        // Сбор данных из формы
        const formData = {
            carKm: parseInt(sliderElements.carKm.slider.value),
            publicTransport: parseInt(sliderElements.publicTransport.slider.value),
            meat: parseInt(sliderElements.meatConsumption.slider.value),
            wasteLevel: selectedWaste,
            electricity: parseInt(sliderElements.electricity.slider.value),
            renewable: renewableCheckbox.checked,
            showerTime: parseInt(sliderElements.showerTime.slider.value),
            bottles: parseInt(sliderElements.bottles.slider.value)
        };
        
        // Выполнение расчетов
        const categories = {
            transport: CALCULATIONS.calculateTransport(formData.carKm, formData.publicTransport),
            food: CALCULATIONS.calculateFood(formData.meat, formData.wasteLevel),
            energy: CALCULATIONS.calculateEnergy(formData.electricity, formData.renewable),
            water: CALCULATIONS.calculateWater(formData.showerTime, formData.bottles)
        };
        
        const totalScore = CALCULATIONS.calculateTotal(categories);
        const categoryInfo = CALCULATIONS.getCategory(totalScore);
        const equivalents = CALCULATIONS.calculateEquivalents(totalScore);
        const recommendations = CALCULATIONS.getRecommendations(categories);
        
        console.log('Результаты расчета:', { totalScore, categories, equivalents });
        
        // Обновление UI с результатами
        updateResultsUI(totalScore, categories, categoryInfo, equivalents, recommendations);
        
        // Показать секцию с результатами
        document.getElementById('resultsSection').classList.remove('hidden');
        document.getElementById('chartSection').classList.remove('hidden');
        
        // Создать график
        createImprovementChart(totalScore);
        
        // Прокрутка к результатам
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
    
    // Сброс формы
    resetBtn.addEventListener('click', function() {
        console.log('Сброс формы...');
        
        // Сброс слайдеров к значениям по умолчанию
        Object.entries(sliderElements).forEach(([key, elements]) => {
            const defaultValue = {
                carKm: 100,
                publicTransport: 5,
                meatConsumption: 4,
                electricity: 200,
                showerTime: 10,
                bottles: 5
            }[key];
            
            elements.slider.value = defaultValue;
            elements.value.textContent = defaultValue;
        });
        
        // Сброс кнопок отходов
        wasteButtons.forEach(btn => btn.classList.remove('active'));
        wasteButtons[1].classList.add('active'); // Средний уровень
        selectedWaste = 'medium';
        
        // Сброс переключателя ВИЭ
        renewableCheckbox.checked = false;
        renewableLabel.textContent = 'Нет';
        
        // Скрыть результаты
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('chartSection').classList.add('hidden');
    });
    
    // Сохранение в localStorage
    saveLocalBtn.addEventListener('click', function() {
        console.log('Сохранение плана в localStorage...');
        
        const totalScore = document.getElementById('totalScore').textContent;
        const scoreCategory = document.getElementById('scoreCategory').textContent;
        const recommendations = Array.from(document.querySelectorAll('.recommendation-item p'))
            .map(p => p.textContent);
        
        const plan = {
            date: new Date().toISOString(),
            score: parseInt(totalScore),
            category: scoreCategory,
            recommendations: recommendations,
            goal: ECO_DATA.goals.total,
            equivalents: {
                trees: document.getElementById('treesCount').textContent,
                pools: document.getElementById('poolsCount').textContent,
                carKm: document.getElementById('carKmEquivalent').textContent
            }
        };
        
        localStorage.setItem('ecoImprovementPlan', JSON.stringify(plan));
        
        // Показываем модальное окно
        showModal('План сохранен в браузере! 🌱', 
            'Ваш экологический след и рекомендации сохранены локально. Вы можете вернуться в любое время, чтобы увидеть прогресс.');
    });
    
    // Скачивание плана как TXT файла
    downloadPlanBtn.addEventListener('click', function() {
        console.log('Скачивание плана как TXT файла...');
        downloadPlanAsTXT();
    });
    
    // Закрытие модального окна
    closeModal.addEventListener('click', function() {
        modal.classList.add('hidden');
    });
    
    // Закрытие модального окна по клику вне окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
    
    // Переключение темы
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Обновление иконки
        const themeIcon = themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Сохранение темы в localStorage
        localStorage.setItem('theme', newTheme);
    });
    
    // Проверка сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Функция показа модального окна
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }
    
    // Функция обновления UI с результатами
    function updateResultsUI(totalScore, categories, categoryInfo, equivalents, recommendations) {
        // Общий счет
        document.getElementById('totalScore').textContent = Math.round(totalScore);
        document.getElementById('scoreCategory').textContent = categoryInfo.name;
        document.getElementById('scoreDescription').textContent = categoryInfo.description;
        
        // Обновление кругового прогресса
        const maxScore = 500; // Максимальный отображаемый счет
        const percentage = Math.min((totalScore / maxScore) * 100, 100);
        const circle = document.querySelector('.progress-ring-fill');
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.stroke = categoryInfo.color;
        circle.style.strokeDashoffset = offset;
        
        // Визуализация по категориям
        updateBarsVisualization(categories);
        
        // Сравнение
        const userBar = document.getElementById('userBar');
        const userValue = document.getElementById('userValue');
        const averagePercentage = (totalScore / 300) * 100; // 300 - средний по стране
        
        userBar.style.width = `${Math.min(averagePercentage, 100)}%`;
        userBar.style.background = categoryInfo.color;
        userValue.textContent = `${Math.round(totalScore)} кг`;
        
        // Эквиваленты
        document.getElementById('treesCount').textContent = equivalents.trees;
        document.getElementById('poolsCount').textContent = equivalents.pools;
        document.getElementById('carKmEquivalent').textContent = equivalents.carKm;
        
        // Рекомендации
        updateRecommendations(recommendations);
    }
    
    // Функция обновления визуализации категорий
    function updateBarsVisualization(categories) {
        const barsContainer = document.getElementById('barsContainer');
        const maxValue = Math.max(...Object.values(categories));
        
        barsContainer.innerHTML = '';
        
        Object.entries(categories).forEach(([category, value]) => {
            const percentage = (value / maxValue) * 100;
            const barItem = document.createElement('div');
            barItem.className = 'bar-item';
            
            const categoryNames = {
                transport: 'Транспорт',
                food: 'Питание',
                energy: 'Энергия',
                water: 'Вода'
            };
            
            barItem.innerHTML = `
                <span class="bar-label">${categoryNames[category]}</span>
                <div class="bar">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="bar-value">${Math.round(value)} кг</span>
            `;
            
            barsContainer.appendChild(barItem);
        });
    }
    
    // Функция обновления рекомендаций
    function updateRecommendations(recommendations) {
        const recommendationsList = document.getElementById('recommendationsList');
        const icons = ['🌱', '💡', '🚲', '♻️', '🌍'];
        
        recommendationsList.innerHTML = '';
        
        recommendations.forEach((rec, index) => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <span class="recommendation-icon">${icons[index] || '✅'}</span>
                <p>${rec}</p>
            `;
            recommendationsList.appendChild(item);
        });
    }
    
    // Функция создания графика улучшений
    function createImprovementChart(currentScore) {
        const ctx = document.getElementById('improvementChart').getContext('2d');
        
        // Данные для графика (симуляция улучшений за 6 месяцев)
        const months = ['Текущий', '1 месяц', '2 месяца', '3 месяца', '4 месяца', '5 месяцев', '6 месяцев'];
        const improvementRate = 0.85; // Улучшение на 15% в месяц
        let scores = [currentScore];
        
        for (let i = 1; i < 7; i++) {
            scores.push(Math.max(scores[i-1] * improvementRate, ECO_DATA.goals.total));
        }
        
        // Уничтожение предыдущего графика, если он существует
        if (window.ecoChart) {
            window.ecoChart.destroy();
        }
        
        // Создание нового графика
        window.ecoChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Ваш экологический след (кг CO₂)',
                    data: scores.map(score => Math.round(score)),
                    borderColor: '#2E8B57',
                    backgroundColor: 'rgba(46, 139, 87, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Цель 2030',
                    data: Array(7).fill(ECO_DATA.goals.total),
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text')
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-light')
                        }
                    },
                    x: {
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-light')
                        }
                    }
                }
            }
        });
    }
    
    // Функция скачивания плана как TXT файла
    function downloadPlanAsTXT() {
        // Собираем данные
        const date = new Date().toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const totalScore = document.getElementById('totalScore').textContent;
        const scoreCategory = document.getElementById('scoreCategory').textContent;
        const scoreDescription = document.getElementById('scoreDescription').textContent;
        
        const recommendations = Array.from(document.querySelectorAll('.recommendation-item p'))
            .map(p => p.textContent);
        
        const trees = document.getElementById('treesCount').textContent;
        const pools = document.getElementById('poolsCount').textContent;
        const carKm = document.getElementById('carKmEquivalent').textContent;
        
        // Формируем содержимое файла
        const content = `
🌿 ЭКОЛОГИЧЕСКИЙ ПЛАН УЛУЧШЕНИЙ
================================
Дата создания: ${date}
Ваш экологический след: ${totalScore} кг CO₂/месяц
Категория: ${scoreCategory}

${scoreDescription}

📊 ВАШИ РЕЗУЛЬТАТЫ В ЭКВИВАЛЕНТАХ
---------------------------------
🌳 Для компенсации вашего следа потребуется ${trees} деревьев
🏊 Выбросы эквивалентны объёму ${pools} плавательных бассейнов
🚗 Как проехать ${carKm} км на среднестатистическом автомобиле

🎯 ПЕРСОНАЛИЗИРОВАННЫЕ РЕКОМЕНДАЦИИ
------------------------------------
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

📅 ПЛАН ДЕЙСТВИЙ НА БЛИЖАЙШИЙ МЕСЯЦ
-----------------------------------
Неделя 1:
- Выберите 2 самые простые рекомендации
- Начните внедрять их в свою жизнь

Неделя 2-3:
- Добавьте еще 1-2 рекомендации
- Отслеживайте свои успехи

Невеля 4:
- Подведите итоги месяца
- Вернитесь в калькулятор для проверки прогресса

📝 СОВЕТЫ ПО ВНЕДРЕНИЮ
----------------------
1. Начинайте с малого - даже маленькие изменения имеют значение
2. Расскажите друзьям о своих целях - это повысит ответственность
3. Отмечайте свои успехи - ведите экологический дневник
4. Присоединяйтесь к местным экологическим инициативам

🌍 ПОМНИТЕ
----------
Каждый ваш шаг к экологичному образу жизни вносит вклад
в сохранение планеты для будущих поколений.
Совместными усилиями мы можем сделать мир лучше!

══════════════════════════════════════════
Сгенерировано на EcoCalc 2026
Проект для демонстрации навыков веб-разработки
© 2026
══════════════════════════════════════════
        `.trim();
        
        // Создаем Blob и ссылку для скачивания
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Создаем временную ссылку для скачивания
        const a = document.createElement('a');
        a.href = url;
        a.download = `Экологический_план_${date.replace(/[:\s,]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        
        // Очищаем
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Показываем уведомление
        showModal('План скачан! 📥', 
            'Ваш персональный экологический план успешно скачан. Откройте файл для просмотра рекомендаций.');
    }
    
    // Загрузка сохраненного плана, если есть
    const savedPlan = localStorage.getItem('ecoImprovementPlan');
    if (savedPlan) {
        try {
            const plan = JSON.parse(savedPlan);
            console.log('Сохраненный план найден:', plan);
            // Можно добавить отображение сохраненного плана при желании
        } catch (e) {
            console.error('Ошибка при загрузке сохраненного плана:', e);
        }
    }
    
    console.log('Калькулятор готов к работе!');
});