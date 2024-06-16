async function prepareDataCountryMedal(selectedData) {
  const dataMedals = await loadDataMedal();
  const dataCountries = await loadDataCoutries();

  const dataMeds2020 = dataMedals.filter((d) => d.Year == 2020);
  const countryListWithMedals = dataMeds2020.map((element) => element.Country);
  const countryWithMedalsOrder = dataCountries.filter((d) => countryListWithMedals.includes(d.Country));

  const medalsMap = new Map();
  dataMeds2020.forEach((medal) => {
    if (medalsMap.has(medal.Country)) {
      medalsMap.get(medal.Country).Total += medal.Total;
    } else {
      medalsMap.set(medal.Country, { ...medal });
    }
  });

  const mergedData = countryWithMedalsOrder.map((country) => {
    const countryMedals = medalsMap.get(country.Country);
    return {
      ...country,
      TotalMedals: countryMedals ? countryMedals.Total : 0,
      GoldMedals: countryMedals ? countryMedals.Gold : 0,
      SilverMedals: countryMedals ? countryMedals.Silver : 0,
      BronzeMedals: countryMedals ? countryMedals.Bronze : 0,
    };
  });

  mergedData.sort((a, b) => b['TotalMedals'] - a['TotalMedals']);
  console.log(mergedData.slice(0, 20));

  return mergedData.slice(0, 20);
}

async function loadDataMedal() {
  const medals = await fetch('data_medal.json');
  return await medals.json();
}

async function loadDataCoutries() {
  const countries = await fetch('data_country.json');
  return await countries.json();
}

function initializeCountryMedalChart() {
  const ctx = document.getElementById('chartCanvasMedals').getContext('2d');
  chart2 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Top 20 Countries',
          data: [],
          backgroundColor: [],
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Top 20 Countries by Medals in the 2020 Olympics games',
          font: {
            family: 'Arial',
            size: 18,
          },
          color: '#333',
          padding: {
            top: 10,
            bottom: 10,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: {
              family: 'Arial',
              size: 12,
            },
            color: '#333',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              family: 'Arial',
              size: 12,
            },
            color: '#333',
          },
        },
      },
    },
  });
}

async function updateCountryMedalChart() {
  const selectedData = document.getElementById('dataSelect2').value;

  try {
    const data = await prepareDataCountryMedal(selectedData);

    chart2.data.labels = data.map((country) => country.Country);
    chart2.data.datasets[0].label = selectedData;
    chart2.data.datasets[0].data = data.map((country) => country[selectedData]);
    chart2.data.datasets[0].backgroundColor = data.map(() => 'rgba(0, 123, 255, 0.5)');

    // Clear any existing average lines before updating
    chart2.data.datasets = chart2.data.datasets.filter((dataset) => !dataset.label.startsWith('Average'));

    // Add average lines based on selectedData
    if (selectedData === 'PIB per capita') {
      addLineToCountryMedalChart(chart2, 'Average best performing countries', 52036.2, 'rgba(255, 99, 132, 1)', [5, 5], 1);
      addLineToCountryMedalChart(chart2, 'Average all countries', 27034.3, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    } else if (selectedData === 'Gini coefficient') {
      addLineToCountryMedalChart(chart2, 'Average best performing countries', 35.175, 'rgba(255, 99, 132, 1)', [5, 5], 1);
      addLineToCountryMedalChart(chart2, 'Average all countries', 37.6, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    } else if (selectedData === 'Human Development Index') {
      addLineToCountryMedalChart(chart2, 'Average best performing countries', 0.885, 'rgba(255, 99, 132, 1)', [5, 5], 1);
      addLineToCountryMedalChart(chart2, 'Average all countries', 0.72, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    } else if (selectedData === 'Total population') {
      addLineToCountryMedalChart(chart2, 'Average best performing countries', 139660981, 'rgba(255, 99, 132, 1)', [5, 5], 1);
      addLineToCountryMedalChart(chart2, 'Average all countries', 40360406, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    }

    chart2.update();
  } catch (error) {
    console.error('Error updating chart:', error);
  }
}

function prepareChartData(selectedData) {
  const data = {
    labels: Object.keys(countryData),
    values: [],
  };

  // Obtenir les valeurs et les étiquettes
  const values = data.labels.map((country) => countryData[country][selectedData]);
  const labels = data.labels;

  // Combiner les étiquettes et les valeurs pour trier
  const combined = labels.map((label, index) => {
    return {
      label: label,
      value: values[index],
    };
  });

  // Trier les données : décroissant sauf pour Gini coefficient
  if (selectedData === 'Gini coefficient') {
    combined.sort((a, b) => a.value - b.value); // Croissant pour Gini
  } else {
    combined.sort((a, b) => b.value - a.value); // Décroissant pour les autres
  }

  // Séparer les étiquettes et les valeurs triées
  data.labels = combined.map((item) => item.label);
  data.values = combined.map((item) => item.value);

  return data;
}

function addLineToCountryMedalChart(chart, label, value, color, borderDash = [], borderWidth = 1) {
  const datasetIndex = chart.data.datasets.findIndex((d) => d.label === label);
  if (datasetIndex !== -1) {
    chart.data.datasets[datasetIndex].data = new Array(chart.data.labels.length).fill(value);
    chart.data.datasets[datasetIndex].borderDash = borderDash;
    chart.data.datasets[datasetIndex].borderColor = color;
    chart.data.datasets[datasetIndex].borderWidth = borderWidth;
    chart.data.datasets[datasetIndex].type = 'line';
  } else {
    chart.data.datasets.push({
      label: label,
      data: new Array(chart.data.labels.length).fill(value),
      borderColor: color,
      borderWidth: borderWidth,
      type: 'line',
      fill: false,
      pointRadius: 0,
      borderDash: borderDash,
      order: 1,
    });
  }
}

function resetCountryMedalChart() {
  // Réinitialiser les couleurs de toutes les barres à la couleur par défaut
  chart2.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map(() => 'rgba(0, 123, 255, 0.5)');
  chart2.update();
}

async function prepareGovernmentData() {
  const top20Countries = await prepareDataCountryMedal();

  const governmentData = {};

  top20Countries.forEach((country) => {
    const governmentType = country.Simplified_Government[0];
    if (governmentData[governmentType]) {
      governmentData[governmentType].count += 1;
      governmentData[governmentType].countries.push(country.Country);
    } else {
      governmentData[governmentType] = {
        count: 1,
        countries: [country.Country],
      };
    }
  });

  return governmentData;
}

function initializeGovernmentPieChart(governmentData) {
  const ctx = document.getElementById('chartCanvasGovernment').getContext('2d');
  const labels = Object.keys(governmentData);
  const data = labels.map((label) => governmentData[label].count);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Government Types of Top 20 Countries',
          font: {
            family: 'Arial',
            size: 18,
          },
          color: '#333',
          padding: {
            top: 10,
            bottom: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const countries = governmentData[label].countries.join(', ');
              return `${label}: ${context.raw} countries\n${countries}`;
            },
          },
        },
      },
    },
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  initializeCountryMedalChart();
  updateCountryMedalChart();

  const governmentData = await prepareGovernmentData();
  initializeGovernmentPieChart(governmentData);
});
