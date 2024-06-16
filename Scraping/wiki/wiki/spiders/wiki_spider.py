import scrapy
import re

class wiki_spider(scrapy.Spider):
    name = "wiki"

    start_urls = [
        'https://en.wikipedia.org/wiki/List_of_sovereign_states'
    ]

    def parse(self, response):
        countries = response.css('table.sortable.wikitable tbody tr td b a::attr(title)').getall()
        for country in countries:
            country_link = response.css(f'a[title="{country}"]::attr(href)').get()
            country_url = response.urljoin(country_link)
            yield scrapy.Request(country_url, callback=self.parse_country, meta={'country_name': country})

    def parse_country(self, response):

        country_name = response.meta['country_name']
        population_estimate = response.css('tr.mergedrow th:contains("estimate") + td::text, tr.mergedrow th:contains("estimate") + td div ul li::text').get()
        population_census = response.css('tr.mergedrow th:contains("census") + td::text').get()

        if population_estimate:
            population = population_estimate
        elif population_census:
            population = population_census
        else:
            population = None

        def clean_population(population_str):
            cleaned_str = re.sub(r'[^\d,]', '', population_str)
            return int(cleaned_str.replace(',', ''))
        
        population_total = clean_population(population)
        
        area_mergedbottomrow = response.css('tr.mergedbottomrow th:contains("Total") + td::text').get()
        area_mergedrow = response.css('tr.mergedrow th:contains("Total") + td::text').get()
        
        if area_mergedbottomrow:
            area = area_mergedbottomrow
        elif area_mergedrow:
            area = area_mergedrow
        else:
            area = None

        def clean_area(area_str):
            if "or" in area_str:
                area_str = area_str.split("or")[0].strip()
            cleaned_str = re.sub(r'[^\d,]', '', area_str)
            return int(cleaned_str.replace(',', ''))

        area_total = clean_area(area)

        water = response.css('th:contains("Water") + td::text').get()

        def clean_water_data(water_str):
            if water_str:
                water_str = water_str.replace('%', '')
                if 'negligible' in water_str.lower():
                    return 0
                match = re.search(r'\d+(\.\d+)?', water_str)
                return float(match.group(0)) if match else None
            return None

        water_area = clean_water_data(water) if water else None

        gdp_ppp_percapita = response.css('th:contains("Per capita") + td::text').get()
        gdp_ppp_percapita = gdp_ppp_percapita.replace('$', '').replace(' ', '') if gdp_ppp_percapita else None

        if gdp_ppp_percapita:
            cleaned_value = re.search(r'\d[\d,.]*', gdp_ppp_percapita).group()
            def convert_to_int(value):
                try:
                    return int(value.replace(',', '').strip())
                except ValueError:
                    return None

            gdp_ppp_percapita = convert_to_int(cleaned_value)
        else:
            gdp_ppp_percapita = None

        gini = response.css('th:contains("Gini") + td::text').get()
        gini = gini.replace('\xa0', '').replace(' ', '') if gini else None

        def convert_to_float(value):
            try:
                return float(value.replace(',', '.').strip())
            except (ValueError, AttributeError):
                return None

        gini = convert_to_float(gini)

        hdi = response.css('th:contains("HDI") + td::text').get()
        hdi = hdi.replace('\xa0', '') if hdi else None
        hdi = convert_to_float(hdi)

        currency = response.css('table.infobox th:contains("Currency") + td a[title="ISO 4217"]::text').get() or None

        governement = response.css('table.infobox th:contains("Government") + td a::attr(title)').getall()

        #schemaorg = response.css('script[type="application/ld+json"]').get()

        
        yield {
            'Country': country_name,
            'Total population': population_total,
            'Total area': area_total,
            'Water area (%)' : water_area,
            'PIB per capita' : gdp_ppp_percapita,
            'Gini coefficient' : gini,
            'Human Development Index' : hdi,
            'Currency' : currency,
            'Governement' : governement
            #'Structured data': schemaorg
        }