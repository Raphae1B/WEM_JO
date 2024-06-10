
// Coordonnées des villes hôtes des JO
const cityCoords = {
    // ajoutez vos coordonnées ici
    "Athina": [37.9838, 23.7275],
    "Berlin": [52.52, 13.405],
    "London": [51.5074, -0.1278],
    "St. Louis": [38.627, -90.1994],
    "Paris": [48.8566, 2.3522],
    "Antwerpen": [51.2194, 4.4025],
    "Stockholm": [59.3293, 18.0686],
    "Los Angeles": [34.0522, -118.2437],
    "Helsinki": [60.1695, 24.9354],
    "Amsterdam": [52.3676, 4.9041],
    "Roma": [41.9028, 12.4964],
    "Beijing": [39.9042, 116.4074],
    "Sydney": [-33.8688, 151.2093],
    "Atlanta": [33.749, -84.388],
    "Moskva": [55.7558, 37.6173],
    "Ciudad de México": [19.4326, -99.1332],
    "Montréal": [45.5017, -73.5673],
    "München": [48.1351, 11.582],
    "Tokyo": [35.6895, 139.6917],
    "Seoul": [37.5665, 126.978],
    "Rio de Janeiro": [-22.9068, -43.1729],
    "Barcelona": [41.3851, 2.1734],
    "Melbourne": [-37.814, 144.96332]
};

let chart;  // script.js instance
let cityDetails = {}; // Store city details globally
let countryData = {}; // Store country data globally

document.addEventListener('DOMContentLoaded', async function() {
    // Initialise et configure la carte
    const map = initMap();

    // Ajouter la légende à la carte
    addLegend(map);

    // Charge les données des villes hôtes des JO
    const data = await loadData();
    const cityDetails = prepareCityData(data);
    countryData = prepareCountryData(data);

    // Met à jour la carte avec des cercles représentant les villes hôtes
    updateMapWithCities(map, cityDetails, cityCoords);

    // Initialise le graphique
    initializeChart();

    // Ajuste la taille des cercles lors du changement de niveau de zoom
    map.on('zoomend', function() {
        updateMapWithCities(map, cityDetails, cityCoords);
    });

    // Mettre à jour le graphique initialement
    updateChart();
});

// Fonction pour ouvrir la boîte de dialogue modale
function openModal() {
    document.getElementById('infoModal').style.display = 'block';
}

// Fonction pour fermer la boîte de dialogue modale
function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

