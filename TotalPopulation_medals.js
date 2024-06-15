import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function ScatterPlot(Id, data) {
  const filteredData = data.filter((d) => d.country !== 'China' && d.country !== 'United States' && d.medals > 10);

  const svg = d3.select(`#${Id}`);
  const width = 928;
  const height = 600;

  const margin = { top: 200, right: 30, bottom: 40, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([1, d3.max(filteredData, (d) => d.population)])
    .range([0, innerWidth]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(filteredData, (d) => d.medals)])
    .range([innerHeight, 0]);

  const xAxis = d3.axisBottom(x).ticks(10, ',.1s');
  const yAxis = d3.axisLeft(y);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  svg
    .append('text')
    .attr('x', width / 1.5)
    .attr('y', margin.top / 2)
    .attr('font-family', 'Montserrat, sans-serif')
    .attr('text-anchor', 'middle')
    .attr('font-size', '17px')
    .attr('fill', '#333')
    .text('Countries that have won at least 10 medals at 2020 Olympics games (excluding USA and China) by total medals and total population');

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', innerWidth / 2)
    .attr('y', 35)
    .attr('text-anchor', 'middle')
    .text('Total Population');

  g.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', -innerHeight / 2)
    .attr('y', -40)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Total Medals');

  g.selectAll('.dot')
    .data(filteredData)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 5)
    .attr('cx', (d) => x(d.population))
    .attr('cy', (d) => y(d.medals))
    .style('fill', (d) => d3.schemeCategory10[d.country.length % 10])
    .style('font-family', 'Montserrat, sans-serif')
    // Ajouter l'info-bulle au survol
    .on('mouseover', function (event, d) {
      d3.select(this).style('stroke', 'black').style('stroke-width', 2);
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(`<strong>${d.country}</strong><br>Medals: ${d.medals}<br>Population: ${d.population}`)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function (d) {
      d3.select(this).style('stroke', 'none');
      tooltip.transition().duration(500).style('opacity', 0); // Masquer l'info-bulle
    });

  // Ajouter les étiquettes de texte pour chaque point de données
  g.selectAll('.label')
    .data(filteredData)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', (d) => x(d.population))
    .attr('y', (d) => y(d.medals) - 10)
    .attr('text-anchor', 'middle')
    .text((d) => d.country)
    .style('font-size', '10px')
    .style('font-family', 'Montserrat, sans-serif')
    .style('fill', 'black')
    .on('mouseover', function (event, d) {
      d3.select(this).style('stroke', 'black').style('stroke-width', 0.5).style('fill', 'white');
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(`<strong>${d.country}</strong><br>Medals: ${d.medals}<br>Population: ${d.population}`)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function (d) {
      d3.select(this).style('stroke', 'none').style('fill', 'black');
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Gestion des collisions entre les étiquettes
  const simulation = d3
    .forceSimulation(filteredData)
    .force('x', d3.forceX((d) => x(d.population)).strength(1))
    .force('y', d3.forceY((d) => y(d.medals)).strength(1))
    .force('collision', d3.forceCollide(18)) // Rayon de collision pour éviter les chevauchements
    .stop();

  for (let i = 0; i < 120; i++) simulation.tick();

  g.selectAll('.label')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y);

  const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
}
