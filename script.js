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
                        <td>${user.auditRatio}</td>
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
                    <p>Total XP: ${user.totalUp / 1000} XP</p>
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

        const margin = { top: 50, right: 60, bottom: 90, left: 100 };
        const width = 1000 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        svg
          .attr('viewBox', `0 0 1000 600`)
          .attr('preserveAspectRatio', 'xMidYMid meet');

        const g = svg
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // Process and sort data
        const data = transactions
          .map((t) => ({
            date: new Date(t.createdAt),
            xp: t.amount / 1000,
            path: t.path,
          }))
          .sort((a, b) => a.date - b.date);

        // Create scales with sorted dates
        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d.date))
          .range([0, width]);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d.xp) * 1.2])
          .range([height, 0]);

        // Add gradient definition
        const gradient = svg
          .append('defs')
          .append('linearGradient')
          .attr('id', 'bar-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%');

        gradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#64b5f6');

        gradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#1a73e8');

        // Add styled X axis with 4-month intervals
        g.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3
              .axisBottom(x)
              .tickFormat(d3.timeFormat('%b %Y'))
              .ticks(d3.timeMonth.every(4))
          ) // Show every 4 months
          .selectAll('text')
          .style('fill', '#ffffff')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .attr('transform', 'rotate(-45)')
          .attr('text-anchor', 'end');

        // Add styled Y axis
        g.append('g')
          .call(
            d3
              .axisLeft(y)
              .tickFormat((d) => `${Math.round(d)}kB`)
              .ticks(10)
          )
          .selectAll('text')
          .style('fill', '#ffffff')
          .style('font-size', '14px')
          .style('font-weight', 'bold');

        // Calculate bar width
        const barWidth = (width / data.length) * 0.8; // 80% of available space per bar

        // Add bars with enhanced styling
        const bars = g
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (d) => x(d.date) - barWidth / 2) // Center the bar on the date
          .attr('y', (d) => y(d.xp))
          .attr('width', barWidth)
          .attr('height', (d) => height - y(d.xp))
          .attr('fill', 'url(#bar-gradient)')
          .attr('rx', 12)
          .attr('ry', 12)
          .style('filter', 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))');

        // Enhanced hover effect
        bars
          .on('mouseover', function (event, d) {
            d3.select(this)
              .transition()
              .duration(300)
              .attr('fill', '#64b5f6')
              .style('filter', 'drop-shadow(0px 8px 12px rgba(0,0,0,0.4))')
              .attr('transform', 'translateY(-5px)');

            // Enhanced tooltip
            g.append('text')
              .attr('class', 'tooltip')
              .attr('x', x(d.date))
              .attr('y', y(d.xp) - 20)
              .attr('text-anchor', 'middle')
              .style('fill', '#ffffff')
              .style('font-size', '16px')
              .style('font-weight', 'bold')
              .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.3)')
              .text(`${Math.round(d.xp)}kB - ${d.path}`);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(300)
              .attr('fill', 'url(#bar-gradient)')
              .style('filter', 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))')
              .attr('transform', 'translateY(0)');

            g.selectAll('.tooltip').remove();
          });

        // Enhanced axis labels
        g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left + 30)
          .attr('x', 0 - height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .style('fill', '#ffffff')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .text('XP (kB)');

        // Add X axis label
        g.append('text')
          .attr('x', width / 2)
          .attr('y', height + margin.bottom - 20)
          .style('text-anchor', 'middle')
          .style('fill', '#ffffff')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .text('Date');

        // Style axis lines
        svg
          .selectAll('.domain, .tick line')
          .style('stroke', '#ffffff')
          .style('stroke-width', '2px');

        // Add subtle grid lines
        g.selectAll('g.y-axis g.tick')
          .append('line')
          .attr('class', 'grid-line')
          .attr('x2', width)
          .style('stroke', 'rgba(255, 255, 255, 0.1)')
          .style('stroke-width', '1px');
      }

      function drawAuditPieChart(up, down) {
        const svg = d3.select('#auditGraph');
        svg.selectAll('*').remove();

        // Update SVG viewBox for better scaling
        svg
          .attr('viewBox', `0 0 500 400`)
          .attr('preserveAspectRatio', 'xMidYMid meet');

        const width = 500;
        const height = 400;
        const radius = Math.min(width, height) / 2.5;

        const total = up + down;
        const upRatio = up / total;
        const downRatio = down / total;

        const centerX = width / 2;
        const centerY = height / 2;

        // Convert ratio to angles
        const upAngle = upRatio * 360;
        const downAngle = downRatio * 360;

        // Create pie slices
        const createSlice = (startAngle, endAngle, color) => {
          const start = polarToCartesian(centerX, centerY, radius, startAngle);
          const end = polarToCartesian(centerX, centerY, radius, endAngle);
          const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

          const path = [
            'M',
            centerX,
            centerY,
            'L',
            start.x,
            start.y,
            'A',
            radius,
            radius,
            0,
            largeArcFlag,
            1,
            end.x,
            end.y,
            'Z',
          ].join(' ');

          const slice = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          );
          slice.setAttribute('d', path);
          slice.setAttribute('fill', color);
          return slice;
        };

        svg.node().appendChild(createSlice(0, upAngle, '#4CAF50'));
        svg.node().appendChild(createSlice(upAngle, 360, '#F44336'));

        // Add legend
        addLegendItem(
          svg,
          350,
          120,
          '#4CAF50',
          `Up (${Math.round(upRatio * 100)}%)`
        );
        addLegendItem(
          svg,
          350,
          150,
          '#F44336',
          `Down (${Math.round(downRatio * 100)}%)`
        );
      }

      function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
          x: centerX + radius * Math.cos(angleInRadians),
          y: centerY + radius * Math.sin(angleInRadians),
        };
      }

      function addLegendItem(svg, x, y, color, text) {
        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        rect.setAttribute('x', x);
        rect.setAttribute('y', y - 10);
        rect.setAttribute('width', 20);
        rect.setAttribute('height', 20);
        rect.setAttribute('fill', color);
        svg.node().appendChild(rect);

        const label = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        label.setAttribute('x', x + 30);
        label.setAttribute('y', y + 5);
        label.textContent = text;
        svg.node().appendChild(label);
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