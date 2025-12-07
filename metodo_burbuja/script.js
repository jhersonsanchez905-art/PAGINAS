// ========================================
// GLOBAL VARIABLES
// ========================================
let currentArray = [];
let originalArray = [];
let sortingInProgress = false;
let isPaused = false;
let animationSpeed = 500;
let comparisons = 0;
let swaps = 0;
let passes = 0;
let animationTimeout = null;

// Practice mode variables
let practiceArray = [];
let practiceOriginal = [];
let selectedBar = null;
let userMoves = 0;
let optimalMoves = 0;

// Quiz variables
let quizStarted = false;
let currentQuizAnswers = {};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeBackground();
    initializeBubbles();
    initializeTabs();
    initializeVisualizer();
    initializePractice();
    initializeComplexity();
    initializeQuiz();
});

// ========================================
// FUTURISTIC ATLANTIS BACKGROUND
// ========================================
function initializeBackground() {
    // Crear contenedor de fondo Atlantis
    const atlantisDiv = document.createElement('div');
    atlantisDiv.className = 'atlantis-background';
    
    // Crear rayos de luz
    const lightRays = document.createElement('div');
    lightRays.className = 'light-rays';
    atlantisDiv.appendChild(lightRays);
    
    // Crear ciudad futurista
    const futuristicCity = document.createElement('div');
    futuristicCity.className = 'futuristic-city';
    
    // Crear edificios
    const cityBuildings = document.createElement('div');
    cityBuildings.className = 'city-buildings';
    
    // Generar 7 edificios
    for (let i = 0; i < 7; i++) {
        const building = document.createElement('div');
        building.className = 'building';
        cityBuildings.appendChild(building);
    }
    
    futuristicCity.appendChild(cityBuildings);
    atlantisDiv.appendChild(futuristicCity);
    
    // Insertar al principio del body
    document.body.insertBefore(atlantisDiv, document.body.firstChild);
}

// ========================================
// ANIMATED BUBBLES - SOLUCIÓN: FLUJO CONSTANTE
// ========================================
function initializeBubbles() {
    const bubblesContainer = document.getElementById('bubblesContainer');
    
    // SOLUCIÓN: Crear solo 3-5 burbujas iniciales
    const initialBubbles = 5;
    
    for (let i = 0; i < initialBubbles; i++) {
        createBubble(bubblesContainer, i);
    }
    
    // SOLUCIÓN: Crear nuevas burbujas a intervalos regulares constantes
    // Esto mantiene un flujo uniforme en todo momento
    setInterval(() => {
        createBubble(bubblesContainer, Math.random() * 100);
    }, 800); // Una nueva burbuja cada 800ms (ajusta este valor si quieres más o menos frecuencia)
}

function createBubble(container, index) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Tamaño grande constante (120px)
    const size = 120;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    
    // Posición horizontal aleatoria
    const leftPosition = Math.random() * 100;
    bubble.style.left = leftPosition + '%';
    
    // Velocidad de flotación aleatoria (10-18 segundos)
    const duration = Math.random() * 8 + 10;
    bubble.style.animationDuration = duration + 's';
    
    // Sin retraso para que aparezcan inmediatamente
    bubble.style.animationDelay = '0s';
    
    // Deriva horizontal aleatoria para el movimiento
    const driftAmount = (Math.random() - 0.5) * 200; // -100px a 100px
    const driftStart = driftAmount * 0.3;
    const driftMid = driftAmount * 0.7;
    const driftEnd = driftAmount;
    
    bubble.style.setProperty('--drift-start', driftStart + 'px');
    bubble.style.setProperty('--drift-mid', driftMid + 'px');
    bubble.style.setProperty('--drift-end', driftEnd + 'px');
    
    // Opacidad aleatoria
    const opacity = Math.random() * 0.4 + 0.3; // 0.3 a 0.7
    bubble.style.setProperty('--bubble-opacity', opacity);
    
    container.appendChild(bubble);
    
    // Eliminar la burbuja después de que termine la animación
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.remove();
        }
    }, duration * 1000);
}

// ========================================
// TAB NAVIGATION
// ========================================
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            // Stop any ongoing animations when switching tabs
            stopSorting();
        });
    });
}

