import scrapy

class olymp_disc_spider(scrapy.Spider):
    name = "olymp_disc"

    start_urls = [
        'https://www.olympedia.org/editions'
    ]

    def parse(self, response):
        olympic_games = response.css('ol.breadcrumb + h1 + h2 + h3 + table.table.table-striped a::attr(href)').getall()

        exclude_urls = ["/editions/63", "/editions/64", "/editions/372"] #edition 2024,2028 et 2032

        olympic_games = [url for url in olympic_games if url not in exclude_urls]

        for olympic_game in olympic_games :
            olympic_link = response.css(f'a[href="{olympic_game}"]::attr(href)').get()
            olympic_url = response.urljoin(olympic_link)
            yield scrapy.Request(olympic_url, callback=self.parse_disc, meta={'olympic_name': olympic_game})

    def parse_disc(self, response):

        year = response.css('ol.breadcrumb + h1::text').get().replace(' Summer Olympics', '')

        disciplines = response.css('h2:contains("Medal Disciplines") + table a::text').getall()

        # Définir les groupes de disciplines qui doivent être regroupées sous une seule catégorie
        grouped_disciplines = {
            'Equestrian Dressage': 'Equestrian',
            'Equestrian Driving': 'Equestrian',
            'Equestrian Eventing': 'Equestrian',
            'Equestrian Jumping': 'Equestrian',
            'Equestrian Vaulting': 'Equestrian',
            'Diving': 'Aquatics',
            'Marathon Swimming': 'Aquatics',
            'Artistic Swimming': 'Aquatics',
            'Swimming': 'Aquatics',
            'Water Polo': 'Aquatics',
            'Cycling BMX Freestyle': 'Cycling',
            'Cycling BMX Racing': 'Cycling',
            'Cycling Mountain Bike': 'Cycling',
            'Cycling Road': 'Cycling',
            'Cycling Track': 'Cycling',
            'Trampolining': 'Gymnastics',
            'Artistic Gymnastics': 'Gymnastics',
            'Rhythmic Gymnastics': 'Gymnastics',
            'Canoe Slalom': 'Canoe',
            'Canoe Sprint': 'Canoe',
            'Canoe Marathon': 'Canoe',
            '3x3 Basketball': 'Basketball',
            'Beach Volleyball':  'Volleyball',
            'Rugby Sevens': 'Rugby',
        }

        filtered_disciplines = []

        for discipline in disciplines:
            if discipline in grouped_disciplines:
                filtered_disciplines.append(grouped_disciplines[discipline])
            else:
                filtered_disciplines.append(discipline)

        if not disciplines:
            yield {
                'Year': year,
                'Disciplines': "Not held due to war"
            }
        else:
            unique_disciplines = list(set(filtered_disciplines))
            yield {
                'Year': year,
                'Disciplines': unique_disciplines
            }