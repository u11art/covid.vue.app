import { ref } from 'vue'

export const isDark = ref(false)

export const setTheme = (dark) => {
    isDark.value = dark
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
}

export const toggleTheme = () => {
    setTheme(!isDark.value)
}

export const initTheme = () => {
    const saved = localStorage.getItem('theme')
    setTheme(saved === 'dark')
}
