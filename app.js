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
                path
            }
            progresses(where: {object: {type: {_eq: "project"}}}) {
                id
                isDone
                grade
                createdAt
                object {
                    id
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
        createXPProgressGraph(data.data.user[0].transactions);
        createProjectRatioGraph(data.data.user[0].progresses);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function displayUserInfo(user) {
    const totalXP = user.transactions.reduce((sum, t) => sum + t.amount, 0);
    const completedProjects = user.progresses.filter(p => p.isDone).length;

    userInfo.innerHTML = `
        <h2>${user.login}</h2>
        <p><strong>User ID:</strong> ${user.id}</p>
        <p><strong>Total XP:</strong> ${totalXP.toLocaleString()} XP</p>
        <p><strong>Completed Projects:</strong> ${completedProjects}</p>
    `;
}

function createXPProgressGraph(transactions) {
    const xpData = transactions.map(t => ({
        date: new Date(t.createdAt),
        xp: t.amount
    }));

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#xp-progress-graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(xpData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(xpData, d => d.xp)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.xp))
        .curve(d3.curveMonotoneX);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    const path = svg.append("path")
        .datum(xpData)
        .attr("fill", "none")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2)
        .attr("d", line);

    const totalLength = path.node().getTotalLength();

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("XP Progress Over Time");
}

function createProjectRatioGraph(progresses) {
    const projectData = [
        { status: "Passed", count: progresses.filter(p => p.isDone && p.grade > 0).length },
        { status: "Failed", count: progresses.filter(p => p.isDone && p.grade === 0).length },
        { status: "In Progress", count: progresses.filter(p => !p.isDone).length }
    ];

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal()
        .domain(projectData.map(d => d.status))
        .range(["#2ecc71", "#e74c3c", "#f39c12"]);

    const svg = d3.select("#project-ratio-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8);

    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const arcs = svg.selectAll("arc")
        .data(pie(projectData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("fill", d => color(d.data.status))
        .attr("d", arc)
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    arcs.append("text")
        .attr("transform", d => {
            const pos = outerArc.centroid(d);
            pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr("dy", ".35em")
        .style("text-anchor", d => midAngle(d) < Math.PI ? "start" : "end")
        .text(d => `${d.data.status}: ${d.data.count}`)
        .style("fill", "#34495e")
        .style("font-size", "12px");

    arcs.append("polyline")
        .attr("points", d => {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .style("fill", "none")
        .style("stroke", "#34495e")
        .style("stroke-width", "1px")
        .style("opacity", 0.5);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Project Status Distribution");
}

