# Comment ouvrir la web app
1. Ouvrir un terminal dans le dossier WEM_JO extrait de github
2. Faire la commande : python -m http.server 8000
3. ouvrir google chrome (par exemple) et coller dans la barre des recherches : http://localhost:8000/index.html
4. Profitez des visualisations en scrollant
(- pour la visulalisation sur les disciplines et médailles, vous pouvez voir le nombre de médailles obtenu sur toutes les années ou cliquer sur une année spécifique. pour réilinitialiser, cliquer à l'intérieur du graphe des disciplines.
- pour la visualisation sur les pays hôtes, utiliser le + et le - en haut à gauche de la carte pour zoomer et en cliquant sur l'une des villes, le barre graphe va être modifier)

# Analyse des performances sportives aux jeux olympiques 
## Contexte 
Avec l'approche des Jeux Olympiques d'été de cette année, un événement mondial qui se tient tous les quatre ans depuis 1896, notre projet s'est orienté vers une analyse approfondie de ce sujet. Nous avons choisi de nous concentrer sur les jeux d'été en raison de leur couverture médiatique plus importante et du nombre de pays participants, nettement supérieur à celui des jeux d'hiver (206 délégations en été 2021 contre 91 en hiver 2022). Cette décision nous offre l'accès à une plus grande diversité de données, ainsi qu'à un nombre d'épreuves considérablement plus élevé (339 épreuves en été 2021 contre 109 en hiver 2022).
## Objectifs 
Notre objectif principal est d'explorer la relation entre le nombre de médailles obtenues par pays et divers facteurs des pays participants comme socio-économiques (PIB, indice de développement humain, etc). Nous souhaitons également examiner l'évolution historique des épreuves pour identifier des tendances ou des changements significatifs au fil du temps. Un autre volet de notre étude concernera les villes hôtes, dans le but de comprendre les critères de leur sélection. L'aboutissement de notre projet sera le développement d'une application web proposant des visualisations interactives, combinant données sportives et caractéristiques nationales pour une analyse enrichie. 
## Données (sources, quantité, évtl. pré-traitement, description) 
Les données de notre projet se divise en deux principales catégories : les caractéristiques des pays et les données relatives aux Jeux Olympiques. Pour le premier, nous avons utilisé Wikipedia comme source principale, en exploitant la structure HTML globalement uniforme des pages pour faciliter le scraping. Les informations pertinentes ont été extraites des infoboxes sur le côté droit de chaque page, incluant : 

Nom du pays : Essentiel pour référencer et organiser les données de manière cohérente. 

Surface total et proportion de surface d’eau : Aide à comprendre les défis et opportunités liés à la taille du pays et à sa gestion des ressources en eau. 

Population totale : Cruciale pour évaluer la densité démographique. 

Pib par habitant : Permet d’évaluer le niveau économique et la prospérité relative des habitants. 

Coefficent de gini : Fournit une mesure de l'inégalité de revenu au sein d'une économie, crucial pour évaluer l'équité sociale et la stabilité. 

Indice de développement humain : Evalue la santé, l'éducation et le revenu, donnant une image globale du niveau de développement humain. 

Monnaie : Permettre potentiellement de faire des analyses économiques mais demande des données supplémentaires. 

Type de gouvernement : Impacte la politique intérieure et la stabilité nationale. 

Pour les données sur les Jeux Olympiques, nous avions initialement envisagé de continuer avec Wikipedia. Cependant, nous avons rapidement rencontré des difficultés liées aux variations des structures HTML sur les pages dédiées à chaque événement olympique. Ces différences, couvrant les éditions de 1896 à 2020, soit un total de 32 pages Wikipedia potentiellement distinctes, compliquaient considérablement la tâche. Nous avons donc été contraints de chercher une autre source. En explorant d'autres options, nous avons tenté d'utiliser le site officiel des Jeux Olympiques, mais les conditions d'utilisation interdisaient le scraping. Après des recherches supplémentaires, nous avons découvert Olympedia, un site dédié à l'histoire et aux statistiques des Jeux Olympiques, sur lequel le scraping était possible. Nous avons donc choisi de récupérer les données en trois catégories distinctes : 

Informations sur les pays hôtes à travers les années, features : année, ville et pays hôte. 

Informations sur le nombre de médailles obtenues par pays et par événement, features : année, pays, médailles d'or, d'argent, de bronze et total. 

Informations sur les disciplines à travers les différents événements, features : année et disciplines. 

Nous avons également vérifié que nous avions le droit d'utiliser ces données. Les conditions d'utilisation permettaient le partage du contenu olympique uniquement à des fins personnelles et non commerciales, ce qui correspondait à nos besoins.  

La phase suivante a impliqué le prétraitement des données. Nous avons dû harmoniser les noms des pays entre Wikipedia et Olympedia, par exemple, en modifiant 'Türkiye' en 'Turkey' et 'Great Britain' en 'United Kingdom'. Le principal travail de prétraitement concernait les fichiers contenant des caractéristiques pour chaque pays provenant de Wikipedia. Pour les types de gouvernement, nous avons simplifié les désignations et regroupé les termes différents qui renvoyaient au même type de gouvernement. Nous avons également dû ajuster les données de population et de superficie totale qui présentaient des exceptions avec des structures HTML légèrement différentes et donc des résultats inattendus.  

Grâce à la visualisation de la distribution des données, nous avons pu identifier que, bien que des valeurs comme celles de la Chine et de l'Inde, avec plus d'un milliard d'habitants, semblent extrêmes par rapport aux pays qui suivent comme les États-Unis avec 330 millions d'habitants, elles ne constituaient pas des valeurs aberrantes. Un constat similaire a été fait pour la superficie, où la Russie domine avec plus de 17 millions de km², suivie par les États-Unis, le Canada et la Chine, tous avec plus de 9 millions de km². Les distributions du pourcentage d'eau, du PIB, du coefficient Gini et de l'indice de développement humain semblaient normales et plausibles, ne nécessitant donc aucune modification supplémentaire.
## Etat de l'art 
Notre étude a pour but d'analyser le lien entre les caractéristiques socio-économiques des pays et leurs performances aux Jeux Olympiques d'été, en s'appuyant sur des données précises telles que le PIB par habitant, le coefficient de Gini, et l'Indice de Développement Humain (IDH). Des travaux antérieurs ont souvent exploré les corrélations entre les ressources économiques des pays et leurs résultats aux Jeux, mais principalement en termes de comptage des médailles, sans prendre en compte l'évolution temporelle des performances lors de différentes éditions (voir par exemple le site :  https://flourish.studio/blog/visualizing-olympics/). 

Notre recherche vise à combler cette lacune en mettant en lumière des modèles sur le long terme, analysant les tendances des résultats accumulés par pays aux différentes éditions des Jeux Olympiques d'été. L'objectif est d'explorer comment les profils socio-économiques influencent les performances globales sans se concentrer sur la réussite dans des sports spécifiques, étant donné que les données disponibles ne détaillent pas les médailles par discipline sportive. 

Les techniques de collecte de données incluront le scraping de sources diversifiées comme Wikipedia et Olympedia, ce qui nous permettra de compiler un vaste ensemble de données sur les résultats olympiques et les indicateurs socio-économiques. Cette méthode nous aidera à assurer que notre analyse est soutenue par des informations à jour et pertinentes. 

En dépit de ne pas pouvoir examiner les résultats par sport individuel, notre étude fournira une compréhension plus profonde des tendances globales et offrira des insights sur les facteurs socio-économiques qui peuvent être exploités pour améliorer la compétitivité olympique à l'avenir. 
## Conception 
La conception de ce projet vise à créer une application web qui permettra non seulement l'analyse des performances olympiques des pays à travers le temps mais aussi l'intégration des indicateurs socio-économiques pour enrichir l'analyse et mieux comprendre les facteurs contribuant aux succès sportifs. Cette application sera conçue pour être intuitive et accessible, répondant aux besoins des étudiants en statistique, des journalistes sportifs, et des amateurs de sports.
## Cas d’utilisation 
### Étudiant  
Un étudiant utilise l'application dans le cadre de son cursus académique pour mener un projet d'études. Il explore la relation entre les indicateurs socio-économiques des différents pays et leurs performances aux Jeux Olympiques, en utilisant les outils de visualisation pour analyser les tendances et préparer des rapports ou des présentations. 
### Journaliste sportif  
Un journaliste spécialisé dans le sport utilise l'application pour analyser les performances historiques et récentes aux Jeux Olympiques. Cela lui permet de préparer des articles enrichis de statistiques et de tendances avant les prochains Jeux, offrant ainsi un contenu précis et engageant à son audience. 
### Amateur de sport 
Un passionné de sport s'intéresse aux divers aspects historiques et statistiques des Jeux Olympiques. L'application lui offre la possibilité de découvrir des faits intéressants sur les différentes éditions des Jeux, les pays participants, et l'évolution des différentes disciplines, enrichissant ainsi sa connaissance et son appréciation du sport. 
## Architecture 
### Scraping des données 
L'objectif premier était de collecter automatiquement les données nécessaires à partir de sources en ligne. Nous avons utilisé la bibliothèque Scrapy en Python pour extraire les données des sites Wikipedia et Olympedia. Le processus consistait à programmer des scripts automatisés pour naviguer sur ces sites, extraire les données pertinentes et les structurer en format JSON. 
### Stockage des données 
Les données sont simplement stockées en local au format JSON. En cas de développement futur et de déploiement réel de l'application, il serait important de sauvegarder les données extraites de manière organisée et sécurisée, en utilisant PostgreSQL par exemple. 
### Traitement des données 
Le nettoyage des données extraites au format JSON a été réalisé avec un notebook Python, utilisant la bibliothèque Pandas pour la manipulation des données et Matplotlib pour visualiser la distribution des données. Une fois le nettoyage et l'analyse terminés, nous avons exporté les données au format JSON pour la visualisation. 
### Visualisation des résultats (Front-end) 
Pour la visualisation des données, Chart.js et D3.js ont été choisis pour leur puissance et leur flexibilité dans la représentation de données complexes, essentielles pour illustrer les tendances des Jeux Olympiques et les corrélations socio-économiques. Leaflet.js a été utilisé pour créer une carte interactive, permettant ainsi d'enrichir la visualisation des données géographiques, telles que les emplacements des villes hôtes des Jeux Olympiques. 
## Fonctionnalités 
Voici les principales fonctionnalités envisagées :  

Visualisation dynamique des données : Graphiques animé montrant les performances des pays les plus médaillés aux Jeux Olympiques au fil des années.  

Filtrage selon différents critères : Possibilité de filtrer les données selon l'année de l'événement, les disciplines présentes et le nombre de médailles obtenues par les 15 meilleurs pays, permettant des analyses ciblées selon des critères spécifiques. 

Illustration des disciplines : Pop-ups avec des images explicatives lorsqu'on clique sur une discipline, rendant l'information plus accessible, surtout pour les disciplines moins connues. 

Comparaison entre pays : Un outil spécialisé pour comparer les performances entre les pays de l'Est et de l'Ouest durant la Guerre froide, offrant une perspective historique et politique unique. 

Carte interactive avec les villes hôtes : Une carte du monde interactive montrant les villes qui ont accueilli les Jeux, avec des cercles proportionnels au nombre d'événements organisés. Un graphique à barres associé, affichant le PIB, le coefficient de Gini, et l'IDH, aidera à explorer les tendances et similitudes dans le choix des pays organisateurs. 

Visualisation des caractéristiques socio-économiques des 20 pays les plus médaillés en 2020 
## Techniques, algorithmes et outils utilisés 
Pour automatiser la collecte des données nécessaires à notre projet sur les performances olympiques et les indicateurs socio-économiques, nous avons utilisé la bibliothèque Python Scrapy pour effectuer le scraping des sites Wikipedia et Olympedia. Cette méthode nous a permis d'extraire efficacement les informations requises, qui ont ensuite été structurées au format JSON pour un traitement ultérieur. Une fois les données collectées, le nettoyage et la transformation ont été réalisés à l'aide de Pandas, un puissant outil de manipulation de données en Python, tandis que Matplotlib nous a servi à visualiser la distribution des données et détecter d'éventuelles anomalies. Pour la présentation des résultats, nous avons opté pour D3.js, qui offre des capacités étendues pour des visualisations interactives et complexes, Chart.js pour des graphiques intuitifs, et Leaflet.js pour la cartographie interactive, enrichissant ainsi notre application web avec des représentations graphiques dynamiques et des cartes détaillées. Ces outils ont ensemble facilité l'analyse statistique et l'amélioration de la compréhension des tendances et des corrélations au sein des données. 
## Planification, organisation et suivi répartition du travail (diagramme de Gantt) 
Voici ce qui était prévu dans le cahier des charges : 

Développement des scripts de scraping pour extraire les données [19.04 -> 03.05] 

Nettoyage et prétraitement des données extraites [03.05 -> 10.05] 

Analyse exploratoire des données (tendances, corrélations, …) [10.05 -> 24.05] 

Implémentation des analyses statistiques et de clustering [24.05 -> 07.06] 

Visualisation des résultats [31.05 -> 14.06] 

Raphaël (temps partiel) s’est occupé de scraper les données, le nettoyage et l’exploration des données ainsi que certaines visualisations pour la web app. 

Tania (temps partiel) devait s’occuper de l’implémentation des analyses statistiques et clustering et certaines visualisations pour la web app. Cependant, nous avons plus eu de nouvelles de sa part depuis moins d’un mois et elle n’a donc rien fait pour ce projet. 

Calvin (temps plein) c’est principalement occupé de la partie visualisation des données de la web app. 
## Conclusion 
Notre projet d'analyse des performances olympiques et des caractéristiques socio-économiques des pays participants aux Jeux Olympiques d'été a abouti à des découvertes fascinantes. Nous avons réussi à corréler des indicateurs tels que le PIB, l'indice de développement humain, et le coefficient de Gini avec les résultats sportifs, apportant ainsi une dimension plus profonde à l'analyse des performances olympiques. Nos visualisations dynamiques ont démontré que les pays avec des indicateurs socio-économiques supérieurs tendent à obtenir de meilleurs résultats, soulignant l'impact des ressources économiques et du développement humain sur les compétences sportives et les infrastructures. 
## Travail futur 
Pour l'avenir, plusieurs améliorations et extensions de ce projet sont envisageables : 

Extension des données et des éditions couvertes : Intégrer les Jeux Olympiques d'hiver pour une comparaison complète entre les éditions estivales et hivernales, permettant d'examiner des tendances plus globales à travers toutes les formes de Jeux Olympiques. 

Analyses plus poussées par sport : Bien que notre étude actuelle ne détaille pas les médailles par discipline, il serait enrichissant d'explorer les performances par sport pour déterminer si certains facteurs socio-économiques influencent spécifiquement certains types de disciplines. 

Modèles prédictifs : Développer des modèles prédictifs pour estimer les performances futures des pays aux Jeux Olympiques en utilisant des algorithmes de machine learning, basés sur des données historiques et des indicateurs socio-économiques. 

Analyse historique plus poussée : Enrichissement des données avec des statistiques socio-économique historique des pays aurait permis une analyse historique plus poussé. 

Visualisation plus attrayante : Rendre la visualisation plus attrayante en ajoutant des animations et des éléments décoratifs en rapport avec les jeux olympiques 

