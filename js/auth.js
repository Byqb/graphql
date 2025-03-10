// API endpoints
const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';
let jwt = localStorage.getItem('jwt');

// Check if user is already logged in
if (jwt) {
    showProfile();
}

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
        setSession(data); // Store token in session
        showProfile();
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
    }
}

// Handle user logout
function logout() {
    clearSession();
    location.reload();
}

// Check session on page load
if (getSession()) {
    showProfile();
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