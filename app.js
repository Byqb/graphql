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

// Enhanced GraphQL queries
const PROFILE_QUERY = `
  query {
    user {
      id
      login
      totalUp
      totalDown
      transactions(order_by: {createdAt: asc}) {
        id
        type
        amount
        createdAt
      }
      progresses {
        id
        object {
          name
          type
        }
        grade
        createdAt
      }
      results {
        id
        grade
        createdAt
        object {
          name
          type
        }
      }
    }
  }
`;

// Function to update UI with user data
function updateProfileUI(userData) {
    // Basic Info
    const userBasic = document.querySelector('.user-basic');
    userBasic.innerHTML = `
        <h3>Basic Info</h3>
        <p>Username: ${userData.login}</p>
        <p>ID: ${userData.id}</p>
    `;

    // XP Info
    const userXP = document.querySelector('.user-xp');
    const totalXP = userData.transactions
        .filter(t => t.type === 'xp')
        .reduce((sum, t) => sum + t.amount, 0);
    userXP.innerHTML = `
        <h3>XP Progress</h3>
        <p>Total XP: ${Math.round(totalXP).toLocaleString()}</p>
    `;

    // Create XP Graph
    createXPOverTimeGraph(userData.transactions);
    createAuditRatioGraph(userData.results);
}

// Enhanced SVG Graph Generation
function createXPOverTimeGraph(transactions) {
    const xpTransactions = transactions
        .filter(t => t.type === 'xp')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const svg = document.getElementById('xpGraph');
    // Clear existing content
    svg.innerHTML = '';
    
    // Calculate dimensions
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = 40;
    
    // Create scales
    const xScale = d3.scaleTime()
        .domain([
            new Date(transactions[0].createdAt),
            new Date(transactions[transactions.length - 1].createdAt)
        ])
        .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(transactions, d => d.amount)])
        .range([height - padding, padding]);

    // Create line
    const line = d3.line()
        .x(d => xScale(new Date(d.createdAt)))
        .y(d => yScale(d.amount));

    // Add path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', line(transactions));
    path.setAttribute('stroke', '#4CAF50');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    //
    // Add axes
    // ... axis implementation
}

function createAuditRatioGraph(results) {
    const auditResults = results.filter(r => r.object.type === 'audit');
    const svg = document.getElementById('auditGraph');
    
    // Create pie chart for audit ratio
    // ... SVG pie chart implementation
}

// Update login handler to show/hide sections
async function handleLogin(credentials) {
    const success = await login(credentials);
    if (success) {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('profileSection').classList.remove('hidden');
        
        const userData = await fetchUserData();
        if (userData) {
            updateProfileUI(userData.user);
        }
    } else {
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.textContent = 'Invalid credentials. Please try again.';
    }
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