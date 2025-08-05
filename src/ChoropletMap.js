import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const ChoropletMap = ({ educationData, countiesData }) => {
  const svgRef = useRef();

  // Estado para controlar o tooltip
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!educationData || !countiesData || !svgRef.current) return;

    const width = 960;
    const height = 600;

    const counties = feature(countiesData, countiesData.objects.counties).features;

    const educationMap = {};
    educationData.forEach(d => {
      educationMap[d.fips] = {
        area_name: d.area_name,
        state: d.state,
        bachelorsOrHigher: d.bachelorsOrHigher,
      };
    });

    const color = d3.scaleQuantize()
      .domain([d3.min(educationData, d => d.bachelorsOrHigher), d3.max(educationData, d => d.bachelorsOrHigher)])
      .range(d3.schemeGreens[9]);

    const path = d3.geoPath();

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Adiciona os condados ao mapa
    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(counties)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", d => d.id)
      .attr("data-education", d => educationMap[d.id] ? educationMap[d.id].bachelorsOrHigher : 0)
      .attr("fill", d => educationMap[d.id] ? color(educationMap[d.id].bachelorsOrHigher) : '#ccc')
      .attr("d", path)
      .on("mouseover", (event, d) => {
        const data = educationMap[d.id];
        if (data) {
          // Atualiza o estado do tooltip
          setTooltip({
            visible: true,
            content: `${data.area_name}, ${data.state}: ${data.bachelorsOrHigher}%`,
            x: event.pageX,
            y: event.pageY,
          });
        }
      })
      .on("mouseout", () => {
        // Oculta o tooltip
        setTooltip({ ...tooltip, visible: false });
      });

    // Adiciona as fronteiras dos estados
    svg.append("path")
      .datum(feature(countiesData, countiesData.objects.states))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    // --- Parte da legenda ---
    const legendWidth = 200;
    const legendHeight = 10;

    const legendSvg = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${width - legendWidth - 220}, ${height - 40})`);

    // Cria a escala de legenda
    const legendScale = d3.scaleLinear()
      .domain(color.domain())
      .range([0, legendWidth]);

    // Define os valores de corte (thresholds) da legenda
    const legendData = color.range().map(d => color.invertExtent(d));

    legendSvg.selectAll('rect')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('x', d => legendScale(d[0]))
      .attr('y', 0)
      .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
      .attr('height', legendHeight)
      .attr('fill', d => color(d[0]));

    // Adiciona o eixo para a legenda
    const legendAxis = d3.axisBottom(legendScale)
      .tickSize(13)
      .tickValues(legendData.map(d => d[0]).concat(legendData[legendData.length - 1][1]))
      .tickFormat(d => `${Math.round(d)}%`);

    legendSvg.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .select('.domain')
      .remove();

  }, [educationData, countiesData, tooltip]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {/* Tooltip renderizado pelo React */}
      {tooltip.visible && (
        <div 
          id="tooltip" 
          style={{ 
            opacity: 0.9,
            position: 'absolute',
            left: `${tooltip.x + 10}px`, 
            top: `${tooltip.y - 28}px`,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ChoropletMap;