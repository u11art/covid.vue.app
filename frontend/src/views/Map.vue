<script>
    import covidApi from '../services/covid.api';
    import 'leaflet/dist/leaflet.css'
    import L from 'leaflet';
    import Banner from '../components/Banner.vue';

    export default {
        name: 'Map',
        components: {
            Banner
        },
        data() {
            return {
                loading: true,
                error: null,
                countriesData: [],
                selectedMetric: 'cases',
                map: null,
                markersLayer: null,
                metricNames: {
                    cases: 'Всего случаев',
                    deaths: 'Смертей',
                    recovered: 'Выздоровлений',
                    active: 'Активных случаев',
                    casesPerOneMillion: 'Случаев на млн',
                    deathsPerOneMillion: 'Смертей на млн'
                }
            }
        },
        computed: {
            topCountriesByMetric() {
                return [...this.countriesData]
                    .sort((a, b) => (b[this.selectedMetric] || 0) - (a[this.selectedMetric] || 0))
                    .slice(0, 20)
            }
        },
        async mounted() {
            await this.loadData()
            this.initMap()
        },
        beforeUnmount() {
            if (this.map) {
                this.map.remove()
            }
        },
        methods: {
            async loadData() {
                try {
                    this.loading = true
                    this.error = null
                    this.countriesData = await covidApi.getCountriesData()
                } catch (error) {
                    this.error = 'Ошибка при загрузке данных. Попробуйте обновить страницу.'
                    console.error('Error loading data:', error)
                } finally {
                    this.loading = false
                }
            },

            initMap() {
                if (this.loading) return

                this.map = L.map(this.$refs.mapContainer, {
                    worldCopyJump: false,
                    maxBounds: [[-90, -180], [90, 180]],
                    maxBoundsViscosity: 1.0
                }).setView([20, 0], 2)

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    noWrap: true
                }).addTo(this.map)

                this.markersLayer = L.layerGroup().addTo(this.map)

                this.updateMapData()
            },

            updateMapData() {
                if (!this.map || !this.markersLayer) return

                this.markersLayer.clearLayers()

                const maxValue = Math.max(...this.countriesData.map(country => country[this.selectedMetric] || 0))

                this.countriesData.forEach(country => {
                    if (!country.countryInfo.lat || !country.countryInfo.long) return

                    const value = country[this.selectedMetric] || 0
                    if (value === 0) return

                    const normalizedValue = value / maxValue
                    const radius = Math.max(5, normalizedValue * 30)
                    const color = this.getColorForValue(normalizedValue)

                    const marker = L.circleMarker([country.countryInfo.lat, country.countryInfo.long], {
                        radius: radius,
                        fillColor: color,
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.7
                    })

                    const popupContent = `
                        <div class="popup-content">
                            <div class="popup-header">
                                <img src="${country.countryInfo.flag}" alt="${country.country}" class="popup-flag" />
                                <h4>${country.country}</h4>
                            </div>
                            <div class="popup-stats">
                                <div class="popup-stat">
                                    <span class="label">Всего случаев:</span>
                                    <span class="value confirmed">${this.formatNumber(country.cases)}</span>
                                </div>
                                <div class="popup-stat">
                                    <span class="label">Смертей:</span>
                                    <span class="value deaths">${this.formatNumber(country.deaths)}</span>
                                </div>
                                <div class="popup-stat">
                                    <span class="label">Выздоровлений:</span>
                                    <span class="value recovered">${this.formatNumber(country.recovered)}</span>
                                </div>
                                <div class="popup-stat">
                                    <span class="label">Активных:</span>
                                    <span class="value active">${this.formatNumber(country.active)}</span>
                                </div>
                                <div class="popup-stat">
                                    <span class="label">${this.metricNames[this.selectedMetric]}:</span>
                                    <span class="value ${this.getMetricClass(this.selectedMetric)}">${this.formatNumber(value)}</span>
                                </div>
                            </div>
                        </div>
                    `

                    marker.bindPopup(popupContent)
                    this.markersLayer.addLayer(marker)
                })
            },

            getColorForValue(normalizedValue) {
                const colors = ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']
                const index = Math.floor(normalizedValue * (colors.length - 1))
                return colors[Math.min(index, colors.length - 1)]
            },

            getMetricClass(metric) {
                const classMap = {
                    cases: 'confirmed',
                    deaths: 'deaths',
                    recovered: 'recovered',
                    active: 'active',
                    casesPerOneMillion: 'confirmed',
                    deathsPerOneMillion: 'deaths'
                }
                return classMap[metric] || 'default'
            },

            formatNumber(value) {
                if (value === undefined || value === null) return 'Нет данных'
                return value.toLocaleString('ru-RU')
            }
        }
    }
