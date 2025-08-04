<script>
    export default {
        name: 'StatCard',
        props: {
            title: {
                type: String,
                required: true
            },
            number: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                default: 'default'
            },
            change: {
                type: Number,
                default: null
            }
        },
        computed: {
            formattedNumber() {
                return this.number.toLocaleString('ru-RU')
            },
            changeText() {
                if (!this.change) return ''
                const sign = this.change > 0 ? '+' : ''
                return `${sign}${this.change.toLocaleString('ru-RU')}`
            },
            changeClass() {
                if (!this.change) return ''
                return this.change > 0 ? 'positive' : 'negative'
            }
        }
    }
</script>
<template>
    <div class="stat-card">
        <h3>{{ title }}</h3>
        <div class="line">
            <div class="number" :class="type">
                {{ formattedNumber }}
            </div>
            <div class="change" v-if="change" :class="changeClass">
                {{ changeText }}
            </div>
        </div>
    </div>
</template>
<style scoped>
    .stat-card {
        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem;
        background-color: var(--color-select);
        border-bottom: solid 2px var(--color-main);
    }

    .line {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }
</style>