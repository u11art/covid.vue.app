import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile(query = '(max-width: 768px)') {
    const isMobile = ref(false)
    let mediaQuery

    const update = () => {
        isMobile.value = mediaQuery.matches
    }

    onMounted(() => {
        mediaQuery = window.matchMedia(query)
        update()
        mediaQuery.addEventListener('change', update)
    })

    onUnmounted(() => {
        mediaQuery?.removeEventListener('change', update)
    })

    return { isMobile }
}
