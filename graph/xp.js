// Function to create XP progress graph using D3.js
function drawXPGraph(transactions) {
    // Clear existing graph
    const svg = d3.select('#xpGraph');
    svg.selectAll('*').remove();

    // Set up graph dimensions and margins
    const margin = { top: 50, right: 60, bottom: 120, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Configure SVG viewport
    svg.attr('viewBox', `0 0 1000 600`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main graph group
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process and filter data (exclude piscine entries)
    const data = transactions
        .filter(t => !t.path.toLowerCase().includes('piscine'))
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