// Database types
export interface LovePage {
  id: string
  pageName: string
  pageTitle: string
  startDate: Date | null
  loveText: string
  youtubeUrl: string | null
  photos: Photo[]
  createdAt: Date
  updatedAt: Date
}

export interface Memory {
  id: string
  slug: string
  title: string
  love_letter_content: string
  relationship_start_date: string
  photos_urls: string[] | null
  youtube_music_url: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'abandoned'
  preference_id: string | null
  payment_id: string | null
  created_at: string
  updated_at: string
}

export interface Photo {
  preview: string
  caption?: string
  public_id?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CreatePageResponse extends ApiResponse<LovePage> {}

export interface GetPageResponse extends ApiResponse<LovePage> {}

export interface UploadResponse extends ApiResponse<{
  url: string
  public_id: string
}> {}

export interface PaymentResponse extends ApiResponse<{
  init_point: string
  preference_id: string
}> {}

// Form data types
export interface BuilderData {
  pageName: string
  pageTitle: string
  startDate: Date | null
  photos: Array<{
    file?: File
    preview: string
    caption: string
    public_id?: string
  }>
  loveText: string
  youtubeUrl: string
}

export interface PaymentData {
  pageData: BuilderData
  customerEmail: string
  customerName: string
}

// Component props types
export interface FormSectionProps {
  builderData: BuilderData
  setBuilderData: (data: BuilderData) => void
}

export interface PreviewSectionProps {
  builderData: BuilderData
}

export interface RomanticPreviewProps {
  builderData: BuilderData
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Environment types
export interface EnvironmentConfig {
  databaseUrl: string
  nextAuthSecret: string
  nextAuthUrl: string
  cloudinaryCloudName?: string
  cloudinaryApiKey?: string
  cloudinaryApiSecret?: string
  mercadoPagoAccessToken?: string
  baseUrl: string
}

// Performance monitoring types
export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  errorCount: number
  userInteractions: number
}

// Cache types
export interface CacheEntry<T> {
  data: T
  expiry: number
  createdAt: number
}

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
}