</script>
<template>
    <Banner>
        <template #title>Карта</template>
        <template #description>
            Визуальная статистика по нашей планете
        </template>
    </Banner>
    <div>
        <div class="container">
            <div v-if="loading" class="loading">
                Загрузка данных...
            </div>
            
            <div v-else-if="error" class="error">
                {{ error }}
            </div>
            
            <div v-else>

                <div class="map-container">
                    <div class="oneline">
                        <h3>Распространение COVID-19 по странам: </h3>
                        <select v-model="selectedMetric" @change="updateMapData">
                            <option value="cases">Всего случаев</option>
                            <option value="deaths">Смертей</option>
                            <option value="recovered">Выздоровлений</option>
                            <option value="active">Активных случаев</option>
                            <option value="casesPerOneMillion">Случаев на млн</option>
                            <option value="deathsPerOneMillion">Смертей на млн</option>
                        </select>
                    </div>
                    <div id="map" ref="mapContainer"></div>
                </div>

                <div>
                    <h3>Легенда</h3>
                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #ffffcc"></div>
                            <span>Низкий уровень</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #a1dab4"></div>
                            <span>Ниже среднего</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #41b6c4"></div>
                            <span>Средний уровень</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #2c7fb8"></div>
                            <span>Выше среднего</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #253494"></div>
                            <span>Высокий уровень</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3>Топ-20 стран по показателю: {{ metricNames[selectedMetric] }}</h3>
                    <div class="countries-ranking">
                        <div 
                            v-for="(country, index) in topCountriesByMetric" 
                            :key="country.country"
                            class="ranking-item"
                        >
                            <div class="rank">{{ index + 1 }}</div>
                            <img :src="country.countryInfo.flag" :alt="country.country" class="flag" />
                            <div class="country-name">{{ country.country }}</div>
                            <div class="metric-value" :class="getMetricClass(selectedMetric)">
                                {{ formatNumber(country[selectedMetric]) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    #map {
        height: 450px;
        border-radius: 10px;
        z-index: 1;
        position: relative;
    }

    .oneline {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .map-row h3 {
        margin: 0;
        white-space: nowrap;
    }

    .map-row select {
        font-size: 1rem;
    }

    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .legend-color {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }

    .countries-ranking {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 0.5rem;
        max-height: 600px;
        overflow-y: auto;
    }

    .ranking-item {
        display: grid;
        grid-template-columns: auto auto 1fr auto;
        gap: 0.5rem;
        align-items: center;
        padding: 0.5rem;
        border-radius: 8px;
    }

    .rank {
        font-weight: 700;
        min-width: 25px;
        text-align: center;
    }

    .flag {
        width: 25px;
        height: 18px;
        border-radius: 2px;
        object-fit: cover;
    }

    .country-name {
        font-weight: 500;
    }

    .metric-value {
        font-weight: 600;
        text-align: right;
    }

    .metric-value.confirmed { color: #3498db; }
    .metric-value.deaths { color: #e74c3c; }
    .metric-value.recovered { color: #27ae60; }
    .metric-value.active { color: #f39c12; }

    :deep(.popup-content) {
        min-width: 200px;
    }

    :deep(.popup-header) {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    :deep(.popup-flag) {
        width: 30px;
        height: 20px;
        border-radius: 2px;
        object-fit: cover;
    }

    :deep(.popup-header h4) {
        margin: 0;
        color: #2c3e50;
    }

    :deep(.popup-stats) {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    :deep(.popup-stat) {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    :deep(.popup-stat .label) {
        font-size: 0.8rem;
        color: #666;
    }

    :deep(.popup-stat .value) {
        font-weight: 600;
        font-size: 0.8rem;
    }

    :deep(.popup-stat .value.confirmed) { color: #3498db; }
    :deep(.popup-stat .value.deaths) { color: #e74c3c; }
    :deep(.popup-stat .value.recovered) { color: #27ae60; }
    :deep(.popup-stat .value.active) { color: #f39c12; }

    @media (max-width: 768px) {
        .countries-ranking {
            grid-template-columns: 1fr;
        }
        
        #map {
            height: 300px;
        }
        
        .legend {
            flex-direction: column;
            align-items: center;
        }
    }
</style>
