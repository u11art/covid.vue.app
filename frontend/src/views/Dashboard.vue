<script>
    import { format } from 'date-fns';
    import { ru } from 'date-fns/locale';

    import covidApi from '../services/covid.api.js';
    import StatCard from '../components/StatCard.vue';
    import LineChart from '../components/LineChart.vue';
    import StatItem from '../components/StatItem.vue';
    import Banner from '../components/Banner.vue';

    export default {
        name: 'Dashboard',
        components: {
            StatCard,
            LineChart,
            StatItem,
            Banner
        },
        data() {
            return {
                loading: true,
                error: null,
                globalData: {},
                countriesData: [],
                historicalData: null,
                historicalChartData: null
            }
        },
        computed: {
            topCountries() {
                return this.countriesData.slice(0, 10)
            }
        },
        async mounted() {
            await this.loadData()
        },
        methods: {
            async loadData() {
                try {
                    this.loading = true
                    this.error = null

                    const [globalData, countriesData, historicalData] = await Promise.all([
                        covidApi.getGlobalData(),
                        covidApi.getCountriesData(),
                        covidApi.getHistoricalGlobal(30)
                    ])

                    this.globalData = globalData
                    this.countriesData = countriesData
                    this.historicalData = historicalData
                    this.prepareHistoricalChart()
                } catch (error) {
                    this.error = 'Ошибка при загрузке данных. Попробуйте обновить страницу.'
                    console.error('Ошибка при загрузке данных:', error)
                } finally {
                    this.loading = false
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
            }
        }
    }
</script>
<template>
    <Banner>
        <template #title>Данные по COVID-19</template>
        <template #description>
            Здесь мы собрали основную информацию.
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
                <div class="stats-grid">
                    <StatCard
                        title="Всего случаев"
                        :number="globalData.cases"
                        :change="globalData.todayCases"
                        type="confirmed"
                    />
                    <StatCard
                        title="Смертей"
                        :number="globalData.deaths"
                        :change="globalData.todayDeaths"
                        type="deaths"
                    />
                    <StatCard
                        title="Выздоровлений"
                        :number="globalData.recovered"
                        :change="globalData.todayRecovered"
                        type="recovered"
                    />
                    <StatCard
                        title="Активных случаев"
                        :number="globalData.active"
                        type="active"
                    />
                </div>
                <LineChart
                    v-if="historicalChartData"
                    title="Глобальная динамика COVID-19 (последние 30 дней)"
                    :chartData="historicalChartData"
                    :importDisplayMode="'daily'"
                />
                <div class="chart-container">
                    <h3>Топ-10 стран по количеству случаев</h3>
                    <div class="countries-list">
                        <StatItem
                            v-for="(country, index) in topCountries"
                            :key="country.country"
                            :country="country"
                            :index="index"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