// ========================================
// VISUALIZER SECTION
// ========================================
function initializeVisualizer() {
    // Generate initial array
    generateNewArray();

    // Event listeners
    document.getElementById('arraySize').addEventListener('input', function(e) {
        document.getElementById('arraySizeValue').textContent = e.target.value;
    });

    document.getElementById('speed').addEventListener('change', function(e) {
        animationSpeed = parseInt(e.target.value);
    });

    document.getElementById('generateArray').addEventListener('click', generateNewArray);
    document.getElementById('startSort').addEventListener('click', startSorting);
    document.getElementById('pauseSort').addEventListener('click', pauseSorting);
    document.getElementById('resetSort').addEventListener('click', resetSorting);
    
    // NUEVA FUNCIONALIDAD: Event listener para cargar array personalizado
    document.getElementById('loadCustomArray').addEventListener('click', loadCustomArray);
    
    // NUEVA FUNCIONALIDAD: Permitir cargar con Enter
    document.getElementById('customArrayInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadCustomArray();
        }
    });

    // NUEVA FUNCIONALIDAD: Limpiar mensajes de error al escribir
    document.getElementById('customArrayInput').addEventListener('input', function() {
        hideCustomArrayMessages();
        // Aplicar estilo de foco
        this.style.borderColor = 'rgba(91, 155, 213, 0.6)';
        this.style.boxShadow = '0 0 0 3px rgba(91, 155, 213, 0.2)';
    });

    document.getElementById('customArrayInput').addEventListener('blur', function() {
        this.style.borderColor = 'rgba(91, 155, 213, 0.3)';
        this.style.boxShadow = 'none';
    });
}

// ========================================
// NUEVA FUNCIÓN: CARGAR ARRAY PERSONALIZADO
// ========================================
function loadCustomArray() {
    const input = document.getElementById('customArrayInput');
    const inputValue = input.value.trim();
    
    // Ocultar mensajes previos
    hideCustomArrayMessages();
    
    // Validar que no esté vacío
    if (inputValue === '') {
        showCustomArrayError('❌ Por favor, ingresa al menos un número.');
        return;
    }
    
    // Parsear los números
    const numberStrings = inputValue.split(',').map(s => s.trim()).filter(s => s !== '');
    
    // Validar que haya números
    if (numberStrings.length === 0) {
        showCustomArrayError('❌ No se encontraron números válidos.');
        return;
    }
    
    // Convertir a números
    const numbers = [];
    for (let i = 0; i < numberStrings.length; i++) {
        const num = parseFloat(numberStrings[i]);
        
        // Validar que sea un número
        if (isNaN(num)) {
            showCustomArrayError(`❌ "${numberStrings[i]}" no es un número válido.`);
            return;
        }
        
        // Validar rango (entre 1 y 999)
        if (num < 1 || num > 999) {
            showCustomArrayError('❌ Los números deben estar entre 1 y 999.');
            return;
        }
        
        // Convertir a entero
        numbers.push(Math.round(num));
    }
    
    // Validar cantidad de elementos
    if (numbers.length < 3) {
        showCustomArrayError('❌ Ingresa al menos 3 números.');
        return;
    }
    
    if (numbers.length > 15) {
        showCustomArrayError('❌ El máximo es 15 números para mejor visualización.');
        return;
    }
    
    // Todo validado correctamente, cargar el array
    currentArray = numbers;
    originalArray = [...currentArray];
    resetStats();
    displayArray(currentArray);
    
    // Mostrar mensaje de éxito
    showCustomArraySuccess(`✅ Array cargado exitosamente: [${currentArray.join(', ')}]`);
    
    // Limpiar el input después de 2 segundos
    setTimeout(() => {
        input.value = '';
        hideCustomArrayMessages();
    }, 3000);
}

