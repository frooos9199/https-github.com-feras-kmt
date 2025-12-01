// ملف تكوين API مركزي لجميع مسارات التطبيق
// يحتوي على جميع المسارات والدوال المساعدة للتواصل مع الـ Backend

// ⚠️ للتطوير: استخدم localhost
// 🌐 للإنتاج: استخدم kmtsys.com
// const API_BASE_URL = __DEV__ 
//   ? 'http://localhost:3000/api'  // Development - Backend المحلي
//   : 'https://www.kmtsys.com/api'; // Production

// استخدام Production دائماً للتطوير والتجربة
const API_BASE_URL = 'https://www.kmtsys.com/api';

console.log('[API CONFIG] Using API_BASE_URL:', API_BASE_URL);

// دوال مساعدة لإنشاء الهيدرز
export const createAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// مسارات API حسب نوع المستخدم
export const API_ENDPOINTS = {
  // مسارات المصادقة (للجميع)
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
  },
  
  // مسارات الأدمن فقط
  ADMIN: {
    EVENTS: `${API_BASE_URL}/admin/events`,
    STATS: `${API_BASE_URL}/admin/stats`,
    MARSHALS: `${API_BASE_URL}/admin/marshals`,
    REPORTS: `${API_BASE_URL}/admin/reports`,
    BROADCAST: `${API_BASE_URL}/admin/broadcast`,
  },
  
  // مسارات المارشال/المستخدم
  DASHBOARD: {
    EVENTS: `${API_BASE_URL}/dashboard/events`,
    STATS: `${API_BASE_URL}/dashboard/stats`,
  },
  
  // مسارات المستخدم العادي
  USER: {
    EVENTS: `${API_BASE_URL}/user/events`,
    PROFILE: `${API_BASE_URL}/profile`,
  },
  
  // مسارات الحضور (للجميع بعد تسجيل الدخول)
  ATTENDANCE: {
    REGISTER: `${API_BASE_URL}/attendance/register`,
    MY_ATTENDANCE: `${API_BASE_URL}/attendance/my-attendance`,
    CANCEL: `${API_BASE_URL}/attendance/cancel`,
  },
  
  // مسارات عامة
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  MOBILE_CONFIG: `${API_BASE_URL}/mobile/config`,
};

// دالة للحصول على مسار الأحداث حسب دور المستخدم
export const getEventsEndpoint = (userRole) => {
  if (userRole === 'admin') {
    return API_ENDPOINTS.ADMIN.EVENTS;
  } else if (userRole === 'marshal') {
    return API_ENDPOINTS.DASHBOARD.EVENTS;
  } else {
    return API_ENDPOINTS.USER.EVENTS;
  }
};

// دالة للحصول على مسار الإحصائيات حسب دور المستخدم
export const getStatsEndpoint = (userRole) => {
  if (userRole === 'admin') {
    return API_ENDPOINTS.ADMIN.STATS;
  } else {
    return API_ENDPOINTS.DASHBOARD.STATS;
  }
};

// دالة لعمل طلب GET مع المصادقة
export const apiGet = async (url, token) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(token),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API GET Error:', error);
    return { success: false, error: error.message };
  }
};

// دالة لعمل طلب POST مع المصادقة
export const apiPost = async (url, token, body) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API POST Error:', error);
    return { success: false, error: error.message };
  }
};

// دالة لعمل طلب DELETE مع المصادقة
export const apiDelete = async (url, token) => {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createAuthHeaders(token),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Delete failed');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API DELETE Error:', error);
    return { success: false, error: error.message };
  }
};

// دالة لعمل طلب PUT مع المصادقة
export const apiPut = async (url, token, body) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: createAuthHeaders(token),
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Update failed');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API PUT Error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  API_ENDPOINTS,
  createAuthHeaders,
  getEventsEndpoint,
  getStatsEndpoint,
  apiGet,
  apiPost,
  apiDelete,
  apiPut,
};
