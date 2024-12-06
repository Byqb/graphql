const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';

let token = null;

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const loginPage = document.getElementById('login-page');
const profilePage = document.getElementById('profile-page');
const userInfo = document.getElementById('user-info');
const logoutButton = document.getElementById('logout-button');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${username}:${password}`)}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        token = data.token;
        showProfilePage();
        fetchUserData();
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

logoutButton.addEventListener('click', () => {
    token = null;
    showLoginPage();
});

function showLoginPage() {
    loginPage.classList.remove('hidden');
    profilePage.classList.add('hidden');
}

function showProfilePage() {
    loginPage.classList.add('hidden');
    profilePage.classList.remove('hidden');
}

async function fetchUserData() {
    const query = `
    {
        user {
            id
            login
            transactions {
                id
                type
                amount
                createdAt
            }
            progresses {
                id
                grade
                createdAt
                object {
                    name
                }
            }
        }
    }
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        displayUserInfo(data.data.user[0]);
        createXPGraph(data.data.user[0].transactions);
        createAuditRatioGraph(data.data.user[0].progresses);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function displayUserInfo(user) {
    const totalXP = user.transactions
        .filter(t => t.type === 'xp')
        .reduce((sum, t) => sum + t.amount, 0);

    userInfo.innerHTML = `
        <h2>${user.login}</h2>
        <p>User ID: ${user.id}</p>
        <p>Total XP: ${totalXP}</p>
    `;
}

function createXPGraph(transactions) {
    const xpData = transactions
        .filter(t => t.type === 'xp')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 600 200');

    const xScale = 600 / xpData.length;
    const yScale = 180 / Math.max(...xpData.map(t => t.amount));

    let path = `M0,200`;
    let cumulativeXP = 0;

    xpData.forEach((t, index) => {
        cumulativeXP += t.amount;
        const x = index * xScale;
        const y = 200 - cumulativeXP * yScale;
        path += ` L${x},${y}`;
    });

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', path);
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('stroke', '#007bff');
    pathElement.setAttribute('stroke-width', '2');

    svg.appendChild(pathElement);

    const xpGraph = document.getElementById('xp-graph');
    xpGraph.innerHTML = '<h3>XP Progress Over Time</h3>';
    xpGraph.appendChild(svg);
}

function createAuditRatioGraph(progresses) {
    const auditData = progresses.filter(p => p.object.name.toLowerCase().includes('audit'));
    const totalAudits = auditData.length;
    const passedAudits = auditData.filter(p => p.grade > 0).length;
    const failedAudits = totalAudits - passedAudits;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 100 100');

    const passedPercentage = (passedAudits / totalAudits) * 100;
    const failedPercentage = 100 - passedPercentage;

    const passedSlice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    passedSlice.setAttribute('cx', '50');
    passedSlice.setAttribute('cy', '50');
    passedSlice.setAttribute('r', '25');
    passedSlice.setAttribute('fill', 'transparent');
    passedSlice.setAttribute('stroke', '#28a745');
    passedSlice.setAttribute('stroke-width', '50');
    passedSlice.setAttribute('stroke-dasharray', `${passedPercentage} 100`);

    const failedSlice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    failedSlice.setAttribute('cx', '50');
    failedSlice.setAttribute('cy', '50');
    failedSlice.setAttribute('r', '25');
    failedSlice.setAttribute('fill', 'transparent');
    failedSlice.setAttribute('stroke', '#dc3545');
    failedSlice.setAttribute('stroke-width', '50');
    failedSlice.setAttribute('stroke-dasharray', `${failedPercentage} 100`);
    failedSlice.setAttribute('stroke-dashoffset', `-${passedPercentage}`);

    svg.appendChild(passedSlice);
    svg.appendChild(failedSlice);

    const auditRatioGraph = document.getElementById('audit-ratio-graph');
    auditRatioGraph.innerHTML = `
        <h3>Audit Ratio</h3>
        ${svg.outerHTML}
        <p>Passed: ${passedAudits} (${passedPercentage.toFixed(1)}%)</p>
        <p>Failed: ${failedAudits} (${failedPercentage.toFixed(1)}%)</p>
    `;
}