// ========================================
// NUEVAS FUNCIONES: MENSAJES DE ERROR Y ÉXITO
// ========================================
function showCustomArrayError(message) {
    const errorDiv = document.getElementById('customArrayError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Animación de aparición
    errorDiv.style.animation = 'fadeIn 0.3s ease';
}

function showCustomArraySuccess(message) {
    const successDiv = document.getElementById('customArraySuccess');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Animación de aparición
    successDiv.style.animation = 'fadeIn 0.3s ease';
}

function hideCustomArrayMessages() {
    document.getElementById('customArrayError').style.display = 'none';
    document.getElementById('customArraySuccess').style.display = 'none';
}

// ========================================
// FUNCIONES EXISTENTES (sin cambios)
// ========================================
function generateNewArray() {
    const size = parseInt(document.getElementById('arraySize').value);
    currentArray = [];
    
    for (let i = 0; i < size; i++) {
        currentArray.push(Math.floor(Math.random() * 100) + 10);
    }
    
    originalArray = [...currentArray];
    resetStats();
    displayArray(currentArray);
    
    // Limpiar mensajes de array personalizado
    hideCustomArrayMessages();
}

function displayArray(array, comparingIndices = [], swappingIndices = [], sortedIndices = []) {
    const container = document.getElementById('arrayBars');
    container.innerHTML = '';
    
    const maxValue = Math.max(...array);
    const containerWidth = container.clientWidth;
    const barCount = array.length;
    
    // CAMBIO IMPORTANTE: Aumentar espacio entre círculos de 16px a 24px
    const totalGap = 24 * (barCount - 1);
    const availableWidth = containerWidth - totalGap;
    
    // CAMBIO IMPORTANTE: Tamaño mínimo de círculo aumentado de 80px a 110px
    const barSize = Math.min(110, availableWidth / barCount);
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        // Las barras son círculos, así que width = height
        bar.style.width = `${barSize}px`;
        bar.style.height = `${barSize}px`;
        
        const barValue = document.createElement('span');
        barValue.className = 'bar-value';
        barValue.textContent = value;
        bar.appendChild(barValue);
        
        // Apply states
        if (sortedIndices.includes(index)) {
            bar.classList.add('sorted');
        } else if (comparingIndices.includes(index)) {
            bar.classList.add('comparing');
        } else if (swappingIndices.includes(index)) {
            bar.classList.add('swapping');
        }
        
        container.appendChild(bar);
    });
}

function resetStats() {
    comparisons = 0;
    swaps = 0;
    passes = 0;
    updateStats();
    updateStatus('Listo');
}

function updateStats() {
    document.getElementById('comparisons').textContent = comparisons;
    document.getElementById('swaps').textContent = swaps;
    document.getElementById('passes').textContent = passes;
}

function updateStatus(status) {
    document.getElementById('status').textContent = status;
}

async function startSorting() {
    if (sortingInProgress) return;
    
    sortingInProgress = true;
    isPaused = false;
    
    document.getElementById('startSort').disabled = true;
    document.getElementById('pauseSort').disabled = false;
    document.getElementById('generateArray').disabled = true;
    document.getElementById('loadCustomArray').disabled = true;
    
    updateStatus('Ordenando...');
    
    await bubbleSortVisualization();
    
    if (!isPaused) {
        updateStatus('¡Completado!');
        document.getElementById('startSort').disabled = false;
        document.getElementById('pauseSort').disabled = true;
        document.getElementById('generateArray').disabled = false;
        document.getElementById('loadCustomArray').disabled = false;
    }
    
    sortingInProgress = false;
}

function pauseSorting() {
    isPaused = true;
    sortingInProgress = false;
    updateStatus('Pausado');
    document.getElementById('startSort').disabled = false;
    document.getElementById('pauseSort').disabled = true;
    document.getElementById('loadCustomArray').disabled = false;
}

function stopSorting() {
    if (animationTimeout) {
        clearTimeout(animationTimeout);
    }
    isPaused = true;
    sortingInProgress = false;
    document.getElementById('startSort').disabled = false;
    document.getElementById('pauseSort').disabled = true;
    document.getElementById('generateArray').disabled = false;
    document.getElementById('loadCustomArray').disabled = false;
}

function resetSorting() {
    stopSorting();
    currentArray = [...originalArray];
    resetStats();
    displayArray(currentArray);
}

