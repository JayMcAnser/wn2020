
const routes = [
  {
    path: '/org',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Home.vue') },
      { path: 'stichting', component: () => import('pages/Stichting.vue') },
      { path: 'confirm/:key', component: () => import('pages/NewsletterConfirm.vue')},
      { path: 'confirm', component: () => import('pages/NewsletterConfirm.vue')},

//      { path: 'design', component: () => import('pages/Design.vue') },
//      { path: 'design/rietveld', component: () =>import('pages/DesignRietveld.vue')},
//      { path: 'design/font', component: () =>import('pages/DesignFont.vue')},
      { path: 'team', component: () => import('pages/Team.vue') }
    ]
  },

]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
