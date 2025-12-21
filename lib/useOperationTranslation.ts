import { useLanguage } from '@/contexts/LanguageContext';
import { getOperationTranslation } from './monitoring';

// Hook مخصص لترجمة العمليات حسب اللغة المختارة في الموقع
export function useOperationTranslation() {
  const { language } = useLanguage();

  const translateOperation = (operation: string) => {
    return getOperationTranslation(operation, language as 'en' | 'ar');
  };

  return translateOperation;
}