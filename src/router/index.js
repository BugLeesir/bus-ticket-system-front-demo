import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */
/**
 * 动态路由
 *
 */
export const asyncRoutes = [
  {
    path: '/user-manage',
    component: Layout,
    redirect: '/user-manage/member',
    name: 'user-manage',
    meta: {
      title: '用户管理',
      icon: 'user-manage',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'member',
        component: () => import('@/views/user-manage/member'), // Parent router-view
        name: 'Member',
        meta:
        {
          title: '会员信息管理',
          icon: 'member'
        }
      },
      {
        path: 'admin',
        component: () => import('@/views/user-manage/admin'),
        name: 'Admin',
        meta:
        {
          title: '管理员信息管理',
          icon: 'admin'
        }
      }
    ]
  },
  {
    path: '/bus-route',
    component: Layout,
    redirect: '/bus-route',
    children: [
      {
        path: 'index',
        name: 'bus-route',
        component: () => import('@/views/bus-route/index'),
        meta: { title: '车次信息管理', icon: 'bus-route', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/announcement',
    component: Layout,
    redirect: '/announcement',
    children: [
      {
        path: 'index',
        name: 'announcement',
        component: () => import('@/views/announcement/index'),
        meta: { title: '公告信息管理', icon: 'announcement', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/message',
    component: Layout,
    redirect: '/message',
    children: [
      {
        path: 'index',
        name: 'message',
        component: () => import('@/views/message/index'),
        meta: { title: '留言区', icon: 'message', roles: ['admin', 'member'] }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order',
    name: 'order',
    meta: {
      title: '订单管理',
      icon: 'order',
      roles: ['admin']
    },
    children: [
      {
        path: 'order-info',
        component: () => import('@/views/order/order-info'), // Parent router-view
        name: 'order-info',
        meta:
        {
          title: '订单信息',
          icon: 'order-info'
        }
      },
      {
        path: 'dashboard',
        component: () => import('@/views/order/dashboard'),
        name: 'dashboard',
        meta:
        {
          title: '订单统计',
          icon: 'dashboard'
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]
/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/homepage',
    children: [{
      path: 'homepage',
      name: 'Homepage',
      component: () => import('@/views/homepage/index'),
      meta: { title: '首页', icon: 'homepage' }
    }]
  },
  {
    path: '/personal-center',
    component: Layout,
    redirect: '/personal-center/personal-info',
    name: 'personal-center',
    meta: {
      title: '个人中心',
      icon: 'personal-center'
    },
    children: [
      {
        path: 'personal-info',
        component: () => import('@/views/personal-center/personal-info'), // Parent router-view
        name: 'personal-info',
        meta:
        {
          title: '个人信息',
          icon: 'personal-info'
        }
      },
      {
        path: 'my-orders',
        component: () => import('@/views/personal-center/my-orders'),
        name: 'my-orders',
        meta:
        {
          title: '我的订单',
          icon: 'my-orders'
        }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
