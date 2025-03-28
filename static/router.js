import Home from './components/home.js';
import instructor_home from './components/instructor_home.js';
import login from './components/login.js';
import Register from './components/register.js';
import student_home from './components/student_home.js';
import project_team from './components/project_team.js';
import gen_ai from './components/gen_ai.js';
import project_team_std from './components/project_team_std.js'; // Import the new component
import instructor_dashboard from './components/instructor_dashboard.js'
import student_dashboard from './components/student_dashboard.js'
import ta_dashboard from './components/ta_dashboard.js';
import notifications from './components/notifications.js';
import ta_home from './components/ta_home.js';
import admin_home from './components/admin_home.js';
import default_home from './components/default_home.js'; // Import the default_home component
import team_report from './components/team_report.js'; // Adjust the path to your TeamReports component


const routes = [
    { path: '/', component: Home, name: 'homepage'},
    {path: '/login', component: login, name: 'login'},
    { path: '/register', component: Register, name: 'signup' },
    { path: '/instructor_home', component: instructor_home},
    { path: '/student_home', component: student_home},
    { path: '/project_team/:teamId', component: project_team, name: 'project_team' },
    { path: '/gen_ai', component: gen_ai, name: 'gen_ai' },
    { path: '/project_team_std/:teamId', component: project_team_std, name: 'project_team_std' },
    { path: '/instructor_dashboard', component: instructor_dashboard},
    { path: '/student_dashboard', component: student_dashboard},
    { path: '/ta_home', component: ta_home, name:'ta_home'},
    { path: '/ta_dashboard', component: ta_dashboard, name:'ta_dashboard'},
    { path: '/notifications', name: 'notifications',component: notifications},    
    { path: '/admin_home', component: admin_home},
    { path: '/default_home', component: default_home, name: 'default_home'}, // Add this route
    { path: '/team_report', component: team_report, name: 'team_report' },

]


export default new VueRouter({
    routes,
}) 
