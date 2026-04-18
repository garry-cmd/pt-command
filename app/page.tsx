'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WorkoutSession, WorkoutExercise, WorkoutSetData, ExerciseName } from '@/types/database'

export default function PTCommand() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'program' | 'history' | 'progress'>('today')
  const [loading, setLoading] = useState(true)
  
  // Workout state
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)

  const supabase = createClient()

  // Mock data - will be replaced with Supabase data
  const mockSession: WorkoutSession = {
    id: 'mock-session',
    workout_type: 'heavy',
    week_number: 3,
    exercises: [
      {
        name: 'deadlift',
        sets: [
          { 
            set_number: 1, 
            prescribed_weight: 315, 
            prescribed_reps: 5, 
            actual_weight: 315, 
            actual_reps: 5, 
            completed: true 
          },
          { 
            set_number: 2, 
            prescribed_weight: 360, 
            prescribed_reps: 3, 
            actual_weight: 360, 
            actual_reps: 3, 
            completed: true 
          },
          { 
            set_number: 3, 
            prescribed_weight: 405, 
            prescribed_reps: 1, 
            actual_weight: 405, 
            actual_reps: 1, 
            completed: false 
          },
          { 
            set_number: 4, 
            prescribed_weight: 425, 
            prescribed_reps: 1, 
            actual_weight: 425, 
            actual_reps: 1, 
            completed: false 
          }
        ]
      },
      {
        name: 'bench_press',
        sets: [
          { 
            set_number: 1, 
            prescribed_weight: 225, 
            prescribed_reps: 5, 
            actual_weight: 225, 
            actual_reps: 5, 
            completed: false 
          },
          { 
            set_number: 2, 
            prescribed_weight: 245, 
            prescribed_reps: 3, 
            actual_weight: 245, 
            actual_reps: 3, 
            completed: false 
          },
          { 
            set_number: 3, 
            prescribed_weight: 265, 
            prescribed_reps: 1, 
            actual_weight: 265, 
            actual_reps: 1, 
            completed: false 
          },
          { 
            set_number: 4, 
            prescribed_weight: 275, 
            prescribed_reps: 1, 
            actual_weight: 275, 
            actual_reps: 1, 
            completed: false 
          }
        ]
      },
      {
        name: 'kettlebell_swings',
        sets: [
          { 
            set_number: 1, 
            prescribed_weight: 35, 
            prescribed_reps: 20, 
            actual_weight: 35, 
            actual_reps: 20, 
            completed: false 
          },
          { 
            set_number: 2, 
            prescribed_weight: 35, 
            prescribed_reps: 20, 
            actual_weight: 35, 
            actual_reps: 20, 
            completed: false 
          },
          { 
            set_number: 3, 
            prescribed_weight: 35, 
            prescribed_reps: 20, 
            actual_weight: 35, 
            actual_reps: 20, 
            completed: false 
          }
        ],
        protocol: 'for_time'
      }
    ]
  }

  useEffect(() => {
    const initializeUser = async () => {
      // Temporarily bypass auth for demo - set fake user
      const mockUser = { id: 'demo-user', email: 'demo@ptcommand.app' } as any
      setUser(mockUser)
      setCurrentSession(mockSession)
      setWorkoutStartTime(Date.now())
      setLoading(false)
    }

    initializeUser()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(timer => timer - 1)
      }, 1000)
    } else if (restTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, restTimer])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalWorkoutTime = (): string => {
    if (!workoutStartTime) return "0:00"
    const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000)
    return formatTime(elapsed)
  }

  const getCurrentSet = (): (WorkoutSetData & { index: number }) | null => {
    if (!currentSession) return null
    
    const exercise = currentSession.exercises[currentExercise]
    if (!exercise) return null
    
    const currentSetIndex = exercise.sets.findIndex(set => !set.completed)
    return currentSetIndex !== -1 ? { ...exercise.sets[currentSetIndex], index: currentSetIndex } : null
  }

  const completeSet = async (actualWeight: number, actualReps: number) => {
    if (!currentSession) return
    
    const currentSet = getCurrentSet()
    if (!currentSet) return

    // Update local state
    const newSession = { ...currentSession }
    const exercise = newSession.exercises[currentExercise]
    exercise.sets[currentSet.index] = {
      ...exercise.sets[currentSet.index],
      completed: true,
      actual_weight: actualWeight,
      actual_reps: actualReps,
      completed_at: new Date().toISOString()
    }
    setCurrentSession(newSession)

    // Start rest timer based on exercise
    const exerciseName = exercise.name
    if (exerciseName === 'deadlift') {
      setRestTimer(240) // 4 minutes
      setIsTimerRunning(true)
    } else if (exerciseName === 'bench_press') {
      setRestTimer(180) // 3 minutes  
      setIsTimerRunning(true)
    }
    // KB swings don't get rest timer
  }

  const updateSetWeight = (weight: number) => {
    if (!currentSession) return
    
    const currentSet = getCurrentSet()
    if (!currentSet) return

    const newSession = { ...currentSession }
    newSession.exercises[currentExercise].sets[currentSet.index].actual_weight = weight
    setCurrentSession(newSession)
  }

  const updateSetReps = (reps: number) => {
    if (!currentSession) return
    
    const currentSet = getCurrentSet()
    if (!currentSet) return

    const newSession = { ...currentSession }
    newSession.exercises[currentExercise].sets[currentSet.index].actual_reps = reps
    setCurrentSession(newSession)
  }

  const getCompletedSets = (): WorkoutSetData[] => {
    if (!currentSession) return []
    return currentSession.exercises[currentExercise]?.sets.filter(set => set.completed) || []
  }

  const getNextExercise = (): WorkoutExercise | null => {
    if (!currentSession || currentExercise >= currentSession.exercises.length - 1) return null
    return currentSession.exercises[currentExercise + 1]
  }

  const getExerciseDisplayName = (name: ExerciseName): string => {
    const names = {
      'deadlift': 'Deadlifts',
      'bench_press': 'Bench Press',
      'overhead_press': 'Overhead Press',
      'squat': 'Squats',
      'kettlebell_swings': 'Kettlebell Swings'
    }
    return names[name]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading PT Command...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-hull-950 flex items-center justify-center">
        <div className="naval-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-navy-50 mb-4">PT Command</h1>
          <p className="text-muted-100 mb-6">Sign in to access your training protocol</p>
          <button className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                PT Command
              </h1>
              <p className="text-slate-400 text-sm">
                Heavy/Medium/Light Training Protocol
              </p>
            </div>
            <div className="bg-yellow-600 text-black px-3 py-2 rounded-lg text-sm font-mono font-semibold">
              Week 3 - Monday
            </div>
          </div>

          {/* Session Preview */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-yellow-500">
                Today: Heavy Day
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                Workout time: {getTotalWorkoutTime()}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-slate-600 text-yellow-300 px-2 py-1 rounded text-xs font-mono">Dead 425×1</span>
              <span className="bg-slate-600 text-yellow-300 px-2 py-1 rounded text-xs font-mono">Bench 275×1</span>
              <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-mono font-semibold">
                KB 3×20
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 mb-6">
          <div className="flex gap-1">
            {[
              { id: 'today' as const, label: 'Today' },
              { id: 'program' as const, label: 'Program' },
              { id: 'history' as const, label: 'History' },
              { id: 'progress' as const, label: 'Progress' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Today Tab Content */}
        {activeTab === 'today' && currentSession && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="pl-4 border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {getExerciseDisplayName(currentSession.exercises[currentExercise]?.name)}
                </h3>
                <p className="text-sm text-slate-400">
                  Heavy Day (90-100%) • Next: {getNextExercise()?.name ? getExerciseDisplayName(getNextExercise()!.name) : 'Session Complete'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-yellow-500">
                  {getCompletedSets().length}/{currentSession.exercises[currentExercise]?.sets.length || 0}
                </span>
                <span className="text-sm text-slate-400">sets</span>
              </div>
            </div>

            {(() => {
              const currentSet = getCurrentSet()
              if (!currentSet) {
                return (
                  <div className="naval-card border-success bg-success/10 p-8 text-center">
                    <div className="text-4xl mb-4">✓</div>
                    <h3 className="text-lg font-semibold mb-2 text-success">
                      Exercise Complete
                    </h3>
                    <p className="text-muted-100 mb-5">
                      All sets finished. Ready for next exercise.
                    </p>
                    <button
                      onClick={() => {
                        if (currentExercise < currentSession.exercises.length - 1) {
                          setCurrentExercise(currentExercise + 1)
                          setRestTimer(0)
                          setIsTimerRunning(false)
                        }
                      }}
                      className="btn-primary"
                    >
                      {currentExercise < currentSession.exercises.length - 1 ? 'Next Exercise' : 'Finish Session'}
                    </button>
                  </div>
                )
              }

              return (
                <>
                  {/* Current Set */}
                  <div className="set-card-active p-6 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-xs text-muted-100 mb-1">
                          Set {currentSet.index + 1} of {currentSession.exercises[currentExercise].sets.length}
                        </div>
                        <div className="text-2xl font-semibold text-navy-50 mb-2">
                          Prescribed: {currentSet.prescribed_weight} lbs × {currentSet.prescribed_reps}
                        </div>
                      </div>
                      {restTimer > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-muted-100 mb-1">Rest Timer</div>
                          <div className={`timer-display ${isTimerRunning ? 'timer-pulse' : ''}`}>
                            {formatTime(restTimer)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Adjustable Inputs */}
                    <div className="bg-hull-700 p-4 rounded-xl mb-4">
                      <div className="text-xs font-semibold text-navy-400 mb-3">
                        Actual Performance
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="block text-xs text-navy-400 mb-2">
                            Weight (lbs)
                          </label>
                          <input
                            type="number"
                            value={currentSet.actual_weight || ''}
                            onChange={(e) => updateSetWeight(parseInt(e.target.value) || 0)}
                            className="naval-input-large w-full"
                          />
                        </div>
                        <div className="text-2xl text-navy-400 mt-6">×</div>
                        <div className="flex-1">
                          <label className="block text-xs text-navy-400 mb-2">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={currentSet.actual_reps || ''}
                            onChange={(e) => updateSetReps(parseInt(e.target.value) || 0)}
                            className="naval-input-large w-full"
                          />
                        </div>
                      </div>
                      <div className={`text-xs mt-3 text-center ${
                        (currentSet.actual_weight || 0) === currentSet.prescribed_weight ? 'text-success' : 'text-danger'
                      }`}>
                        {(currentSet.actual_weight || 0) === currentSet.prescribed_weight
                          ? 'Exactly as prescribed ✓'
                          : `${((currentSet.actual_weight || 0) - currentSet.prescribed_weight) > 0 ? '+' : ''}${(currentSet.actual_weight || 0) - currentSet.prescribed_weight} lbs from prescribed`
                        }
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => completeSet(currentSet.actual_weight || currentSet.prescribed_weight, currentSet.actual_reps || currentSet.prescribed_reps)}
                        className="btn-success flex-1"
                      >
                        Complete Set
                      </button>
                      <button className="btn-secondary px-6">
                        Skip
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}

            {/* Completed Sets */}
            {getCompletedSets().length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-muted-100 mb-3">
                  Completed Sets
                </h4>
                <div className="space-y-2">
                  {getCompletedSets().map((set, index) => (
                    <div key={index} className="set-card-completed p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-navy-50 font-mono">
                            {set.actual_weight} lbs × {set.actual_reps}
                          </span>
                          {(set.actual_weight !== set.prescribed_weight) && (
                            <span className="text-xs text-muted-100 ml-3">
                              prescribed: {set.prescribed_weight}×{set.prescribed_reps}
                            </span>
                          )}
                        </div>
                        <span className="text-success font-medium">
                          ✓ {set.actual_reps} reps
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Overview */}
            <div className="naval-card p-4 mb-4">
              <h4 className="text-sm font-semibold text-muted-100 mb-3">
                Today's Session
              </h4>
              <div className="flex gap-2 flex-wrap">
                {currentSession.exercises.map((exercise, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      index === currentExercise 
                        ? 'bg-amber-500 text-hull-950 font-semibold' 
                        : 'bg-hull-700 text-muted-100'
                    }`}
                  >
                    {index + 1}. {getExerciseDisplayName(exercise.name)}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="btn-secondary flex-1">
                End Session
              </button>
              <button
                onClick={() => {
                  if (currentExercise < currentSession.exercises.length - 1) {
                    setCurrentExercise(currentExercise + 1)
                    setRestTimer(0)
                    setIsTimerRunning(false)
                  }
                }}
                disabled={currentExercise >= currentSession.exercises.length - 1}
                className={`flex-[2] px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentExercise >= currentSession.exercises.length - 1
                    ? 'bg-hull-700 text-muted-100 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {currentExercise >= currentSession.exercises.length - 1 ? 'Session Complete' : 'Next Exercise'}
              </button>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'today' && (
          <div className="naval-card p-12 text-center">
            <div className="text-4xl mb-4 opacity-30">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-navy-50">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
            </h3>
            <p className="text-muted-100">
              Under construction - focus on Today tab for workout logging
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
