<script setup>
    import iconLight from '../assets/icons/light.svg'
    import iconDark from '../assets/icons/dark.svg'
    import { ref, onMounted } from 'vue'

    const isDark = ref(false)

    const setTheme = (dark) => {
        isDark.value = dark
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }

    const toggleTheme = () => {
        setTheme(!isDark.value)
    }

    onMounted(() => {
        const saved = localStorage.getItem('theme')
        setTheme(saved === 'dark')
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