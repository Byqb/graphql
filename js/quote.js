// Array of motivational quotes with their authors
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" }
];

// Function to display a random quote with fade effect
function displayRandomQuote() {
    const quoteElement = document.getElementById('quote');
    const authorElement = document.getElementById('author');
    const quoteContainer = document.getElementById('quoteContainer');

    // Add fade-out effect
    quoteContainer.style.opacity = '0';

    setTimeout(() => {
        // Select and display random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];

        quoteElement.textContent = `"${quote.text}"`;
        authorElement.textContent = `${quote.author}`;

        // Add fade-in effect
        quoteContainer.style.opacity = '1';
    }, 500);
}

// Initialize the quote system with timer
function initQuoteSystem() {
    displayRandomQuote();

    const intervalTime = 30; // seconds between quotes
    let timeLeft = intervalTime;

    // Update timer every second
    const timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);

        if (timeLeft <= 0) {
            displayRandomQuote();
            timeLeft = intervalTime;
        }
    }, 1000);
}

// Add timer element to quote container
const timerHTML = `<div id="quoteTimer" class="quote-timer"></div>`;
document.querySelector('.quote-container').insertAdjacentHTML('beforeend', timerHTML);

// Start the quote system
initQuoteSystem();