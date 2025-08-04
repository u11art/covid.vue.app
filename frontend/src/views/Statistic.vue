<script>
    import StatCard from '../components/StatCard.vue'
    import LineChart from '../components/LineChart.vue'
    import Banner from '../components/Banner.vue'
    import covidApi from '../services/covid.api.js'
    import { format } from 'date-fns'
    import { ru } from 'date-fns/locale'

    export default {
        name: 'Statistics',
        components: {
            StatCard,
            LineChart,
            Banner
        },
        data() {
            return {
                loading: true,
                error: null,
                globalData: {},
                countries: [],
                continentsData: [],
                selectedCountry: '',
                selectedPeriod: '30',
                countryData: null,
                historicalData: null,
                historicalChartData: null
            }
        },
        computed: {
            currentData() {
                return this.countryData || this.globalData
            },
            chartTitle() {
                const period = this.selectedPeriod === 'all' ? 'все время' : `${this.selectedPeriod} дней`
                const location = this.selectedCountry || 'мир'
                return `Динамика COVID-19: ${location} (${period})`
            }
        },
        async mounted() {
            await this.loadInitialData()
        },
        methods: {
            async loadInitialData() {
                try {
                    this.loading = true
                    this.error = null

                    const [globalData, countriesData, continentsData, historicalData] = await Promise.all([
                        covidApi.getGlobalData(),
                        covidApi.getCountriesData(),
                        covidApi.getContinentsData(),
                        covidApi.getHistoricalGlobal(this.selectedPeriod)
                    ])

                    this.globalData = globalData
                    this.countries = countriesData
                    this.continentsData = continentsData
                    this.historicalData = historicalData

                    this.prepareHistoricalChart()
                } catch (error) {
                    this.error = 'Ошибка при загрузке данных. Попробуйте обновить страницу.'
                    console.error('Error loading data:', error)
                } finally {
                    this.loading = false
                }
            },

            async loadCountryData() {
                if (!this.selectedCountry) {
                    this.countryData = null
                    await this.loadHistoricalData()
                    return
                }

                try {
                    this.countryData = await covidApi.getCountryData(this.selectedCountry)
                    await this.loadHistoricalData()
                } catch (error) {
                    this.error = `Ошибка при загрузке данных для ${this.selectedCountry}`
                    console.error('Error loading country data:', error)
                }
            },

            async loadHistoricalData() {
                try {
                    const days = this.selectedPeriod === 'all' ? 'all' : this.selectedPeriod
                    
                    if (this.selectedCountry) {
                        this.historicalData = await covidApi.getHistoricalCountry(this.selectedCountry, days)
                        if (this.historicalData.timeline) {
                            this.historicalData = this.historicalData.timeline
                        }
                    } else {
                        this.historicalData = await covidApi.getHistoricalGlobal(days)
                    }

                    this.prepareHistoricalChart()
                } catch (error) {
                    console.error('Error loading historical data:', error)
                }
            },

            prepareHistoricalChart() {
                if (!this.historicalData) return

                const dates = Object.keys(this.historicalData.cases)
                const cases = Object.values(this.historicalData.cases)
                const deaths = Object.values(this.historicalData.deaths)
                const recovered = Object.values(this.historicalData.recovered)

                const formattedDates = dates.map(date => {
                    return format(new Date(date), 'dd MMM', { locale: ru })
                })

                this.historicalChartData = {
                    labels: formattedDates,
                    datasets: [
                        {
                            label: 'Случаи',
                            data: cases,
                            borderColor: '#3498db',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Смерти',
                            data: deaths,
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Выздоровления',
                            data: recovered,
                            borderColor: '#27ae60',
                            backgroundColor: 'rgba(39, 174, 96, 0.1)',
                            fill: false,
                            tension: 0.4
                        }
                    ]
                }
            },

            formatDate(timestamp) {
                return format(new Date(timestamp), 'dd MMMM yyyy, HH:mm', { locale: ru })
            }
        }
    }
