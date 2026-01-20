import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type DisguiseType = 'none' | 'calculator' | 'clock';

interface DiscreetModeState {
  isDiscreetMode: boolean;
  disguiseType: DisguiseType;
  secretCode: string; // Code to exit discreet mode
}

export function useDiscreetMode() {
  const { user } = useAuth();
  const [state, setState] = useState<DiscreetModeState>({
    isDiscreetMode: false,
    disguiseType: 'none',
    secretCode: '1234' // Default secret code
  });

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('discreetMode');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse discreet mode settings');
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('discreetMode', JSON.stringify(state));
  }, [state]);

  const enableDiscreetMode = useCallback((type: DisguiseType) => {
    setState(prev => ({
      ...prev,
      isDiscreetMode: true,
      disguiseType: type
    }));
  }, []);

  const disableDiscreetMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDiscreetMode: false,
      disguiseType: 'none'
    }));
  }, []);

  const setSecretCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, secretCode: code }));
  }, []);

  const verifySecretCode = useCallback((inputCode: string): boolean => {
    return inputCode === state.secretCode;
  }, [state.secretCode]);

  const toggleDiscreetMode = useCallback((type?: DisguiseType) => {
    if (state.isDiscreetMode) {
      disableDiscreetMode();
    } else {
      enableDiscreetMode(type || 'calculator');
    }
  }, [state.isDiscreetMode, enableDiscreetMode, disableDiscreetMode]);

  return {
    isDiscreetMode: state.isDiscreetMode,
    disguiseType: state.disguiseType,
    secretCode: state.secretCode,
    enableDiscreetMode,
    disableDiscreetMode,
    setSecretCode,
    verifySecretCode,
    toggleDiscreetMode
  };
}
