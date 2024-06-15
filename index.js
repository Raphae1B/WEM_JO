//import './style.css';
import { generateDataSets } from './DataGenerator.js';
import { BarChartRace } from './bar_chart_race.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { ScatterPlot } from './TotalPopulation_medals.js';
import { ColdWarChart } from './cold_war.js';

//import { select as d3Select } from 'd3';

async function loadDataMedals() {
  const response = await fetch('./data_medal.json');
  return await response.json();
}

async function loadDataCountry() {
  const response = await fetch('./data_country.json');
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

async function getCountryPopMedal() {
  const countries = await loadDataCountry();
  const medals = await loadDataMedals();
  const countryPopMedal = [];
  countries.forEach((countrydata) => {
    const countryMedals = medals.find((medal) => medal.Country === countrydata['Country'] && medal.Year === 2020);
    countryPopMedal.push({
      country: countrydata['Country'],
      population: countrydata['Total population'],
      medals: countryMedals ? countryMedals.Total : 0,
    });
  });
  return countryPopMedal;
}

getMedalByYear().then((data) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        getMedalByYear().then((data) => {
          const myChart = new BarChartRace('bar-chart-race');
          myChart.setTitle('Olympic medals by country over the years').addDatasets(data).render();
          d3.select('#bar-chart-race-control').on('click', function () {
            if (this.innerHTML === 'Stop') {
              this.innerHTML = 'Resume';
              myChart.stop();
            } else if (this.innerHTML === 'Resume') {
              this.innerHTML = 'Stop';
              myChart.start();
            } else {
              this.innerHTML = 'Stop';
              myChart.addDatasets(data).render();
            }
          });

          d3.select('#chart-restart').on('click', function () {
            myChart.reset();
          });
        });
        observer.unobserve(entry.target); // Arrêter d'observer une fois que le conteneur est visible et l'animation a démarré
      }
    });
  });
  const chartContainerElement = document.getElementById('bar-chart-race');
  observer.observe(chartContainerElement);
});

getCountryPopMedal().then((data) => {
  const scatter = new ScatterPlot('scatter-plot', data);
});

loadDataMedals().then((medals) => {
  loadDataCountry().then((countries) => {
    const cold_war = new ColdWarChart(countries, medals);
  });
});
