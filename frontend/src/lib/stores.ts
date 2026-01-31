import { writable } from 'svelte/store';
import type { Article } from './api';

// Notification system
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  dismissible?: boolean;
  autoClose?: boolean;
  timeout?: number;
}

// Individual stores for easier component access
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const articles = writable<Article[]>([]);
export const notifications = writable<Notification[]>([]);

// Helper functions
export const setLoading = (loading: boolean) => {
  isLoading.set(loading);
};

export const setError = (errorMessage: string | null) => {
  error.set(errorMessage);
};

export const clearError = () => {
  setError(null);
};

// Notification functions
export const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const newNotification: Notification = {
    id,
    dismissible: true,
    autoClose: true,
    timeout: 5000,
    ...notification
  };
  
  notifications.update(current => [...current, newNotification]);
  
  // Auto-remove notification if autoClose is enabled
  if (newNotification.autoClose) {
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.timeout);
  }
};

export const removeNotification = (id: string) => {
  notifications.update(current => current.filter(n => n.id !== id));
};

export const clearNotifications = () => {
  notifications.set([]);
};
