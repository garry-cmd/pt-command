'use client';

import React, { useState, useEffect } from 'react';

interface Set {
  id: number;
  setNumber: number;
  prescribed: { weight: number; reps: number };
  actual?: { weight: number; reps: number };
  completed: boolean;
  active: boolean;
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

  // Sample workout data
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: 1,
      name: 'Squats',
      description: '70-85% Training Max • Moderate intensity • Exercise 1 of 3',
      completed: true,
      sets: [
        {
          id: 1,
          setNumber: 1,
          prescribed: { weight: 225, reps: 5 },
          actual: { weight: 220, reps: 5 },
          completed: true,
          active: false
        },
        {
          id: 2,
          setNumber: 2,
          prescribed: { weight: 235, reps: 3 },
          actual: { weight: 235, reps: 3 },
          completed: true,
          active: false
        },
        {
          id: 3,
          setNumber: 3,
          prescribed: { weight: 245, reps: 1 },
          actual: { weight: 245, reps: 2 },
          completed: true,
          active: false
        },
        {
          id: 4,
          setNumber: 4,
          prescribed: { weight: 215, reps: 8 },
          actual: { weight: 215, reps: 8 },
          completed: true,
          active: false
        }
      ]
    },
    {
      id: 2,
      name: 'Overhead Press',
      description: '70-85% Training Max • Moderate intensity • Exercise 2 of 3',
      completed: false,
      sets: [
        {
          id: 5,
          setNumber: 1,
          prescribed: { weight: 135, reps: 5 },
          actual: { weight: 135, reps: 5 },
          completed: true,
          active: false
        },
        {
          id: 6,
          setNumber: 2,
          prescribed: { weight: 145, reps: 3 },
          actual: { weight: 145, reps: 3 },
          completed: true,
          active: false
        },
        {
          id: 7,
          setNumber: 3,
          prescribed: { weight: 155, reps: 1 },
          completed: false,
          active: true
        },
        {
          id: 8,
          setNumber: 4,
          prescribed: { weight: 125, reps: 8 },
          completed: false,
          active: false
        }
      ]
    },
    {
      id: 3,
      name: 'Kettlebell Swings',
      description: 'Conditioning • High intensity • Exercise 3 of 3',
      completed: false,
      sets: Array.from({ length: 10 }, (_, i) => ({
        id: 9 + i,
        setNumber: i + 1,
        prescribed: { weight: 53, reps: 10 },
        completed: false,
        active: false
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalSets = () => exercises.reduce((total, ex) => total + ex.sets.length, 0);
  const getCompletedSets = () => exercises.reduce((total, ex) => total + ex.sets.filter(set => set.completed).length, 0);
  const getCompletedExercises = () => exercises.filter(ex => ex.completed).length;

  const completeSet = (exerciseId: number, setId: number, weight: number, reps: number) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map(set => {
          if (set.id === setId) {
            return {
              ...set,
              actual: { weight, reps },
              completed: true,
              active: false
            };
          }
          return set;
        });

        // Activate next set
        const currentSetIndex = updatedSets.findIndex(set => set.id === setId);
        if (currentSetIndex < updatedSets.length - 1) {
          updatedSets[currentSetIndex + 1].active = true;
        }

        const allSetsCompleted = updatedSets.every(set => set.completed);

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

  const isExactlyPrescribed = (set: Set) => {
    if (!set.actual) return false;
    return set.actual.weight === set.prescribed.weight && set.actual.reps === set.prescribed.reps;
  };

  const TodayView = () => (
    <div style={{ padding: '20px', background: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* Session Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
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
            <div>Sets completed: {getCompletedSets()}/{getTotalSets()}</div>
            <div>Exercises: {getCompletedExercises()}/3</div>
          </div>
        </div>
      </div>

      {/* Exercise Overview Chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {exercises.map(exercise => (
          <div key={exercise.id} style={{
            background: '#334155',
            border: `2px solid ${exercise.completed ? '#22c55e' : '#475569'}`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}>
            {exercise.name} {exercise.sets.length}×{exercise.sets[0]?.prescribed.reps || '?'}
          </div>
        ))}
      </div>

      {/* Exercise List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {exercises.map(exercise => (
          <ExerciseBlock 
            key={exercise.id} 
            exercise={exercise} 
            onCompleteSet={completeSet}
          />
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
          borderRadius: '16px',
          padding: '16px 24px',
          fontWeight: 700,
          fontSize: '18px',
          color: '#fbbf24',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          Rest Timer: {formatTime(restTimer)}
        </div>
      )}
    </div>
  );

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

interface ExerciseBlockProps {
  exercise: Exercise;
  onCompleteSet: (exerciseId: number, setId: number, weight: number, reps: number) => void;
}

const ExerciseBlock: React.FC<ExerciseBlockProps> = ({ exercise, onCompleteSet }) => {
  const completedSets = exercise.sets.filter(set => set.completed).length;
  const isLocked = exercise.id === 3 && !exercise.sets.some(set => set.completed); // KB swings locked until started

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '20px',
      padding: '24px',
      border: '2px solid #475569',
      position: 'relative',
      overflow: 'hidden',
      opacity: isLocked ? 0.7 : 1
    }}>
      {/* Exercise stripe */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '6px',
        height: '100%',
        background: exercise.completed ? '#22c55e' : '#fbbf24',
        opacity: 0.7
      }}></div>

      {/* Exercise Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #475569'
      }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>
            {exercise.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            lineHeight: 1.6
          }}>
            {exercise.description}
          </div>
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#fbbf24'
        }}>
          {completedSets}/{exercise.sets.length}
        </div>
      </div>

      {/* Sets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {exercise.sets.map((set, index) => (
          <SetCard 
            key={set.id} 
            set={set} 
            exercise={exercise}
            onComplete={onCompleteSet}
            disabled={isLocked || (!set.active && !set.completed && index > 0 && !exercise.sets[index - 1].completed)}
          />
        ))}
      </div>
    </div>
  );
};

interface SetCardProps {
  set: Set;
  exercise: Exercise;
  onComplete: (exerciseId: number, setId: number, weight: number, reps: number) => void;
  disabled: boolean;
}

const SetCard: React.FC<SetCardProps> = ({ set, exercise, onComplete, disabled }) => {
  const [weight, setWeight] = useState(set.prescribed.weight);
  const [reps, setReps] = useState(set.prescribed.reps);

  const getCardClass = () => {
    if (set.completed) return 'completed';
    if (set.active) return 'active';
    return 'pending';
  };

  const getStatusColor = () => {
    if (set.completed) return '#22c55e';
    if (set.active) return '#fbbf24';
    return '#64748b';
  };

  const getBorderColor = () => {
    if (set.completed) return '#22c55e';
    if (set.active) return '#fbbf24';
    return 'transparent';
  };

  const getBackgroundColor = () => {
    if (set.completed) return 'rgba(34, 197, 94, 0.1)';
    if (set.active) return 'rgba(251, 191, 36, 0.1)';
    return '#334155';
  };

  const isExactlyPrescribed = () => {
    if (!set.actual) return false;
    return set.actual.weight === set.prescribed.weight && set.actual.reps === set.prescribed.reps;
  };

  const handleComplete = () => {
    onComplete(exercise.id, set.id, weight, reps);
  };

  return (
    <div style={{
      background: getBackgroundColor(),
      borderRadius: '12px',
      padding: '20px',
      border: `2px solid ${getBorderColor()}`,
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.5 : 1,
      transform: set.active ? 'scale(1.02)' : 'scale(1)'
    }}>
      {/* Set Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontWeight: 700, color: '#f1f5f9' }}>
          Set {set.setNumber} of {exercise.sets.length}
        </span>
        <span style={{
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: 500,
          background: set.completed ? '#22c55e' : set.active ? '#fbbf24' : '#0f172a',
          color: set.completed ? 'white' : set.active ? '#0f172a' : '#64748b',
          border: !set.completed && !set.active ? '1px solid #475569' : 'none'
        }}>
          {set.completed ? '✓' : set.active ? 'ACTIVE' : 'PENDING'}
        </span>
      </div>

      {/* Prescribed Info */}
      <div style={{
        fontSize: '16px',
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: '16px'
      }}>
        Prescribed: <span style={{ color: '#fbbf24', fontWeight: 700 }}>
          {set.prescribed.weight} lbs × {set.prescribed.reps}
        </span>
      </div>

      {/* Content based on state */}
      {set.completed ? (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#22c55e',
            fontWeight: 500
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>✓</div>
            <span>{set.actual?.weight} lbs × {set.actual?.reps} reps</span>
          </div>
          {isExactlyPrescribed() && (
            <div style={{
              color: '#22c55e',
              fontSize: '12px',
              marginTop: '8px',
              fontWeight: 500
            }}>
              ✓ Exactly as prescribed
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                fontSize: '11px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 500,
                display: 'block',
                marginBottom: '6px'
              }}>
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                disabled={disabled || !set.active}
                style={{
                  background: '#0f172a',
                  border: '2px solid #475569',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '16px',
                  fontWeight: 500,
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
                marginBottom: '6px'
              }}>
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                disabled={disabled || !set.active}
                style={{
                  background: '#0f172a',
                  border: '2px solid #475569',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#f1f5f9',
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleComplete}
              disabled={disabled || !set.active}
              style={{
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '14px',
                fontWeight: 500,
                cursor: disabled || !set.active ? 'not-allowed' : 'pointer',
                background: disabled || !set.active ? '#64748b' : '#22c55e',
                color: 'white',
                transition: 'all 0.2s ease',
                opacity: disabled || !set.active ? 0.5 : 1
              }}
            >
              Complete
            </button>
            <button
              disabled={disabled || !set.active}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '14px',
                fontWeight: 500,
                cursor: disabled || !set.active ? 'not-allowed' : 'pointer',
                opacity: disabled || !set.active ? 0.5 : 1
              }}
            >
              Skip
            </button>
          </div>
          {disabled && !set.completed && (
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              marginTop: '8px'
            }}>
              Complete previous set to unlock
            </div>
          )}
        </div>
      )}
    </div>
  );
};
