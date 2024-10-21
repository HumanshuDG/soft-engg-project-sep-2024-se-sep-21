import Home from './components/home.js';
import login from './components/login.js';
import Register from './components/register.js';

const routes = [
    { path: '/', component: Home, name: 'homepage'},
    {path: '/login', component: login, name: 'login'},
    { path: '/register', component: Register, name: 'signup'},
]


export default new VueRouter({
    routes,
}) 