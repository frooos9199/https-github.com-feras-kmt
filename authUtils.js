// authUtils.js - دوال مساعدة للمصادقة والتحقق من التوكن

/**
 * Base64 URL decode للاستخدام في React Native
 */
const base64UrlDecode = (str) => {
  // تحويل Base64URL إلى Base64 عادي
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // إضافة padding إذا لزم الأمر
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64url string');
    }
    base64 += new Array(5 - pad).join('=');
  }
  
  // فك التشفير باستخدام atob (متوفر في React Native)
  try {
    const decoded = atob(base64);
    return decodeURIComponent(escape(decoded));
  } catch (e) {
    console.error('Base64 decode error:', e);
    return null;
  }
};

/**
 * فك تشفير JWT token بدون مكتبات خارجية
 */
export const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // فك تشفير الـ payload (الجزء الثاني)
    const payload = parts[1];
    const decodedStr = base64UrlDecode(payload);
    
    if (!decodedStr) {
      return null;
    }
    
    const decoded = JSON.parse(decodedStr);
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * التحقق من صلاحية التوكن
 * @returns {boolean} true إذا كان التوكن صالح
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return false;
  
  // التوكن منتهي إذا كان exp أقل من الوقت الحالي
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp > now;
};

/**
 * الحصول على الوقت المتبقي حتى انتهاء التوكن (بالثواني)
 */
export const getTokenExpiryTime = (token) => {
  if (!token) return 0;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
};

/**
 * التحقق من قرب انتهاء التوكن
 * @param {string} token - JWT token
 * @param {number} thresholdMinutes - عدد الدقائق قبل الانتهاء (الافتراضي 5 دقائق)
 * @returns {boolean} true إذا كان التوكن قريب من الانتهاء
 */
export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  const timeLeft = getTokenExpiryTime(token);
  return timeLeft > 0 && timeLeft < (thresholdMinutes * 60);
};

/**
 * محاولة تحديث التوكن من السيرفر
 */
export const refreshToken = async (currentToken) => {
  try {
    console.log('[AUTH] Attempting to refresh token...');
    
    const response = await fetch('https://www.kmtsys.com/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
    });
    
    if (!response.ok) {
      console.error('[AUTH] Token refresh failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('[AUTH] Token refreshed successfully');
    
    return data.accessToken || data.token;
  } catch (error) {
    console.error('[AUTH] Token refresh error:', error);
    return null;
  }
};

/**
 * دالة للتحقق التلقائي من التوكن وتحديثه
 */
export const checkAndRefreshToken = async (token, onTokenRefreshed, onTokenExpired) => {
  if (!isTokenValid(token)) {
    console.log('[AUTH] Token is invalid or expired');
    if (onTokenExpired) onTokenExpired();
    return null;
  }
  
  if (isTokenExpiringSoon(token, 10)) { // تحديث قبل 10 دقائق من الانتهاء
    console.log('[AUTH] Token expiring soon, refreshing...');
    const newToken = await refreshToken(token);
    
    if (newToken) {
      if (onTokenRefreshed) onTokenRefreshed(newToken);
      return newToken;
    } else {
      console.log('[AUTH] Failed to refresh token');
      if (onTokenExpired) onTokenExpired();
      return null;
    }
  }
  
  return token; // التوكن مازال صالح
};
