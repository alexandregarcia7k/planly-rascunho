import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AnalyticsData {
  date: string;
  notesCreated: number;
  tasksCompleted: number;
  tasksCreated: number;
  productivity: number;
}

export interface AnalyticsSettings {
  showNotes: boolean;
  showTasks: boolean;
  showProductivity: boolean;
  dateRange: 'week' | 'month' | 'year';
}

interface AnalyticsContextProps {
  data: AnalyticsData[];
  settings: AnalyticsSettings;
  updateSettings: (settings: Partial<AnalyticsSettings>) => void;
  addDataPoint: (point: Partial<AnalyticsData>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AnalyticsData[]>(() => {
    const saved = localStorage.getItem('planly-analytics');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AnalyticsSettings>(() => {
    const saved = localStorage.getItem('planly-analytics-settings');
    return saved ? JSON.parse(saved) : {
      showNotes: true,
      showTasks: true,
      showProductivity: true,
      dateRange: 'week'
    };
  });

  useEffect(() => {
    localStorage.setItem('planly-analytics', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('planly-analytics-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AnalyticsSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addDataPoint = (point: Partial<AnalyticsData>) => {
    const today = new Date().toISOString().split('T')[0];
    setData(prev => {
      const existingIndex = prev.findIndex(item => item.date === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...point };
        return updated;
      } else {
        return [...prev, {
          date: today,
          notesCreated: 0,
          tasksCompleted: 0,
          tasksCreated: 0,
          productivity: 0,
          ...point
        }];
      }
    });
  };

  return (
    <AnalyticsContext.Provider value={{
      data,
      settings,
      updateSettings,
      addDataPoint
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics deve ser usado dentro do AnalyticsProvider');
  }
  return context;
}