async function bubbleSortVisualization() {
    const n = currentArray.length;
    let sortedIndices = [];
    
    for (let i = 0; i < n - 1 && !isPaused; i++) {
        passes++;
        updateStats();
        let swapped = false;
        
        for (let j = 0; j < n - i - 1 && !isPaused; j++) {
            comparisons++;
            updateStats();
            
            // Highlight comparing elements
            displayArray(currentArray, [j, j + 1], [], sortedIndices);
            await sleep(animationSpeed);
            
            if (currentArray[j] > currentArray[j + 1]) {
                // Swap
                swaps++;
                updateStats();
                
                // Show swapping animation
                displayArray(currentArray, [], [j, j + 1], sortedIndices);
                await sleep(animationSpeed);
                
                [currentArray[j], currentArray[j + 1]] = [currentArray[j + 1], currentArray[j]];
                swapped = true;
                
                displayArray(currentArray, [], [], sortedIndices);
                await sleep(animationSpeed / 2);
            }
        }
        
        sortedIndices.push(n - i - 1);
        displayArray(currentArray, [], [], sortedIndices);
        
        if (!swapped) break;
    }
    
    // Mark all as sorted
    sortedIndices = Array.from({length: n}, (_, i) => i);
    displayArray(currentArray, [], [], sortedIndices);
}

function sleep(ms) {
    return new Promise(resolve => {
        animationTimeout = setTimeout(resolve, ms);
    });
}

// ========================================
// PRACTICE SECTION
// ========================================
function initializePractice() {
    document.getElementById('newPracticeArray').addEventListener('click', generatePracticeArray);
    document.getElementById('showSolution').addEventListener('click', showSolution);
    document.getElementById('resetPractice').addEventListener('click', resetPractice);
    
    generatePracticeArray();
}

function generatePracticeArray() {
    const size = 6;
    practiceArray = [];
    
    for (let i = 0; i < size; i++) {
        practiceArray.push(Math.floor(Math.random() * 50) + 10);
    }
    
    practiceOriginal = [...practiceArray];
    userMoves = 0;
    selectedBar = null;
    
    // Calculate optimal moves
    optimalMoves = calculateOptimalMoves([...practiceArray]);
    
    updatePracticeStats();
    displayPracticeArray();
    hidePracticeResult();
}

function displayPracticeArray() {
    const container = document.getElementById('practiceArray');
    container.innerHTML = '';
    
    const maxValue = Math.max(...practiceArray);
    // CAMBIO IMPORTANTE: Tamaño de círculos en práctica aumentado de 80px a 100px
    const barSize = 100;
    
    practiceArray.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'practice-bar';
        bar.style.width = `${barSize}px`;
        bar.style.height = `${barSize}px`;
        bar.dataset.index = index;
        
        const barValue = document.createElement('span');
        barValue.className = 'practice-bar-value';
        barValue.textContent = value;
        bar.appendChild(barValue);
        
        bar.addEventListener('click', () => handlePracticeBarClick(index));
        
        container.appendChild(bar);
    });
}

function handlePracticeBarClick(index) {
    const bars = document.querySelectorAll('.practice-bar');
    
    if (selectedBar === null) {
        // First selection
        selectedBar = index;
        bars[index].classList.add('selected');
    } else if (selectedBar === index) {
        // Deselect
        selectedBar = null;
        bars[index].classList.remove('selected');
    } else {
        // Second selection - swap
        bars[selectedBar].classList.remove('selected');
        
        // Perform swap
        [practiceArray[selectedBar], practiceArray[index]] = 
            [practiceArray[index], practiceArray[selectedBar]];
        
        userMoves++;
        selectedBar = null;
        
        displayPracticeArray();
        updatePracticeStats();
        checkPracticeSolution();
    }
}

function calculateOptimalMoves(arr) {
    let moves = 0;
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                moves++;
            }
        }
    }
    
    return moves;
}

function updatePracticeStats() {
    document.getElementById('userMoves').textContent = userMoves;
    document.getElementById('optimalMoves').textContent = optimalMoves;
    
    if (userMoves > 0) {
        const efficiency = ((optimalMoves / userMoves) * 100).toFixed(1);
        document.getElementById('efficiency').textContent = efficiency + '%';
    } else {
        document.getElementById('efficiency').textContent = '-';
    }
}

