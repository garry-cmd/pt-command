'use client';

import React, { useState, useEffect } from 'react';

interface Set {
  id: number;
  setNumber: number;
  prescribed: { weight: number; reps: number };
  actual?: { weight: number; reps: number };
  completed: boolean;
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  sets: Set[];
  completed: boolean;
}

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [workoutTime, setWorkoutTime] = useState(23); // minutes
  const [restTimer, setRestTimer] = useState(151); // seconds
  const [showRestTimer, setShowRestTimer] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Current exercise and set tracking
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(1); // Start with Overhead Press (index 1)
  const [currentWeight, setCurrentWeight] = useState(155);
  const [currentReps, setCurrentReps] = useState(1);

  // Sample workout data
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: 1,
      name: 'Squats',
      description: '70-85% Training Max • Moderate intensity',
      completed: true,
      sets: [
        { id: 1, setNumber: 1, prescribed: { weight: 225, reps: 5 }, actual: { weight: 220, reps: 5 }, completed: true },
        { id: 2, setNumber: 2, prescribed: { weight: 235, reps: 3 }, actual: { weight: 235, reps: 3 }, completed: true },
        { id: 3, setNumber: 3, prescribed: { weight: 245, reps: 1 }, actual: { weight: 245, reps: 2 }, completed: true },
        { id: 4, setNumber: 4, prescribed: { weight: 215, reps: 8 }, actual: { weight: 215, reps: 8 }, completed: true }
      ]
    },
    {
      id: 2,
      name: 'Overhead Press',
      description: '70-85% Training Max • Moderate intensity',
      completed: false,
      sets: [
        { id: 5, setNumber: 1, prescribed: { weight: 135, reps: 5 }, actual: { weight: 135, reps: 5 }, completed: true },
        { id: 6, setNumber: 2, prescribed: { weight: 145, reps: 3 }, actual: { weight: 145, reps: 3 }, completed: true },
        { id: 7, setNumber: 3, prescribed: { weight: 155, reps: 1 }, completed: false },
        { id: 8, setNumber: 4, prescribed: { weight: 125, reps: 8 }, completed: false }
      ]
    },
    {
      id: 3,
      name: 'Kettlebell Swings',
      description: 'Conditioning • High intensity',
      completed: false,
      sets: Array.from({ length: 10 }, (_, i) => ({
        id: 9 + i,
        setNumber: i + 1,
        prescribed: { weight: 53, reps: 10 },
        completed: false
      }))
    }
  ]);

  // Rest timer countdown
  useEffect(() => {
    if (showRestTimer && restTimer > 0) {
      const timer = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showRestTimer, restTimer]);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentExercise = () => exercises[currentExerciseIndex];
  const getCurrentSet = () => {
    const exercise = getCurrentExercise();
    return exercise.sets.find(set => !set.completed);
  };

  const getCompletedExercises = () => exercises.filter(ex => ex.completed).length;

  const completeSet = () => {
    const currentSet = getCurrentSet();
    if (!currentSet) return;

    setExercises(prev => prev.map((exercise, idx) => {
      if (idx === currentExerciseIndex) {
        const updatedSets = exercise.sets.map(set => {
          if (set.id === currentSet.id) {
            return {
              ...set,
              actual: { weight: currentWeight, reps: currentReps },
              completed: true
            };
          }
          return set;
        });

        const allSetsCompleted = updatedSets.every(set => set.completed);

        // If this exercise is complete, move to next exercise
        if (allSetsCompleted) {
          setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
              setCurrentExerciseIndex(prev => prev + 1);
              const nextExercise = exercises[currentExerciseIndex + 1];
              const nextSet = nextExercise.sets[0];
              if (nextSet) {
                setCurrentWeight(nextSet.prescribed.weight);
                setCurrentReps(nextSet.prescribed.reps);
              }
            }
          }, 500);
        } else {
          // Move to next set in same exercise
          const nextSet = updatedSets.find(set => !set.completed);
          if (nextSet) {
            setCurrentWeight(nextSet.prescribed.weight);
            setCurrentReps(nextSet.prescribed.reps);
          }
        }

        return {
          ...exercise,
          sets: updatedSets,
          completed: allSetsCompleted
        };
      }
      return exercise;
    }));

    // Start rest timer
    setRestTimer(165); // 2:45
    setShowRestTimer(true);
  };

  const TodayView = () => {
    const currentExercise = getCurrentExercise();
    const currentSet = getCurrentSet();
    const completedSets = currentExercise.sets.filter(set => set.completed);

    return (
      <div style={{ padding: '20px', background: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
        {/* Session Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #475569',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #fbbf24, #fb923c, #fbbf24)'
          }}></div>
          <div style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '14px',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px'
          }}>
            Heavy/Medium/Light Training Protocol
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>
              Today: Medium Day
            </div>
            <div style={{
              display: 'flex',
              gap: '24px',
              fontSize: '14px',
              color: '#94a3b8'
            }}>
              <div>Workout time: {workoutTime}:00</div>
              <div>Exercise: {getCompletedExercises() + 1}/3</div>
            </div>
          </div>
        </div>

        {/* Dual Cards Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Left Card - Program */}
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #475569',
            height: 'fit-content'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '16px',
              color: '#f1f5f9'
            }}>
              Today's Program
            </div>
            
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #475569' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fbbf24', marginBottom: '4px' }}>
                {currentExercise.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {currentExercise.description} • Exercise {currentExerciseIndex + 1} of 3
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentExercise.sets.map((set, index) => (
                <div key={set.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  border: set === currentSet ? '2px solid #fbbf24' : '1px solid transparent',
                  background: set === currentSet ? 'rgba(251, 191, 36, 0.1)' : 
                             set.completed ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                }}>
                  <span style={{ 
                    color: set === currentSet ? '#fbbf24' : set.completed ? '#22c55e' : '#94a3b8',
                    fontWeight: set === currentSet ? 600 : 400 
                  }}>
                    Set {set.setNumber}
                  </span>
                  <span style={{
                    color: '#fbbf24',
                    fontWeight: 600
                  }}>
                    {set.prescribed.weight} lbs × {set.prescribed.reps}
                  </span>
                  {set.completed && (
                    <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                  )}
                  {set === currentSet && (
                    <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 600 }}>ACTIVE</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Card - Logging */}
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #fbbf24',
            position: 'relative',
            height: 'fit-content'
          }}>
            <div style={{
              position: 'absolute',
              top: -1,
              right: 16,
              background: '#fbbf24',
              color: '#0f172a',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '0 0 6px 6px'
            }}>
              ACTIVE
            </div>

            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '16px',
              color: '#f1f5f9'
            }}>
              Log Performance
            </div>

            {currentSet ? (
              <>
                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#fbbf24',
                    marginBottom: '4px'
                  }}>
                    Set {currentSet.setNumber} of {currentExercise.sets.length} - {currentExercise.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Prescribed: {currentSet.prescribed.weight} lbs × {currentSet.prescribed.reps}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      fontSize: '11px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(Number(e.target.value))}
                      style={{
                        background: '#334155',
                        border: '2px solid #475569',
                        borderRadius: '8px',
                        padding: '12px',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '16px',
                        color: '#f1f5f9',
                        textAlign: 'center',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      fontSize: '11px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Reps
                    </label>
                    <input
                      type="number"
                      value={currentReps}
                      onChange={(e) => setCurrentReps(Number(e.target.value))}
                      style={{
                        background: '#334155',
                        border: '2px solid #475569',
                        borderRadius: '8px',
                        padding: '12px',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '16px',
                        color: '#f1f5f9',
                        textAlign: 'center',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={completeSet}
                  style={{
                    width: '100%',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = '#22c55e';
                  }}
                >
                  Complete Set
                </button>

                {completedSets.length > 0 && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid #475569'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Completed Sets
                    </div>
                    {completedSets.map(set => (
                      <div key={set.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#22c55e'
                      }}>
                        <span>Set {set.setNumber}: {set.actual?.weight} × {set.actual?.reps}</span>
                        <span>✓</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                  {currentExercise.name} Complete!
                </div>
                <div style={{ fontSize: '14px' }}>
                  Moving to next exercise...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px'
        }}>
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              onClick={() => {
                setCurrentExerciseIndex(index);
                const firstIncompleteSet = exercise.sets.find(set => !set.completed);
                if (firstIncompleteSet) {
                  setCurrentWeight(firstIncompleteSet.prescribed.weight);
                  setCurrentReps(firstIncompleteSet.prescribed.reps);
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: index === currentExerciseIndex ? '#fbbf24' : 
                           exercise.completed ? '#22c55e' : '#475569',
                background: index === currentExerciseIndex ? 'rgba(251, 191, 36, 0.1)' :
                           exercise.completed ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                color: index === currentExerciseIndex ? '#fbbf24' :
                       exercise.completed ? '#22c55e' : '#94a3b8',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {exercise.name}
            </button>
          ))}
        </div>

        {/* Rest Timer */}
        {showRestTimer && restTimer > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#1e293b',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: 700,
            color: '#fbbf24',
            fontSize: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          }}>
            Rest Timer: {formatTime(restTimer)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace',
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f1f5f9'
    }}>
      {/* Navigation */}
      <div style={{
        display: 'flex',
        background: '#1e293b',
        borderRadius: '16px',
        padding: '8px',
        margin: '24px 20px',
        gap: '8px'
      }}>
        {['today', 'program', 'history', 'progress'].map(tab => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            style={{
              flex: 1,
              background: currentTab === tab ? '#fbbf24' : 'transparent',
              color: currentTab === tab ? '#0f172a' : '#94a3b8',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {currentTab === 'today' && <TodayView />}
      {currentTab !== 'today' && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} View</h2>
          <p>Coming soon...</p>
        </div>
      )}
    </div>
  );
}
