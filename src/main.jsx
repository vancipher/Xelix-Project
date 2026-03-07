import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserAuthProvider } from './contexts/UserAuthContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { GroupProvider } from './contexts/GroupContext';
import { ResourcesProvider } from './contexts/ResourcesContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <UserAuthProvider>
              <ScheduleProvider>
                <GroupProvider>
                  <ResourcesProvider>
                    <App />
                  </ResourcesProvider>
                </GroupProvider>
              </ScheduleProvider>
            </UserAuthProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
