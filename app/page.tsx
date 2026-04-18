'use client'

import { useState, useEffect } from 'react'
import './globals.css'

export default function PTCommand() {
  const [activeTab, setActiveTab] = useState<'today' | 'program' | 'history' | 'progress'>('today')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)
  const [currentSession, setCurrentSession] = useState<any>(null)

  // Get today's workout based on day of week
  const getTodaysWorkout = () => {
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
            name: 'deadlift' as const,
            sets: [
              { set_number: 1, prescribed_weight: 315, prescribed_reps: 5, actual_weight: 315, actual_reps: 5, completed: true },
              { set_number: 2, prescribed_weight: 360, prescribed_reps: 3, actual_weight: 360, actual_reps: 3, completed: true },
              { set_number: 3, prescribed_weight: 405, prescribed_reps: 1, actual_weight: 405, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 425, prescribed_reps: 1, actual_weight: 425, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'bench_press' as const,
            sets: [
              { set_number: 1, prescribed_weight: 225, prescribed_reps: 5, actual_weight: 225, actual_reps: 5, completed: false },
              { set_number: 2, prescribed_weight: 245, prescribed_reps: 3, actual_weight: 245, actual_reps: 3, completed: false },
              { set_number: 3, prescribed_weight: 265, prescribed_reps: 1, actual_weight: 265, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 275, prescribed_reps: 1, actual_weight: 275, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'kettlebell_swings' as const,
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
            name: 'squat' as const,
            sets: [
              { set_number: 1, prescribed_weight: 190, prescribed_reps: 8, actual_weight: 190, actual_reps: 8, completed: false },
              { set_number: 2, prescribed_weight: 205, prescribed_reps: 6, actual_weight: 205, actual_reps: 6, completed: false },
              { set_number: 3, prescribed_weight: 220, prescribed_reps: 4, actual_weight: 220, actual_reps: 4, completed: false },
              { set_number: 4, prescribed_weight: 220, prescribed_reps: 4, actual_weight: 220, actual_reps: 4, completed: false }
            ]
          },
          {
            name: 'overhead_press' as const,
            sets: [
              { set_number: 1, prescribed_weight: 135, prescribed_reps: 8, actual_weight: 135, actual_reps: 8, completed: false },
              { set_number: 2, prescribed_weight: 145, prescribed_reps: 6, actual_weight: 145, actual_reps: 6, completed: false },
              { set_number: 3, prescribed_weight: 155, prescribed_reps: 4, actual_weight: 155, actual_reps: 4, completed: false },
              { set_number: 4, prescribed_weight: 155, prescribed_reps: 4, actual_weight: 155, actual_reps: 4, completed: false }
            ]
          },
          {
            name: 'kettlebell_swings' as const,
            sets: Array.from({length: 10}, (_, i) => ({
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
            name: 'squat' as const,
            sets: [
              { set_number: 1, prescribed_weight: 220, prescribed_reps: 5, actual_weight: 220, actual_reps: 5, completed: false },
              { set_number: 2, prescribed_weight: 235, prescribed_reps: 3, actual_weight: 235, actual_reps: 3, completed: false },
              { set_number: 3, prescribed_weight: 250, prescribed_reps: 1, actual_weight: 250, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 265, prescribed_reps: 1, actual_weight: 265, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'overhead_press' as const,
            sets: [
              { set_number: 1, prescribed_weight: 145, prescribed_reps: 5, actual_weight: 145, actual_reps: 5, completed: false },
              { set_number: 2, prescribed_weight: 155, prescribed_reps: 3, actual_weight: 155, actual_reps: 3, completed: false },
              { set_number: 3, prescribed_weight: 165, prescribed_reps: 1, actual_weight: 165, actual_reps: 1, completed: false },
              { set_number: 4, prescribed_weight: 175, prescribed_reps: 1, actual_weight: 175, actual_reps: 1, completed: false }
            ]
          },
          {
            name: 'kettlebell_swings' as const,
            sets: Array.from({length: 10}, (_, i) => ({
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

  // Initialize today's workout
  const todaysWorkout = getTodaysWorkout()
  useEffect(() => {
    // Initialize today's workout and set start time
    setCurrentSession(todaysWorkout)
    setWorkoutStartTime(Date.now())
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

  const getCurrentSet = () => {
    if (!currentSession || !currentSession.exercises) return null
    const exercise = currentSession.exercises[currentExercise]
    if (!exercise) return null
    const currentSetIndex = exercise.sets.findIndex(set => !set.completed)
    return currentSetIndex !== -1 ? { ...exercise.sets[currentSetIndex], index: currentSetIndex } : null
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

  const completeSet = (actualWeight: number, actualReps: number) => {
    if (!currentSession) return
    const currentSet = getCurrentSet()
    if (!currentSet) return

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
    } else if (exerciseName === 'squat') {
      setRestTimer(180) // 3 minutes
      setIsTimerRunning(true)
    } else if (exerciseName === 'overhead_press') {
      setRestTimer(120) // 2 minutes
      setIsTimerRunning(true)
    }
    // KB swings don't get rest timer
  }

  const endSession = () => {
    if (confirm('Are you sure you want to end this session? Your progress will be saved.')) {
      // In real app, this would save to database
      alert('Session ended and progress saved!')
      // Could navigate to history or reset to new session
    }
  }

  const nextExercise = () => {
    if (currentExercise < currentSession.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setRestTimer(0)
      setIsTimerRunning(false)
    } else {
      // Session complete
      if (confirm('Congratulations! Session complete. Mark as finished?')) {
        alert('🎉 Session completed successfully! Great work!')
        // In real app, would save completion to database
      }
    }
  }

  const isSessionComplete = () => {
    if (!currentSession || !currentSession.exercises) return false
    return currentSession.exercises.every(exercise => 
      exercise.sets.every(set => set.completed)
    )
  }

  const getCompletedSets = () => {
    return currentSession.exercises[currentExercise]?.sets.filter(set => set.completed) || []
  }

  const getExerciseDisplayName = (name: string): string => {
    const names = {
      'deadlift': 'Deadlifts',
      'bench_press': 'Bench Press',
      'overhead_press': 'Overhead Press',
      'squat': 'Squats',
      'kettlebell_swings': 'Kettlebell Swings'
    }
    return names[name as keyof typeof names] || name
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
                {currentSession.exercises.map((exercise, index) => (
                  <span key={index} style={{ 
                    backgroundColor: '#374151', 
                    color: '#facc15', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontFamily: 'monospace' 
                  }}>
                    {getExerciseDisplayName(exercise.name)} {exercise.sets.length}×{exercise.sets[0]?.prescribed_reps}
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
            ].map(tab => (
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
            ) : currentSession?.exercises && (
              // Workout Content
              <div className="pt-card">
                
                {/* Exercise Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ borderLeft: `4px solid ${currentSession.color}`, paddingLeft: '16px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0', color: '#f1f5f9' }}>
                      {getExerciseDisplayName(currentSession.exercises[currentExercise]?.name)}
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
                          {currentExercise < currentSession.exercises.length - 1 ? 'Next Exercise' : 'Finish Session'}
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div>
                      {/* Current Set */}
                      <div style={{ border: `2px solid ${currentSession.color}`, borderRadius: '12px', padding: '24px', marginBottom: '16px', backgroundColor: '#1a1a2e' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                              Set {currentSet.index + 1} of {currentSession.exercises[currentExercise].sets.length}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9' }}>
                              Prescribed: {currentSet.prescribed_weight} lbs × {currentSet.prescribed_reps}
                            </div>
                          </div>
                          {restTimer > 0 && (
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Rest Timer</div>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: currentSession.color, fontFamily: 'monospace' }}>
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
                                onChange={(e) => updateSetWeight(parseInt(e.target.value) || 0)}
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
                                onChange={(e) => updateSetReps(parseInt(e.target.value) || 0)}
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
                            {getCompletedSets().map((set, index) => (
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
                          disabled={isSessionComplete() && currentExercise >= currentSession.exercises.length - 1}
                          style={{
                            flex: 2,
                            padding: '12px',
                            backgroundColor: isSessionComplete() ? '#22c55e' : currentSession.color,
                            color: isSessionComplete() ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isSessionComplete() ? '🎉 Session Complete!' : 
                           currentExercise >= currentSession.exercises.length - 1 ? 'Finish Session' : 'Next Exercise'}
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* Progress Tab Content */}
        {activeTab === 'progress' && (
          <div>
            {/* Weekly Progress Overview */}
            <div className="pt-card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#f1f5f9' }}>
                Weekly Progress
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                H/M/L completion rate and consistency tracking
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* Current Week */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', border: '2px solid #eab308' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#eab308', marginBottom: '12px' }}>
                    Week 16 (Current)
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#f1f5f9' }}>Heavy Day</span>
                    <span style={{ color: '#22c55e', fontWeight: '600' }}>✓ Completed</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#f1f5f9' }}>Light Day</span>
                    <span style={{ color: '#94a3b8' }}>○ Scheduled</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#f1f5f9' }}>Medium Day</span>
                    <span style={{ color: '#94a3b8' }}>○ Scheduled</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#eab308' }}>
                    Progress: 1/3 (33%)
                  </div>
                </div>

                {/* Previous Weeks */}
                {[
                  { week: 15, heavy: true, light: true, medium: true, percentage: 100 },
                  { week: 14, heavy: true, light: false, medium: true, percentage: 67 },
                  { week: 13, heavy: true, light: true, medium: true, percentage: 100 }
                ].map((week, index) => (
                  <div key={index} style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>
                      Week {week.week}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#f1f5f9' }}>Heavy Day</span>
                      <span style={{ color: week.heavy ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                        {week.heavy ? '✓' : '✗'} {week.heavy ? 'Completed' : 'Missed'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#f1f5f9' }}>Light Day</span>
                      <span style={{ color: week.light ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                        {week.light ? '✓' : '✗'} {week.light ? 'Completed' : 'Missed'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#f1f5f9' }}>Medium Day</span>
                      <span style={{ color: week.medium ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                        {week.medium ? '✓' : '✗'} {week.medium ? 'Completed' : 'Missed'}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: week.percentage === 100 ? '#22c55e' : week.percentage >= 67 ? '#eab308' : '#ef4444'
                    }}>
                      Completion: {week.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength Progression */}
            <div className="pt-card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Strength Progression (Last 12 Weeks)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Deadlift Progression */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '16px' }}>
                    Deadlift Progression
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { week: 'Week 16', weight: 450, change: '+15' },
                      { week: 'Week 13', weight: 435, change: '+10' },
                      { week: 'Week 10', weight: 425, change: '+15' },
                      { week: 'Week 7', weight: 410, change: '+5' },
                      { week: 'Week 4', weight: 405, change: '+10' }
                    ].map((entry, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>{entry.week}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f1f5f9', fontWeight: '600', fontFamily: 'monospace' }}>
                            {entry.weight} lbs
                          </span>
                          <span style={{ color: '#22c55e', fontSize: '12px', fontFamily: 'monospace' }}>
                            +{entry.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#374151', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Total Gain (12 weeks)</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>+45 lbs</div>
                  </div>
                </div>

                {/* Bench Press Progression */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6', marginBottom: '16px' }}>
                    Bench Press Progression
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { week: 'Week 16', weight: 275, change: '+10' },
                      { week: 'Week 13', weight: 265, change: '+10' },
                      { week: 'Week 10', weight: 255, change: '+5' },
                      { week: 'Week 7', weight: 250, change: '+10' },
                      { week: 'Week 4', weight: 240, change: '+5' }
                    ].map((entry, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>{entry.week}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f1f5f9', fontWeight: '600', fontFamily: 'monospace' }}>
                            {entry.weight} lbs
                          </span>
                          <span style={{ color: '#22c55e', fontSize: '12px', fontFamily: 'monospace' }}>
                            +{entry.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#374151', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Total Gain (12 weeks)</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>+35 lbs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Analytics */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Training Analytics
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Consistency */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
                    89%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Consistency Rate
                  </div>
                  <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
                    34/38 sessions completed
                  </div>
                </div>

                {/* Average Session Time */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eab308', marginBottom: '8px' }}>
                    46m
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Avg Session Time
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Range: 32-58 minutes
                  </div>
                </div>

                {/* Volume Increase */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                    +23%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Volume Increase
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
                    vs. 12 weeks ago
                  </div>
                </div>

                {/* Current Streak */}
                <div style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                    7
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Week Streak
                  </div>
                  <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                    Personal best!
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>
                  Current Goals
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { goal: 'Deadlift 500 lbs', current: 450, target: 500, progress: 90 },
                    { goal: 'Bench Press 300 lbs', current: 275, target: 300, progress: 92 },
                    { goal: 'Complete 4 weeks straight', current: 7, target: 4, progress: 100, completed: true }
                  ].map((goal, index) => (
                    <div key={index} style={{ 
                      backgroundColor: '#1a1a2e', 
                      padding: '12px', 
                      borderRadius: '6px',
                      border: goal.completed ? '1px solid #22c55e' : '1px solid #374151'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>
                          {goal.goal}
                          {goal.completed && <span style={{ marginLeft: '8px', color: '#22c55e' }}>🎉</span>}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '4px', 
                        backgroundColor: '#374151', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${goal.progress}%`, 
                          height: '100%', 
                          backgroundColor: goal.completed ? '#22c55e' : '#eab308',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      {!goal.completed && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          {typeof goal.current === 'number' && typeof goal.target === 'number' ? 
                            `${goal.target - goal.current} lbs to go` : 
                            'In progress'
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div>
            {/* Recent Sessions */}
            <div className="pt-card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#f1f5f9' }}>
                Recent Sessions
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                Your last 10 workouts with completion status and key lifts
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { date: '2026-04-16', type: 'Heavy', completed: true, deadlift: '425×1', bench: '275×1', duration: '52 min', pr: true },
                  { date: '2026-04-14', type: 'Light', completed: true, squat: '225×4×2', ohp: '135×4×2', duration: '38 min', pr: false },
                  { date: '2026-04-12', type: 'Medium', completed: true, squat: '265×1', ohp: '155×1', duration: '45 min', pr: false },
                  { date: '2026-04-09', type: 'Heavy', completed: true, deadlift: '405×1', bench: '265×1', duration: '48 min', pr: false },
                  { date: '2026-04-07', type: 'Light', completed: false, squat: '215×6', ohp: '125×6', duration: '25 min', pr: false },
                  { date: '2026-04-05', type: 'Medium', completed: true, squat: '255×1', ohp: '150×1', duration: '42 min', pr: false }
                ].map((session, index) => (
                  <div key={index} style={{ 
                    border: `1px solid ${session.completed ? '#22c55e' : '#ef4444'}`, 
                    borderRadius: '8px', 
                    padding: '16px', 
                    backgroundColor: session.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                            {session.type} Day
                            {session.pr && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#eab308', fontWeight: 'bold' }}>🏆 PR!</span>}
                          </div>
                          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                            {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: session.completed ? '#22c55e' : '#ef4444',
                          fontWeight: '600'
                        }}>
                          {session.completed ? '✓ COMPLETED' : '✗ INCOMPLETE'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {session.duration}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {session.deadlift && (
                        <span style={{ backgroundColor: '#374151', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                          Dead: {session.deadlift}
                        </span>
                      )}
                      {session.bench && (
                        <span style={{ backgroundColor: '#374151', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                          Bench: {session.bench}
                        </span>
                      )}
                      {session.squat && (
                        <span style={{ backgroundColor: '#374151', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                          Squat: {session.squat}
                        </span>
                      )}
                      {session.ohp && (
                        <span style={{ backgroundColor: '#374151', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                          OHP: {session.ohp}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Records */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Personal Records
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {[
                  { 
                    exercise: 'Deadlift', 
                    current: 450, 
                    previous: 435, 
                    date: '2026-04-16',
                    trend: 'up'
                  },
                  { 
                    exercise: 'Bench Press', 
                    current: 275, 
                    previous: 265, 
                    date: '2026-04-16',
                    trend: 'up'
                  },
                  { 
                    exercise: 'Squat', 
                    current: 315, 
                    previous: 315, 
                    date: '2026-03-28',
                    trend: 'same'
                  },
                  { 
                    exercise: 'Overhead Press', 
                    current: 185, 
                    previous: 180, 
                    date: '2026-04-03',
                    trend: 'up'
                  }
                ].map((pr, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#1a1a2e', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    border: `2px solid ${pr.trend === 'up' ? '#22c55e' : pr.trend === 'same' ? '#eab308' : '#ef4444'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                        {pr.exercise}
                      </div>
                      <div style={{ 
                        fontSize: '20px',
                        color: pr.trend === 'up' ? '#22c55e' : pr.trend === 'same' ? '#eab308' : '#ef4444'
                      }}>
                        {pr.trend === 'up' ? '📈' : pr.trend === 'same' ? '➖' : '📉'}
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '4px' }}>
                      {pr.current} lbs
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                      Previous: {pr.previous} lbs
                      {pr.trend === 'up' && (
                        <span style={{ color: '#22c55e', marginLeft: '8px' }}>
                          (+{pr.current - pr.previous})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(pr.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'program' && (
          <div>
            {/* Program Overview */}
            <div className="pt-card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#f1f5f9' }}>
                H/M/L Training Programs
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                Heavy/Medium/Light protocol with progressive overload. Customize your upcoming workouts.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {/* Heavy Day Program */}
                <div style={{ border: '1px solid #374151', borderRadius: '12px', padding: '16px', backgroundColor: '#1a1a2e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', margin: 0 }}>Heavy Day</h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>Monday</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                    90-100% Training Max • Max effort singles
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>Deadlifts</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>70%×5, 80%×3, 90%×1, 94%×1</div>
                    </div>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>Bench Press</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>70%×5, 80%×3, 90%×1, 94%×1</div>
                    </div>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>KB Swings</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>3×20 for time</div>
                    </div>
                  </div>
                  <button className="pt-button-primary" style={{ width: '100%', marginTop: '12px', fontSize: '14px' }}>
                    Edit Program
                  </button>
                </div>

                {/* Light Day Program */}
                <div style={{ border: '1px solid #374151', borderRadius: '12px', padding: '16px', backgroundColor: '#1a1a2e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e', margin: 0 }}>Light Day</h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>Wednesday</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                    60-70% Training Max • Volume work
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>Squats</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>60%×8, 65%×6, 70%×4, 70%×4</div>
                    </div>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>Overhead Press</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>60%×8, 65%×6, 70%×4, 70%×4</div>
                    </div>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>KB Swings</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>10×20, 1min rest</div>
                    </div>
                  </div>
                  <button className="pt-button-primary" style={{ width: '100%', marginTop: '12px', fontSize: '14px' }}>
                    Edit Program
                  </button>
                </div>

                {/* Medium Day Program */}
                <div style={{ border: '1px solid #374151', borderRadius: '12px', padding: '16px', backgroundColor: '#1a1a2e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#eab308', margin: 0 }}>Medium Day</h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>Friday</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                    70-85% Training Max • Moderate intensity
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>Squats</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>70%×5, 75%×3, 80%×1, 85%×1</div>
                    </div>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>Overhead Press</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>70%×5, 75%×3, 80%×1, 85%×1</div>
                    </div>
                    <div style={{ backgroundColor: '#374151', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>KB Swings</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>10×10, 1min rest</div>
                    </div>
                  </div>
                  <button className="pt-button-primary" style={{ width: '100%', marginTop: '12px', fontSize: '14px' }}>
                    Edit Program
                  </button>
                </div>
              </div>
            </div>

            {/* 1RM Settings */}
            <div className="pt-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#f1f5f9' }}>
                Training Maxes (90% of 1RM)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { exercise: 'Deadlift', oneRM: 450, trainingMax: 405 },
                  { exercise: 'Bench Press', oneRM: 275, trainingMax: 250 },
                  { exercise: 'Squat', oneRM: 315, trainingMax: 285 },
                  { exercise: 'Overhead Press', oneRM: 185, trainingMax: 170 }
                ].map((lift, index) => (
                  <div key={index} style={{ backgroundColor: '#1a1a2e', padding: '16px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>
                      {lift.exercise}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                          1RM
                        </label>
                        <input
                          type="number"
                          value={lift.oneRM}
                          style={{ 
                            width: '100%', 
                            padding: '6px 8px', 
                            backgroundColor: '#374151',
                            border: '1px solid #4b5563',
                            borderRadius: '4px',
                            color: '#f1f5f9',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                          Training Max
                        </label>
                        <input
                          type="number"
                          value={lift.trainingMax}
                          style={{ 
                            width: '100%', 
                            padding: '6px 8px', 
                            backgroundColor: '#374151',
                            border: '1px solid #4b5563',
                            borderRadius: '4px',
                            color: '#f1f5f9',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="pt-button-primary" style={{ marginTop: '16px' }}>
                Update Training Maxes
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
