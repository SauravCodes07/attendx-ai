export type ThemePreference = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: string
  avatar_url: string | null
  phone: string | null
  bio: string | null
  dark_mode: boolean
  theme_preference: ThemePreference
  usn?: string | null
  roll_number?: string | null
  branch?: string | null
  department?: string | null
  year?: string | null
  semester?: string | null
  section?: string | null
  dob?: string | null
  mobile?: string | null
  gender?: string | null
  address?: string | null
  emergency_contact?: string | null
  personal_email?: string | null
  college_email?: string | null
  profile_photo_url?: string | null
  attendance_percentage?: number | null
  current_streak?: number | null
  account_status?: string | null
  email_verified?: boolean | null
  last_login?: string | null
  joined_at?: string | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  profile_id: string
  student_code: string
  department: string | null
  semester: string | null
  created_at: string
}

export interface Teacher {
  id: string
  profile_id: string
  employee_code: string
  department: string | null
  created_at: string
}

export interface Admin {
  id: string
  profile_id: string
  admin_code: string
  created_at: string
}

export interface Subject {
  id: string
  profile_id: string
  name: string
  code: string
  color: string
  created_at: string
}

export interface Classroom {
  id: string
  profile_id: string
  name: string
  building: string | null
  capacity: number | null
  created_at: string
}

export interface AttendanceRecord {
  id: string
  profile_id: string
  subject_name: string
  subject_code: string
  classroom_name: string | null
  attendance_date: string
  status: 'present' | 'absent' | 'leave'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TimetableItem {
  id: string
  profile_id: string
  title: string
  subject_name: string
  room: string | null
  teacher_name: string | null
  day_of_week: string
  class_time: string
  start_time: string
  end_time: string
  created_at: string
}

export interface NotificationItem {
  id: string
  profile_id: string
  title: string
  message: string
  kind: string
  unread: boolean
  created_at: string
}

export interface AnalyticsItem {
  id: string
  profile_id: string
  period: string
  value: number
  label: string
  created_at: string
}

export interface SettingItem {
  id: string
  profile_id: string
  key: string
  value: string
  created_at: string
  updated_at: string
}
