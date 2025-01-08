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
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.classList.remove('hidden');
    profilePage.classList.add('loading');

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
        audits {
          id
          grade
        }
        results(where: {object: {type: {_eq: "piscine"}}}) {
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
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        
        displayUserInfo(data.data.user[0]);
        createXPOverTimeGraph(data.data.user[0].transactions);
        createXPByProjectGraph(data.data.user[0].transactions);
        createAuditRatioGraph(data.data.user[0].audits);
        createProjectRatioGraph(data.data.user[0].progresses);
        createPiscineStats(data.data.user[0].results);
    } catch (error) {
        console.error('Error fetching user data:', error);
        errorMessage.textContent = 'Failed to load profile data. Please try again.';
    } finally {
        loadingIndicator.classList.add('hidden');
        profilePage.classList.remove('loading');
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

function createXPOverTimeGraph(transactions) {
    const xpData = transactions.map(t => ({
        date: new Date(t.createdAt),
        xp: t.amount
    }));

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#xp-over-time svg")
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
        .attr("class", "line")
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

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
        .data(xpData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.xp))
        .attr("r", 5)
        .attr("fill", "#3498db")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Date: ${d.date.toLocaleDateString()}<br/>XP: ${d.xp}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const newX = event.transform.rescaleX(x);
        svg.select(".x-axis").call(d3.axisBottom(newX));
        svg.select(".line")
            .attr("d", d3.line()
                .x(d => newX(d.date))
                .y(d => y(d.xp))
            );
    }
}

function createXPByProjectGraph(transactions) {
    const projectXP = transactions.reduce((acc, t) => {
        const project = t.path.split('/').pop();
        acc[project] = (acc[project] || 0) + t.amount;
        return acc;
    }, {});

    const data = Object.entries(projectXP).map(([project, xp]) => ({ project, xp }));

    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#xp-by-project svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.project))
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.xp)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.project))
        .attr("y", d => y(d.xp))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.xp));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("XP Earned by Project");
}

function createAuditRatioGraph(audits) {
    const totalAudits = audits.length;
    const passedAudits = audits.filter(a => a.grade > 0).length;
    const failedAudits = totalAudits - passedAudits;

    const data = [
        { label: "Passed", value: passedAudits },
        { label: "Failed", value: failedAudits }
    ];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#2ecc71", "#e74c3c"]);

    const svg = d3.select("#audit-ratio svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcs = svg.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => `${d.data.label}: ${d.data.value}`);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Audit Ratio");
}

function createProjectRatioGraph(progresses) {
    const totalProjects = progresses.length;
    const passedProjects = progresses.filter(p => p.isDone && p.grade > 0).length;
    const failedProjects = progresses.filter(p => p.isDone && p.grade === 0).length;
    const inProgressProjects = totalProjects - passedProjects - failedProjects;

    const data = [
        { label: "Passed", value: passedProjects },
        { label: "Failed", value: failedProjects },
        { label: "In Progress", value: inProgressProjects }
    ];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#2ecc71", "#e74c3c", "#f39c12"]);

    const svg = d3.select("#project-ratio svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcs = svg.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => `${d.data.label}: ${d.data.value}`);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Project Status Distribution");

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width/2 + 10},${-height/2 + 50})`);

    legend.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => color(d.label));

    legend.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 15)
        .attr("y", (d, i) => i * 20 + 9)
        .text(d => d.label);
}

function createPiscineStats(results) {
    const piscineResults = results.filter(r => r.object.name.toLowerCase().includes('piscine'));
    
    // Pass/Fail Ratio
    const passedPiscines = piscineResults.filter(r => r.grade > 0).length;
    const failedPiscines = piscineResults.length - passedPiscines;

    const ratioData = [
        { label: "Passed", value: passedPiscines },
        { label: "Failed", value: failedPiscines }
    ];

    const width = 300;
    const height = 200;

    const svg = d3.select("#piscine-pass-fail svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .range([0, width])
        .domain(ratioData.map(d => d.label))
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(ratioData, d => d.value)])
        .range([height, 0]);

    svg.selectAll("rect")
        .data(ratioData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", (d, i) => i === 0 ? "#2ecc71" : "#e74c3c");

    svg.selectAll("text")
        .data(ratioData)
        .enter()
        .append("text")
        .text(d => d.value)
        .attr("x", d => x(d.label) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Piscine Pass/Fail Ratio");

    // Attempts for each exercise
    const exerciseAttempts = piscineResults.reduce((acc, r) => {
        const exercise = r.object.name;
        acc[exercise] = (acc[exercise] || 0) + 1;
        return acc;
    }, {});

    const attemptsData = Object.entries(exerciseAttempts).map(([exercise, attempts]) => ({ exercise, attempts }));

    const attemptsWidth = 600;
    const attemptsHeight = 300;

    const attemptsSvg = d3.select("#piscine-attempts svg")
        .attr("width", attemptsWidth)
        .attr("height", attemptsHeight);

    const attemptsX = d3.scaleBand()
        .range([0, attemptsWidth])
        .domain(attemptsData.map(d => d.exercise))
        .padding(0.1);

    const attemptsY = d3.scaleLinear()
        .domain([0, d3.max(attemptsData, d => d.attempts)])
        .range([attemptsHeight, 0]);

    attemptsSvg.selectAll("rect")
        .data(attemptsData)
        .enter()
        .append("rect")
        .attr("x", d => attemptsX(d.exercise))
        .attr("y", d => attemptsY(d.attempts))
        .attr("width", attemptsX.bandwidth())
        .attr("height", d => attemptsHeight - attemptsY(d.attempts))
        .attr("fill", "#3498db");

    attemptsSvg.selectAll("text")
        .data(attemptsData)
        .enter()
        .append("text")
        .text(d => d.attempts)
        .attr("x", d => attemptsX(d.exercise) + attemptsX.bandwidth() / 2)
        .attr("y", d => attemptsY(d.attempts) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333");

    attemptsSvg.append("text")
        .attr("x", attemptsWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Piscine Exercise Attempts");
}

// Add error boundaries for graph creation
function createGraphWithErrorHandling(createFn, data, containerId) {
    try {
        createFn(data);
    } catch (error) {
        console.error(`Error creating graph in ${containerId}:`, error);
        const container = document.getElementById(containerId);
        container.innerHTML = '<p class="error">Failed to load graph</p>';
    }
}

fetchUserData();

