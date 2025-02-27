// Function to create audit ratio pie chart using D3.js
function drawAuditPieChart(up, down) {
    // Clear existing chart
    const svg = d3.select('#auditGraph');
    svg.selectAll('*').remove();

    // Set up chart dimensions
    const width = 400;
    const height = 200;
    const barHeight = 20;
    const margin = { top: 40, left: 100, right: 100, bottom: 40 };

    // Update SVG viewBox
    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // Calculate ratio
    const ratio = (up / down).toFixed(1);

    // Create group for the visualization
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add "Done" bar
    g.append('rect')
        .attr('width', width - margin.left - margin.right)
        .attr('height', barHeight)
        .attr('fill', '#4CAF50')
        .attr('rx', 4);

    // Add "Received" bar
    g.append('rect')
        .attr('y', barHeight + 20)
        .attr('width', (width - margin.left - margin.right) * 0.7)
        .attr('height', barHeight)
        .attr('fill', '#ffffff')
        .attr('rx', 4);

    // Add labels
    g.append('text')
        .attr('x', -10)
        .attr('y', barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .style('fill', '#ffffff')
        .text('Done');

    g.append('text')
        .attr('x', -10)
        .attr('y', barHeight * 2 + 20)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .style('fill', '#ffffff')
        .text('Received');

    // Add values
    g.append('text')
        .attr('x', width - margin.left - margin.right + 10)
        .attr('y', barHeight / 2)
        .attr('dy', '0.35em')
        .style('fill', '#ffffff')
        .text(`${(up / 1000000).toFixed(2)} MB ↑`);

    g.append('text')
        .attr('x', width - margin.left - margin.right + 10)
        .attr('y', barHeight * 2 + 20)
        .attr('dy', '0.35em')
        .style('fill', '#ffffff')
        .text(`${(down / 1000000).toFixed(2)} MB ↓`);

    // Add ratio display
    svg.append('text')
        .attr('x', 50)
        .attr('y', height - 20)
        .style('fill', '#1cd4a5')
        .style('font-size', '48px')
        .style('font-weight', 'bold')
        .text(ratio);

    // Add "Almost perfect!" text
    svg.append('text')
        .attr('x', 140)
        .attr('y', height - 10)
        .style('fill', '#1cd4a5')
        .style('font-size', '16px')
        .text('Almost perfect!');
}