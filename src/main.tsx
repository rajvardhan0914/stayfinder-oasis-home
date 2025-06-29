import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { AuthProvider } from './lib/auth';
import { FavoritesProvider } from './lib/favorites';
import { SettingsProvider } from './lib/SettingsProvider';
import { ThemeProvider } from "next-themes";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback="loading...">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  </React.StrictMode>
);
