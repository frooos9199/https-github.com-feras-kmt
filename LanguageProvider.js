import React, { useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import I18n from './i18n';

export default function LanguageProvider({ children }) {
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (user && user.language && I18n.locale !== user.language) {
      I18n.locale = user.language;
    }
  }, [user]);
  return children;
}
