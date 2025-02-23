// Function to create audit ratio pie chart using D3.js
function drawAuditPieChart(up, down) {
    // Clear existing chart
    const svg = d3.select('#auditGraph');
    svg.selectAll('*').remove();

    // Set up chart dimensions
    const width = 500;
    const height = 400;
    const radius = Math.min(width, height) / 3;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate audit ratios
    const total = up + down;
    const upRatio = up / total;
    const downRatio = down / total;

    // Create arc generator for pie segments
    const arc = d3.arc()
        .innerRadius(radius * 0.6) // Create donut chart effect
        .outerRadius(radius);

    // Create pie layout generator
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    // Prepare data for pie chart
    const data = [
        { type: 'up', value: up },
        { type: 'down', value: down }
    ];

    // Update SVG viewBox for better scaling
    svg.attr('viewBox', `0 0 500 400`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

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