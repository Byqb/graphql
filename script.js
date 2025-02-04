const API_URL =
        'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
      const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';
      let jwt = localStorage.getItem('jwt');

      // Check if already logged in
      if (jwt) {
        showProfile();
      }

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
          localStorage.setItem('jwt', jwt);
          showProfile();
        } catch (error) {
          document.getElementById('loginError').textContent = error.message;
        }
      }

      function logout() {
        localStorage.removeItem('jwt');
        location.reload();
      }

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
    
            // Calculate total XP excluding piscine
            const totalXP = user.transactions
                .filter(t => t.path.toLowerCase().includes('piscine'))
                .reduce((sum, t) => sum + t.amount, 0) / 1000;
    

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

      function drawXPGraph(transactions) {
        const svg = d3.select('#xpGraph');
        svg.selectAll('*').remove();

        const margin = { top: 50, right: 60, bottom: 120, left: 100 };
        const width = 1000 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        svg.attr('viewBox', `0 0 1000 600`)
           .attr('preserveAspectRatio', 'xMidYMid meet');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Process and sort data, excluding piscine data
        const data = transactions
            .filter(t => !t.path.toLowerCase().includes('piscine')) // Filter out piscine entries
            .map((t) => ({
                date: new Date(t.createdAt),
                xp: t.amount / 1000,
                path: t.path,
                totalXp: 0 // Will be calculated below
            }))
            .sort((a, b) => a.date - b.date);

        // Calculate cumulative XP
        let cumulativeXp = 0;
        data.forEach(d => {
            cumulativeXp += d.xp;
            d.totalXp = cumulativeXp;
        });

        // Create scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalXp) * 1.1])
            .range([height, 0]);

        // Create gradient for area
        const areaGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "areaGradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        areaGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#64b5f6")
            .attr("stop-opacity", 0.8);

        areaGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#1a73e8")
            .attr("stop-opacity", 0.2);

        // Create line generator
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.totalXp))
            .curve(d3.curveMonotoneX);

        // Create area generator
        const area = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.totalXp))
            .curve(d3.curveMonotoneX);

        // Add grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat('')
            );

        // Add the area path
        g.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area)
            .style("fill", "url(#areaGradient)")
            .style("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))");

        // Add the line path
        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#64b5f6")
            .attr("stroke-width", 3)
            .attr("d", line)
            .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))");

        // Add X axis
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%b %Y")))
            .selectAll("text")
            .style("fill", "#ffffff")
            .style("font-size", "14px")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end");

        // Add Y axis
        g.append("g")
            .call(d3.axisLeft(y)
                .tickFormat(d => `${Math.round(d)}kB`))
            .selectAll("text")
            .style("fill", "#ffffff")
            .style("font-size", "14px");

        // Style axes
        g.selectAll(".domain, .tick line")
            .style("stroke", "#ffffff")
            .style("opacity", 0.5);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "#fff")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "14px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", 1000);

        // Add interactive points
        const points = g.selectAll(".point")
            .data(data)
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.totalXp))
            .attr("r", 6)
            .attr("fill", "#ffffff")
            .attr("stroke", "#64b5f6")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 8)
                    .attr("fill", "#64b5f6");

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html(`
                    <strong>Project:</strong> ${d.path}<br/>
                    <strong>XP Gained:</strong> ${Math.round(d.xp)}kB<br/>
                    <strong>Total XP:</strong> ${Math.round(d.totalXp)}kB<br/>
                    <strong>Date:</strong> ${d3.timeFormat("%B %d, %Y")(d.date)}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 6)
                    .attr("fill", "#ffffff");

                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add title
        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("fill", "#ffffff")
            .style("font-size", "24px")
            .style("font-weight", "bold")

        // Add axis labels
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 30)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#ffffff")
            .style("font-size", "18px")
            .text("Total XP (kB)");

        g.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 30)
            .style("text-anchor", "middle")
            .style("fill", "#ffffff")
            .style("font-size", "18px")
            .text("Date");
    }

      function drawAuditPieChart(up, down) {
        const svg = d3.select('#auditGraph');
        svg.selectAll('*').remove();

        // Update SVG viewBox for better scaling
        svg.attr('viewBox', `0 0 500 400`)
           .attr('preserveAspectRatio', 'xMidYMid meet');

        const width = 500;
        const height = 400;
        const radius = Math.min(width, height) / 3; // Slightly smaller radius
        const centerX = width / 2;
        const centerY = height / 2;

        // Calculate ratios
        const total = up + down;
        const upRatio = up / total;
        const downRatio = down / total;

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.6) // Create donut chart effect
            .outerRadius(radius);

        // Create pie generator
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // Prepare data
        const data = [
            { type: 'up', value: up },
            { type: 'down', value: down }
        ];

        // Create gradient definitions
        const defs = svg.append('defs');

        // Gradient for up slice
        const gradientUp = defs.append('linearGradient')
            .attr('id', 'gradientUp')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradientUp.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#4CAF50')
            .attr('stop-opacity', 0.8);

        gradientUp.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#45a049')
            .attr('stop-opacity', 1);

        // Gradient for down slice
        const gradientDown = defs.append('linearGradient')
            .attr('id', 'gradientDown')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradientDown.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#F44336')
            .attr('stop-opacity', 0.8);

        gradientDown.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#e53935')
            .attr('stop-opacity', 1);

        // Create group element for the chart
        const g = svg.append('g')
            .attr('transform', `translate(${centerX},${centerY})`);

        // Add slices
        const slices = g.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.type === 'up' ? 'url(#gradientUp)' : 'url(#gradientDown)')
            .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.2))')
            .style('transition', 'all 0.3s ease')
            .on('mouseover', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('transform', function(d) {
                        const [x, y] = arc.centroid(d);
                        return `translate(${x * 0.1},${y * 0.1})`;
                    });
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('transform', 'translate(0,0)');
            });

        // Add percentage labels
        g.selectAll('text')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
            .text(d => `${Math.round(d.data.value / total * 100)}%`);

        // Add title
        svg.append('text')
            .attr('x', centerX)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .text('Audit Ratio Distribution');

        // Add legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 120}, ${height - 100})`);

        // Up legend
        const upLegend = legend.append('g');
        upLegend.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', 'url(#gradientUp)');
        upLegend.append('text')
            .attr('x', 30)
            .attr('y', 15)
            .style('fill', '#ffffff')
            .text(`Up (${Math.round(upRatio * 100)}%)`);

        // Down legend
        const downLegend = legend.append('g')
            .attr('transform', 'translate(0, 30)');
        downLegend.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', 'url(#gradientDown)');
        downLegend.append('text')
            .attr('x', 30)
            .attr('y', 15)
            .style('fill', '#ffffff')
            .text(`Down (${Math.round(downRatio * 100)}%)`);
    }

      function drawSkillsGraph(skills) {
        const svg = d3.select('#skillsGraph');
        svg.selectAll('*').remove();
    
        const margin = { top: 50, right: 60, bottom: 90, left: 100 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
    
        svg
            .attr('viewBox', `0 0 800 400`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
    
        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    
        // Process data
        const data = skills.map(skill => ({
            type: skill.type.replace('skill_', ''), // Remove "skill_" prefix
            amount: skill.amount
        }));
    
        // Create scales
        const x = d3
            .scaleBand()
            .domain(data.map(d => d.type))
            .range([0, width])
            .padding(0.2);
    
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.amount)])
            .range([height, 0]);
    
        // Add bars
        g.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.type))
            .attr('y', d => y(d.amount))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.amount))
            .attr('fill', '#64b5f6')
            .attr('rx', 8)
            .attr('ry', 8)
            .style('filter', 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))');
    
        // Add X axis
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('fill', '#ffffff')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end');
    
        // Add Y axis
        g.append('g')
            .call(d3.axisLeft(y).ticks(10))
            .selectAll('text')
            .style('fill', '#ffffff')
            .style('font-size', '12px')
            .style('font-weight', 'bold');
    
        // Add Y axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 30)
            .attr('x', 0 - height / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text('Amount');
    
        // Add X axis label
        g.append('text')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 20)
            .style('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text('Skill Type');
    }


    function displayProgressTable(progresses) {
        const table = document.createElement('table');
        table.className = 'progress-table';
    
        // Create table header
        const headerRow = document.createElement('tr');
        const headers = ['Path', 'Created At', 'Grade', 'Captain', 'Auditors'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
    
        // Populate table rows
        progresses.forEach(progress => {
            const row = document.createElement('tr');
    
            // Path
            const pathCell = document.createElement('td');
            pathCell.textContent = progress.path;
            row.appendChild(pathCell);
    
            // Created At
            const createdAtCell = document.createElement('td');
            createdAtCell.textContent = new Date(progress.createdAt).toLocaleString();
            row.appendChild(createdAtCell);
    
            // Grade
            const gradeCell = document.createElement('td');
            gradeCell.textContent = progress.grade || 'N/A';
            row.appendChild(gradeCell);
    
            // Captain
            const captainCell = document.createElement('td');
            captainCell.textContent = progress.group?.captainLogin || 'N/A';
            row.appendChild(captainCell);
    
            // Auditors
            const auditorsCell = document.createElement('td');
            const auditors = progress.group?.auditors?.map(a => a.auditorLogin).join(', ') || 'N/A';
            auditorsCell.textContent = auditors;
            row.appendChild(auditorsCell);
    
            table.appendChild(row);
        });
    
        // Append the table to the DOM
        const progressTableContainer = document.getElementById('progressTableContainer');
        progressTableContainer.innerHTML = ''; // Clear previous content
        progressTableContainer.appendChild(table);
    }

    function displayProgressTable(progresses) {
      const table = document.createElement('table');
      table.className = 'progress-table';
  
      // Create table header
      const headerRow = document.createElement('tr');
      const headers = ['Path', 'Created At', 'Grade', 'Captain', 'Auditors'];
      headers.forEach(headerText => {
          const th = document.createElement('th');
          th.textContent = headerText;
          headerRow.appendChild(th);
      });
      table.appendChild(headerRow);
  
      // Populate table rows
      progresses.forEach(progress => {
          const row = document.createElement('tr');
  
          // Path
          const pathCell = document.createElement('td');
          pathCell.textContent = progress.path;
          row.appendChild(pathCell);
  
          // Created At
          const createdAtCell = document.createElement('td');
          createdAtCell.textContent = new Date(progress.createdAt).toLocaleString();
          row.appendChild(createdAtCell);
  
          // Grade
          const gradeCell = document.createElement('td');
          gradeCell.textContent = progress.grade ;
          row.appendChild(gradeCell);
  
          // Captain
          const captainCell = document.createElement('td');
          captainCell.textContent = progress.group?.captainLogin ;
          row.appendChild(captainCell);
  
          // Auditors
          const auditorsCell = document.createElement('td');
          const auditors = progress.group?.auditors?.map(a => a.auditorLogin).join(', ');
          auditorsCell.textContent = auditors;
          row.appendChild(auditorsCell);
  
          table.appendChild(row);
      });
  
      // Append the table to the DOM
      const progressTableContainer = document.getElementById('progressTableContainer');
      progressTableContainer.innerHTML = ''; // Clear previous content
      progressTableContainer.appendChild(table);
  }