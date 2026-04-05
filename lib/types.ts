/**
 * @file Global Type Definitions
 * @description Proje genelinde kullanılan type tanımları
 * @ai-context Yeni type eklerken bu dosyayı kullan
 */

// ============================================
// Common Types
// ============================================

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// Entity Types
// ============================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * User entity
 * @ai-context Authentication ve user management için
 */
export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: UserRole
}

export type UserRole = 'admin' | 'user' | 'guest'

// ============================================
// Component Props Types
// ============================================

/**
 * Common props for components with children
 */
export interface WithChildren {
  children: React.ReactNode
}

/**
 * Common props for components with className
 */
export interface WithClassName {
  className?: string
}

/**
 * Combined common props
 */
export interface CommonProps extends WithChildren, WithClassName {}

// ============================================
// Form Types
// ============================================

/**
 * Form field state
 */
export interface FieldState {
  value: string
  error?: string
  touched: boolean
}

/**
 * Form submission state
 */
export interface FormState {
  isSubmitting: boolean
  isValid: boolean
  errors: Record<string, string>
}

// ============================================
// UI State Types
// ============================================

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Modal/Dialog state
 */
export interface ModalState {
  isOpen: boolean
  data?: unknown
}

// ============================================
// Utility Types
// ============================================

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

/**
 * Make specified properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never
