import scrapy

class olymp_spider(scrapy.Spider):
    name = "olymp"

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
            yield scrapy.Request(olympic_url, callback=self.parse_olympic, meta={'olympic_name': olympic_game})

    def parse_olympic(self, response):

        year = response.css('ol.breadcrumb + h1::text').get().replace(' Summer Olympics', '')

        medal_table = response.css('table.table.table-striped:contains("NOC") a::text, table.table.table-striped:contains("NOC") td::text').getall()
        medal_data_list = []

        for i in range(0, len(medal_table), 6):
            if len(medal_table[i:i+6]) == 6:
                country_name = medal_table[i]
                gold = int(medal_table[i+2])
                silver = int(medal_table[i+3])
                bronze = int(medal_table[i+4])
                total = int(medal_table[i+5])

                found = False
                for country in medal_data_list:
                    if country['Country'] == country_name:
                        country['Gold'] += gold
                        country['Silver'] += silver
                        country['Bronze'] += bronze
                        country['Total'] += total
                        found = True
                        break
                if not found:
                    medal_data_list.append({
                        'Country': country_name,
                        'Gold': gold,
                        'Silver': silver,
                        'Bronze': bronze,
                        'Total': total
                    })

        if not medal_data_list:
            medal_status = "Not held due to war"

            yield {
                    'Year': year,
                    'Status': medal_status
                }
        else:
            for country_data in medal_data_list:

                yield {
                    'Year': year,
                    'Country': country_data['Country'],
                    'Gold': country_data['Gold'],
                    'Silver': country_data['Silver'],
                    'Bronze': country_data['Bronze'],
                    'Total': country_data['Total']
                }