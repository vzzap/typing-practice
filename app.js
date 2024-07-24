const textDisplay = document.getElementById('text-display');
const userInput = document.getElementById('user-input');
const keyboard = document.getElementById('keyboard');

const keyboardLayout = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', ' ', ' ', 'Alt', 'Space', ' ', ' ', ' ']
];

const words = ['the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only'];

let currentText = '';
let startTime;
let errors = 0;
let speedData = [];
let accuracyData = [];

const speedChart = new Chart(document.getElementById('speedChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Speed (WPM)',
            data: [],
            borderColor: '#b8bb26', // Gruvbox green
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#ebdbb2' }
            },
            x: {
                ticks: { color: '#ebdbb2' }
            }
        },
        plugins: {
            legend: {
                labels: { color: '#ebdbb2' }
            }
        }
    }
});

const accuracyChart = new Chart(document.getElementById('accuracyChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Accuracy (%)',
            data: [],
            borderColor: '#fabd2f', // Gruvbox yellow
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#ebdbb2' }
            },
            x: {
                ticks: { color: '#ebdbb2' }
            }
        },
        plugins: {
            legend: {
                labels: { color: '#ebdbb2' }
            }
        }
    }
});

function createKeyboard() {
    keyboardLayout.forEach(row => {
        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key');
            keyElement.textContent = key;
            if (['Backspace', 'Enter'].includes(key)) {
                keyElement.classList.add('more-wide');
            } else if (['Shift'].includes(key)) {
                keyElement.classList.add('extra-more-wide');
            } else if (['Caps'].includes(key)) {
                keyElement.classList.add('more-wide');
            } else if (['Tab', 'Ctrl', '\\'].includes(key)) {
                keyElement.classList.add('wide');
            }
            if (key === 'Space') {
                keyElement.classList.add('space');
            }
            keyboard.appendChild(keyElement);
        });
    });
}

function generateText(length = 30) {
    return Array.from({length}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

function newText() {
    currentText = generateText();
    textDisplay.textContent = currentText;
    userInput.value = '';
    startTime = null;
    errors = 0;
}

function startTimer() {
    startTime = new Date();
}

function calculateWPM() {
    const endTime = new Date();
    const timeElapsed = (endTime - startTime) / 1000 / 60; // in minutes
    const wordsTyped = userInput.value.trim().split(/\s+/).length;
    return Math.round(wordsTyped / timeElapsed);
}

function calculateAccuracy() {
    const totalCharacters = userInput.value.length;
    return totalCharacters > 0 ? Math.round(((totalCharacters - errors) / totalCharacters) * 100) : 100;
}

function updateCharts(wpm, accuracy) {
    const timestamp = new Date().toLocaleTimeString();
    speedData.push({ x: wpm, y: wpm });
    accuracyData.push({ x: accuracy, y: accuracy });

    if (speedData.length > 10) {
        speedData.shift();
        accuracyData.shift();
    }

    speedChart.data.labels = speedData.map(d => d.x);
    speedChart.data.datasets[0].data = speedData.map(d => d.y);
    speedChart.update();

    accuracyChart.data.labels = accuracyData.map(d => d.x);
    accuracyChart.data.datasets[0].data = accuracyData.map(d => d.y);
    accuracyChart.update();
}

function highlightKey(key) {
    const keyElement = Array.from(keyboard.children).find(el => el.textContent.toLowerCase() === key.toLowerCase());
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => keyElement.classList.remove('active'), 100);
    }
}

document.addEventListener('keydown', function(e) {
    if (!startTime) startTimer();

    const key = e.key;
    highlightKey(key);

    if (key === 'Backspace') {
        if (currentChar > 0) {
            currentChar--;
            updateWordDisplay();
        } else if (currentWord > 0) {
            currentWord--;
            currentChar = currentText[currentWord].length;
            updateWordDisplay();
        }
    } else if (key.length === 1) {
        const currentWordEl = textDisplay.children[currentWord];
        if (currentChar < currentText[currentWord].length) {
            if (key === currentText[currentWord][currentChar]) {
                currentWordEl.classList.add('correct');
            } else {
                currentWordEl.classList.add('incorrect');
                errors++;
            }
            currentChar++;
        } else if (key === ' ' && currentWord < currentText.length - 1) {
            currentWord++;
            currentChar = 0;
            updateWordDisplay();
        }

        if (currentWord === currentText.length - 1 && currentChar === currentText[currentWord].length) {
            const wpm = calculateWPM();
            const accuracy = calculateAccuracy();
            updateCharts(wpm, accuracy);
            setTimeout(newText, 1000);
        }
    }

    e.preventDefault();
});

userInput.addEventListener('input', function(e) {
    if (!startTime) startTimer();

    const currentInput = e.target.value;
    const currentLength = currentInput.length;

    if (currentInput !== currentText.slice(0, currentLength)) {
        errors++;
    }

    if (currentInput === currentText) {
        const wpm = calculateWPM();
        const accuracy = calculateAccuracy();
        updateCharts(wpm, accuracy);
        setTimeout(newText, 1000);
    } else {
        const wpm = calculateWPM();
        const accuracy = calculateAccuracy();
        updateCharts(wpm, accuracy);
    }
});

createKeyboard();
newText();
