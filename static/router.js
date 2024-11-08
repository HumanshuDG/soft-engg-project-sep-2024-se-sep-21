import Home from './components/home.js';
import instructor_home from './components/instructor_home.js';
import login from './components/login.js';
import Register from './components/register.js';
import student_home from './components/student_home.js';
import project_team from './components/project_team.js';
import gen_ai from './components/gen_ai.js';
import project_team_std from './components/project_team_std.js'; // Import the new component


const routes = [
    { path: '/', component: Home, name: 'homepage'},
    {path: '/login', component: login, name: 'login'},
    { path: '/register', component: Register, name: 'signup'},
    { path: '/instructor_home', component: instructor_home},
    { path: '/student_home', component: student_home},
    { path: '/project_team/:teamId', component: project_team, name: 'project_team' },
    { path: '/gen_ai', component: gen_ai, name: 'gen_ai' },
    { path: '/project_team_std/:teamId', component: project_team_std, name: 'project_team_std' },
  
]


export default new VueRouter({
    routes,
}) 