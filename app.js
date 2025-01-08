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
        transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
          id
          amount
          createdAt
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
        createXPOverTimeGraph(data.data.user[0].transactions);
    } catch (error) {
        errorMessage.textContent = 'Failed to load profile data. Please try again.';
    }
}

function displayUserInfo(user) {
    userInfo.innerHTML = `
        <h2>${user.login}</h2>
        <p><strong>User ID:</strong> ${user.id}</p>
        <p><strong>Total XP:</strong> ${user.transactions.reduce((sum, t) => sum + t.amount, 0)} XP</p>
    `;
}

function createXPOverTimeGraph(transactions) {
    const svg = d3.select("#xp-over-time svg");
    const width = 600, height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const data = transactions.map(t => ({ date: new Date(t.createdAt), xp: t.amount }));

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.xp)]).range([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.xp));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
}