function checkPracticeSolution() {
    const isSorted = practiceArray.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
    
    if (isSorted) {
        const resultDiv = document.getElementById('practiceResult');
        resultDiv.classList.add('show');
        
        const efficiency = ((optimalMoves / userMoves) * 100).toFixed(1);
        let message = '';
        let emoji = '';
        
        if (userMoves === optimalMoves) {
            emoji = '🏆';
            message = '¡PERFECTO! Lo resolviste con el número óptimo de movimientos.';
        } else if (efficiency >= 80) {
            emoji = '🎉';
            message = '¡Excelente! Tu solución es muy eficiente.';
        } else if (efficiency >= 60) {
            emoji = '👏';
            message = '¡Bien hecho! Puedes mejorar un poco más.';
        } else {
            emoji = '👍';
            message = 'Completado. ¡Sigue practicando para mejorar!';
        }
        
        resultDiv.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
            <h3>${message}</h3>
            <p style="margin-top: 1rem; font-size: 1.1rem;">
                Movimientos: <strong>${userMoves}</strong> | 
                Óptimo: <strong>${optimalMoves}</strong> | 
                Eficiencia: <strong>${efficiency}%</strong>
            </p>
        `;
        
        // Mark all bars as correct
        document.querySelectorAll('.practice-bar').forEach(bar => {
            bar.classList.add('correct');
        });
    }
}

function showSolution() {
    practiceArray = [...practiceOriginal].sort((a, b) => a - b);
    displayPracticeArray();
    
    document.querySelectorAll('.practice-bar').forEach(bar => {
        bar.classList.add('correct');
    });
    
    const resultDiv = document.getElementById('practiceResult');
    resultDiv.classList.add('show');
    resultDiv.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">💡</div>
        <h3>Solución mostrada</h3>
        <p>Movimientos óptimos necesarios: <strong>${optimalMoves}</strong></p>
    `;
}

function resetPractice() {
    practiceArray = [...practiceOriginal];
    userMoves = 0;
    selectedBar = null;
    displayPracticeArray();
    updatePracticeStats();
    hidePracticeResult();
}

function hidePracticeResult() {
    document.getElementById('practiceResult').classList.remove('show');
}

// ========================================
// COMPLEXITY SECTION - CORRECCIÓN PRINCIPAL
// ========================================
function initializeComplexity() {
    drawComplexityChart();
}

// FUNCIÓN CORREGIDA: testComplexity con arrays más grandes y mejor formato de tiempo
function testComplexity(caseType) {
    let testArray = [];
    let resultId = '';
    
    // CORRECCIÓN: Usar arrays de 100 elementos para obtener tiempos medibles
    switch(caseType) {
        case 'best':
            // Mejor caso: array ya ordenado de 100 elementos
            testArray = Array.from({length: 100}, (_, i) => i + 1);
            resultId = 'bestResult';
            break;
        case 'worst':
            // Peor caso: array en orden inverso de 100 elementos
            testArray = Array.from({length: 100}, (_, i) => 100 - i);
            resultId = 'worstResult';
            break;
        case 'average':
            // Caso promedio: array aleatorio de 100 elementos
            testArray = Array.from({length: 100}, () => Math.floor(Math.random() * 100) + 1);
            resultId = 'averageResult';
            break;
    }
    
    // Ejecutar el test de ordenamiento y medir tiempo
    const startTime = performance.now();
    const result = bubbleSortTest(testArray);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    
    // CORRECCIÓN: Formatear el tiempo correctamente
    let timeDisplay = '';
    if (timeTaken < 1) {
        // Si es menor a 1ms, mostrar en microsegundos
        timeDisplay = (timeTaken * 1000).toFixed(2) + ' μs';
    } else if (timeTaken < 1000) {
        // Si es menor a 1 segundo, mostrar en milisegundos
        timeDisplay = timeTaken.toFixed(4) + ' ms';
    } else {
        // Si es mayor o igual a 1 segundo, mostrar en segundos
        timeDisplay = (timeTaken / 1000).toFixed(4) + ' s';
    }
    
    const resultDiv = document.getElementById(resultId);
    resultDiv.innerHTML = `
        <strong>Resultado:</strong><br>
        Comparaciones: ${result.comparisons}<br>
        Intercambios: ${result.swaps}<br>
        Tiempo: ${timeDisplay}<br>
        Array ordenado: [${result.array.slice(0, 10).join(', ')}...]
    `;
}

function bubbleSortTest(arr) {
    arr = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
                swapped = true;
            }
        }
        
        if (!swapped) break;
    }
    
    return { array: arr, comparisons, swaps };
}

