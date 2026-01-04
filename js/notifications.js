/**
 * نظام الإشعارات والتنبيهات
 */

class NotificationSystem {
    constructor() {
        this.container = document.querySelector('.alerts-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'alerts-container';
            document.body.appendChild(this.container);
        }
        
        this.notificationSound = null;
        this.initSound();
    }

    // تهيئة صوت الإشعار
    initSound() {
        try {
            this.notificationSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        } catch (error) {
            console.log('Notification sound not available');
        }
    }

    // إظهار إشعار
    show(title, message, type = 'info', duration = 5000) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        
        const icon = this.getIcon(type);
        
        alert.innerHTML = `
            <i class="${icon}"></i>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
            </div>
            <button class="alert-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(alert);
        
        // تشغيل صوت الإشعار
        if (this.notificationSound) {
            this.notificationSound.play().catch(() => {});
        }
        
        // إضافة حدث الإغلاق
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            this.remove(alert);
        });
        
        // إزالة الإشعار تلقائياً بعد المدة المحددة
        if (duration > 0) {
            setTimeout(() => {
                this.remove(alert);
            }, duration);
        }
        
        // إزالة الإشعار بعد 5 ثوانٍ كحد أقصى
        setTimeout(() => {
            if (alert.parentNode) {
                this.remove(alert);
            }
        }, 5000);
        
        return alert;
    }

    // إزالة إشعار
    remove(alert) {
        alert.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }

    // إظهار إشعار نجاح
    success(message, title = 'نجاح') {
        return this.show(title, message, 'success');
    }

    // إظهار إشعار خطأ
    error(message, title = 'خطأ') {
        return this.show(title, message, 'error');
    }

    // إظهار إشعار تحذير
    warning(message, title = 'تحذير') {
        return this.show(title, message, 'warning');
    }

    // إظهار إشعار معلومات
    info(message, title = 'معلومة') {
        return this.show(title, message, 'info');
    }

    // الحصول على الأيقونة المناسبة
    getIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-bell';
    }

    // إظهار رسالة تأكيد
    confirm(message, title = 'تأكيد') {
        return new Promise((resolve) => {
            const alert = this.show(title, message, 'info', 0);
            
            const content = alert.querySelector('.alert-content');
            content.innerHTML += `
                <div class="confirm-actions">
                    <button class="btn btn-sm btn-primary confirm-yes">نعم</button>
                    <button class="btn btn-sm btn-outline confirm-no">لا</button>
                </div>
            `;
            
            const yesBtn = alert.querySelector('.confirm-yes');
            const noBtn = alert.querySelector('.confirm-no');
            
            yesBtn.addEventListener('click', () => {
                this.remove(alert);
                resolve(true);
            });
            
            noBtn.addEventListener('click', () => {
                this.remove(alert);
                resolve(false);
            });
        });
    }

    // إظهار رسالة إدخال
    prompt(message, title = 'إدخال', defaultValue = '') {
        return new Promise((resolve) => {
            const alert = this.show(title, message, 'info', 0);
            
            const content = alert.querySelector('.alert-content');
            content.innerHTML += `
                <div class="prompt-input">
                    <input type="text" class="form-control" value="${defaultValue}" placeholder="اكتب هنا...">
                </div>
                <div class="prompt-actions">
                    <button class="btn btn-sm btn-primary prompt-submit">موافق</button>
                    <button class="btn btn-sm btn-outline prompt-cancel">إلغاء</button>
                </div>
            `;
            
            const input = alert.querySelector('input');
            const submitBtn = alert.querySelector('.prompt-submit');
            const cancelBtn = alert.querySelector('.prompt-cancel');
            
            input.focus();
            
            const submit = () => {
                const value = input.value.trim();
                this.remove(alert);
                resolve(value);
            };
            
            const cancel = () => {
                this.remove(alert);
                resolve(null);
            };
            
            submitBtn.addEventListener('click', submit);
            cancelBtn.addEventListener('click', cancel);
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') cancel();
            });
        });
    }

    // مسح جميع الإشعارات
    clearAll() {
        this.container.innerHTML = '';
    }

    // إظهار إشعار تقدم
    showProgress(title, message = '') {
        const alert = document.createElement('div');
        alert.className = 'alert alert-info';
        
        alert.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                ${message ? `<div class="alert-message">${message}</div>` : ''}
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        this.container.appendChild(alert);
        
        return {
            update: (progress, newMessage = null) => {
                const fill = alert.querySelector('.progress-fill');
                if (fill) {
                    fill.style.width = `${progress}%`;
                }
                if (newMessage) {
                    const messageEl = alert.querySelector('.alert-message');
                    if (messageEl) {
                        messageEl.textContent = newMessage;
                    }
                }
            },
            remove: () => {
                this.remove(alert);
            }
        };
    }

    // إشعارات نظامية
    showSystemNotification(title, message) {
        // التحقق من دعم إشعارات المتصفح
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: '/assets/logo.png'
            });
        }
        
        // إظهار إشعار في الواجهة
        return this.show(title, message, 'info');
    }

    // طلب إذن إشعارات المتصفح
    async requestNotificationPermission() {
        if (!("Notification" in window)) {
            return 'unsupported';
        }
        
        if (Notification.permission === "granted") {
            return 'granted';
        }
        
        if (Notification.permission === "denied") {
            return 'denied';
        }
        
        const permission = await Notification.requestPermission();
        return permission;
    }
}

// إنشاء نسخة من نظام الإشعارات
const notificationSystem = new NotificationSystem();

// دالة مختصرة للاستخدام
function showNotification(message, type = 'info', title = null) {
    if (!title) {
        switch (type) {
            case 'success': title = 'نجاح'; break;
            case 'error': title = 'خطأ'; break;
            case 'warning': title = 'تحذير'; break;
            case 'info': title = 'معلومة'; break;
            default: title = 'إشعار';
        }
    }
    return notificationSystem.show(title, message, type);
}

// تصدير الوظائف
window.notifications = notificationSystem;
window.showNotification = showNotification;
