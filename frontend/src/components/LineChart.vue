<script>
    import VueApexCharts from 'vue3-apexcharts'

    import { isDark } from '../stores/theme.js'

    export default {
        name: 'LineChart',
        components: {
            apexchart: VueApexCharts
        },
        props: {
            title: {
                type: String,
                required: true
            },
            chartData: {
                type: Object,
                required: true
            },
            importDisplayMode: {
                type: String,
                default: 'cumulative'
            }
        },
        data() {
            return {
                displayMode: this.importDisplayMode,
                aggregationType: 'daily',
                internalLabels: [],
                internalSeries: []
            }
        },
        computed: {
            isDarkTheme() {
                return isDark.value
            },
            shouldShowAggregation() {
                return this.chartData?.labels?.length > 90
            },
            chartOptions() {
                return {
                    chart: {
                        type: 'line',
                        background: 'transparent',
                        toolbar: {
                            show: true,
                            tools: {
                                zoom: true,
                                zoomin: true,
                                zoomout: true,
                                pan: true,
                                reset: true
                            }
                        }
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 2
                    },
                    markers: {
                        size: 4,
                        hover: {
                            size: 6
                        }
                    },
                    colors: ['#3498db', '#e74c3c', '#27ae60', '#f39c12'],
                    xaxis: {
                        categories: this.internalLabels,
                        title: {
                            text: 'Дата'
                        },
                        labels: {
                            rotate: -45
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Количество'
                        },
                        labels: {
                            formatter: value => value?.toLocaleString('ru-RU') || '0'
                        }
                    },
                    tooltip: {
                        shared: true,
                        intersect: false,
                        y: {
                            formatter: value => value?.toLocaleString('ru-RU') || '0'
                        }
                    },
                    legend: {
                        position: 'top',
                        horizontalAlign: 'center'
                    },
                    grid: {
                        borderColor: '#e0e0e0',
                        strokeDashArray: 3
                    },
                    theme: {
                        mode: this.isDarkTheme ? 'dark' : 'light'
                    }
                }
            }
        },
        watch: {
            chartData: {
                handler: 'processData',
                immediate: true,
                deep: true
            },
            displayMode: {
                handler: 'processData',
                immediate: false
            },
            aggregationType: {
                handler: 'processData',
                immediate: false
            },
            isDarkTheme: {
                handler() {
                    this.$forceUpdate()
                },
                immediate: false
            }
        },
        methods: {
            processData() {
                if (!this.chartData || !this.chartData.datasets || !this.chartData.labels) {
                    this.internalLabels = []
                    this.internalSeries = []
                    return
                }

                // Проверяем, что данные не пустые
                if (this.chartData.labels.length === 0 || this.chartData.datasets.length === 0) {
                    this.internalLabels = []
                    this.internalSeries = []
                    return
                }

                let data = {
                    labels: [...this.chartData.labels],
                    datasets: this.chartData.datasets.map(ds => ({
                        ...ds,
                        data: [...ds.data]
                    }))
                }

                if (this.displayMode === 'daily') {
                    data = this.calculateDerivative(data)
                }

                if (this.shouldShowAggregation && this.aggregationType !== 'daily') {
                    data = this.aggregateByPeriod(data)
                }

                this.internalLabels = data.labels
                this.internalSeries = data.datasets.map(ds => ({
                    name: ds.label,
                    data: ds.data,
                    color: ds.borderColor || ds.backgroundColor
                }))

                // Принудительно обновляем компонент для перерисовки графика
                this.$nextTick(() => {
                    if (this.$refs.apexChart) {
                        this.$refs.apexChart.updateOptions(this.chartOptions)
                    }
                })
            },
            calculateDerivative(data) {
                return {
                    labels: data.labels.slice(1),
                    datasets: data.datasets.map(dataset => ({
                        ...dataset,
                        data: dataset.data.slice(1).map((val, i) =>
                            Math.max(0, (val || 0) - (dataset.data[i] || 0))
                        )
                    }))
                }
            },
            aggregateByPeriod(data) {
                const periodMap = {
                    weekly: { days: 7, suffix: 'нед.' },
                    monthly: { days: 30, suffix: 'мес.' }
                }
                const { days, suffix } = periodMap[this.aggregationType] || {}

                if (!days) return data

                const labels = []
                const datasets = data.datasets.map(ds => ({ ...ds, data: [] }))

                for (let i = 0; i < data.labels.length; i += days) {
                    const end = Math.min(i + days, data.labels.length)
                    const label = `${data.labels[i]} - ${data.labels[end - 1]} (${suffix})`
                    labels.push(label)

                    data.datasets.forEach((ds, idx) => {
                        const slice = ds.data.slice(i, end)
                        const value = this.displayMode === 'daily'
                            ? slice.reduce((sum, v) => sum + (v || 0), 0)
                            : slice.at(-1) || 0
                        datasets[idx].data.push(value)
                    })
                }

                return { labels, datasets }
            }
        }
    }
</script>
<template>
    <div class="chart-container">
        <h3>{{ title }}</h3>

        <div class="chart-controls">
            <div class="control-group">
                <label>Тип данных:</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" v-model="displayMode" value="cumulative" />
                        Накопительные
                    </label>
                    <label class="radio-label">
                        <input type="radio" v-model="displayMode" value="daily" />
                        Новые случаи (производная)
                    </label>
                </div>
            </div>

            <div class="control-group" v-if="shouldShowAggregation">
                <label>Агрегация:</label>
                <select v-model="aggregationType" class="aggregation-select">
                    <option value="daily">По дням</option>
                    <option value="weekly">По неделям</option>
                    <option value="monthly">По месяцам</option>
                </select>
            </div>
        </div>

        <apexchart
            ref="apexChart"
            :options="chartOptions"
            :series="internalSeries"
            type="line"
            height="400"
        />
    </div>
</template>
<style scoped>
    .chart-container {
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .chart-container h3 {
        margin-bottom: 1rem;
        font-weight: 600;
        text-align: center;
    }

    .chart-controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        border-radius: 10px;
    }

    .control-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .control-group label {
        font-weight: 600;
        font-size: 0.9rem;
    }

    .radio-group {
        display: flex;
        gap: 1rem;
    }

    .radio-label {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: color 0.2s ease;
    }

    .radio-label input[type="radio"] {
        margin: 0;
        cursor: pointer;
    }

    .aggregation-select {
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-size: 0.85rem;
        cursor: pointer;
    }

    .aggregation-select:focus {
        outline: none;
    }

    @media (max-width: 768px) {
        .chart-controls {
            flex-direction: column;
            gap: 1rem;
        }

        .radio-group {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
</style>
