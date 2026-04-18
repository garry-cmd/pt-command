'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import './globals.css'

// Type definitions
interface WorkoutSet {
  set_number: number
  prescribed_weight: number
  prescribed_reps: number
  actual_weight: number
  actual_reps: number
  completed: boolean
  completed_at?: string
}

interface Exercise {
  name: string
  sets: WorkoutSet[]
}

interface WorkoutSession {
  type: string
  name: string
  color: string
  description: string
  exercises: Exercise[]
}

type ExerciseName = 'deadlift' | 'bench_press' | 'overhead_press' | 'squat' | 'kettlebell_swings';

export default function PTCommand() {
  const [activeTab, setActiveTab] = useState<'today' | 'program' | 'history' | 'progress'>('today')
  const [currentExercise, setCurrentExercise] = useState<number>(0)
  const [restTimer, setRestTimer] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null)

  // Get today's workout based on day of week
  const getTodaysWorkout = (): WorkoutSession => {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Monday = Heavy, Wednesday = Light, Friday = Medium
    if (today === 1) { // Monday
      return {
        type: 'heavy',
        name: 'Heavy Day',
        color: '#ef4444',
        description: '90-100% Training Max • Max effort singles',
        exercises: [
          {
            name: 'deadlift',
            sets: [
              { set_number: 1, prescribed_weight: 315, prescribed_reps: 5, actual_weight: 315, actual_reps: 5, completed: true },
              { set_number: 2, prescribed_weight: 360, prescribed_reps: 3, actual_weight: 360, actual_reps: 3, completed: true },
              { set_number: 3, prescribed_weight: 405, prescribed_reps: 1, actual_weight: 405, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 425, prescribed_reps: 1, actual_weight: 425, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'bench_press',
            sets: [
              { set_number: 1, prescribed_weight: 225, prescribed_reps: 5, actual_weight: 225, actual_reps: 5, completed: false },
              { set_number: 2, prescribed_weight: 245, prescribed_reps: 3, actual_weight: 245, actual_reps: 3, completed: false },
              { set_number: 3, prescribed_weight: 265, prescribed_reps: 1, actual_weight: 265, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 275, prescribed_reps: 1, actual_weight: 275, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'kettlebell_swings',
            sets: [
              { set_number: 1, prescribed_weight: 35, prescribed_reps: 20, actual_weight: 35, actual_reps: 20, completed: false },
              { set_number: 2, prescribed_weight: 35, prescribed_reps: 20, actual_weight: 35, actual_reps: 20, completed: false },
              { set_number: 3, prescribed_weight: 35, prescribed_reps: 20, actual_weight: 35, actual_reps: 20, completed: false }
            ]
          }
        ]
      }
    } else if (today === 3) { // Wednesday  
      return {
        type: 'light',
        name: 'Light Day', 
        color: '#22c55e',
        description: '60-70% Training Max • Volume work',
        exercises: [
          {
            name: 'squat',
            sets: [
              { set_number: 1, prescribed_weight: 190, prescribed_reps: 8, actual_weight: 190, actual_reps: 8, completed: false },
              { set_number: 2, prescribed_weight: 205, prescribed_reps: 6, actual_weight: 205, actual_reps: 6, completed: false },
              { set_number: 3, prescribed_weight: 220, prescribed_reps: 4, actual_weight: 220, actual_reps: 4, completed: false },
              { set_number: 4, prescribed_weight: 220, prescribed_reps: 4, actual_weight: 220, actual_reps: 4, completed: false }
            ]
          },
          {
            name: 'overhead_press',
            sets: [
              { set_number: 1, prescribed_weight: 135, prescribed_reps: 8, actual_weight: 135, actual_reps: 8, completed: false },
              { set_number: 2, prescribed_weight: 145, prescribed_reps: 6, actual_weight: 145, actual_reps: 6, completed: false },
              { set_number: 3, prescribed_weight: 155, prescribed_reps: 4, actual_weight: 155, actual_reps: 4, completed: false },
              { set_number: 4, prescribed_weight: 155, prescribed_reps: 4, actual_weight: 155, actual_reps: 4, completed: false }
            ]
          },
          {
            name: 'kettlebell_swings',
            sets: Array.from({length: 10}, (_: unknown, i: number): WorkoutSet => ({
              set_number: i + 1, 
              prescribed_weight: 35, 
              prescribed_reps: 20, 
              actual_weight: 35, 
              actual_reps: 20, 
              completed: false 
            }))
          }
        ]
      }
    } else if (today === 5) { // Friday
      return {
        type: 'medium',
        name: 'Medium Day',
        color: '#eab308', 
        description: '70-85% Training Max • Moderate intensity',
        exercises: [
          {
            name: 'squat',
            sets: [
              { set_number: 1, prescribed_weight: 220, prescribed_reps: 5, actual_weight: 220, actual_reps: 5, completed: false },
              { set_number: 2, prescribed_weight: 235, prescribed_reps: 3, actual_weight: 235, actual_reps: 3, completed: false },
              { set_number: 3, prescribed_weight: 250, prescribed_reps: 1, actual_weight: 250, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 265, prescribed_reps: 1, actual_weight: 265, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'overhead_press',
            sets: [
              { set_number: 1, prescribed_weight: 145, prescribed_reps: 5, actual_weight: 145, actual_reps: 5, completed: false },
              { set_number: 2, prescribed_weight: 155, prescribed_reps: 3, actual_weight: 155, actual_reps: 3, completed: false },
              { set_number: 3, prescribed_weight: 165, prescribed_reps: 1, actual_weight: 165, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 175, prescribed_reps: 1, actual_weight: 175, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'kettlebell_swings',
            sets: Array.from({length: 10}, (_: unknown, i: number): WorkoutSet => ({
              set_number: i + 1, 
              prescribed_weight: 35, 
              prescribed_reps: 10, 
              actual_weight: 35, 
              actual_reps: 10, 
              completed: false 
            }))
          }
        ]
      }
    } else {
      // Weekend or off days
      return {
        type: 'rest',
        name: 'Rest Day',
        color: '#64748b',
        description: 'Recovery and mobility',
        exercises: []
      }
    }
  }

  useEffect(() => {
    // Initialize today's workout and set start time
    const workout = getTodaysWorkout()
    setCurrentSession(workout)
    setWorkoutStartTime(Date.now())
  }, []) // Empty dependency array is intentional - we only want this to run once

  // Timer effect
  useEffect(() => {
    let interval: number | undefined
    if (isTimerRunning && restTimer > 0) {
      interval = window.setInterval(() => {
        setRestTimer((timer: number) => timer - 1)
      }, 1000)
    } else if (restTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false)
    }
    return () => {
      if (interval) window.clearInterval(interval)
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

  const getCurrentSet = (): (WorkoutSet & { index: number }) | null => {
    if (!currentSession || !currentSession.exercises) return null
    const exercise = currentSession.exercises[currentExercise]
    if (!exercise) return null
    const currentSetIndex = exercise.sets.findIndex((set: WorkoutSet) => !set.completed)
    return currentSetIndex !== -1 ? { ...exercise.sets[currentSetIndex], index: currentSetIndex } : null
  }

  const updateSetWeight = (weight: number): void => {
    if (!currentSession) return
    const currentSet = getCurrentSet()
    if (!currentSet) return

    const newSession: WorkoutSession = { ...currentSession }
    newSession.exercises[currentExercise].sets[currentSet.index].actual_weight = weight
    setCurrentSession(newSession)
  }

  const updateSetReps = (reps: number): void => {
    if (!currentSession) return
    const currentSet = getCurrentSet()
    if (!currentSet) return

    const newSession: WorkoutSession = { ...currentSession }
    newSession.exercises[currentExercise].sets[currentSet.index].actual_reps = reps
    setCurrentSession(newSession)
  }

  const completeSet = (actualWeight: number, actualReps: number): void => {
    if (!currentSession) return
    const currentSet = getCurrentSet()
    if (!currentSet) return

    const newSession: WorkoutSession = { ...currentSession }
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
    const exerciseName = exercise.name as ExerciseName
    if (exerciseName === 'deadlift') {
      setRestTimer(240) // 4 minutes
      setIsTimerRunning(true)
    } else if (exerciseName === 'bench_press') {
      setRestTimer(180) // 3 minutes  
      setIsTimerRunning(true)
    } else if (exerciseName === 'squat') {
      setRestTimer(180) // 3 minutes
      setIsTimerRunning(true)
    } else if (exerciseName === 'overhead_press') {
      setRestTimer(120) // 2 minutes
      setIsTimerRunning(true)
    }
    // KB swings don't get rest timer
  }

  const endSession = (): void => {
    if (window.confirm('Are you sure you want to end this session? Your progress will be saved.')) {
      // In real app, this would save to database
      window.alert('Session ended and progress saved!')
      // Could navigate to history or reset to new session
    }
  }

  const nextExercise = (): void => {
    if (!currentSession) return
    if (currentExercise < currentSession.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setRestTimer(0)
      setIsTimerRunning(false)
    } else {
      // Session complete
      if (window.confirm('Congratulations! Session complete. Mark as finished?')) {
        window.alert('🎉 Session completed successfully! Great work!')
        // In real app, would save completion to database
      }
    }
  }

  const isSessionComplete = (): boolean => {
    if (!currentSession || !currentSession.exercises) return false
    return currentSession.exercises.every((exercise: Exercise) => 
      exercise.sets.every((set: WorkoutSet) => set.completed)
    )
  }

  const getCompletedSets = (): WorkoutSet[] => {
    if (!currentSession || !currentSession.exercises) return []
    const currentExerciseData = currentSession.exercises[currentExercise]
    if (!currentExerciseData) return []
    return currentExerciseData.sets.filter((set: WorkoutSet) => set.completed)
  }

  const getExerciseDisplayName = (name: string): string => {
    const names: Record<string, string> = {
      'deadlift': 'Deadlifts',
      'bench_press': 'Bench Press',
      'overhead_press': 'Overhead Press',
      'squat': 'Squats',
      'kettlebell_swings': 'Kettlebell Swings'
    }
    return names[name] || name
  }

  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value) || 0
    updateSetWeight(value)
  }

  const handleRepsChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value) || 0
    updateSetReps(value)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '24px' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="pt-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#f1f5f9' }}>
                PT Command
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                Heavy/Medium/Light Training Protocol
              </p>
            </div>
            <div style={{ 
              backgroundColor: currentSession?.color || '#64748b', 
              color: '#000', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              Week 16 - {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: currentSession?.color || '#64748b' }}>
                Today: {currentSession?.name || 'Rest Day'}
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                Workout time: {getTotalWorkoutTime()}
              </div>
            </div>
            {currentSession?.exercises && currentSession.exercises.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {currentSession.exercises.map((exercise: Exercise, index: number) => (
                  <span key={index} style={{ 
                    backgroundColor: '#374151', 
                    color: '#facc15', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontFamily: 'monospace' 
                  }}>
                    {getExerciseDisplayName(exercise.name)} {exercise.sets.length}×{exercise.sets[0]?.prescribed_reps || 0}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                {currentSession?.description || 'Rest day - no scheduled workout'}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="pt-card" style={{ marginBottom: '24px', padding: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'today' as const, label: 'Today' },
              { id: 'program' as const, label: 'Program' },
              { id: 'history' as const, label: 'History' },
              { id: 'progress' as const, label: 'Progress' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pt-tab ${activeTab === tab.id ? 'pt-tab-active' : 'pt-tab-inactive'}`}
                style={{ flex: 1, border: 'none' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Today Tab Content */}
        {activeTab === 'today' && (
          <div>
            {currentSession?.type === 'rest' ? (
              // Rest Day Content
              <div className="pt-card" style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛌</div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                  Rest Day
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                  Recovery time! Your next workout is scheduled for Monday (Heavy Day).
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="pt-button-primary">
                    View Next Workout
                  </button>
                </div>
              </div>
            ) : currentSession?.exercises && currentSession.exercises.length > 0 && (
              // Workout Content
              <div className="pt-card">
                
                {/* Exercise Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ borderLeft: `4px solid ${currentSession.color}`, paddingLeft: '16px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0', color: '#f1f5f9' }}>
                      {getExerciseDisplayName(currentSession.exercises[currentExercise]?.name || '')}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                      {currentSession.description} • Exercise {currentExercise + 1} of {currentSession.exercises.length}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: currentSession.color }}>
                      {getCompletedSets().length}/{currentSession.exercises[currentExercise]?.sets.length || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>sets</div>
                  </div>
                </div>

                {(() => {
                  const currentSet = getCurrentSet()
                  if (!currentSet) {
                    return (
                      <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#166534', border: '1px solid #22c55e', borderRadius: '12px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>
                          Exercise Complete
                        </h3>
                        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                          All sets finished. Ready for next exercise.
                        </p>
                        <button
                          onClick={nextExercise}
                          className="pt-button-primary"
                        >
                          {currentExercise < (currentSession?.exercises.length || 0) - 1 ? 'Next Exercise' : 'Finish Session'}
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div>
                      {/* Current Set */}
                      <div style={{ border: `2px solid ${currentSession?.color || '#64748b'}`, borderRadius: '12px', padding: '24px', marginBottom: '16px', backgroundColor: '#1a1a2e' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                              Set {currentSet.index + 1} of {currentSession?.exercises[currentExercise]?.sets.length || 0}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9' }}>
                              Prescribed: {currentSet.prescribed_weight} lbs × {currentSet.prescribed_reps}
                            </div>
                          </div>
                          {restTimer > 0 && (
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Rest Timer</div>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: currentSession?.color || '#64748b', fontFamily: 'monospace' }}>
                                {formatTime(restTimer)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>
                            Actual Performance
                          </div>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                                Weight (lbs)
                              </label>
                              <input
                                type="number"
                                value={currentSet.actual_weight || ''}
                                onChange={handleWeightChange}
                                style={{ 
                                  width: '100%', 
                                  padding: '8px', 
                                  borderRadius: '8px', 
                                  border: '1px solid #374151',
                                  backgroundColor: '#1e293b',
                                  color: '#f1f5f9',
                                  fontSize: '18px',
                                  fontFamily: 'monospace',
                                  textAlign: 'center'
                                }}
                              />
                            </div>
                            <div style={{ fontSize: '24px', color: '#94a3b8', paddingBottom: '8px' }}>×</div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                                Reps
                              </label>
                              <input
                                type="number"
                                value={currentSet.actual_reps || ''}
                                onChange={handleRepsChange}
                                style={{ 
                                  width: '100%', 
                                  padding: '8px', 
                                  borderRadius: '8px', 
                                  border: '1px solid #374151',
                                  backgroundColor: '#1e293b',
                                  color: '#f1f5f9',
                                  fontSize: '18px',
                                  fontFamily: 'monospace',
                                  textAlign: 'center'
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            marginTop: '8px', 
                            textAlign: 'center',
                            color: (currentSet.actual_weight || 0) === currentSet.prescribed_weight ? '#22c55e' : '#ef4444'
                          }}>
                            {(currentSet.actual_weight || 0) === currentSet.prescribed_weight
                              ? 'Exactly as prescribed ✓'
                              : `${((currentSet.actual_weight || 0) - currentSet.prescribed_weight) > 0 ? '+' : ''}${(currentSet.actual_weight || 0) - currentSet.prescribed_weight} lbs from prescribed`
                            }
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => completeSet(currentSet.actual_weight || currentSet.prescribed_weight, currentSet.actual_reps || currentSet.prescribed_reps)}
                            style={{ 
                              flex: 1, 
                              backgroundColor: '#22c55e', 
                              color: '#fff', 
                              padding: '12px', 
                              borderRadius: '8px', 
                              border: 'none', 
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Complete Set
                          </button>
                          <button 
                            style={{ 
                              padding: '12px 24px', 
                              backgroundColor: 'transparent', 
                              color: '#94a3b8', 
                              border: '1px solid #374151', 
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            Skip
                          </button>
                        </div>
                      </div>

                      {/* Completed Sets */}
                      {getCompletedSets().length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>
                            Completed Sets
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {getCompletedSets().map((set: WorkoutSet, index: number) => (
                              <div key={index} style={{ 
                                border: '1px solid #22c55e', 
                                borderRadius: '8px', 
                                padding: '12px', 
                                backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>
                                    {set.actual_weight} lbs × {set.actual_reps}
                                  </span>
                                  <span style={{ color: '#22c55e', fontWeight: '500' }}>
                                    ✓ {set.actual_reps} reps
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={endSession}
                          style={{ 
                            flex: 1,
                            padding: '12px', 
                            backgroundColor: 'transparent', 
                            color: '#94a3b8', 
                            border: '1px solid #374151', 
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          End Session
                        </button>
                        <button
                          onClick={nextExercise}
                          disabled={isSessionComplete() && currentExercise >= (currentSession?.exercises.length || 0) - 1}
                          style={{
                            flex: 2,
                            padding: '12px',
                            backgroundColor: isSessionComplete() ? '#22c55e' : currentSession?.color,
                            color: isSessionComplete() ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isSessionComplete() ? '🎉 Session Complete!' : 
                           currentExercise >= (currentSession?.exercises.length || 0) - 1 ? 'Finish Session' : 'Next Exercise'}
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* Program Tab Content */}
        {activeTab === 'program' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* H/M/L Protocol Overview */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Heavy/Medium/Light Protocol
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                
                {/* Heavy Day */}
                <div style={{ 
                  backgroundColor: '#7f1d1d', 
                  border: '1px solid #ef4444', 
                  borderRadius: '12px', 
                  padding: '20px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ 
                      backgroundColor: '#ef4444', 
                      color: '#000', 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      HEAVY
                    </div>
                    <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '14px' }}>Monday</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>90-100% Training Max</h4>
                  <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px' }}>
                    Max effort singles and doubles. Neural adaptation focus.
                  </p>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    • Deadlifts: Work up to 1RM<br/>
                    • Bench: Heavy singles<br/>
                    • KB Swings: 3×20 for time
                  </div>
                </div>

                {/* Light Day */}
                <div style={{ 
                  backgroundColor: '#14532d', 
                  border: '1px solid #22c55e', 
                  borderRadius: '12px', 
                  padding: '20px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ 
                      backgroundColor: '#22c55e', 
                      color: '#000', 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      LIGHT
                    </div>
                    <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '14px' }}>Wednesday</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>60-70% Training Max</h4>
                  <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px' }}>
                    Volume work and technique practice. Recovery focused.
                  </p>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    • Squats: 4×6-8 reps<br/>
                    • OHP: 4×6-8 reps<br/>
                    • KB Swings: 10×20, 1min rest
                  </div>
                </div>

                {/* Medium Day */}
                <div style={{ 
                  backgroundColor: '#451a03', 
                  border: '1px solid #eab308', 
                  borderRadius: '12px', 
                  padding: '20px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ 
                      backgroundColor: '#eab308', 
                      color: '#000', 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      MEDIUM
                    </div>
                    <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '14px' }}>Friday</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#eab308' }}>70-85% Training Max</h4>
                  <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px' }}>
                    Moderate intensity. Strength-power development.
                  </p>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    • Squats: 4×3-5 reps<br/>
                    • OHP: 4×3-5 reps<br/>
                    • KB Swings: 10×10, 1min rest
                  </div>
                </div>
              </div>
            </div>

            {/* Training Max Calculator */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Training Max Calculator
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                
                {['Deadlift', 'Bench Press', 'Squat', 'Overhead Press'].map((exercise: string, index: number) => (
                  <div key={index} style={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4b5563', 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#f1f5f9', fontSize: '16px' }}>{exercise}</h4>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                        Current 1RM (lbs)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        style={{ 
                          width: '100%', 
                          padding: '8px', 
                          borderRadius: '6px', 
                          border: '1px solid #4b5563',
                          backgroundColor: '#1f2937',
                          color: '#f1f5f9',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      <div>90% TM: <span style={{ color: '#ef4444', fontWeight: '600' }}>---</span></div>
                      <div>70% TM: <span style={{ color: '#eab308', fontWeight: '600' }}>---</span></div>
                      <div>60% TM: <span style={{ color: '#22c55e', fontWeight: '600' }}>---</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Database */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Exercise Database
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                
                {[
                  {
                    name: 'Deadlift',
                    description: 'King of all lifts. Full-body posterior chain development.',
                    muscles: 'Hamstrings, Glutes, Lats, Traps, Rhomboids',
                    tips: 'Keep bar close to body. Drive through heels. Chest up.',
                    restTime: '4-5 minutes'
                  },
                  {
                    name: 'Bench Press',
                    description: 'Upper body power. Chest, shoulders, and triceps.',
                    muscles: 'Pectorals, Anterior Deltoids, Triceps',
                    tips: 'Retract shoulder blades. Arch back slightly. Control descent.',
                    restTime: '3-4 minutes'
                  },
                  {
                    name: 'Squat',
                    description: 'Lower body foundation. Quad and glute dominant.',
                    muscles: 'Quadriceps, Glutes, Core, Calves',
                    tips: 'Break at hips first. Knees track over toes. Full depth.',
                    restTime: '3-4 minutes'
                  },
                  {
                    name: 'Overhead Press',
                    description: 'Standing shoulder press. Core stability and power.',
                    muscles: 'Shoulders, Triceps, Upper Back, Core',
                    tips: 'Tight core. Press in straight line. Lock out overhead.',
                    restTime: '2-3 minutes'
                  }
                ].map((exercise, index: number) => (
                  <div key={index} style={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4b5563', 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#facc15', fontSize: '16px' }}>{exercise.name}</h4>
                    <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px' }}>
                      {exercise.description}
                    </p>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>Primary Muscles: </span>
                      <span style={{ color: '#f1f5f9' }}>{exercise.muscles}</span>
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>Key Tips: </span>
                      <span style={{ color: '#f1f5f9' }}>{exercise.tips}</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#94a3b8' }}>Rest Time: </span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>{exercise.restTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Recent Sessions */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Recent Sessions
              </h3>
              
              {[
                {
                  date: 'Friday, Apr 11, 2026',
                  type: 'Medium Day',
                  color: '#eab308',
                  duration: '48 min',
                  exercises: [
                    { name: 'Squats', sets: 4, topSet: '265×1', completed: true },
                    { name: 'OHP', sets: 4, topSet: '175×1', completed: true },
                    { name: 'KB Swings', sets: 10, topSet: '35×10', completed: true }
                  ]
                },
                {
                  date: 'Wednesday, Apr 9, 2026', 
                  type: 'Light Day',
                  color: '#22c55e',
                  duration: '52 min',
                  exercises: [
                    { name: 'Squats', sets: 4, topSet: '220×8', completed: true },
                    { name: 'OHP', sets: 4, topSet: '155×8', completed: true },
                    { name: 'KB Swings', sets: 10, topSet: '35×20', completed: true }
                  ]
                },
                {
                  date: 'Monday, Apr 7, 2026',
                  type: 'Heavy Day', 
                  color: '#ef4444',
                  duration: '65 min',
                  exercises: [
                    { name: 'Deadlifts', sets: 4, topSet: '425×1', completed: true },
                    { name: 'Bench Press', sets: 4, topSet: '275×1', completed: true },
                    { name: 'KB Swings', sets: 3, topSet: '35×20', completed: true }
                  ]
                },
                {
                  date: 'Friday, Apr 4, 2026',
                  type: 'Medium Day',
                  color: '#eab308', 
                  duration: '45 min',
                  exercises: [
                    { name: 'Squats', sets: 4, topSet: '250×3', completed: false },
                    { name: 'OHP', sets: 4, topSet: '165×2', completed: false },
                    { name: 'KB Swings', sets: 7, topSet: '35×10', completed: false }
                  ]
                }
              ].map((session, index: number) => (
                <div key={index} style={{ 
                  border: `1px solid ${session.color}`, 
                  borderRadius: '12px', 
                  padding: '20px', 
                  backgroundColor: session.completed ? 'rgba(34, 197, 94, 0.1)' : '#1f2937',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: session.color, fontSize: '16px', fontWeight: '600' }}>
                        {session.type}
                      </h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                        {session.date}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        backgroundColor: session.color, 
                        color: '#000', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {session.duration}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {session.exercises.every((ex: any) => ex.completed) ? '✓ Complete' : '⚠ Incomplete'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                    {session.exercises.map((exercise: any, exIndex: number) => (
                      <div key={exIndex} style={{ 
                        backgroundColor: '#374151', 
                        padding: '8px 12px', 
                        borderRadius: '6px',
                        border: exercise.completed ? '1px solid #22c55e' : '1px solid #ef4444'
                      }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>
                          {exercise.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#f1f5f9', fontFamily: 'monospace' }}>
                          {exercise.sets}×{exercise.topSet}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Trends */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Performance Trends (Last 30 Days)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { exercise: 'Deadlift', current: '425 lbs', change: '+15 lbs', trend: 'up' },
                  { exercise: 'Bench Press', current: '275 lbs', change: '+10 lbs', trend: 'up' },
                  { exercise: 'Squat', current: '265 lbs', change: '+5 lbs', trend: 'up' },
                  { exercise: 'Overhead Press', current: '175 lbs', change: '+5 lbs', trend: 'up' }
                ].map((stat, index: number) => (
                  <div key={index} style={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4b5563', 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                      {stat.exercise}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '4px' }}>
                      {stat.current}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: stat.trend === 'up' ? '#22c55e' : '#ef4444',
                      fontWeight: '600'
                    }}>
                      {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Calendar */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Workout Calendar - April 2026
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: string) => (
                  <div key={day} style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#94a3b8' 
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNum = i + 1
                  const isWorkout = dayNum % 2 === 1 && dayNum <= 17 // Mock workout days
                  const workoutType = 
                    dayNum === 1 || dayNum === 15 ? 'Heavy' :
                    dayNum === 3 || dayNum === 17 ? 'Light' :
                    dayNum === 5 || dayNum === 11 ? 'Medium' :
                    null
                  
                  return (
                    <div key={i} style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontSize: '14px', 
                      borderRadius: '6px',
                      backgroundColor: isWorkout ? '#374151' : '#1f2937',
                      border: isWorkout ? '1px solid #facc15' : '1px solid #374151',
                      minHeight: '40px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{ color: '#f1f5f9', fontWeight: '600' }}>{dayNum}</div>
                      {workoutType && (
                        <div style={{ 
                          fontSize: '8px', 
                          color: '#facc15',
                          marginTop: '2px'
                        }}>
                          {workoutType}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* Progress Tab Content */}
        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Personal Records */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Personal Records
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {[
                  { 
                    exercise: 'Deadlift', 
                    current: '425 lbs', 
                    previous: '410 lbs', 
                    date: 'Apr 7, 2026',
                    improvement: '+15 lbs',
                    color: '#ef4444'
                  },
                  { 
                    exercise: 'Bench Press', 
                    current: '275 lbs', 
                    previous: '265 lbs', 
                    date: 'Apr 7, 2026',
                    improvement: '+10 lbs',
                    color: '#3b82f6'
                  },
                  { 
                    exercise: 'Squat', 
                    current: '265 lbs', 
                    previous: '260 lbs', 
                    date: 'Apr 11, 2026',
                    improvement: '+5 lbs',
                    color: '#eab308'
                  },
                  { 
                    exercise: 'Overhead Press', 
                    current: '175 lbs', 
                    previous: '170 lbs', 
                    date: 'Apr 11, 2026',
                    improvement: '+5 lbs',
                    color: '#22c55e'
                  }
                ].map((pr, index: number) => (
                  <div key={index} style={{ 
                    background: `linear-gradient(135deg, ${pr.color}20, transparent)`,
                    border: `1px solid ${pr.color}`, 
                    borderRadius: '12px', 
                    padding: '20px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: pr.color, fontSize: '16px', fontWeight: '600' }}>
                        {pr.exercise}
                      </h4>
                      <div style={{ 
                        backgroundColor: pr.color, 
                        color: '#000', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        fontWeight: '600' 
                      }}>
                        NEW PR
                      </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '8px' }}>
                      {pr.current}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      Previous: {pr.previous}
                    </div>
                    <div style={{ fontSize: '12px', color: pr.color, fontWeight: '600' }}>
                      {pr.improvement} improvement • {pr.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength Progression Chart */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Strength Progression (Last 12 Weeks)
              </h3>
              
              {/* Mock Chart Area */}
              <div style={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151', 
                borderRadius: '8px', 
                padding: '24px',
                minHeight: '300px',
                position: 'relative'
              }}>
                {/* Chart Legend */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', justifyContent: 'center' }}>
                  {[
                    { exercise: 'Deadlift', color: '#ef4444' },
                    { exercise: 'Bench', color: '#3b82f6' },
                    { exercise: 'Squat', color: '#eab308' },
                    { exercise: 'OHP', color: '#22c55e' }
                  ].map((item, index: number) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: item.color, 
                        borderRadius: '2px' 
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.exercise}</span>
                    </div>
                  ))}
                </div>

                {/* Mock Chart Lines */}
                <div style={{ 
                  height: '200px', 
                  background: `
                    linear-gradient(45deg, transparent 48%, #ef444450 49%, #ef444450 51%, transparent 52%),
                    linear-gradient(35deg, transparent 48%, #3b82f650 49%, #3b82f650 51%, transparent 52%),
                    linear-gradient(25deg, transparent 48%, #eab30850 49%, #eab30850 51%, transparent 52%),
                    linear-gradient(15deg, transparent 48%, #22c55e50 49%, #22c55e50 51%, transparent 52%)
                  `,
                  borderRadius: '4px',
                  position: 'relative'
                }}>
                  {/* Y-axis labels */}
                  <div style={{ 
                    position: 'absolute', 
                    left: '-40px', 
                    top: 0, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    color: '#94a3b8',
                    fontSize: '10px'
                  }}>
                    <span>450</span>
                    <span>350</span>
                    <span>250</span>
                    <span>150</span>
                  </div>
                  
                  {/* X-axis labels */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-25px', 
                    left: 0, 
                    right: 0, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    color: '#94a3b8',
                    fontSize: '10px'
                  }}>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume & Frequency Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Weekly Volume */}
              <div className="pt-card">
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                  Weekly Training Volume
                </h3>
                
                {[
                  { week: 'This Week', sets: 36, volume: '12,450 lbs', status: 'current' },
                  { week: 'Last Week', sets: 42, volume: '13,200 lbs', status: 'complete' },
                  { week: '2 Weeks Ago', sets: 39, volume: '12,850 lbs', status: 'complete' },
                  { week: '3 Weeks Ago', sets: 45, volume: '13,980 lbs', status: 'complete' }
                ].map((week, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: week.status === 'current' ? '#374151' : '#1f2937',
                    border: week.status === 'current' ? '1px solid #facc15' : '1px solid #374151',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '600' }}>
                        {week.week}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {week.sets} total sets
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', color: '#facc15', fontWeight: '600' }}>
                        {week.volume}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        total volume
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Training Frequency */}
              <div className="pt-card">
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                  Training Frequency
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>Sessions This Month</span>
                    <span style={{ fontSize: '16px', color: '#22c55e', fontWeight: '600' }}>12 / 12</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    backgroundColor: '#374151', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: '100%', 
                      backgroundColor: '#22c55e',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>Consistency Score</span>
                    <span style={{ fontSize: '16px', color: '#22c55e', fontWeight: '600' }}>95%</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    backgroundColor: '#374151', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: '95%', 
                      backgroundColor: '#22c55e',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>

                {/* Average Session Time */}
                <div style={{ 
                  backgroundColor: '#374151', 
                  padding: '16px', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15', marginBottom: '4px' }}>
                    52 min
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Average Session Duration
                  </div>
                </div>
              </div>
            </div>

            {/* Goals & Targets */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                2026 Strength Goals
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { 
                    exercise: 'Deadlift', 
                    current: 425, 
                    goal: 500, 
                    progress: 85,
                    color: '#ef4444'
                  },
                  { 
                    exercise: 'Bench Press', 
                    current: 275, 
                    goal: 315, 
                    progress: 87,
                    color: '#3b82f6'
                  },
                  { 
                    exercise: 'Squat', 
                    current: 265, 
                    goal: 350, 
                    progress: 76,
                    color: '#eab308'
                  },
                  { 
                    exercise: 'Overhead Press', 
                    current: 175, 
                    goal: 225, 
                    progress: 78,
                    color: '#22c55e'
                  }
                ].map((goal, index: number) => (
                  <div key={index} style={{ 
                    backgroundColor: '#374151', 
                    border: `1px solid ${goal.color}`, 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: goal.color, fontSize: '14px' }}>
                      {goal.exercise}
                    </h4>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '4px' }}>
                      {goal.current} / {goal.goal} lbs
                    </div>
                    <div style={{ 
                      height: '6px', 
                      backgroundColor: '#1f2937', 
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${goal.progress}%`, 
                        backgroundColor: goal.color,
                        borderRadius: '3px'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {goal.progress}% to goal • {goal.goal - goal.current} lbs remaining
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
