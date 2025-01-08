// Constants
const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';

// Authentication handling
async function login(credentials) {
    const base64Creds = btoa(`${credentials.username}:${credentials.password}`);
    
    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${base64Creds}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        
        const data = await response.json();
        localStorage.setItem('jwt', data.token);
        return true;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

function logout() {
    localStorage.removeItem('jwt');
    window.location.href = '/login.html';
}

// GraphQL queries
async function fetchUserData() {
    const jwt = localStorage.getItem('jwt');
    
    const query = `
        query {
            user {
                id
                login
                totalXp
                skills {
                    name
                    level
                }
                transactions {
                    type
                    amount
                    createdAt
                }
                // Add more fields as needed
            }
        }
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        return null;
    }
}

// SVG Graph Generation
function createXPOverTimeGraph(transactions) {
    // Implementation for XP over time graph using SVG
}

function createAuditRatioGraph(auditData) {
    // Implementation for audit ratio graph using SVG
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Setup login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const success = await login({ username, password });
            if (success) {
                window.location.href = '/profile.html';
            } else {
                // Show error message
            }
        });
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});