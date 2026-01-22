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
// Расчет экологического следа (ИСПРАВЛЕННЫЙ)
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
        
        // Принудительная перерисовка после небольшой задержки
        setTimeout(() => {
            if (window.ecoChart) {
                const canvas = document.getElementById('improvementChart');
                if (canvas) {
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                }
                window.ecoChart.update();
            }
        }, 300);
        
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
        
        // Эквиваленты
        document.getElementById('treesCount').textContent = equivalents.trees;
        document.getElementById('poolsCount').textContent = equivalents.pools;
        document.getElementById('carKmEquivalent').textContent = equivalents.carKm;
        
        // Рекомендации
        updateRecommendations(recommendations);
    }
    
    // Функция обновления визуализации категорий
    // Функция обновления визуализации категорий (ИСПРАВЛЕННАЯ)
    function updateBarsVisualization(categories) {
        // Обновляем значения в существующих элементах (а не создаем новые)
        document.getElementById('transportValue').textContent = Math.round(categories.transport) + ' кг';
        document.getElementById('foodValue').textContent = Math.round(categories.food) + ' кг';
        document.getElementById('energyValue').textContent = Math.round(categories.energy) + ' кг';
        document.getElementById('waterValue').textContent = Math.round(categories.water) + ' кг';
        
        // Также обновляем полосы сравнения
        updateComparisonBars(categories);
    }
    // Функция обновления полос сравнения (новая)
    function updateComparisonBars(categories) {
        const totalScore = CALCULATIONS.calculateTotal(categories);
        
        // Обновляем пользовательскую полосу
        const userBar = document.querySelector('.user-bar');
        const userValue = document.getElementById('userComparisonValue');
        
        if (userBar && userValue) {
            const percentage = Math.min((totalScore / 300) * 100, 100);
            userBar.style.width = `${percentage}%`;
            userValue.textContent = `${Math.round(totalScore)} кг`;
        }
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
    // Функция создания графика улучшений (ИСПРАВЛЕННАЯ ВЕРСИЯ)
        function createImprovementChart(currentScore) {
        console.log('=== СОЗДАНИЕ ГРАФИКА ===');
        console.log('Текущий счет:', currentScore);
        
        const canvas = document.getElementById('improvementChart');
        console.log('Canvas найден:', !!canvas);
        
        if (!canvas) {
            console.error('❌ Canvas не найден!');
            return;
        }
        
        // Очищаем canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Устанавливаем размеры
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 250;
        
        console.log('Размеры canvas:', canvas.width, 'x', canvas.height);
        
        // Уничтожаем старый график
        if (window.ecoChart) {
            console.log('Уничтожаем старый график');
            window.ecoChart.destroy();
            window.ecoChart = null;
        }
        
        // Простейшие данные
        const labels = ['Сейчас', '1 мес', '2 мес', '3 мес', '4 мес', '5 мес', '6 мес'];
        const userData = [
            currentScore,
            currentScore * 0.9,
            currentScore * 0.8,
            currentScore * 0.7,
            currentScore * 0.65,
            currentScore * 0.6,
            Math.max(currentScore * 0.55, 150)
        ].map(num => Math.round(num));
        
        console.log('Данные графика:', userData);
        
        try {
            window.ecoChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ваш экослед',
                        data: userData,
                        borderColor: '#2E8B57',
                        backgroundColor: 'rgba(46, 139, 87, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 0
                        }
                    }
                }
            });
            
            console.log('✅ График создан успешно!');
            
            // Принудительное обновление
            setTimeout(() => {
                window.ecoChart.update();
                console.log('График обновлен');
            }, 100);
            
        } catch (error) {
            console.error('❌ Ошибка создания графика:', error);
        }
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
    
    // ===== УЛУЧШЕННАЯ АДАПТИВНОСТЬ ДЛЯ МОБИЛЬНЫХ =====
    (function() {
        // Исправляем высоту для мобильных браузеров
        function fixMobileHeight() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Адаптивная высота для модального окна
            if (modal && !modal.classList.contains('hidden')) {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent && window.innerHeight < 500) {
                    modalContent.style.maxHeight = '70vh';
                }
            }
        }
        
        // Предотвращаем зум при двойном тапе на iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Скрываем возможные баннеры активации Windows
        function hideWindowsBanners() {
            setTimeout(() => {
                document.querySelectorAll('div').forEach(el => {
                    const text = el.textContent || '';
                    if (text.includes('Активизация') || 
                        text.includes('Активация') || 
                        text.includes('Windows') ||
                        text.includes('активация Windows')) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.height = '0';
                        el.style.overflow = 'hidden';
                    }
                });
            }, 500);
        }
        
        // Адаптация слайдеров для мобильных
        function adaptSlidersForMobile() {
            if (window.innerWidth < 768) {
                document.querySelectorAll('.slider-container').forEach(container => {
                    const valueDisplay = container.querySelector('.slider-value');
                    if (valueDisplay) {
                        // На мобильных делаем отображение значения более заметным
                        valueDisplay.style.position = 'static';
                        valueDisplay.style.display = 'block';
                        valueDisplay.style.margin = '8px auto 0';
                        valueDisplay.style.width = 'fit-content';
                    }
                });
            }
        }
        
        // Пересчет графика при изменении размера окна
        function handleResize() {
            fixMobileHeight();
            adaptSlidersForMobile();
            hideWindowsBanners();
            
            // Перерисовываем график, если он существует
            if (window.ecoChart) {
                setTimeout(() => {
                    window.ecoChart.resize();
                }, 100);
            }
        }
        
        // Инициализация
        fixMobileHeight();
        adaptSlidersForMobile();
        hideWindowsBanners();
        
        // Обработчики событий
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', function() {
            setTimeout(handleResize, 100);
        });
        
        // Улучшение для очень медленных устройств
        if ('connection' in navigator && navigator.connection.saveData === true) {
            console.log('Режим экономии данных включен, оптимизируем...');
            // Можно добавить дополнительные оптимизации
        }
    })();
});
