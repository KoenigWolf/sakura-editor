'use client';

import { create } from 'zustand';

interface AnnouncerState {
  message: string;
  politeness: 'polite' | 'assertive';
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  clear: () => void;
}

export const useAnnouncerStore = create<AnnouncerState>((set) => ({
  message: '',
  politeness: 'polite',

  announce: (message, politeness = 'polite') => {
    set({ message: '', politeness });
    setTimeout(() => {
      set({ message, politeness });
    }, 50);
  },

  clear: () => {
    set({ message: '' });
  },
}));
