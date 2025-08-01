<script setup>
    import iconLight from '../assets/icons/light.svg'
    import iconDark from '../assets/icons/dark.svg'

    import { onMounted } from 'vue'
    import { isDark, toggleTheme, initTheme } from '../stores/theme.js'

    onMounted(() => {
        initTheme()
    })
</script>
<template>
    <a @click="toggleTheme">
        <img :src="isDark ? iconLight : iconDark" alt="Theme Icon" />
    </a>
</template>
<style scoped>
    img {
        vertical-align: bottom;
    }
</style>