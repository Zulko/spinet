import Vue from 'vue'
import Router from 'vue-router'
import spinet from '@/components/spinet'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'spinet',
      component: spinet
    }
  ]
})
