// API endpoints
const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';
let jwt = localStorage.getItem('jwt');

// Check if user is already logged in
if (jwt) {
    showProfile();
}

// Session management constants
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;  // Check every 5 minutes

// Basic session management
function setSession(token) {
    localStorage.setItem('session', token);
}

function getSession() {
    return localStorage.getItem('session');
}

function clearSession() {
    localStorage.removeItem('session');
}

// Handle user login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const credentials = btoa(`${username}:${password}`);

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        jwt = data;
        
        // Store JWT and session timestamp
        const session = {
            token: jwt,
            timestamp: Date.now(),
        };
        localStorage.setItem('session', JSON.stringify(session));
        
        showProfile();
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
    }
}

// Handle user logout
function logout() {
    localStorage.removeItem('session');
    localStorage.removeItem('jwt');
    location.reload();
}

// Check if session is valid
function isSessionValid() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session) return false;
    
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    return sessionAge < SESSION_DURATION;
}

// Refresh session timestamp
function refreshSession() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session) {
        session.timestamp = Date.now();
        localStorage.setItem('session', JSON.stringify(session));
    }
}

// Initialize session management
function initSessionManager() {
    // Check session validity on load
    if (!isSessionValid()) {
        logout();
        return;
    }

    // Get JWT from session
    const session = JSON.parse(localStorage.getItem('session'));
    jwt = session.token;

    // Periodic session check
    setInterval(() => {
        if (!isSessionValid()) {
            logout();
        }
    }, SESSION_CHECK_INTERVAL);

    // Refresh session timestamp on user activity
    ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
        document.addEventListener(event, refreshSession);
    });
}

// Update initial check
if (localStorage.getItem('session')) {
    initSessionManager();
}

// Utility function to fetch data from GraphQL API
async function fetchGraphQLData(query) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });
    return response.json();
}