</script>
<template>
    <Banner>
        <template #title>Статистика</template>
        <template #description>
                Получите статистику по конкретным данным.
        </template>
    </Banner>
    <div class="dashboard">
        <div class="container">
            <div v-if="loading" class="loading">
                Загрузка данных...
            </div>
            
            <div v-else-if="error" class="error">
                {{ error }}
            </div>
            
            <div v-else>
                <div class="filters">
                    <select v-model="selectedCountry" @change="loadCountryData" class="filter-select">
                        <option value="">Выберите страну</option>
                        <option v-for="country in countries" :key="country.country" :value="country.country">
                            {{ country.country }}
                        </option>
                    </select>
                    
                    <select v-model="selectedPeriod" @change="loadHistoricalData" class="filter-select">
                        <option value="30">30 дней</option>
                        <option value="90">90 дней</option>
                        <option value="365">1 год</option>
                        <option value="all">Все время</option>
                    </select>
                </div>

                <div class="list">
                    <StatCard
                        title="Всего случаев"
                        :number="currentData.cases"
                        :change="currentData.todayCases"
                        type="confirmed"
                    />
                    <StatCard
                        title="Смертей"
                        :number="currentData.deaths"
                        :change="currentData.todayDeaths"
                        type="deaths"
                    />
                    <StatCard
                        title="Выздоровлений"
                        :number="currentData.recovered"
                        :change="currentData.todayRecovered"
                        type="recovered"
                    />
                    <StatCard
                        title="Активных случаев"
                        :number="currentData.active"
                        type="active"
                    />
                </div>

                <LineChart
                    v-if="historicalChartData"
                    :title="chartTitle"
                    :chartData="historicalChartData"
                />

                <div class="additional-info" v-if="selectedCountry && countryData">
                    <div class="chart-container">
                        <h3>Дополнительная информация о {{ selectedCountry }}</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Население:</span>
                                <span class="info-value">{{ countryData.population?.toLocaleString('ru-RU') || 'Нет данных' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Тестов проведено:</span>
                                <span class="info-value">{{ countryData.tests?.toLocaleString('ru-RU') || 'Нет данных' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Случаев на млн:</span>
                                <span class="info-value">{{ countryData.casesPerOneMillion?.toLocaleString('ru-RU') || 'Нет данных' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Смертей на млн:</span>
                                <span class="info-value">{{ countryData.deathsPerOneMillion?.toLocaleString('ru-RU') || 'Нет данных' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Критическое состояние:</span>
                                <span class="info-value">{{ countryData.critical?.toLocaleString('ru-RU') || 'Нет данных' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Обновлено:</span>
                                <span class="info-value">{{ formatDate(countryData.updated) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chart-container">
                    <h3>Статистика по континентам</h3>
                    <div class="list">
                        <div v-for="continent in continentsData" :key="continent.continent" class="continent-card">
                            <h4>{{ continent.continent }}</h4>
                            <div class="continent-stats">
                                <div class="stat">
                                    <span class="label">Случаи:</span>
                                    <span class="value confirmed">{{ continent.cases.toLocaleString('ru-RU') }}</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Смерти:</span>
                                    <span class="value deaths">{{ continent.deaths.toLocaleString('ru-RU') }}</span>
                                </div>
                                <div class="stat">
                                    <span class="label">Выздоровления:</span>
                                    <span class="value recovered">{{ continent.recovered.toLocaleString('ru-RU') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .filters {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem 1rem;
        gap: 0.5rem;
    }

    .chart-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .continent-card {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        background-color: var(--color-select);
        border-bottom: solid 2px var(--color-main);
    }

    .continent-stats {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat {
        display: flex;
        justify-content: space-between;
    }

    .label {
        font-weight: 500;
    }

    .value {
        font-weight: bold;
    }

    .value.confirmed {
        color: #007bff;
    }

    .value.deaths {
        color: #dc3545;
    }

    .value.recovered {
        color: #28a745;
    }
</style>