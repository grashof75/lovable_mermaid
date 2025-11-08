import { useState, useCallback } from 'react';

export interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
}

export const usePreviewControls = () => {
  const [currentView, setCurrentView] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 }
  });

  const handleViewChange = useCallback((zoom: number, pan: { x: number; y: number }) => {
    setCurrentView({ zoom, pan });
  }, []);

  const setView = useCallback((zoom: number, pan: { x: number; y: number }) => {
    setCurrentView({ zoom, pan });
  }, []);

  return {
    currentView,
    handleViewChange,
    setView
  };
};