import type { FavoriteStation, Fillup, KmLog, KmSettings, MaintenanceLog, Reminder } from './index'

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      fillups: Table<Fillup, Omit<Fillup, 'id' | 'total'>>
      km_logs: Table<KmLog, Omit<KmLog, 'id'>>
      settings: Table<KmSettings & { user_id: string }, KmSettings & { user_id: string }>
      maintenance_logs: Table<MaintenanceLog, Omit<MaintenanceLog, 'id'>>
      favorite_stations: Table<FavoriteStation, Omit<FavoriteStation, 'id'>, Partial<FavoriteStation>>
      reminders: Table<Reminder, Pick<Reminder, 'title' | 'due_date' | 'due_odometer'>, Partial<Reminder>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
