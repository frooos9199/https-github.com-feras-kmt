import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // حفظ بيانات المستخدم حسب الـ IP
  const saveUserForIP = async (userObj) => {
    try {
      // تحديث الـ state أولاً (مهم جداً!)
      setUserState(userObj);
      console.log('User state updated:', userObj.email, userObj.role);
      
      const ip = await fetchPublicIP();
      if (ip) {
        await AsyncStorage.setItem(`user_${ip}`, JSON.stringify(userObj));
        console.log('User saved to AsyncStorage for IP:', ip);
      } else {
        // حتى لو فشل حفظ IP، احفظ بمفتاح عام
        await AsyncStorage.setItem('user_data', JSON.stringify(userObj));
        console.log('User saved to AsyncStorage (no IP)');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      // تحديث الـ state على أي حال
      setUserState(userObj);
    }
  };

  // استرجاع بيانات المستخدم حسب الـ IP
  const loadUserForIP = async () => {
    try {
      const ip = await fetchPublicIP();
      let data = null;
      
      if (ip) {
        data = await AsyncStorage.getItem(`user_${ip}`);
        console.log('Loading user for IP:', ip);
      }
      
      // إذا لم يوجد بيانات بالـ IP، جرب المفتاح العام
      if (!data) {
        data = await AsyncStorage.getItem('user_data');
        console.log('Loading user from general storage');
      }
      
      if (data) {
        const userData = JSON.parse(data);
        setUserState(userData);
        console.log('User loaded:', userData.email, userData.role);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // عند بدء التطبيق، حاول استرجاع المستخدم
  useEffect(() => {
    loadUserForIP();
  }, []);

  // setUser المعدلة: تحفظ وتحدث (مع دعم async)
  const setUser = async (userObj) => {
    await saveUserForIP(userObj);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loadUserForIP }}>
      {children}
    </UserContext.Provider>
  );
};
