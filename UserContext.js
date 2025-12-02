import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenValid, checkAndRefreshToken } from './authUtils';

export const UserContext = createContext();


// دالة لجلب عنوان الـ IP العام
const fetchPublicIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);

  // دالة logout
  const logout = async () => {
    try {
      console.log('[AUTH] Logging out user...');
      setUserState(null);
      
      const ip = await fetchPublicIP();
      if (ip) {
        await AsyncStorage.removeItem(`user_${ip}`);
      }
      await AsyncStorage.removeItem('user_data');
      
      console.log('[AUTH] User logged out successfully');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    }
  };

  // حفظ بيانات المستخدم حسب الـ IP
  const saveUserForIP = async (userObj) => {
    try {
      // تحديث الـ state أولاً (مهم جداً!)
      setUserState(userObj);
      console.log('[USER CONTEXT] 💾 Saving user:', {
        email: userObj.email,
        role: userObj.role,
        hasToken: !!userObj.token,
        tokenLength: userObj.token?.length
      });
      
      const ip = await fetchPublicIP();
      if (ip) {
        await AsyncStorage.setItem(`user_${ip}`, JSON.stringify(userObj));
        console.log('[USER CONTEXT] ✅ User saved to AsyncStorage for IP:', ip);
      } else {
        // حتى لو فشل حفظ IP، احفظ بمفتاح عام
        await AsyncStorage.setItem('user_data', JSON.stringify(userObj));
        console.log('[USER CONTEXT] ✅ User saved to AsyncStorage (no IP)');
      }
    } catch (error) {
      console.error('[USER CONTEXT] ❌ Error saving user:', error);
      // تحديث الـ state على أي حال
      setUserState(userObj);
    }
  };

  // استرجاع بيانات المستخدم حسب الـ IP
  const loadUserForIP = async () => {
    try {
      console.log('[USER CONTEXT] 📂 Loading user data...');
      const ip = await fetchPublicIP();
      let data = null;
      
      if (ip) {
        data = await AsyncStorage.getItem(`user_${ip}`);
        console.log('[USER CONTEXT] 🔍 Checking IP storage:', ip, data ? 'Found' : 'Not found');
      }
      
      // إذا لم يوجد بيانات بالـ IP، جرب المفتاح العام
      if (!data) {
        data = await AsyncStorage.getItem('user_data');
        console.log('[USER CONTEXT] 🔍 Checking general storage:', data ? 'Found' : 'Not found');
      }
      
      if (data) {
        const userData = JSON.parse(data);
        setUserState(userData);
        console.log('[USER CONTEXT] ✅ User loaded:', {
          email: userData.email,
          role: userData.role,
          hasToken: !!userData.token
        });
      } else {
        console.log('[USER CONTEXT] ⚠️ No user data found');
      }
    } catch (error) {
      console.error('[USER CONTEXT] ❌ Error loading user:', error);
    }
  };

  // عند بدء التطبيق، حاول استرجاع المستخدم
  useEffect(() => {
    loadUserForIP();
  }, []);

  // التحقق من صلاحية التوكن كل دقيقة
  useEffect(() => {
    if (!user?.token) return;

    const checkToken = async () => {
      try {
        const updatedToken = await checkAndRefreshToken(
          user.token,
          // عند تحديث التوكن
          async (newToken) => {
            console.log('[AUTH] Token refreshed, updating user...');
            await saveUserForIP({ ...user, token: newToken });
          },
          // عند انتهاء صلاحية التوكن
          () => {
            console.log('[AUTH] Token expired, logging out...');
            logout();
          }
        );
      } catch (error) {
        console.error('[AUTH] Error checking token:', error);
      }
    };

    // فحص فوري
    checkToken();

    // فحص كل دقيقة
    const interval = setInterval(checkToken, 60000);

    return () => clearInterval(interval);
  }, [user?.email]); // نستخدم email بدلاً من token لتجنب infinite loop

  // setUser المعدلة: تحفظ وتحدث (مع دعم async)
  const setUser = async (userObj) => {
    await saveUserForIP(userObj);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loadUserForIP }}>
      {children}
    </UserContext.Provider>
  );
};
