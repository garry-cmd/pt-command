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

interface EditModalData {
  setItem: Set | null;
  exercise: Exercise | null;
  isOpen: boolean;
}

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [editModal, setEditModal] = useState<EditModalData>({
    setItem: null,
    exercise: null,
    isOpen: false
  });
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(0);

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
        { id: 3, setNumber: 3, prescribed: { weight: 245, reps: 1 }, actual: { weight: 250, reps: 1 }, completed: true },
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
      sets: [
        { id: 9, setNumber: 1, prescribed: { weight: 53, reps: 10 }, completed: false }
      ]
    }
  ]);

  const openEdit = (set: Set, exercise: Exercise) => {
    setEditModal({ setItem: set, exercise, isOpen: true });
    setEditWeight(set.prescribed.weight);
    setEditReps(set.prescribed.reps);
  };

  const closeEdit = () => {
    setEditModal({ setItem: null, exercise: null, isOpen: false });
  };

  const saveEdit = () => {
    if (!editModal.setItem || !editModal.exercise) return;

    setExercises(prev => prev.map(exercise => {
      if (exercise.id === editModal.exercise!.id) {
        const updatedSets = exercise.sets.map(set => {
          if (set.id === editModal.setItem!.id) {
            return {
              ...set,
              actual: { weight: editWeight, reps: editReps },
              completed: true
            };
          }
          return set;
        });

        const allSetsCompleted = updatedSets.every(set => set.completed);

        return {
          ...exercise,
          sets: updatedSets,
          completed: allSetsCompleted
        };
      }
      return exercise;
    }));

    closeEdit();
  };

  const adjustWeight = (delta: number) => {
    setEditWeight(prev => Math.max(0, prev + delta));
  };

  const adjustReps = (delta: number) => {
    setEditReps(prev => Math.max(0, prev + delta));
  };

  const getExerciseStatus = (exercise: Exercise) => {
    if (exercise.completed) return 'complete';
    if (exercise.sets.some(set => set.completed)) return 'active';
    return 'pending';
  };

  const TodayView = () => (
    <div style={{ padding: '20px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Flow Explanation */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        borderLeft: '4px solid #4ade80'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#4ade80',
          marginBottom: '12px'
        }}>
          Real-World Workout
        </div>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
          <strong>1.</strong> Tap any set to edit weight/reps
        </div>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
          <strong>2.</strong> Adjust based on how you feel
        </div>
        <div style={{ fontSize: '14px', color: '#ccc' }}>
          <strong>3.</strong> Save to log actual performance
        </div>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
          Today's Workout
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          Medium Day • Adjust as needed
        </div>
      </div>

      {/* Exercises */}
      {exercises.map(exercise => (
        <div key={exercise.id} style={{
          marginBottom: '32px',
          background: '#111',
          borderRadius: '16px',
          padding: '20px'
        }}>
          {/* Exercise Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
              {exercise.name}
            </span>
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: getExerciseStatus(exercise) === 'complete' ? '#22c55e' : 
                         getExerciseStatus(exercise) === 'active' ? '#fbbf24' : '#666',
              color: getExerciseStatus(exercise) === 'complete' || getExerciseStatus(exercise) === 'active' ? '#000' : '#fff'
            }}>
              {getExerciseStatus(exercise) === 'complete' ? 'Complete' :
               getExerciseStatus(exercise) === 'active' ? 'Active' : 'Pending'}
            </div>
          </div>

          {/* Sets */}
          {exercise.sets.map(set => (
            <div
              key={set.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 0',
                borderBottom: '1px solid #222',
                cursor: set.completed ? 'default' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => !set.completed && openEdit(set, exercise)}
              onMouseEnter={(e) => {
                if (!set.completed) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.margin = '0 -16px';
                  e.currentTarget.style.padding = '16px';
                  e.currentTarget.style.borderRadius = '8px';
                }
              }}
              onMouseLeave={(e) => {
                if (!set.completed) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.margin = '0';
                  e.currentTarget.style.padding = '16px 0';
                  e.currentTarget.style.borderRadius = '0';
                }
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: '24px',
                height: '24px',
                background: set.completed ? '#4ade80' : '#222',
                border: `2px solid ${set.completed ? '#4ade80' : '#444'}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#000',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                {set.completed && '✓'}
              </div>

              {/* Set Content */}
              <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '15px',
                  color: set.completed ? '#666' : '#ccc',
                  textDecoration: set.completed ? 'line-through' : 'none'
                }}>
                  Set {set.setNumber}
                </div>

                <div style={{ textAlign: 'right' }}>
                  {set.completed && set.actual ? (
                    <>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        Prescribed: {set.prescribed.weight} × {set.prescribed.reps}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>
                        Actual: {set.actual.weight} × {set.actual.reps}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        {set.prescribed.weight} × {set.prescribed.reps}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                        Tap to adjust
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
        >
          <div style={{
            background: '#111',
            borderRadius: '20px',
            padding: '32px',
            width: '320px',
            border: '1px solid #333'
          }}>
            {/* Title */}
            <div style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Set {editModal.setItem?.setNumber} - {editModal.exercise?.name}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#888',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Adjust based on how you feel
            </div>

            {/* Prescribed Info */}
            <div style={{
              background: '#0a0a0a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                Prescribed
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#888',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {editModal.setItem?.prescribed.weight} × {editModal.setItem?.prescribed.reps}
              </div>
            </div>

            {/* Edit Inputs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Weight
                </div>
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  style={{
                    background: '#222',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'center',
                    width: '100%',
                    fontFamily: '"JetBrains Mono", monospace',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px',
                  justifyContent: 'center'
                }}>
                  {[-10, -5, 5, 10].map(delta => (
                    <button
                      key={delta}
                      onClick={() => adjustWeight(delta)}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.1s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#4ade80';
                        e.currentTarget.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#333';
                        e.currentTarget.style.color = '#fff';
                      }}
                    >
                      {delta > 0 ? '+' : ''}{delta}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Reps
                </div>
                <input
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(Number(e.target.value))}
                  style={{
                    background: '#222',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'center',
                    width: '100%',
                    fontFamily: '"JetBrains Mono", monospace',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px',
                  justifyContent: 'center'
                }}>
                  {[-1, 1].map(delta => (
                    <button
                      key={delta}
                      onClick={() => adjustReps(delta)}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.1s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#4ade80';
                        e.currentTarget.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#333';
                        e.currentTarget.style.color = '#fff';
                      }}
                    >
                      {delta > 0 ? '+' : ''}{delta}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={closeEdit}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  background: '#4ade80',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#22c55e'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#4ade80'}
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      background: '#000',
      minHeight: '100vh',
      color: '#fff'
    }}>
      {/* Navigation */}
      <div style={{
        display: 'flex',
        background: '#111',
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
              background: currentTab === tab ? '#4ade80' : 'transparent',
              color: currentTab === tab ? '#000' : '#888',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
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
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} View</h2>
          <p>Coming soon...</p>
        </div>
      )}
    </div>
  );
}