function drawComplexityChart() {
    const canvas = document.getElementById('complexityChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#00d4ff';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Tamaño del Array (n)', width / 2, height - 20);
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Operaciones', 0, 0);
    ctx.restore();
    
    // Draw O(n²) curve
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
        const n = i / 10;
        const x = padding + (i / 100) * (width - 2 * padding);
        const operations = n * n;
        const maxOps = 100;
        const y = height - padding - (operations / maxOps) * (height - 2 * padding);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw O(n) curve
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
        const n = i / 10;
        const x = padding + (i / 100) * (width - 2 * padding);
        const operations = n;
        const maxOps = 100;
        const y = height - padding - (operations / maxOps) * (height - 2 * padding);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Legend
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width - 200, 40, 20, 20);
    ctx.fillStyle = '#00d4ff';
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('O(n²) - Peor/Promedio', width - 170, 55);
    
    ctx.fillStyle = '#10b981';
    ctx.fillRect(width - 200, 70, 20, 20);
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('O(n) - Mejor caso', width - 170, 85);
}

// ========================================
// QUIZ SECTION
// ========================================
const quizQuestions = [
    {
        question: "¿Cuál es la complejidad temporal en el peor caso del algoritmo Bubble Sort?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
        correct: 2
    },
    {
        question: "¿Qué sucede en cada pasada del algoritmo Bubble Sort?",
        options: [
            "El elemento más pequeño se mueve al inicio",
            "El elemento más grande 'burbujea' hacia su posición final",
            "Se divide el array en dos partes",
            "Se ordena todo el array"
        ],
        correct: 1
    },
    {
        question: "¿Cuándo puede terminar el Bubble Sort antes de completar todas las pasadas?",
        options: [
            "Nunca, siempre debe completar n-1 pasadas",
            "Cuando encuentra el elemento más grande",
            "Cuando no se realiza ningún intercambio en una pasada",
            "Cuando la mitad del array está ordenada"
        ],
        correct: 2
    },
    {
        question: "¿Cuál es la complejidad espacial del Bubble Sort?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct: 3
    },
    {
        question: "Para un array de 5 elementos ya ordenado, ¿cuántas comparaciones realiza Bubble Sort optimizado?",
        options: ["0 comparaciones", "4 comparaciones", "10 comparaciones", "25 comparaciones"],
        correct: 1
    },
    {
        question: "¿Bubble Sort es un algoritmo estable?",
        options: [
            "Sí, mantiene el orden relativo de elementos iguales",
            "No, cambia el orden de elementos iguales",
            "Depende de la implementación",
            "Solo es estable en el mejor caso"
        ],
        correct: 0
    },
    {
        question: "¿Cuántos intercambios se necesitan para ordenar [3, 1, 2]?",
        options: ["1 intercambio", "2 intercambios", "3 intercambios", "4 intercambios"],
        correct: 1
    },
    {
        question: "¿Qué ventaja tiene Bubble Sort sobre otros algoritmos de ordenamiento?",
        options: [
            "Es el más rápido",
            "Es simple de entender e implementar",
            "Usa menos memoria",
            "Todas las anteriores"
        ],
        correct: 1
    }
];

function initializeQuiz() {
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
    document.getElementById('restartQuiz').addEventListener('click', restartQuiz);
    
    // Display leaderboard on load
    displayLeaderboard();
}

