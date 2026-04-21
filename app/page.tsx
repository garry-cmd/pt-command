'use client';

import React, { useState, useEffect } from 'react';

// Types
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

interface OneRMs {
  squat: number;
  deadlift: number;
  bench: number;
  ohp: number;
}

interface ProgramData {
  [day: string]: {
    [exercise: string]: {
      weeks: Array<{
        setsReps: string;
        weight: number;
      }>;
    };
  };
}

// Helper functions (defined outside component to avoid hoisting issues)
const parseSetReps = (setRepsString: string) => {
  const match = setRepsString.match(/(\d+)[\s×x]?(\d+)/);
  if (match) {
    return {
      sets: parseInt(match[1]),
      reps: parseInt(match[2])
    };
  }
  return { sets: 0, reps: 0 };
};

const calculatePercentage = (weight: number, oneRM: number) => {
  return Math.round((weight / oneRM) * 100);
};

const calculateVolume = (setsReps: string, weight: number) => {
  const { sets, reps } = parseSetReps(setsReps);
  return sets * reps * weight;
};

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState('monday');

  // Today Tab State
  const [editModal, setEditModal] = useState<EditModalData>({
    setItem: null,
    exercise: null,
    isOpen: false
  });
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(0);

  // Program Tab State
  const [oneRMs, setOneRMs] = useState<OneRMs>({
    squat: 385,
    deadlift: 415,
    bench: 200,
    ohp: 210
  });

  const [programData, setProgramData] = useState<ProgramData>({
    monday: {
      squat: {
        weeks: [
          { setsReps: '3×5', weight: 250 },
          { setsReps: '3×5', weight: 255 },
          { setsReps: '3×5', weight: 260 },
          { setsReps: '3×5', weight: 265 }
        ]
      },
      ohp: {
        weeks: [
          { setsReps: '3×5', weight: 155 },
          { setsReps: '3×5', weight: 157 },
          { setsReps: '3×5', weight: 159 },
          { setsReps: '3×5', weight: 162 }
        ]
      }
    },
    wednesday: {
      squat: {
        weeks: [
          { setsReps: '2×5', weight: 225 },
          { setsReps: '2×5', weight: 230 },
          { setsReps: '2×5', weight: 235 },
          { setsReps: '2×5', weight: 240 }
        ]
      }
    },
    friday: {
      squat: {
        weeks: [
          { setsReps: '1×5', weight: 305 },
          { setsReps: '1×3', weight: 320 },
          { setsReps: '1×2', weight: 335 },
          { setsReps: '1×5', weight: 315 }
        ]
      }
    }
  });

  // Generate today's exercises from program
  const getTodaysExercises = (): Exercise[] => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    let dayKey = 'monday'; // Default
    
    if (today === 1) dayKey = 'monday';
    else if (today === 2) dayKey = 'tuesday';
    else if (today === 3) dayKey = 'wednesday';
    else if (today === 5) dayKey = 'friday';

    const todayProgram = programData[dayKey] || {};
    const exercises: Exercise[] = [];

    Object.entries(todayProgram).forEach(([exerciseName, exerciseData], index) => {
      const weekData = exerciseData.weeks[currentWeek - 1];
      if (!weekData) return;

      const sets = parseSetReps(weekData.setsReps);
      const exerciseSets: Set[] = [];

      for (let i = 1; i <= sets.sets; i++) {
        exerciseSets.push({
          id: index * 10 + i,
          setNumber: i,
          prescribed: { weight: weekData.weight, reps: sets.reps },
          completed: false
        });
      }

      exercises.push({
        id: index + 1,
        name: exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1),
        description: `Week ${currentWeek} • ${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}`,
        sets: exerciseSets,
        completed: false
      });
    });

    return exercises;
  };

  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Initialize exercises
  useEffect(() => {
    setExercises(getTodaysExercises());
  }, [currentWeek, programData]);

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

  const updateProgramData = (day: string, exercise: string, week: number, field: 'setsReps' | 'weight', value: string | number) => {
    setProgramData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [exercise]: {
          ...prev[day]?.[exercise],
          weeks: prev[day]?.[exercise]?.weeks.map((weekData, index) => 
            index === week - 1 
              ? { ...weekData, [field]: value }
              : weekData
          ) || []
        }
      }
    }));
  };

  const updateOneRM = (exercise: keyof OneRMs, value: number) => {
    setOneRMs(prev => ({ ...prev, [exercise]: value }));
  };

  if (currentTab === 'today') {
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
          {[
            { key: 'today', label: 'Today' },
            { key: 'program', label: 'Program' },
            { key: 'history', label: 'History' },
            { key: 'progress', label: 'Progress' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              style={{
                flex: 1,
                background: currentTab === tab.key ? '#4ade80' : 'transparent',
                color: currentTab === tab.key ? '#000' : '#888',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Today Content */}
        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
              Today's Workout
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              Week {currentWeek} • Adjust as needed
            </div>
          </div>

          {/* Week Selector */}
          <div style={{ 
            background: '#111', 
            borderRadius: '12px', 
            padding: '12px', 
            marginBottom: '24px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {[1, 2, 3, 4].map(week => (
              <button
                key={week}
                onClick={() => setCurrentWeek(week)}
                style={{
                  background: currentWeek === week ? '#4ade80' : '#333',
                  color: currentWeek === week ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Week {week}
              </button>
            ))}
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
                            cursor: 'pointer'
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
                            cursor: 'pointer'
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
                      cursor: 'pointer'
                    }}
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
                      cursor: 'pointer'
                    }}
                  >
                    Save & Complete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentTab === 'program') {
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
          {[
            { key: 'today', label: 'Today' },
            { key: 'program', label: 'Program' },
            { key: 'history', label: 'History' },
            { key: 'progress', label: 'Progress' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              style={{
                flex: 1,
                background: currentTab === tab.key ? '#4ade80' : 'transparent',
                color: currentTab === tab.key ? '#000' : '#888',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Program Content */}
        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
              4-Week Program
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              Plan your progression cycle
            </div>
          </div>

          {/* 1RM Section */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#4ade80', marginBottom: '16px' }}>
              Current 1RM Estimates
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(oneRMs).map(([exercise, value]) => (
                <div key={exercise} style={{
                  background: '#0a0a0a',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    {exercise.toUpperCase()}
                  </div>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateOneRM(exercise as keyof OneRMs, Number(e.target.value))}
                    style={{
                      background: '#222',
                      border: '2px solid #333',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#fff',
                      textAlign: 'center',
                      width: '100%',
                      fontFamily: '"JetBrains Mono", monospace'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Day Tabs */}
          <div style={{
            background: '#111',
            borderRadius: '12px',
            padding: '6px',
            marginBottom: '24px',
            display: 'flex',
            gap: '4px'
          }}>
            {['monday', 'tuesday', 'wednesday', 'friday'].map(day => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                style={{
                  flex: 1,
                  background: currentDay === day ? '#4ade80' : 'transparent',
                  color: currentDay === day ? '#000' : '#888',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
              >
                {day} ({day === 'monday' ? 'Volume' : 
                       day === 'tuesday' ? 'Active' : 
                       day === 'wednesday' ? 'Light' : 'Heavy'})
              </button>
            ))}
          </div>

          {/* Program Table */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #333'
          }}>
            {Object.entries(programData[currentDay] || {}).map(([exerciseName, exerciseData]) => (
              <div key={exerciseName} style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#fbbf24', 
                  marginBottom: '16px',
                  textTransform: 'capitalize'
                }}>
                  {exerciseName}
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr>
                        <th style={{ 
                          background: '#1a1a1a', 
                          padding: '12px', 
                          textAlign: 'left', 
                          border: '1px solid #333',
                          color: '#4ade80'
                        }}>
                          Metric
                        </th>
                        {[1, 2, 3, 4].map(week => (
                          <th key={week} style={{ 
                            background: '#1a1a1a', 
                            padding: '12px', 
                            textAlign: 'center', 
                            border: '1px solid #333',
                            color: '#4ade80'
                          }}>
                            Week {week}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sets × Reps */}
                      <tr>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #222', 
                          background: '#0a0a0a',
                          color: '#ccc'
                        }}>
                          Sets × Reps
                        </td>
                        {exerciseData.weeks.map((weekData, weekIndex) => (
                          <td key={weekIndex} style={{ 
                            padding: '12px', 
                            border: '1px solid #222', 
                            background: '#0a0a0a',
                            textAlign: 'center'
                          }}>
                            <input
                              type="text"
                              value={weekData.setsReps}
                              onChange={(e) => updateProgramData(currentDay, exerciseName, weekIndex + 1, 'setsReps', e.target.value)}
                              style={{
                                background: 'transparent',
                                border: '1px solid transparent',
                                color: '#4ade80',
                                textAlign: 'center',
                                width: '100%',
                                padding: '4px',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '14px',
                                fontWeight: 600,
                                borderRadius: '4px'
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                      
                      {/* Weight */}
                      <tr>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #222', 
                          background: '#0a0a0a',
                          color: '#ccc'
                        }}>
                          Weight
                        </td>
                        {exerciseData.weeks.map((weekData, weekIndex) => (
                          <td key={weekIndex} style={{ 
                            padding: '12px', 
                            border: '1px solid #222', 
                            background: '#0a0a0a',
                            textAlign: 'center'
                          }}>
                            <input
                              type="number"
                              value={weekData.weight}
                              onChange={(e) => updateProgramData(currentDay, exerciseName, weekIndex + 1, 'weight', Number(e.target.value))}
                              style={{
                                background: 'transparent',
                                border: '1px solid transparent',
                                color: '#fff',
                                textAlign: 'center',
                                width: '100%',
                                padding: '4px',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '14px',
                                fontWeight: 600,
                                borderRadius: '4px'
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                      
                      {/* Percentage */}
                      <tr>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #222', 
                          background: '#0a0a0a',
                          color: '#ccc'
                        }}>
                          % 1RM
                        </td>
                        {exerciseData.weeks.map((weekData, weekIndex) => {
                          const exerciseKey = exerciseName.toLowerCase() as keyof OneRMs;
                          const oneRM = oneRMs[exerciseKey] || oneRMs.squat;
                          return (
                            <td key={weekIndex} style={{ 
                              padding: '12px', 
                              border: '1px solid #222', 
                              background: '#0a0a0a',
                              textAlign: 'center',
                              color: '#fbbf24',
                              fontStyle: 'italic'
                            }}>
                              {calculatePercentage(weekData.weight, oneRM)}%
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Volume */}
                      <tr>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #222', 
                          background: '#0a0a0a',
                          color: '#ccc'
                        }}>
                          Volume
                        </td>
                        {exerciseData.weeks.map((weekData, weekIndex) => (
                          <td key={weekIndex} style={{ 
                            padding: '12px', 
                            border: '1px solid #222', 
                            background: '#0a0a0a',
                            textAlign: 'center',
                            color: '#8b5cf6',
                            fontStyle: 'italic'
                          }}>
                            {calculateVolume(weekData.setsReps, weekData.weight)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Other tabs
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
        {[
          { key: 'today', label: 'Today' },
          { key: 'program', label: 'Program' },
          { key: 'history', label: 'History' },
          { key: 'progress', label: 'Progress' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            style={{
              flex: 1,
              background: currentTab === tab.key ? '#4ade80' : 'transparent',
              color: currentTab === tab.key ? '#000' : '#888',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} View</h2>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}
