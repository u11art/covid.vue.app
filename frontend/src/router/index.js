import { createRouter, createWebHistory } from 'vue-router';

import Dashboard from '../views/Dashboard.vue';
import Map from '../views/Map.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard
        },
        {
            path: '/map',
            name: 'Map',
            component: Map
        },
    ],
})

export default router;