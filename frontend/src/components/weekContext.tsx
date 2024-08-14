import React, { createContext, useContext, useState, ReactNode, FunctionComponent } from 'react';

interface WeekContextType {
  startOfWeek: string;
  setStartOfWeek: (day: string) => void;
}

const WeekContext = createContext<WeekContextType | undefined>(undefined);

export const WeekProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [startOfWeek, setStartOfWeek] = useState<string>('Sunday');

  return (
    <WeekContext.Provider value={{ startOfWeek, setStartOfWeek }}>
      {children}
    </WeekContext.Provider>
  );
};

export const useWeekContext = () => {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error('useWeekContext must be used within a WeekProvider');
  }
  return context;
};
