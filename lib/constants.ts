/**
 * @file Global Constants
 * @description Proje genelinde kullanılan sabitler
 * @ai-context Yeni sabit eklerken bu dosyayı kullan
 */

// ============================================
// App Config
// ============================================

export const APP_CONFIG = {
  name: 'My App',
  description: 'Created with v0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
} as const

// ============================================
// API Config
// ============================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retries: 3,
} as const

// ============================================
// Pagination Defaults
// ============================================

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
} as const

// ============================================
// Date/Time Formats
// ============================================

export const DATE_FORMATS = {
  display: 'dd MMM yyyy',
  displayWithTime: 'dd MMM yyyy HH:mm',
  api: 'yyyy-MM-dd',
  apiWithTime: "yyyy-MM-dd'T'HH:mm:ss'Z'",
} as const

// ============================================
// UI Constants
// ============================================

export const UI = {
  // Breakpoints (match Tailwind)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Animation durations (ms)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    toast: 500,
  },
} as const

// ============================================
// Routes
// ============================================

export const ROUTES = {
  home: '/',
  // Auth
  login: '/login',
  register: '/register',
  // Dashboard
  dashboard: '/dashboard',
  // Add more routes as needed
} as const

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  network: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
  unauthorized: 'Bu işlem için giriş yapmanız gerekiyor.',
  forbidden: 'Bu işlem için yetkiniz bulunmuyor.',
  notFound: 'Aradığınız sayfa bulunamadı.',
  validation: 'Lütfen formu doğru şekilde doldurun.',
} as const

// ============================================
// Validation
// ============================================

export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Geçerli bir email adresi girin',
  },
  password: {
    minLength: 8,
    message: 'Şifre en az 8 karakter olmalı',
  },
  name: {
    minLength: 2,
    maxLength: 50,
    message: 'İsim 2-50 karakter arası olmalı',
  },
} as const
