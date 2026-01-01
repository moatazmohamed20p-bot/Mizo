/**
 * نظام المصادقة والمستخدمين
 */

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// التحقق من قوة كلمة المرور
function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength < 2) return 'weak';
  if (strength < 4) return 'medium';
  return 'strong';
}

// التحقق من المصادقة
async function requireAuth(admin = false) {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) throw error;
    
    if (!user) {
      window.location.href = "login.html";
      return null;
    }
    
    if (admin) {
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profile.role !== "admin") {
        window.location.href = "dashboard.html";
        return null;
      }
    }
    
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    window.location.href = "login.html";
    return null;
  }
}

// تحديث ملف تعريف المستخدم
async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تسجيل الدخول بالبريد وكلمة المرور
async function loginWithEmail(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تسجيل حساب جديد
async function signUp(email, password, userData) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    
    // إنشاء ملف تعريف للمستخدم
    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name || '',
          role: 'user',
          created_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تسجيل الخروج
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) throw error;
    
    window.location.href = "login.html";
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// استعادة كلمة المرور
async function resetPassword(email) {
  try {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`,
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تحديث كلمة المرور
async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تحديث بيانات المستخدم
async function updateUser(updates) {
  try {
    const { data, error } = await supabaseClient.auth.updateUser(updates);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// الحصول على جلسة المستخدم
async function getSession() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) throw error;
    
    return { success: true, session };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// مراقبة حالة المصادقة
function watchAuthState(callback) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// تصدير الوظائف
window.auth = {
  requireAuth,
  loginWithEmail,
  signUp,
  logout,
  resetPassword,
  updatePassword,
  updateUser,
  getSession,
  watchAuthState,
  validateEmail,
  checkPasswordStrength,
  updateProfile
};