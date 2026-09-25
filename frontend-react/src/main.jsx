import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { useThemeStore } from './stores/themeStore';
import { useLanguageStore } from './stores/languageStore';

// Initialize stores wrapper component
function InitializeStores({ children }) {
  const initTheme = useThemeStore((state) => state.init);
  const initLanguage = useLanguageStore((state) => state.init);
  
  useEffect(() => {
    // Initialize theme and language on app start
    const cleanupTheme = initTheme();
    initLanguage();
    
    return () => {
      if (cleanupTheme) cleanupTheme();
    };
  }, [initTheme, initLanguage]);
  
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <InitializeStores>
      <App />
    </InitializeStores>
  </StrictMode>
);
