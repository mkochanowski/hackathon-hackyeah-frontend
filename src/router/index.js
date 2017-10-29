import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Account from '@/components/Account'
import NewOffer from '@/components/NewOffer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/offers/new',
      name: 'offers-new',
      component: NewOffer
    },
    {
      path: '/offers',
      name: 'offers',
      component: Home
    }
  ]
})
