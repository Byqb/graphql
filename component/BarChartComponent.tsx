import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarChartProps {
  auditsDone: number;
  auditsReceived: number;
}

export const BarChartComponent: React.FC<BarChartProps> = ({ auditsDone, auditsReceived }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    svg.selectAll("*").remove();

    const x = d3.scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top]);

    const data = [
      { category: 'Audits Done', value: auditsDone },
      { category: 'Audits Received', value: auditsReceived },
    ];

    x.domain(data.map(d => d.category));
    y.domain([0, d3.max(data, d => d.value) || 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.category) || 0)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin.bottom - y(d.value))
      .attr("fill", "#3498db");

  }, [auditsDone, auditsReceived]);

  return <svg ref={svgRef} width="300" height="200"></svg>;
};

