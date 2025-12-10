// سكريبت لمسح AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    return false;
  }
};
