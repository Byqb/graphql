async function showProfile() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'block';

    const query = `
        query {
          user {
            id
            login
            firstName
            lastName
            totalUp
            totalDown
            auditRatio
            progresses(order_by: {updatedAt: desc}) {
                path
                createdAt
                grade
                group {
                    captainLogin
                    auditors {
                        auditorLogin
                    }
                }
            }
            audits {
                group {
                    captainLogin
                    auditors {
                        endAt
                    }
                }
                grade
            }
            transactions(where: {type: {_eq: "xp"}, eventId: {_is_null: false}}, order_by: {createdAt: asc}) {
                amount
                createdAt
                path
            }
            skills: transactions(where: {type: {_like: "%skill_%"}}, order_by: {id: asc}) {
                amount
                type
            }
        }
    }
    `;

    try {
        const data = await fetchGraphQLData(query);
        const user = data.data.user[0];

        // Calculate audit ratio
        const auditRatio = user.totalUp / user.totalDown || 0;

        // Calculate total XP using totalUp - totalDown
        const totalXP = (user.totalUp - user.totalDown) / 1000;

        // Display basic info
        document.getElementById('basicInfo').innerHTML = `
            <div class="welcome-message">Welcome, ${user.firstName} ${user.lastName}!</div>
            <table class="user-info-table">
                <tr>
                    <td><strong>ID:</strong></td>
                    <td>${user.id}</td>
                </tr>
                <tr>
                    <td><strong>Audit Ratio:</strong></td>
                    <td>
                        <div class="audit-ratio-container">
                            <span class="audit-ratio-text">${auditRatio.toFixed(1)}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td><strong>Full Name:</strong></td>
                    <td>${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                    <td><strong>Username:</strong></td>
                    <td>${user.login}</td>
                </tr>
                <tr>
                    <td><strong>Campus:</strong></td>
                    <td>Bahrain</td>
                </tr>
                <tr>
                    <td><strong>Last Project:</strong></td>
                    <td>${
                        user.progresses[0]
                            ? `${user.progresses[0].path} (${new Date(user.progresses[0].createdAt).toLocaleString()})`
                            : 'No projects yet'
                    }</td>
                </tr>
                <tr>
                    <td><strong>Total XP:</strong></td>
                    <td>${Math.round(totalXP)} kB</td>
                </tr>
            </table>
        `;

        // Draw graphs
        drawXPGraph(user.transactions);
        drawAuditPieChart(user.totalUp, user.totalDown);
        drawSkillsGraph(user.skills);

        // Display progress table
        displayProgressTable(user.progresses);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Array of quotes
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

// Function to format time
function formatTime(seconds) {
    return `${seconds}s`;
}

// Function to update countdown timer
function updateTimer(timeLeft) {
    const timerElement = document.getElementById('quoteTimer');
    if (timerElement) {
        timerElement.textContent = `Next quote in: ${formatTime(timeLeft)}`;
    }
}

// Function to display random quote with pixel-style animation
function displayRandomQuote() {
    const quoteElement = document.getElementById('quote');
    const authorElement = document.getElementById('author');
    const quoteContainer = document.getElementById('quoteContainer');
    
    // Add fade-out effect
    quoteContainer.style.opacity = '0';
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        
        quoteElement.textContent = `"${quote.text}"`;
        authorElement.textContent = `${quote.author}`;
        
        // Add fade-in effect
        quoteContainer.style.opacity = '1';
    }, 500);
}

// Initialize timer and quote display
function initQuoteSystem() {
    displayRandomQuote();
    
    const intervalTime = 30; // seconds
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

// Add this HTML element for the timer
const timerHTML = `<div id="quoteTimer" class="quote-timer"></div>`;
document.querySelector('.quote-container').insertAdjacentHTML('beforeend', timerHTML);

// Start the quote system
initQuoteSystem();