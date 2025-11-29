import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: {
      title: '数据驾驶舱',
      icon: 'dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/datasources',
    name: 'DataSources',
    component: () => import('@/views/datasources/DataSourceView.vue'),
    meta: {
      title: '数据源管理',
      icon: 'database',
      requiresAuth: true
    }
  },
  {
    path: '/datasources/create',
    name: 'DataSourceCreate',
    component: () => import('@/views/datasources/DataSourceCreate.vue'),
    meta: {
      title: '创建数据源',
      requiresAuth: true,
      hideInMenu: true
    }
  },
  {
    path: '/datasources/:id/edit',
    name: 'DataSourceEdit',
    component: () => import('@/views/datasources/DataSourceEdit.vue'),
    meta: {
      title: '编辑数据源',
      requiresAuth: true,
      hideInMenu: true
    }
  },
  {
    path: '/datasources/:id/detail',
    name: 'DataSourceDetail',
    component: () => import('@/views/datasources/DataSourceDetail.vue'),
    meta: {
      title: '数据源详情',
      requiresAuth: true,
      hideInMenu: true
    }
  },
  {
    path: '/datasets',
    name: 'datasets',
    component: () => import('@/views/datasets/DatasetView.vue'),
    meta: {
      title: '数据集管理',
      icon: 'DataBoard',
      requiresAuth: true
    }
  },
  {
    path: '/datasets/create',
    name: 'dataset-create',
    component: () => import('@/views/datasets/DatasetCreate.vue'),
    meta: {
      title: '创建数据集',
      requiresAuth: true
    }
  },
  {
    path: '/datasets/:id/edit',
    name: 'dataset-edit',
    component: () => import('@/views/datasets/DatasetEdit.vue'),
    meta: {
      title: '编辑数据集',
      requiresAuth: true
    }
  },
  {
    path: '/datasets/:id/detail',
    name: 'dataset-detail',
    component: () => import('@/views/datasets/DatasetDetail.vue'),
    meta: {
      title: '数据集详情',
      requiresAuth: true
    }
  },
  {
    path: '/modeling',
    name: 'Modeling',
    component: () => import('@/views/modeling/ModelingView.vue'),
    meta: {
      title: '智能建模',
      icon: 'model',
      requiresAuth: true
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/analysis/AnalysisView.vue'),
    meta: {
      title: '可视化分析',
      icon: 'analysis',
      requiresAuth: true
    },
    children: [
      {
        path: 'chart/create',
        name: 'ChartCreate',
        component: () => import('@/views/analysis/ChartCreate.vue'),
        meta: {
          title: '创建图表',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'chart/:id/edit',
        name: 'ChartEdit',
        component: () => import('@/views/analysis/ChartEdit.vue'),
        meta: {
          title: '编辑图表',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'chart/:id/detail',
        name: 'ChartDetail',
        component: () => import('@/views/analysis/ChartDetail.vue'),
        meta: {
          title: '图表详情',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'dashboard/create',
        name: 'DashboardCreate',
        component: () => import('@/views/analysis/DashboardCreate.vue'),
        meta: {
          title: '创建仪表板',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'dashboard/:id/edit',
        name: 'DashboardEdit',
        component: () => import('@/views/analysis/DashboardEdit.vue'),
        meta: {
          title: '编辑仪表板',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'dashboard/:id/detail',
        name: 'DashboardDetail',
        component: () => import('@/views/analysis/DashboardDetail.vue'),
        meta: {
          title: '仪表板详情',
          requiresAuth: true,
          hideInMenu: true
        }
      }
    ]
  },
  {
    path: '/ai',
    name: 'AI',
    component: () => import('@/views/ai/AIView.vue'),
    meta: {
      title: 'AI洞察',
      icon: 'ai',
      requiresAuth: true
    }
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: () => import('@/views/alerts/AlertsView.vue'),
    meta: {
      title: '预警监控',
      icon: 'alert',
      requiresAuth: true
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/reports/ReportView.vue'),
    meta: {
      title: '报表中心',
      icon: 'report',
      requiresAuth: true
    }
  },
  {
    path: '/collaboration',
    name: 'Collaboration',
    component: () => import('@/views/collaboration/CollaborationView.vue'),
    meta: {
      title: '协作与共享',
      icon: 'team',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideInMenu: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
      hideInMenu: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回顶部或保存的位置
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title as string || 'Stardust BI'
  document.title = `${title} - Stardust BI`
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // TODO: 检查用户登录状态
    const isAuthenticated = localStorage.getItem('token')
    
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }
  
  next()
})

// 路由后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计
  console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

export default router