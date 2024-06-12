//import * as d3 from 'd3';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export function BarChartRace(chartId, extendedSettings) {
  const chartSettings = {
    width: 800,
    height: 600,
    padding: 40,
    titlePadding: 5,
    columnPadding: 0.4,
    ticksInXAxis: 5,
    duration: 2000,
    ...extendedSettings,
  };

  chartSettings.innerWidth = chartSettings.width - chartSettings.padding * 2;
  chartSettings.innerHeight = chartSettings.height - chartSettings.padding * 2;

  const chartDataSets = [];
  let chartTransition;
  let timerStart, timerEnd;
  let currentDataSetIndex = 0;
  let elapsedTime = chartSettings.duration;

  const chartContainer = d3.select(`#${chartId} .chart-container`);
  const xAxisContainer = d3.select(`#${chartId} .x-axis`);
  const yAxisContainer = d3.select(`#${chartId} .y-axis`);

  const xAxisScale = d3.scaleLinear().range([0, chartSettings.innerWidth]);

  const fixedBarHeight = chartSettings.innerHeight / 20;

  const yAxisScale = d3.scaleBand().range([0, chartSettings.innerHeight]).padding(chartSettings.columnPadding);

  // const colorScale = d3.scaleOrdinal(d3.sch)
  // const colorScale = d3.scaleLinear().domain([1, 15]).range(['red', 'orange']);

  const colorScale = d3
    .scaleOrdinal()
    .domain([])
    .range([
      'gold',
      'blue',
      'green',
      'yellow',
      'black',
      'grey',
      'darkgreen',
      'pink',
      'brown',
      'slateblue',
      'lightgrey',
      'orange',
      'darkblue',
      'tomato',
      'lightgreen',
    ]);

  d3.select(`#${chartId}`).attr('width', chartSettings.width).attr('height', chartSettings.height);

  chartContainer.attr('transform', `translate(${chartSettings.padding} ${chartSettings.padding})`);

  chartContainer.select('.current-date').attr('transform', `translate(${chartSettings.innerWidth} ${chartSettings.innerHeight})`);

  function draw({ dataSet, date: currentDate }, transition) {
    const { innerHeight, ticksInXAxis, titlePadding } = chartSettings;
    const dataSetDescendingOrder = dataSet.sort(({ value: firstValue }, { value: secondValue }) => secondValue - firstValue);

    const limitedDataSet = dataSetDescendingOrder.slice(0, 15);

    colorScale.domain(limitedDataSet.map((d) => d.name));

    // const colorScale = d3
    //   .scaleOrdinal()
    //   .domain(d3.range(15)) // Adjust this if you have more or fewer than 15 categories
    //   .range([
    //     'gold',
    //     'blue',
    //     'green',
    //     'yellow',
    //     'black',
    //     'grey',
    //     'darkgreen',
    //     'pink',
    //     'brown',
    //     'slateblue',
    //     'lightgrey',
    //     'orange',
    //     'darkblue',
    //     'tomato',
    //     'lightgreen',
    //   ]);

    chartContainer.select('.current-date').text(currentDate);

    // xAxisScale.domain([0, dataSetDescendingOrder[0].value]);
    xAxisScale.domain([0, limitedDataSet[0].value]);
    // yAxisScale.domain(dataSetDescendingOrder.map(({ name }) => name));
    yAxisScale.domain(limitedDataSet.map(({ name }) => name));

    xAxisContainer.transition(transition).call(d3.axisTop(xAxisScale).ticks(ticksInXAxis).tickSize(-innerHeight));

    yAxisContainer.transition(transition).call(d3.axisLeft(yAxisScale).tickSize(0));

    // The general update Pattern in d3.js

    // Data Binding
    const barGroups = chartContainer
      .select('.columns')
      .selectAll('g.column-container')
      .data(limitedDataSet, ({ name }) => name);
    //   .data(dataSetDescendingOrder, ({ name }) => name);

    // Enter selection
    const barGroupsEnter = barGroups.enter().append('g').attr('class', 'column-container').attr('transform', `translate(0,${innerHeight})`);

    barGroupsEnter
      .append('rect')
      .attr('class', 'column-rect')
      .attr('width', 0)
      .attr('fill', ({ name }) => colorScale(name))
      // .attr('height', yAxisScale.step() * (1 - chartSettings.columnPadding));
      .attr('height', fixedBarHeight);

    barGroupsEnter
      .append('text')
      .attr('class', 'column-title')
      // .attr('y', (yAxisScale.step() * (1 - chartSettings.columnPadding)) / 2)
      .attr('y', fixedBarHeight / 2)
      .attr('x', -titlePadding)
      // .attr("fill",)
      .text(({ name }) => name);

    barGroupsEnter
      .append('text')
      .attr('class', 'column-value')
      .attr('y', fixedBarHeight / 2)
      // .attr('y', (yAxisScale.step() * (1 - chartSettings.columnPadding)) / 2)
      .attr('x', titlePadding)
      .text(0);

    // Update selection
    const barUpdate = barGroupsEnter.merge(barGroups);

    barUpdate
      .transition(transition)
      .attr('transform', ({ name }) => `translate(0,${yAxisScale(name)})`)
      .attr('fill', 'normal');

    barUpdate
      .select('.column-rect')
      .transition(transition)
      .attr('width', ({ value }) => xAxisScale(value))
      .attr('fill', ({ name }) => colorScale(name));
    // .attr('fill', ({ name }) => myColor(name));
    // .attr('width', 50);

    barUpdate
      .select('.column-title')
      .transition(transition)
      .attr('x', ({ value }) => xAxisScale(value) - titlePadding);

    barUpdate
      .select('.column-value')
      .transition(transition)
      .attr('x', ({ value }) => xAxisScale(value) + titlePadding)
      .tween('text', function ({ value }) {
        const interpolateStartValue = elapsedTime === chartSettings.duration ? this.currentValue || 0 : +this.innerHTML;

        const interpolate = d3.interpolate(interpolateStartValue, value);
        this.currentValue = value;

        return function (t) {
          d3.select(this).text(Math.ceil(interpolate(t)));
        };
      });

    // Exit selection
    const bodyExit = barGroups.exit();

    bodyExit
      .transition(transition)
      .attr('transform', `translate(0,${innerHeight})`)
      .on('end', function () {
        d3.select(this).attr('fill', 'none');
      });

    bodyExit.select('.column-title').transition(transition).attr('x', 0);

    bodyExit.select('.column-rect').transition(transition).attr('width', 0);

    bodyExit
      .select('.column-value')
      .transition(transition)
      .attr('x', titlePadding)
      .tween('text', function () {
        const interpolate = d3.interpolate(this.currentValue, 0);
        this.currentValue = 0;

        return function (t) {
          d3.select(this).text(Math.ceil(interpolate(t)));
        };
      });

    return this;
  }

  function addDataset(dataSet) {
    console.log(dataSet);
    chartDataSets.push(dataSet);

    return this;
  }

  function addDatasets(dataSets) {
    chartDataSets.push.apply(chartDataSets, dataSets);

    return this;
  }

  function setTitle(title) {
    d3.select('.chart-title')
      .attr('x', chartSettings.width / 2)
      .attr('y', -chartSettings.padding / 2)
      .text(title);

    return this;
  }

  /* async function render() {
    for (const chartDataSet of chartDataSets) {
      chartTransition = chartContainer
        .transition()
        .duration(chartSettings.duration)
        .ease(d3.easeLinear);

      draw(chartDataSet, chartTransition);

      await chartTransition.end();
    }
  } */

  async function render(index = 0) {
    currentDataSetIndex = index;
    timerStart = d3.now();

    chartTransition = chartContainer
      .transition()
      .duration(elapsedTime)
      .ease(d3.easeLinear)
      .on('end', () => {
        if (index < chartDataSets.length) {
          elapsedTime = chartSettings.duration;
          render(index + 1);
        } else {
          d3.select('button').text('Play');
        }
      })
      .on('interrupt', () => {
        timerEnd = d3.now();
      });

    if (index < chartDataSets.length) {
      draw(chartDataSets[index], chartTransition);
    }

    return this;
  }

  function stop() {
    d3.select(`#${chartId}`).selectAll('*').interrupt();

    return this;
  }

  function start() {
    elapsedTime -= timerEnd - timerStart;

    render(currentDataSetIndex);

    return this;
  }

  return {
    addDataset,
    addDatasets,
    render,
    setTitle,
    start,
    stop,
  };
}
