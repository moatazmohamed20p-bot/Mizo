// لوحة التحكم الرئيسية
class Dashboard {
    constructor() {
        this.charts = {};
        this.stats = {};
    }

    // تحميل الإحصائيات
    async loadStats() {
        try {
            // جلب إحصائيات المشاريع
            const { data: projects, error: projectsError } = await supabaseClient
                .from('projects')
                .select('id, status');
            
            if (projectsError) throw projectsError;
            
            // جلب إحصائيات المستخدمين
            const { data: users, error: usersError } = await supabaseClient
                .from('profiles')
                .select('id, role');
            
            if (usersError) throw usersError;
            
            // جلب إحصائيات المهام
            const { data: tasks, error: tasksError } = await supabaseClient
                .from('tasks')
                .select('id, status');
            
            if (tasksError) throw tasksError;
            
            // تحديث الإحصائيات
            this.stats = {
                totalProjects: projects?.length || 0,
                activeProjects: projects?.filter(p => p.status === 'active').length || 0,
                totalUsers: users?.length || 0,
                adminUsers: users?.filter(u => u.role === 'admin').length || 0,
                totalTasks: tasks?.length || 0,
                completedTasks: tasks?.filter(t => t.status === 'completed').length || 0
            };
            
            // تحديث واجهة المستخدم
            this.updateStatsUI();
            
            return this.stats;
            
        } catch (error) {
            console.error('Error loading stats:', error);
            showNotification('فشل تحميل الإحصائيات', 'error');
            return null;
        }
    }

    // تحديث واجهة الإحصائيات
    updateStatsUI() {
        if (this.stats.totalProjects !== undefined) {
            document.getElementById('totalProjects').textContent = this.stats.totalProjects;
        }
        if (this.stats.totalUsers !== undefined) {
            document.getElementById('totalUsers').textContent = this.stats.totalUsers;
        }
        if (this.stats.completedTasks !== undefined) {
            document.getElementById('completedTasks').textContent = this.stats.completedTasks;
        }
    }

    // تهيئة الرسوم البيانية
    initCharts() {
        // رسم بياني للمشاريع
        const projectsCtx = document.getElementById('projectsChart').getContext('2d');
        this.charts.projects = new Chart(projectsCtx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'المشاريع المكتملة',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'المشاريع النشطة',
                    data: [8, 12, 10, 18, 15, 20],
                    borderColor: '#f72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                }
            }
        });

        // رسم بياني للمستخدمين
        const usersCtx = document.getElementById('usersChart').getContext('2d');
        this.charts.users = new Chart(usersCtx, {
            type: 'doughnut',
            data: {
                labels: ['المدراء', 'المستخدمون', 'الزوار'],
                datasets: [{
                    data: [5, 35, 8],
                    backgroundColor: [
                        '#4361ee',
                        '#f72585',
                        '#4cc9f0'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo'
                            },
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    // تحميل المشاريع الحديثة
    async loadRecentProjects() {
        try {
            const { data: projects, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);
            
            if (error) throw error;
            
            const container = document.getElementById('recentProjects');
            if (!container) return;
            
            if (!projects || projects.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <p>لا توجد مشاريع بعد</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = projects.map(project => `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-status ${project.status}">
                            <span>${this.getStatusText(project.status)}</span>
                        </div>
                        <div class="project-menu">
                            <button class="menu-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                    <div class="project-body">
                        <h4>${project.title}</h4>
                        <p>${project.description || 'لا يوجد وصف'}</p>
                    </div>
                    <div class="project-footer">
                        <div class="project-meta">
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${new Date(project.created_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-tasks"></i>
                                <span>${project.tasks_count || 0} مهام</span>
                            </div>
                        </div>
                        <div class="project-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                            </div>
                            <span>${project.progress || 0}%</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent projects:', error);
            showNotification('فشل تحميل المشاريع الحديثة', 'error');
        }
    }

    // تحميل النشاط الأخير
    async loadRecentActivity() {
        try {
            const { data: activity, error } = await supabaseClient
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(6);
            
            if (error) throw error;
            
            const container = document.getElementById('recentActivity');
            if (!container) return;
            
            if (!activity || activity.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>لا يوجد نشاط حديث</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = activity.map(item => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${this.getActivityIcon(item.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${item.description}</p>
                        <span class="activity-time">${this.getTimeAgo(item.created_at)}</span>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
            // إنشاء بيانات تجريبية في حالة عدم وجود جدول
            this.loadSampleActivity();
        }
    }

    // تحميل بيانات النشاط التجريبية
    loadSampleActivity() {
        const sampleActivity = [
            {
                description: 'تم إنشاء مشروع جديد "تطوير النظام"',
                type: 'project',
                created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
                description: 'مستخدم جديد مسجل: أحمد محمد',
                type: 'user',
                created_at: new Date(Date.now() - 7200000).toISOString()
            },
            {
                description: 'تم تحديث إعدادات النظام',
                type: 'settings',
                created_at: new Date(Date.now() - 10800000).toISOString()
            },
            {
                description: 'تقرير الأداء الأسبوعي جاهز',
                type: 'report',
                created_at: new Date(Date.now() - 14400000).toISOString()
            }
        ];

        const container = document.getElementById('recentActivity');
        if (!container) return;

        container.innerHTML = sampleActivity.map(item => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${this.getActivityIcon(item.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${item.description}</p>
                    <span class="activity-time">${this.getTimeAgo(item.created_at)}</span>
                </div>
            </div>
        `).join('');
    }

    // وظائف مساعدة
    getStatusText(status) {
        const statusMap = {
            'active': 'نشط',
            'completed': 'مكتمل',
            'pending': 'معلق',
            'cancelled': 'ملغي'
        };
        return statusMap[status] || status;
    }

    getActivityIcon(type) {
        const iconMap = {
            'project': 'fas fa-project-diagram',
            'user': 'fas fa-user',
            'settings': 'fas fa-cog',
            'report': 'fas fa-chart-bar',
            'task': 'fas fa-tasks',
            'file': 'fas fa-file'
        };
        return iconMap[type] || 'fas fa-history';
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        
        return date.toLocaleDateString('ar-SA');
    }

    // تحديث الرسوم البيانية
    async updateCharts() {
        if (this.charts.projects) {
            // يمكن تحديث بيانات الرسوم البيانية هنا
        }
    }
}

// تهيئة لوحة التحكم
let dashboard = null;

async function loadDashboardStats() {
    if (!dashboard) {
        dashboard = new Dashboard();
    }
    await dashboard.loadStats();
}

function initCharts() {
    if (!dashboard) {
        dashboard = new Dashboard();
    }
    dashboard.initCharts();
}

async function loadRecentProjects() {
    if (!dashboard) {
        dashboard = new Dashboard();
    }
    await dashboard.loadRecentProjects();
}

async function loadRecentActivity() {
    if (!dashboard) {
        dashboard = new Dashboard();
    }
    await dashboard.loadRecentActivity();
}

// تصدير الوظائف
window.dashboardManager = {
    loadDashboardStats,
    initCharts,
    loadRecentProjects,
    loadRecentActivity
};