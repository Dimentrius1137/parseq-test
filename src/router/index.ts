import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
      path: '/',
      name: 'lists',
      component: () => import('@/pages/ListsPage.vue'),
    },
    {
      path: '/new-list',
      name: 'list-form',
      component: () => import('@/pages/NewList.vue'),
    },
  ],
})

export default router
