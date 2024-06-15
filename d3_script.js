async function loadDisciplineData() {
  const response = await fetch('data_disciplines.json');
  return await response.json();
}

function prepareDisciplineData(rawData) {
  const data = [];

  rawData.forEach((item) => {
    if (Array.isArray(item.Disciplines)) {
      item.Disciplines.forEach((discipline) => {
        data.push({ year: item.Year, discipline: discipline, present: true });
      });
    }
  });

  const disciplineFrequency = data.reduce((acc, d) => {
    acc[d.discipline] = (acc[d.discipline] || 0) + 1;
    return acc;
  }, {});

  data.sort((a, b) => a.year - b.year);
  const sortedDisciplines = Object.keys(disciplineFrequency).sort((a, b) => disciplineFrequency[a] - disciplineFrequency[b]);

  return { data, sortedDisciplines };
}

function drawHeatmap({ data, sortedDisciplines }) {
  var margin = { top: 50, right: 30, bottom: 35, left: 150 },
    width = document.getElementById('heatmap').offsetWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var svg = d3
    .select('#heatmap')
    .append('svg')
    .attr('id', 'mainSvg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  var x = d3
    .scaleBand()
    .range([0, width])
    .domain([...new Set(data.map((d) => d.year))])
    .padding(0.2); // Réduisez cette valeur pour diminuer l'espace horizontal entre les carrés

  // Sélectionne l'élément SVG et ajoute un gestionnaire d'événements de clic
  d3.select('#mainSvg').on('click', function (event) {
    // Vérifie si l'élément cliqué est le svg lui-même et non un enfant
    if (event.currentTarget === event.target) {
      resetVisualization();
    }
  });

  // Fonction pour réinitialiser la visualisation
  function resetVisualization() {
    // Réinitialise les rectangles
    d3.selectAll('rect.data-rect').style('stroke-width', 1).style('opacity', 0.7);

    // Réinitialise les textes des axes
    d3.selectAll('.x-axis text, .y-axis text').style('font-weight', 'normal').style('opacity', 1);

    resetToAllTime();
  }

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .attr('class', 'x-axis')
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-0.8em')
    .attr('dy', '0.15em')
    .attr('transform', 'rotate(-55)')
    .style('font-size', '12px')
    .style('font-family', 'Arial')
    .on('click', function (event, year) {
      event.stopPropagation();
      d3.selectAll('rect.data-rect')
        .style('stroke-width', (d) => (d.year === year ? 2 : 1))
        .style('opacity', (d) => (d.year === year ? 1 : 0.5));

      d3.selectAll('.x-axis text')
        .style('font-weight', (d) => (d === year ? 'bold' : 'normal'))
        .style('opacity', (d) => (d === year ? 1 : 0.6));

      d3.selectAll('.y-axis text')
        .style('font-weight', function (d) {
          return d3
            .selectAll('rect.data-rect')
            .filter((dd) => dd.year === year && dd.discipline === d)
            .size() > 0
            ? 'bold'
            : 'normal';
        })
        .style('opacity', function (d) {
          return d3
            .selectAll('rect.data-rect')
            .filter((dd) => dd.year === year && dd.discipline === d)
            .size() > 0
            ? 1
            : 0.6; // Opacité réduite pour les disciplines non sélectionnées
        });
      // Met à jour le graphique des médailles pour l'année sélectionnée
      updateMedalChart(year);
    });

  var y = d3.scaleBand().range([height, 0]).domain(sortedDisciplines).padding(0.2);

  svg
    .append('g')
    .call(d3.axisLeft(y).tickSize(0))
    .attr('class', 'y-axis')
    .selectAll('text')
    .style('font-size', '12px')
    .style('font-family', 'Arial')
    .style('cursor', 'pointer')
    .on('click', function (event, discipline) {
      event.stopPropagation();
      openImageModal(discipline);
    });

  const rectWidth = x.bandwidth() - 2; // Ajuster cette valeur pour réduire l'espace horizontal entre les carrés
  const rectHeight = y.bandwidth() - 2; // Ajuster cette valeur pour la hauteur des carrés

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'white')
    .style('border', '1px solid black')
    .style('padding', '5px')
    .style('font-size', '12px')
    .style('font-family', 'Arial');

  svg
    .selectAll('myRects')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'data-rect')
    .attr('x', (d) => x(d.year))
    .attr('y', (d) => y(d.discipline) + (y.bandwidth() - rectHeight) / 2)
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .style('fill', (d) => (d.present ? '#0066CC' : 'none'))
    .style('stroke', 'black')
    .style('opacity', 0.7)
    .on('mouseover', function (event, d) {
      tooltip.html(`Discipline: ${d.discipline}<br>Year: ${d.year}`).style('visibility', 'visible');
      d3.select(this).style('fill', 'orange');
    })
    .on('mousemove', function (event) {
      tooltip.style('top', event.pageY - 10 + 'px').style('left', event.pageX + 10 + 'px');
    })
    .on('mouseout', function () {
      tooltip.style('visibility', 'hidden');
      d3.select(this).style('fill', '#0066CC');
    })
    .on('click', function (event, d) {
      event.stopPropagation();
      openImageModal(d.discipline);
    });

  // Ajouter la légende
  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 160}, ${height - 60})`); // Position en bas à droite

  legend.append('rect').attr('x', 0).attr('y', 0).attr('width', 160).attr('height', 40).attr('fill', 'white').attr('stroke', 'black');

  legend
    .append('rect')
    .attr('x', 10)
    .attr('y', 15)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#0066CC')
    .attr('opacity', 0.7)
    .attr('stroke', 'black');

  legend
    .append('text')
    .attr('x', 40)
    .attr('y', 22)
    .text('Disciplines present')
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .style('font-family', 'Arial');
}

function openImageModal(discipline) {
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('sportImage');

  // Associer chaque discipline à l'URL de l'image correspondante
  const imageMap = {
    Fencing: 'Images/fencing.jpg',
    Aquatics: 'Images/aquatics.jpg',
    Cycling: 'Images/cycling.jpg',
    Athletics: 'Images/athletics.jpg',
    Gymnastics: 'Images/gymnastics.jpg',
    Rowing: 'Images/rowing.jpg',
    Wrestling: 'Images/wrestling.jpg',
    Football: 'Images/football.jpg',
    Sailing: 'Images/sailing.jpg',
    Shooting: 'Images/shooting.jpg',
    Boxing: 'Images/boxing.jpg',
    Weightlifting: 'Images/weightlifting.jpg',
    'Modern Pentathlon': 'Images/modern_pentathlon.jpg',
    Equestrian: 'Images/equestrian.jpg',
    Hockey: 'Images/hockey.jpg',
    Canoe: 'Images/canoe.jpg',
    Basketball: 'Images/basketball.jpg',
    Archery: 'Images/archery.jpg',
    Tennis: 'Images/tennis.jpg',
    Volleyball: 'Images/volleyball.jpg',
    Judo: 'Images/judo.jpg',
    Handball: 'Images/handball.jpg',
    'Table Tennis': 'Images/table_tennis.jpg',
    Badminton: 'Images/badminton.jpg',
    Baseball: 'Images/baseball.jpg',
    Taekwondo: 'Images/taekwondo.jpg',
    Triathlon: 'Images/triathlon.jpg',
    Rugby: 'Images/rugby.jpg',
    Softball: 'Images/softball.jpg',
    'Tug-Of-War': 'Images/tug_of_war.jpg',
    Polo: 'Images/polo.jpg',
    Golf: 'Images/golf.jpg',
    Alpinism: 'Images/alpinism.jpg',
    'Figure Skating': 'Images/figure_skating.jpg',
    Lacrosse: 'Images/lacrosse.jpg',
    'Sport Climbing': 'Images/sport_climbing.jpg',
    Surfing: 'Images/surfing.jpg',
    Skateboarding: 'Images/skateboarding.jpg',
    Karate: 'Images/karate.jpg',
    Aeronautics: 'Images/aeronautics.jpg',
    'Ice Hockey': 'Images/ice_hockey.jpg',
    Roque: 'Images/roque.jpg',
    'Jeu De Paume': 'Images/jeu_de_paume.jpg',
    Racquets: 'Images/racquets.jpg',
    Motorboating: 'Images/motorboating.jpg',
    Cricket: 'Images/cricket.jpg',
    Croquet: 'Images/croquet.jpg',
    'Basque pelota': 'Images/basque_pelota.jpg',
    'Art Competitions': 'Images/art_competitions.jpg',
  };

  img.src = imageMap[discipline] || 'Images/default.jpg'; // Image par défaut
  modal.style.display = 'block';

  // Ajouter l'événement pour fermer la modale en cliquant sur la croix
  const closeBtn = modal.querySelector('.close');
  closeBtn.onclick = function () {
    modal.style.display = 'none';
  };

  // Ajouter l'événement pour fermer la modale en cliquant en dehors de celle-ci
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
}

async function loadMedalData() {
  const response = await fetch('data_medal.json');
  return response.json();
}

function aggregateData(data) {
  const medalsByCountry = {};
  data.forEach((d) => {
    if (!medalsByCountry[d.Country]) {
      medalsByCountry[d.Country] = { Country: d.Country, Gold: 0, Silver: 0, Bronze: 0, Total: 0 };
    }
    medalsByCountry[d.Country].Gold += d.Gold;
    medalsByCountry[d.Country].Silver += d.Silver;
    medalsByCountry[d.Country].Bronze += d.Bronze;
    medalsByCountry[d.Country].Total += d.Gold + d.Silver + d.Bronze;
  });
  return Object.values(medalsByCountry).sort((a, b) => b.Total - a.Total);
}

function updateMedalChart(year = null) {
  loadMedalData().then((data) => {
    const filteredData = year ? data.filter((d) => d.Year === year) : data;
    const aggregatedData = aggregateData(filteredData);
    const topCountriesData = aggregatedData.slice(0, 15); // Ajoutez ceci pour vérifier les données agrégées
    drawMedalChart(topCountriesData, year);
  });
}

function resetToAllTime() {
  updateMedalChart(); // Appelle updateMedalChart sans année pour afficher les données all-time
}

function drawMedalChart(data, year = null) {
  const container = d3.select('#medalChart');
  container.selectAll('*').remove(); // Effacer tout contenu existant

  const margin = { top: 50, right: 20, bottom: 100, left: 70 };
  const width = 600 - margin.left - margin.right; // Redimensionnez cette valeur selon vos besoins
  const height = 400 - margin.top - margin.bottom; // Redimensionnez cette valeur selon vos besoins

  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Ajouter un titre
  const titleText = year ? `Countries with most medals in ${year}` : 'Countries with most medals of all time';
  svg
    .append('text')
    .attr('x', (width + margin.left + margin.right) / 2 - 30)
    .attr('y', margin.top / 2 + 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px') // Réduire la taille de la police
    .style('font-family', 'Arial')
    .text(titleText);

  // Infobulle
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', '#fff')
    .style('border', '1px solid #ccc')
    .style('padding', '5px')
    .style('font-size', '12px')
    .style('z-index', '10');

  // Échelle de l'axe des x
  const x = d3
    .scaleBand()
    .range([0, width])
    .padding(0.1)
    .domain(data.map((d) => d.Country)); // Domaine soit basé sur les pays les plus importants

  // Échelle de l'axe des y
  const y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(data, (d) => d.Total)]);

  // Échelle de couleurs pour les types de médailles
  const colorScale = d3.scaleOrdinal().domain(['Gold', 'Silver', 'Bronze']).range(['#FFD700', '#C0C0C0', '#CD7F32']);

  // Créer une pile de calques
  const stack = d3.stack().keys(['Bronze', 'Silver', 'Gold']);

  const layers = stack(data);

  const layerGroups = svg
    .selectAll('.layer')
    .data(layers)
    .enter()
    .append('g')
    .attr('class', 'layer')
    .attr('fill', (d) => colorScale(d.key));

  layerGroups
    .selectAll('rect')
    .data((d) => d)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.data.Country))
    .attr('y', (d) => y(d[1]))
    .attr('height', (d) => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth())
    .on('click', function (event, d) {
      tooltip
        .html(`Gold: ${d.data.Gold}<br>Silver: ${d.data.Silver}<br>Bronze: ${d.data.Bronze}<br>Total: ${d.data.Total}`)
        .style('visibility', 'visible')
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
      // Réinitialisation des barres précédemment cliquées
      layerGroups.selectAll('rect').style('stroke', 'none').style('opacity', 0.5);
      svg.selectAll('.x-axis text').style('font-weight', 'normal').style('opacity', 0.5);

      // Mettre en évidence toutes les barres d'un même pays
      layerGroups
        .selectAll('rect')
        .filter((data) => data.data.Country === d.data.Country)
        .style('stroke', 'black')
        .style('stroke-width', '2px')
        .style('opacity', 1);

      // Mettre le nom du pays en gras et augmenter l'opacité
      svg
        .selectAll('.x-axis text')
        .filter((text) => text === d.data.Country)
        .style('font-weight', 'bold')
        .style('opacity', 1);
    })
    .on('mouseout', function (event) {
      if (event.target === this) {
        layerGroups.selectAll('rect').style('stroke', 'none').style('opacity', 1);
        svg.selectAll('.x-axis text').style('font-weight', 'normal').style('opacity', 1);
        tooltip.style('visibility', 'hidden');
      }
    });

  // Ajouter l'axe des x
  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-65)')
    .style('font-size', '12px')
    .style('font-family', 'Arial');

  // Ajouter l'axe des y
  svg.append('g').attr('class', 'axis axis--y').call(d3.axisLeft(y).ticks(10, 's')).style('font-size', '12px').style('font-family', 'Arial');

  // Ajout d'une légende
  const legend = svg
    .selectAll('.legend')
    .data(colorScale.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(0,${i * 20})`);

  legend
    .append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', colorScale);

  legend
    .append('text')
    .attr('x', width - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text((d) => d)
    .style('font-size', '12px')
    .style('font-family', 'Arial');
}

document.addEventListener('DOMContentLoaded', async function () {
  const rawDataDiscipline = await loadDisciplineData();
  const preparedDataDiscipline = prepareDisciplineData(rawDataDiscipline);
  drawHeatmap(preparedDataDiscipline);

  const rawDataMedal = await loadMedalData();
  const aggregatedMedalData = aggregateData(rawDataMedal);
  drawMedalChart(aggregatedMedalData);
  resetToAllTime();
});
