import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotesProvider } from './contexts/NotesContext';
import { KanbanProvider } from './contexts/KanbanContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import Kanban from './pages/Kanban';
import Calculators from './pages/Calculators';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotesProvider>
          <KanbanProvider>
            <AnalyticsProvider>
              <Router>
                <div className="min-h-screen bg-background text-foreground">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/notes/:id" element={<NoteEditor />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/calculators" element={<Calculators />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </AnalyticsProvider>
          </KanbanProvider>
        </NotesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
