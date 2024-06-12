//import './style.css';
import { generateDataSets } from './DataGenerator.js';
import { BarChartRace } from './bar_chart_race.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

//import { select as d3Select } from 'd3';

async function loadDataMedals() {
  const response = await fetch('./output_medal.json');
  return await response.json();
}

async function getMedalByYear() {
  const data = await loadDataMedals();
  const medalByYear = [];
  const tempData = {};
  const totalByCountries = {};

  data.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));

  let lastYear = null;
  data.forEach((element) => {
    if (element.Country && element.Total) {
      const year = element.Year;

      if (!tempData[year]) {
        tempData[year] = [];
      }

      if (!totalByCountries[year]) {
        totalByCountries[year] = {};
      }
      // add total by country and by year
      if (lastYear !== null) {
        Object.keys(totalByCountries[lastYear]).forEach((country) => {
          totalByCountries[year][country] = totalByCountries[lastYear][country];
        });
      }
      totalByCountries[year][element.Country] = (totalByCountries[year][element.Country] || 0) + element.Total;

      // Update tempData with the updated medal count for this year
      const updatedData = [];
      Object.entries(totalByCountries[year]).forEach(([country, value]) => {
        updatedData.push({ name: country, value: value });
      });

      tempData[year] = updatedData;
      lastYear = year;
    }
  });

  for (const year in tempData) {
    medalByYear.push({
      date: parseInt(year, 10),
      dataSet: tempData[year],
    });
  }

  return medalByYear;
}

getMedalByYear().then((data) => {
  // console.log('ici', data);
  // const dataTopTen = data.map((element) => {
  //   return {
  //     ...element,
  //     dataSet: element.dataSet.slice(0, 10),
  //   };
  // });
  // generateDataSets({ size: 5 });
  const myChart = new BarChartRace('bar-chart-race');
  myChart.setTitle('Olympic medals by country over the years').addDatasets(data).render();
  d3.select('#bar-chart-race-control').on('click', function () {
    console.log('salut');
    if (this.innerHTML === 'Stop') {
      this.innerHTML = 'Resume';
      myChart.stop();
    } else if (this.innerHTML === 'Resume') {
      this.innerHTML = 'Stop';
      myChart.start();
    } else {
      this.innerHTML = 'Stop';
      myChart.render();
    }
  });
});
