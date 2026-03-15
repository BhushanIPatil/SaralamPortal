export interface PlatformStats {
  services_count?: number
  cities_count?: number
  connections_count?: number
  providers_count?: number
  seekers_count?: number
  jobs_count?: number
  app_launched_date?: string
  [key: string]: unknown
}

export interface PlatformInfo {
  app_launched_date: string
  [key: string]: unknown
}
