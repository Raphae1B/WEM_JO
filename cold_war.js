import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const east = ['Albania', 'Bulgaria', 'Czechoslovakia', 'East Germany', 'Hungary', 'Poland', 'Romania', 'Soviet Union', 'Yugoslavia'];
const west = [
  'United States',
  'Canada',
  'United Kingdom',
  'France',
  'West Germany',
  'Italy',
  'Belgium',
  'Netherlands',
  'Luxembourg',
  'Denmark',
  'Norway',
  'Iceland',
  'Portugal',
  'Greece',
  'Turkey',
];
const cold_war_countries = [...east, ...west];

export function ColdWarChart(dataCountry, dataMedals) {
  const filteredMedals = dataMedals.filter((d) => {
    return d.Year >= 1947 && d.Year <= 1991 && cold_war_countries.includes(d.Country);
  });

  const dataBlock = filteredMedals.map((d) => ({
    ...d,
    block: west.includes(d.Country) ? 'West' : 'East',
  }));

  const aggregatedData = d3.group(
    dataBlock,
    (d) => d.Year,
    (d) => d.block
  );

  // Calculer la somme des totaux pour chaque bloc par année
  const aggregatedTotals = Array.from(aggregatedData, ([year, blocks]) => {
    const eastTotal = blocks.get('East') ? d3.sum(blocks.get('East'), (d) => d.Total) : 0;
    const westTotal = blocks.get('West') ? d3.sum(blocks.get('West'), (d) => d.Total) : 0;
    return [
      { Year: year, block: 'East', totalMedal: eastTotal, countries: blocks.get('East') },
      { Year: year, block: 'West', totalMedal: westTotal, countries: blocks.get('West') },
    ];
  }).flat();

  const width = 800;
  const height = 500;
  const marginTop = 100;
  const marginRight = 10;
  const marginBottom = 60;
  const marginLeft = 40;

  // Extraire et trier les années dans l'ordre croissant
  const years = Array.from(new Set(dataBlock.map((d) => d.Year))).sort((a, b) => a - b);

  const fx = d3
    .scaleBand()
    .domain(years)
    .rangeRound([marginLeft, width - marginRight])
    .paddingInner(0.1);

  const x = d3.scaleBand().domain(['East', 'West']).rangeRound([0, fx.bandwidth()]).padding(0.05);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(aggregatedTotals, (d) => d.totalMedal)])
    .nice()
    .rangeRound([height - marginBottom, marginTop]);

  const colorScale = d3.scaleOrdinal().domain(['East', 'West']).range(['rgba(165, 10, 19, 0.6)', 'rgba(16, 65, 187, 0.6)']);

  const svg = d3
    .select('#cold-war')
    .attr('id', 'cold-war2')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;');

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'rgba(0, 0, 0, 0.7)')
    .style('color', 'white')
    .style('padding', '8px')
    .style('border-radius', '4px')
    .style('font-size', '12px');

  svg
    .append('g')
    .selectAll()
    .data(d3.group(aggregatedTotals, (d) => d.Year))
    .join('g')
    .attr('transform', ([Year]) => `translate(${fx(Year)},0)`)
    .selectAll('rect')
    .data(([, d]) => d)
    .join('rect')
    .attr('x', (d) => x(d.block))
    .attr('y', (d) => y(d.totalMedal))
    .attr('width', x.bandwidth())
    .attr('height', (d) => y(0) - y(d.totalMedal))
    .attr('fill', (d) => colorScale(d.block))
    .on('mouseover', (event, d) => {
      const blockName = d.block === 'East' ? 'Eastern Bloc' : 'Western Bloc';
      const tooltipContent = d.countries.map((country) => `${country.Country}: ${country.Total} medals`).join('<br>');
      tooltip
        .html(`<strong>${blockName}</strong>:<br>${tooltipContent}`)
        .style('visibility', 'visible')
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden');
    });

  const meanEast = d3.mean(
    aggregatedTotals.filter((d) => d.block === 'East'),
    (d) => d.totalMedal
  );
  const meanWest = d3.mean(
    aggregatedTotals.filter((d) => d.block === 'West'),
    (d) => d.totalMedal
  );

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', marginTop / 2)
    .attr('font-family', 'Montserrat, sans-serif')
    .attr('text-anchor', 'middle')
    .attr('font-size', '24px')
    .attr('fill', '#333')
    .text('Cold War Olympic Medals Distribution between the two blocks');

  svg
    .append('line')
    .attr('x1', marginLeft)
    .attr('y1', y(meanEast))
    .attr('x2', width - marginRight)
    .attr('y2', y(meanEast))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '5 5');

  svg
    .append('line')
    .attr('x1', marginLeft)
    .attr('y1', y(meanWest))
    .attr('x2', width - marginRight)
    .attr('y2', y(meanWest))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '5 5');

  svg
    .append('text')
    .attr('x', width - marginRight - 10)
    .attr('y', y(meanEast) - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', 15)
    .attr('font-family', 'Montserrat, sans-serif')
    .style('fill', 'black')
    .text('Mean - East');

  svg
    .append('text')
    .attr('x', width - marginRight - 10)
    .attr('y', y(meanWest) + 16)
    .attr('text-anchor', 'end')
    .attr('font-size', 15)
    .attr('font-family', 'Montserrat, sans-serif')
    .style('fill', 'black')
    .text('Mean - West');

  svg
    .append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(fx).tickSizeOuter(0))
    .call((g) => g.selectAll('.domain').remove());

  svg
    .append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(null, 's'))
    .call((g) => g.selectAll('.domain').remove());
}