// Fermer la boîte de dialogue si l'utilisateur clique en dehors
window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
function initMap() {
    // Définit les limites de la carte pour empêcher la vue répétée
    const southWest = L.latLng(-60, -180),
          northEast = L.latLng(75, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map('map', {
        center: [20, 15],
        zoom: 1.5,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        minZoom: 1.5,
        maxZoom: 18,
        noWrap: true,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    return map;
}

function addLegend(map) {
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
            <style>
                .legend {
                    bottom: 30px;
                    left: 30px;
                    background: white;
                    padding: 7px;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                    border-radius: 5px;
                    line-height: 1.5;
                    font-size: 12px;
                }
                .legend i {
                    width: 18px;
                    height: 18px;
                    float: left;
                    margin-right: 8px;
                    border-radius: 50%;
                    background: rgba(0, 102, 204, 0.4);
                    border: 2px solid #0066CC;
                }
            </style>
            <div class="legend">
                <i></i> Host city
            </div>
        `;
        return div;
    };

    legend.addTo(map);
}

async function loadData() {
    const response = await fetch('Combined_country_host.json');
    return await response.json();
}

function prepareCityData(data) {
    const cityDetails = {};
    data.forEach(item => {
        const city = item["Host city"];
        if (!cityDetails[city]) {
            cityDetails[city] = {
                years: [],
                count: 0,
                country: item["Country"]
            };
        }
        cityDetails[city].years.push(item.Year);
        cityDetails[city].count++;
    });
    return cityDetails;
}

function prepareCountryData(data) {
    const countryDetails = {};
    data.forEach(item => {
        const country = item["Country"];
        if (!countryDetails[country]) {
            countryDetails[country] = {
                "PIB per capita": item["PIB per capita"],
                "Gini coefficient": item["Gini coefficient"],
                "Human Development Index": item["Human Development Index"]
            };
        }
    });
    return countryDetails;
}

function updateMapWithCities(map, cityDetails, cityCoords) {
    // Supprimer les cercles existants avant d'en ajouter de nouveaux
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });

    Object.keys(cityDetails).forEach(city => {
        if (cityCoords[city]) {
            const details = cityDetails[city];
            const zoomLevel = map.getZoom();
            const baseRadius = 800000;
            const eventFactor = 400000; // Facteur de croissance par événement supplémentaire
            const zoomFactor = 3000; // Facteur pour ajuster la taille selon le zoom
            const radius = (baseRadius + (details.count - 1) * eventFactor) / (1 + zoomLevel * zoomFactor / 1000);
            const adjustedRadius = Math.max(radius, 50000); // Assurez-vous que le rayon ne soit pas trop petit

            const circle = L.circle(cityCoords[city], {
                color: '#0066CC',
                fillColor: '#0066CC',
                fillOpacity: 0.4,
                radius: adjustedRadius
            }).addTo(map);
            circle.bindPopup(`Host city: ${city}<br>Year(s) of JO : ${details.years.join(', ')}`);

            // Ajouter un gestionnaire d'événements pour le clic sur le cercle
            circle.on('click', function() {
                highlightBar(city, cityDetails);
            });
        }
    });
}

function initializeChart() {
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Data',
                data: [],
                backgroundColor: [],
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            return datasets.map((dataset, i) => {
                                return {
                                    text: dataset.label,
                                    fillStyle: dataset.type === 'line' ? dataset.borderColor : dataset.backgroundColor,
                                    strokeStyle: dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    hidden: !chart.isDatasetVisible(i),
                                    index: i,
                                    borderDash: dataset.borderDash,
                                    pointStyle: dataset.type === 'line' ? 'line' : 'rect'
                                };
                            });
                        }
                    }
                }
            }
        }
    });
}


function updateChart() {
    const selectedData = document.getElementById('dataSelect').value;
    const data = prepareChartData(selectedData);
    chart.data.labels = data.labels;
    chart.data.datasets[0].label = selectedData;
    chart.data.datasets[0].data = data.values;
    chart.data.datasets[0].backgroundColor = data.values.map(() => 'rgba(0, 123, 255, 0.5)');

    // Ajoute les lignes de moyenne
    if (selectedData === "PIB per capita") {
        addLineToChart(chart, 'Average host countries', 58901.4, 'rgba(255, 99, 132, 1)', [5, 5], 1);
        addLineToChart(chart, 'Average countries', 27034.3, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    } else if (selectedData === "Gini coefficient") {
        addLineToChart(chart, 'Average host countries', 33.3, 'rgba(255, 99, 132, 1)', [5, 5], 1);
        addLineToChart(chart, 'Average countries', 37.6, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    } else if (selectedData === "Human Development Index") {
        addLineToChart(chart, 'Average host countries', 0.91, 'rgba(255, 99, 132, 1)', [5, 5], 1);
        addLineToChart(chart, 'Average countries', 0.72, 'rgba(0, 0, 0, 1)', [5, 5], 1);
    }
    chart.update();
}



function prepareChartData(selectedData) {
    const data = {
        labels: Object.keys(countryData),
        values: []
    };

    // Obtenir les valeurs et les étiquettes
    const values = data.labels.map(country => countryData[country][selectedData]);
    const labels = data.labels;

    // Combiner les étiquettes et les valeurs pour trier
    const combined = labels.map((label, index) => {
        return {
            label: label,
            value: values[index]
        };
    });

    // Trier les données : décroissant sauf pour Gini coefficient
    if (selectedData === "Gini coefficient") {
        combined.sort((a, b) => a.value - b.value); // Croissant pour Gini
    } else {
        combined.sort((a, b) => b.value - a.value); // Décroissant pour les autres
    }

    // Séparer les étiquettes et les valeurs triées
    data.labels = combined.map(item => item.label);
    data.values = combined.map(item => item.value);

    return data;
}

function addLineToChart(chart, label, value, color, borderDash = [], borderWidth = 1) {
    const datasetIndex = chart.data.datasets.findIndex(d => d.label === label);
    if (datasetIndex !== -1) {
        chart.data.datasets[datasetIndex].data = new Array(chart.data.labels.length).fill(value);
        chart.data.datasets[datasetIndex].borderDash = borderDash;
        chart.data.datasets[datasetIndex].borderColor = color; // Mise à jour de la couleur
        chart.data.datasets[datasetIndex].borderWidth = borderWidth; // Mise à jour de l'épaisseur de la ligne
    } else {
        chart.data.datasets.push({
            label: label,
            data: new Array(chart.data.labels.length).fill(value),
            borderColor: color,
            borderWidth: borderWidth,
            type: 'line',
            fill: false,
            pointRadius: 0,  // Suppression des points à l'intersection
            borderDash: borderDash,  // Trait plein ou tillé
            order: 1
        });
    }
}

function highlightBar(city, cityDetails) {
    const country = cityDetails[city].country;
    const countryIndex = chart.data.labels.indexOf(country);
    if (countryIndex !== -1) {
        chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map((color, index) => index === countryIndex ? 'rgba(0, 123, 255, 0.8)' : 'rgba(0, 123, 255, 0.2)');
        chart.update();
    }
}

function resetChart() {
    // Réinitialiser les couleurs de toutes les barres à la couleur par défaut
    chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map(() => 'rgba(0, 123, 255, 0.5)');
    chart.update();
}

