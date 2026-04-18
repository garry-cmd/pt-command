export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_lifts: {
        Row: {
          id: string
          user_id: string
          exercise: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          one_rm: number
          training_max: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          one_rm: number
          training_max: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise?: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          one_rm?: number
          training_max?: number
          updated_at?: string
          created_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          user_id: string
          name: string
          workout_type: 'heavy' | 'medium' | 'light'
          is_default: boolean
          exercises: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          workout_type: 'heavy' | 'medium' | 'light'
          is_default?: boolean
          exercises: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          workout_type?: 'heavy' | 'medium' | 'light'
          is_default?: boolean
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          program_id: string | null
          workout_type: 'heavy' | 'medium' | 'light'
          week_number: number
          date: string
          started_at: string | null
          completed_at: string | null
          duration_seconds: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_id?: string | null
          workout_type: 'heavy' | 'medium' | 'light'
          week_number: number
          date?: string
          started_at?: string | null
          completed_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string | null
          workout_type?: 'heavy' | 'medium' | 'light'
          week_number?: number
          date?: string
          started_at?: string | null
          completed_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          workout_id: string
          exercise: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          set_number: number
          prescribed_weight: number
          prescribed_reps: number
          actual_weight: number | null
          actual_reps: number | null
          completed: boolean
          completed_at: string | null
          rest_time_seconds: number | null
          notes: string | null
          kb_protocol: 'for_time' | 'timed_rest' | 'emom' | null
          kb_total_reps: number | null
          kb_time_seconds: number | null
        }
        Insert: {
          id?: string
          workout_id: string
          exercise: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          set_number: number
          prescribed_weight: number
          prescribed_reps: number
          actual_weight?: number | null
          actual_reps?: number | null
          completed?: boolean
          completed_at?: string | null
          rest_time_seconds?: number | null
          notes?: string | null
          kb_protocol?: 'for_time' | 'timed_rest' | 'emom' | null
          kb_total_reps?: number | null
          kb_time_seconds?: number | null
        }
        Update: {
          id?: string
          workout_id?: string
          exercise?: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          set_number?: number
          prescribed_weight?: number
          prescribed_reps?: number
          actual_weight?: number | null
          actual_reps?: number | null
          completed?: boolean
          completed_at?: string | null
          rest_time_seconds?: number | null
          notes?: string | null
          kb_protocol?: 'for_time' | 'timed_rest' | 'emom' | null
          kb_total_reps?: number | null
          kb_time_seconds?: number | null
        }
      }
      week_progression: {
        Row: {
          id: string
          user_id: string
          week_number: number
          week_start_date: string
          heavy_completed: boolean
          light_completed: boolean
          medium_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_number: number
          week_start_date: string
          heavy_completed?: boolean
          light_completed?: boolean
          medium_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          week_start_date?: string
          heavy_completed?: boolean
          light_completed?: boolean
          medium_completed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_weight: {
        Args: {
          exercise_name: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
          percentage: number
          user_id: string
        }
        Returns: number
      }
      get_current_week: {
        Args: {}
        Returns: number
      }
    }
    Enums: {
      exercise_name: 'bench_press' | 'overhead_press' | 'deadlift' | 'squat' | 'kettlebell_swings'
      kb_protocol: 'for_time' | 'timed_rest' | 'emom'
      workout_type: 'heavy' | 'medium' | 'light'
    }
  }
}

// Custom types for the application
export type WorkoutType = Database['public']['Enums']['workout_type']
export type ExerciseName = Database['public']['Enums']['exercise_name']
export type KbProtocol = Database['public']['Enums']['kb_protocol']

export type UserLift = Database['public']['Tables']['user_lifts']['Row']
export type Program = Database['public']['Tables']['programs']['Row']
export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutSet = Database['public']['Tables']['workout_sets']['Row']
export type WeekProgression = Database['public']['Tables']['week_progression']['Row']

// Exercise set structure for program JSON
export interface ExerciseSetTemplate {
  weight_percent?: number
  weight?: number
  reps: number
  type: 'warmup' | 'work' | 'max' | 'amrap' | 'drop'
}

export interface ExerciseTemplate {
  name: ExerciseName
  sets: ExerciseSetTemplate[]
  protocol?: KbProtocol
  rest_seconds?: number
}

// Workout session types
export interface WorkoutSession {
  id: string
  workout_type: WorkoutType
  week_number: number
  exercises: WorkoutExercise[]
  started_at?: string
  completed_at?: string
  duration_seconds?: number
}

export interface WorkoutExercise {
  name: ExerciseName
  sets: WorkoutSetData[]
  protocol?: KbProtocol
}

export interface WorkoutSetData {
  id?: string
  set_number: number
  prescribed_weight: number
  prescribed_reps: number
  actual_weight?: number
  actual_reps?: number
  completed: boolean
  completed_at?: string
  rest_time_seconds?: number
  notes?: string
}
