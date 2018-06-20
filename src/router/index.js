import Vue from 'vue'
import Router from 'vue-router'
import prototype from '@/components/prototype'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'prototype',
      component: prototype
    }
  ]
})
