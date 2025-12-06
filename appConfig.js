/**
 * App Configuration & Constants
 * إعدادات التطبيق الثابتة لضمان توحيد التصميم على جميع الأجهزة
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

// الأبعاد الأساسية للتصميم (iPhone 17 كمرجع)
const DESIGN_WIDTH = 430; // iPhone 17 width
const DESIGN_HEIGHT = 932; // iPhone 17 height

// الحصول على أبعاد الشاشة الحالية
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// حساب نسب التحجيم
const widthScale = SCREEN_WIDTH / DESIGN_WIDTH;
const heightScale = SCREEN_HEIGHT / DESIGN_HEIGHT;

/**
 * تحجيم حجم الخط بناءً على عرض الشاشة
 * @param {number} size - حجم الخط المرجعي
 * @returns {number} - حجم الخط المُحجّم
 */
export const scaleFont = (size) => {
  return Math.round(size * widthScale);
};

/**
 * تحجيم العرض بناءً على عرض الشاشة
 * @param {number} size - العرض المرجعي
 * @returns {number} - العرض المُحجّم
 */
export const scaleWidth = (size) => {
  return Math.round(size * widthScale);
};

/**
 * تحجيم الارتفاع بناءً على ارتفاع الشاشة
 * @param {number} size - الارتفاع المرجعي
 * @returns {number} - الارتفاع المُحجّم
 */
export const scaleHeight = (size) => {
  return Math.round(size * heightScale);
};

/**
 * تحجيم متوسط (يستخدم للعناصر المربعة مثل الأيقونات)
 * @param {number} size - الحجم المرجعي
 * @returns {number} - الحجم المُحجّم
 */
export const scaleModerate = (size, factor = 0.5) => {
  return Math.round(size + (widthScale - 1) * size * factor);
};

// الألوان الرئيسية للتطبيق
export const COLORS = {
  // الألوان الأساسية
  primary: '#b71c1c', // أحمر KMT
  secondary: '#dc2626',
  black: '#000',
  white: '#fff',
  
  // الألوان الداكنة
  dark: '#191919',
  darkGray: '#222',
  
  // الألوان الفاتحة
  lightGray: '#ccc',
  offWhite: 'rgba(255, 255, 255, 0.7)',
  
  // ألوان الحالة
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#3b82f6',
  
  // ألوان الأكسنت
  gold: '#fbbf24',
  
  // ألوان الخلفية
  gradientStart: '#000',
  gradientEnd: '#b71c1c',
  cardBg: 'rgba(0, 0, 0, 0.7)',
  overlayBg: 'rgba(0, 0, 0, 0.5)',
  
  // ألوان الشفافية
  whiteTransparent10: 'rgba(255, 255, 255, 0.1)',
  whiteTransparent15: 'rgba(255, 255, 255, 0.15)',
  whiteTransparent18: 'rgba(255, 255, 255, 0.18)',
  blackTransparent: 'rgba(0, 0, 0, 0.7)',
  goldTransparent: 'rgba(251, 191, 36, 0.15)',
};

// أحجام الخطوط الموحدة
export const FONT_SIZES = {
  tiny: scaleFont(11),
  small: scaleFont(13),
  regular: scaleFont(14),
  medium: scaleFont(15),
  large: scaleFont(16),
  xlarge: scaleFont(18),
  xxlarge: scaleFont(20),
  huge: scaleFont(24),
  massive: scaleFont(28),
  giant: scaleFont(32),
};

// المسافات الموحدة
export const SPACING = {
  tiny: scaleWidth(4),
  small: scaleWidth(8),
  medium: scaleWidth(12),
  large: scaleWidth(16),
  xlarge: scaleWidth(20),
  xxlarge: scaleWidth(24),
  huge: scaleWidth(32),
};

// أحجام الأيقونات
export const ICON_SIZES = {
  tiny: scaleModerate(16),
  small: scaleModerate(20),
  regular: scaleModerate(24),
  medium: scaleModerate(28),
  large: scaleModerate(32),
  xlarge: scaleModerate(40),
};

// Border Radius
export const BORDER_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  rounded: 20,
  circle: 50, // للأشكال الدائرية الكاملة
};

// الظلال (Shadows)
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};

// معلومات الجهاز
export const DEVICE_INFO = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  pixelRatio: PixelRatio.get(),
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
};

// تصدير الثوابت
export default {
  COLORS,
  FONT_SIZES,
  SPACING,
  ICON_SIZES,
  BORDER_RADIUS,
  SHADOWS,
  DEVICE_INFO,
  scaleFont,
  scaleWidth,
  scaleHeight,
  scaleModerate,
};
