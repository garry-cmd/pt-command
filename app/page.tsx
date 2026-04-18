'use client'

import { useState, useEffect } from 'react'
import './globals.css'

export default function PTCommand() {
  const [activeTab, setActiveTab] = useState<'today' | 'program' | 'history' | 'progress'>('today')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)

  // Mock workout session
  const currentSession = {
    id: 'mock-session',
    workout_type: 'heavy' as const,
    week_number: 3,
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

  useEffect(() => {
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
    const exercise = currentSession.exercises[currentExercise]
    if (!exercise) return null
    const currentSetIndex = exercise.sets.findIndex(set => !set.completed)
    return currentSetIndex !== -1 ? { ...exercise.sets[currentSetIndex], index: currentSetIndex } : null
  }

  const completeSet = (actualWeight: number, actualReps: number) => {
    const currentSet = getCurrentSet()
    if (!currentSet) return

    // Update the set as completed (in real app, this would update database)
    currentSession.exercises[currentExercise].sets[currentSet.index].completed = true
    currentSession.exercises[currentExercise].sets[currentSet.index].actual_weight = actualWeight
    currentSession.exercises[currentExercise].sets[currentSet.index].actual_reps = actualReps
    
    // Start rest timer
    const exerciseName = currentSession.exercises[currentExercise].name
    if (exerciseName === 'deadlift') {
      setRestTimer(240) // 4 minutes
      setIsTimerRunning(true)
    } else if (exerciseName === 'bench_press') {
      setRestTimer(180) // 3 minutes  
      setIsTimerRunning(true)
    }
    
    // Force re-render
    setCurrentExercise(currentExercise)
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
            <div style={{ backgroundColor: '#eab308', color: '#000', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
              Week 3 - Monday
            </div>
          </div>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#eab308' }}>
                Today: Heavy Day
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                Workout time: {getTotalWorkoutTime()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#374151', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                Dead 425×1
              </span>
              <span style={{ backgroundColor: '#374151', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                Bench 275×1
              </span>
              <span style={{ backgroundColor: '#eab308', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>
                KB 3×20
              </span>
            </div>
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
          <div className="pt-card">
            
            {/* Exercise Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ borderLeft: '4px solid #eab308', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0', color: '#f1f5f9' }}>
                  {getExerciseDisplayName(currentSession.exercises[currentExercise]?.name)}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                  Heavy Day (90-100%) • Exercise {currentExercise + 1} of {currentSession.exercises.length}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eab308' }}>
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
                      onClick={() => {
                        if (currentExercise < currentSession.exercises.length - 1) {
                          setCurrentExercise(currentExercise + 1)
                          setRestTimer(0)
                          setIsTimerRunning(false)
                        }
                      }}
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
                  <div style={{ border: '2px solid #eab308', borderRadius: '12px', padding: '24px', marginBottom: '16px', backgroundColor: '#1a1a2e' }}>
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
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#eab308', fontFamily: 'monospace' }}>
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
                      onClick={() => {
                        if (currentExercise < currentSession.exercises.length - 1) {
                          setCurrentExercise(currentExercise + 1)
                          setRestTimer(0)
                          setIsTimerRunning(false)
                        }
                      }}
                      disabled={currentExercise >= currentSession.exercises.length - 1}
                      style={{
                        flex: 2,
                        padding: '12px',
                        backgroundColor: currentExercise >= currentSession.exercises.length - 1 ? '#374151' : '#eab308',
                        color: currentExercise >= currentSession.exercises.length - 1 ? '#94a3b8' : '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: currentExercise >= currentSession.exercises.length - 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {currentExercise >= currentSession.exercises.length - 1 ? 'Session Complete' : 'Next Exercise'}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'today' && (
          <div className="pt-card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>⚡</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
            </h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              Under construction - focus on Today tab for workout logging
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
