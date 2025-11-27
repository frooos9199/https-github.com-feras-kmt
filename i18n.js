import I18n from 'i18n-js';
import ar from './locales/ar.json';
import en from './locales/en.json';

I18n.translations = { ar, en };
I18n.fallbacks = true;
I18n.locale = 'en'; // اللغة الافتراضية الآن إنجليزي

export default I18n;
