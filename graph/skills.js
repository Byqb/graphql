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