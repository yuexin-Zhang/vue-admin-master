import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Menu from './views/nav1/Menu.vue'
import Page4 from './views/nav2/Page4.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '菜谱管理',
        iconCls: 'el-icon-menu',//图标样式class
        children: [
            { path: '/table', component: Table, name: '菜品管理'},
            { path: '/menu', component: Menu, name: '查看周菜单' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '员工就餐汇总',
        iconCls: 'el-icon-menu',
        children: [
            { path: '/page4', component: Page4, name: '员工就餐汇总' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;