import Home from './components/home.js';
import login from './components/login.js';
import Register from './components/register.js';

const routes = [
    { path: '/', component: Home},
    {path: '/login', component: login},
    { path: '/register', component: Register},
]


export default new VueRouter({
    routes,
}) 