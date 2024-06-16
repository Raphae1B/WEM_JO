import scrapy
import re

class olymp_host_spider(scrapy.Spider):
    name = "olymp_host"

    start_urls = [
        'https://www.olympedia.org/editions'
    ]

    def parse(self, response):
        olympic_games = response.css('ol.breadcrumb + h1 + h2 + h3 + table.table.table-striped a::attr(href)').getall()

        exclude_urls = ["/editions/63", "/editions/64", "/editions/372"] #edition 2024,2028 et 2032


        for olympic_game in olympic_games :
            olympic_link = response.css(f'a[href="{olympic_game}"]::attr(href)').get()
            olympic_url = response.urljoin(olympic_link)
            yield scrapy.Request(olympic_url, callback=self.parse_olympic, meta={'olympic_name': olympic_game})

    def parse_olympic(self, response):

        year_raw = response.css('th:contains("Number and Year") + td::text').get()
        year = re.search(r'\b(\d{4})\b', year_raw).group(1)

        host_city_country_raw = response.css('table.biotable th:contains("Host city") + td::text').get()

        host_city = re.search(r'\b([^\d\n,()]+)\b', host_city_country_raw).group(1)
        host_country = re.search(r',\s*([^\d\n,()]+)\b', host_city_country_raw).group(1)


        yield {
                'Year': year,
                'Host city': host_city,
                'Host country': host_country
            }