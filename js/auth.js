// API endpoints
const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';

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

// Check session on page load
window.addEventListener('load', () => {
    if (getSession()) {
        // User is logged in, show their profile/dashboard
        showProfile();
    } 
});

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
        setSession(data); // Store token in session
        showProfile();
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
    }
}

// Handle user logout
function logout() {
    clearSession();
    hideProfile();
}

// Utility function to fetch data from GraphQL API
async function fetchGraphQLData(query) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getSession()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });
    return response.json();
}