function startQuiz() {
    quizStarted = true;
    currentQuizAnswers = {};
    
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    
    quizQuestions.forEach((q, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        const questionTitle = document.createElement('h4');
        questionTitle.textContent = `${qIndex + 1}. ${q.question}`;
        questionDiv.appendChild(questionTitle);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';
        
        q.options.forEach((option, oIndex) => {
            const optionLabel = document.createElement('label');
            optionLabel.className = 'quiz-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question${qIndex}`;
            radio.value = oIndex;
            radio.addEventListener('change', () => {
                currentQuizAnswers[qIndex] = oIndex;
            });
            
            optionLabel.appendChild(radio);
            optionLabel.appendChild(document.createTextNode(option));
            optionsDiv.appendChild(optionLabel);
        });
        
        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
    
    document.getElementById('startQuiz').style.display = 'none';
    document.getElementById('submitQuiz').style.display = 'inline-block';
    document.getElementById('quizResults').classList.remove('show');
}

function submitQuiz() {
    let correctCount = 0;
    
    quizQuestions.forEach((q, qIndex) => {
        const userAnswer = currentQuizAnswers[qIndex];
        const options = document.querySelectorAll(`input[name="question${qIndex}"]`);
        
        options.forEach((option, oIndex) => {
            const label = option.parentElement;
            
            if (oIndex === q.correct) {
                label.classList.add('correct');
            } else if (oIndex === userAnswer && userAnswer !== q.correct) {
                label.classList.add('incorrect');
            }
            
            option.disabled = true;
        });
        
        if (userAnswer === q.correct) {
            correctCount++;
        }
    });
    
    const percentage = ((correctCount / quizQuestions.length) * 100).toFixed(1);
    
    const resultsDiv = document.getElementById('quizResults');
    resultsDiv.classList.add('show');
    
    let feedback = '';
    let emoji = '';
    
    if (percentage >= 90) {
        emoji = '🏆';
        feedback = '¡Excelente! Dominas el Bubble Sort perfectamente.';
    } else if (percentage >= 70) {
        emoji = '🎉';
        feedback = '¡Muy bien! Tienes un buen entendimiento del algoritmo.';
    } else if (percentage >= 50) {
        emoji = '👏';
        feedback = 'Bien, pero puedes mejorar. Revisa la teoría.';
    } else {
        emoji = '📚';
        feedback = 'Necesitas estudiar más sobre el algoritmo.';
    }
    
    resultsDiv.innerHTML = `
        <div style="font-size: 5rem;">${emoji}</div>
        <h3>${feedback}</h3>
        <div class="quiz-score">${correctCount}/${quizQuestions.length}</div>
        <p style="font-size: 1.5rem; color: var(--primary);">${percentage}%</p>
    `;
    
    document.getElementById('submitQuiz').style.display = 'none';
    document.getElementById('restartQuiz').style.display = 'inline-block';
    
    // Save to leaderboard
    saveToLeaderboard(correctCount, percentage);
}

function restartQuiz() {
    document.getElementById('startQuiz').style.display = 'inline-block';
    document.getElementById('submitQuiz').style.display = 'none';
    document.getElementById('restartQuiz').style.display = 'none';
    document.getElementById('quizContainer').innerHTML = '';
    document.getElementById('quizResults').classList.remove('show');
}

function saveToLeaderboard(score, percentage) {
    const name = prompt('¡Felicidades! Ingresa tu nombre para el ranking:') || 'Anónimo';
    
    let leaderboard = JSON.parse(localStorage.getItem('bubbleSortLeaderboard') || '[]');
    
    leaderboard.push({
        name: name,
        score: score,
        percentage: percentage,
        date: new Date().toLocaleDateString()
    });
    
    leaderboard.sort((a, b) => b.score - a.score || b.percentage - a.percentage);
    leaderboard = leaderboard.slice(0, 10); // Keep top 10
    
    localStorage.setItem('bubbleSortLeaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('bubbleSortLeaderboard') || '[]');
    const container = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay registros aún. ¡Sé el primero!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        
        item.innerHTML = `
            <span class="leaderboard-rank">${medal} ${index + 1}</span>
            <span class="leaderboard-name">${entry.name}</span>
            <span class="leaderboard-score">${entry.score}/${quizQuestions.length} (${entry.percentage}%)</span>
        `;
        
        container.appendChild(item);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Handle window resize for chart
window.addEventListener('resize', () => {
    if (document.getElementById('complexity').classList.contains('active')) {
        drawComplexityChart();
    }
});