// تهيئة Supabase
const SUPABASE_URL = 'https://wxhhldltoqlbykvpnaxz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VD3e9Kzt3dOr8iFzY7PmZQ_6OkMCs1J';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// إعدادات التطبيق
const APP_CONFIG = {
  appName: 'Mizo Admin System',
  version: '1.0.0',
  theme: 'light',
  languages: ['ar', 'en'],
  defaultLanguage: 'ar'
};

// تصدير المتغيرات
window.supabaseClient = supabase;
window.appConfig = APP_CONFIG;