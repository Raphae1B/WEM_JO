import * as d3 from 'd3';
// import countrydata from './data_countryformat.json' assert { type: 'json' };

// console.log(countrydata[0]['Country']);

loadData().then((data) => {
  console.log(data[0]['Country']);
});
let button = document.querySelector('#test');

button.addEventListener('click', () => {
  console.log('Salut');
});

// fetch('./data.json')
// .then((response) => response.json())
// .then((json) => console.log(json));

async function loadData() {
  const response = await fetch('./data_countryformat.json');
  return await response.json();
}

async function loadDataMedals() {
  const response = await fetch('./output_medal.json');
  return await response.json();
}

// async function createChart(data){
//         replay;

//     const svg = d3.create("svg")
//         .attr("viewBox", [0, 0, width, height])
//         .attr("width", width)
//         .attr("height", height)
//         .attr("style", "max-width: 100%; height: auto;");

//         const updateBars = bars(svg);
//         const updateAxis = axis(svg);
//         const updateLabels = labels(svg);
//         const updateTicker = ticker(svg);

//         yield svg.node();

//         for (const keyframe of keyframes) {
//           const transition = svg.transition()
//               .duration(duration)
//               .ease(d3.easeLinear);

//           // Extract the top bar’s value.
//           x.domain([0, keyframe[1][0].value]);

//           updateAxis(keyframe, transition);
//           updateBars(keyframe, transition);
//           updateLabels(keyframe, transition);
//           updateTicker(keyframe, transition);

//           invalidation.then(() => svg.interrupt());
//           await transition.end();
//         }
//       }

let duration = 250;
let countryYearsMedals = [];

async function getMedalByYear() {
  let medalByYear = {};
  loadDataMedals().then((data) => {
    data.forEach((element) => {
      if (element.Country) {
        const year = element.Year;
        if (!medalByYear[year]) {
          medalByYear[year] = [];
        }
        medalByYear[year].push(element);
      }
    });
  });
  return medalByYear;
}

getMedalByYear().then((medalByYear) => {});

function rank(value) {
  const data = Array.from(names, (name) => ({ name, value: value(name) }));
  console.log(data);
  data.sort((a, b) => d3.descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}

export function BarChartRace(chartId, extendedSettings) {
  const chartSettings = {
    width: 500,
    height: 400,
    padding: 40,
    titlePadding: 5,
    columnPadding: 0.4,
    ticksInXAxis: 5,
    duration: 3500,
    ...extendedSettings,
  };

  chartSettings.innerWidth = chartSettings.width - chartSettings.padding * 2;
  chartSettings.innerHeight = chartSettings.height - chartSettings.padding * 2;

  const chartDataSets = [];
  let chartTransition;

  const chartContainer = d3.select(`#${chartId} .chart-container`);
  const xAxisContainer = d3.select(`#${chartId} .x-axis`);
  const yAxisContainer = d3.select(`#${chartId} .y-axis`);

  const xAxisScale = d3.scaleLinear().range([0, chartSettings.innerWidth]);

  const yAxisScale = d3.scaleBand().range([0, chartSettings.innerHeight]).padding(chartSettings.columnPadding);

  d3.select(`#${chartId}`).attr('width', chartSettings.width).attr('height', chartSettings.height);

  chartContainer.attr('transform', `translate(${chartSettings.padding} ${chartSettings.padding})`);

  chartContainer.select('.current-date').attr('transform', `translate(${chartSettings.innerWidth} ${chartSettings.innerHeight})`);

  function draw({ dataSet, date: currentDate }, transition) {
    xAxisScale.domain([0, dataSetDescendingOrder[0].value]);
    yAxisScale.domain(dataSetDescendingOrder.map(({ name }) => name));
    xAxisContainer.transition(transition).call(d3.axisTop(xAxisScale).ticks(ticksInXAxis).tickSize(-innerHeight));
    yAxisContainer.transition(transition).call(d3.axisLeft(yAxisScale).tickSize(0));

    return this;
  }

  function addDataset(dataSet) {
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

  function render() {
    // we will implement this function
    return this;
  }

  return {
    addDataset,
    addDatasets,
    render,
    setTitle,
  };
}
