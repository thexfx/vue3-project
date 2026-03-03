import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import BankHomeView from '../views/BankHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: BankHomeView,
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transfer',
      name: 'transfer',
      component: () => import('../views/TransferView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/deposit',
      name: 'deposit',
      component: () => import('../views/DepositView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: () => import('../views/WithdrawView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('bank_user')
  if (to.meta.requiresAuth && !user) {
    next('/')
  } else {
    next()
  }
})

export default router
