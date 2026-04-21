'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://vvuysqzgscdsmqgmlqwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXlzcXpnc2Nkc21xZ21scXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTYzNTIsImV4cCI6MjA5MjI3MjM1Mn0.nYT1vQ2I52lY_sS7yOQIf-NbXKr0YLUCnJdx_sxDCPE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface Set {
  id: string;
  setNumber: number;
  prescribed: { weight: number; reps: number };
  actual?: { weight: number; reps: number };
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
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
  bench_press: number;
  overhead_press: number;
}

interface Program {
  id: string;
  name: string;
  exercises: any;
  workout_type: string;
}

// Exercise options for adding
const EXERCISE_OPTIONS = [
  'squat',
  'bench_press', 
  'overhead_press',
  'deadlift',
  'kettlebell_swings'
];

const EXERCISE_DISPLAY_NAMES = {
  squat: 'Squat',
  bench_press: 'Bench Press',
  overhead_press: 'Overhead Press', 
  deadlift: 'Deadlift',
  kettlebell_swings: 'KB Swings'
};

// Helper functions
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

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  
  // Today Tab State
  const [exercises, setExercises] = useState<Exercise[]>([]);
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
    bench_press: 200,
    overhead_press: 210
  });

  // Add Exercise State
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [newExerciseWeights, setNewExerciseWeights] = useState([0, 0, 0, 0]);
  const [newExerciseSets, setNewExerciseSets] = useState(['3×5', '3×5', '3×5', '3×5']);

  // Load data on mount
  useEffect(() => {
    loadPrograms();
    loadOneRMs();
  }, []);

  // Load current workout when week changes
  useEffect(() => {
    if (currentProgram) {
      loadCurrentWorkout();
    }
  }, [currentWeek, currentProgram]);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPrograms(data || []);
      if (data && data.length > 0) {
        setCurrentProgram(data[0]);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadOneRMs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lifts')
        .select('exercise, one_rm');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newOneRMs = { ...oneRMs };
        data.forEach(lift => {
          newOneRMs[lift.exercise as keyof OneRMs] = lift.one_rm;
        });
        setOneRMs(newOneRMs);
      }
    } catch (error) {
      console.error('Error loading 1RMs:', error);
    }
  };

  const loadCurrentWorkout = async () => {
    if (!currentProgram) return;

    const today = new Date().getDay();
    let workoutType = 'medium'; // Default
    
    if (today === 1) workoutType = 'medium'; // Monday
    else if (today === 3) workoutType = 'light'; // Wednesday  
    else if (today === 5) workoutType = 'heavy'; // Friday

    try {
      // Check if workout already exists for today
      const { data: existingWorkout, error: workoutError } = await supabase
        .from('workouts')
        .select('*, workout_sets(*)')
        .eq('program_id', currentProgram.id)
        .eq('week_number', currentWeek)
        .eq('workout_type', workoutType)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (existingWorkout) {
        setCurrentWorkout(existingWorkout);
        convertWorkoutToExercises(existingWorkout);
      } else {
        // Create new workout from program template
        await createWorkoutFromProgram(workoutType);
      }
    } catch (error) {
      console.error('Error loading current workout:', error);
    }
  };

  const createWorkoutFromProgram = async (workoutType: string) => {
    if (!currentProgram) return;

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          program_id: currentProgram.id,
          workout_type: workoutType,
          week_number: currentWeek,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Get exercises for this workout type from program
      const programExercises = currentProgram.exercises[workoutType] || {};
      const sets = [];

      for (const [exerciseName, exerciseData] of Object.entries(programExercises)) {
        const weekData = exerciseData[`week_${currentWeek}`];
        if (weekData) {
          const { sets: numSets, reps } = parseSetReps(weekData.sets);
          
          for (let i = 1; i <= numSets; i++) {
            sets.push({
              workout_id: workout.id,
              exercise: exerciseName,
              set_number: i,
              prescribed_weight: weekData.weight,
              prescribed_reps: reps,
              completed: false
            });
          }
        }
      }

      if (sets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(sets);

        if (setsError) throw setsError;
      }

      // Reload workout with sets
      loadCurrentWorkout();
    } catch (error) {
      console.error('Error creating workout from program:', error);
    }
  };

  const convertWorkoutToExercises = (workout: any) => {
    if (!workout.workout_sets) return;

    // Group sets by exercise
    const exerciseGroups = workout.workout_sets.reduce((groups: any, set: any) => {
      if (!groups[set.exercise]) {
        groups[set.exercise] = [];
      }
      groups[set.exercise].push(set);
      return groups;
    }, {});

    // Convert to Exercise format
    const exerciseList: Exercise[] = Object.entries(exerciseGroups).map(([exerciseName, sets]: [string, any]) => {
      const exerciseSets: Set[] = sets.map((set: any) => ({
        id: set.id,
        setNumber: set.set_number,
        prescribed: { 
          weight: set.prescribed_weight, 
          reps: set.prescribed_reps 
        },
        actual: set.actual_weight && set.actual_reps ? {
          weight: set.actual_weight,
          reps: set.actual_reps
        } : undefined,
        completed: set.completed
      }));

      return {
        id: exerciseName,
        name: EXERCISE_DISPLAY_NAMES[exerciseName as keyof typeof EXERCISE_DISPLAY_NAMES] || exerciseName,
        sets: exerciseSets.sort((a, b) => a.setNumber - b.setNumber),
        completed: exerciseSets.every(set => set.completed)
      };
    });

    setExercises(exerciseList);
  };

  const updateOneRM = async (exercise: keyof OneRMs, value: number) => {
    try {
      const { error } = await supabase
        .from('user_lifts')
        .upsert({
          exercise: exercise,
          one_rm: value,
          training_max: Math.round(value * 0.9) // 90% for training max
        });

      if (error) throw error;
      
      setOneRMs(prev => ({ ...prev, [exercise]: value }));
    } catch (error) {
      console.error('Error updating 1RM:', error);
    }
  };

  const updateSet = async (setId: string, actualWeight: number, actualReps: number) => {
    try {
      const { error } = await supabase
        .from('workout_sets')
        .update({
          actual_weight: actualWeight,
          actual_reps: actualReps,
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', setId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating set:', error);
    }
  };

  const addExerciseToProgram = async () => {
    if (!selectedExercise || !currentProgram) return;

    try {
      // Get current program exercises
      const currentExercises = { ...currentProgram.exercises };
      
      // Add new exercise to all workout types
      ['heavy', 'medium', 'light'].forEach((workoutType, typeIndex) => {
        if (!currentExercises[workoutType]) {
          currentExercises[workoutType] = {};
        }
        
        currentExercises[workoutType][selectedExercise] = {
          week_1: { sets: newExerciseSets[0], weight: newExerciseWeights[0] },
          week_2: { sets: newExerciseSets[1], weight: newExerciseWeights[1] },
          week_3: { sets: newExerciseSets[2], weight: newExerciseWeights[2] },
          week_4: { sets: newExerciseSets[3], weight: newExerciseWeights[3] }
        };
      });

      // Update program in database
      const { error } = await supabase
        .from('programs')
        .update({ exercises: currentExercises })
        .eq('id', currentProgram.id);

      if (error) throw error;

      // Update local state
      setCurrentProgram({ ...currentProgram, exercises: currentExercises });
      
      // Reset form
      setShowAddExercise(false);
      setSelectedExercise('');
      setNewExerciseWeights([0, 0, 0, 0]);
      setNewExerciseSets(['3×5', '3×5', '3×5', '3×5']);
      
    } catch (error) {
      console.error('Error adding exercise to program:', error);
    }
  };

  const openEdit = (set: Set, exercise: Exercise) => {
    setEditModal({ setItem: set, exercise, isOpen: true });
    setEditWeight(set.prescribed.weight);
    setEditReps(set.prescribed.reps);
  };

  const closeEdit = () => {
    setEditModal({ setItem: null, exercise: null, isOpen: false });
  };

  const saveEdit = async () => {
    if (!editModal.setItem || !editModal.exercise) return;

    try {
      await updateSet(editModal.setItem.id, editWeight, editReps);
      
      // Update local state
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

          return {
            ...exercise,
            sets: updatedSets,
            completed: updatedSets.every(set => set.completed)
          };
        }
        return exercise;
      }));

      closeEdit();
    } catch (error) {
      console.error('Error saving set:', error);
    }
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
              Week {currentWeek} • {currentProgram?.name || 'No Program'}
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
          {exercises.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              background: '#111',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>No workout for today</div>
              <div style={{ fontSize: '14px' }}>Go to Program tab to set up your workouts</div>
            </div>
          ) : (
            exercises.map(exercise => (
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
            ))
          )}

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
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
              Program Setup
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              Configure your 4-week cycle
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
                    {exercise.replace('_', ' ').toUpperCase()}
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

          {/* Add Exercise Section */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #333'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#4ade80' }}>
                Program Exercises
              </div>
              <button
                onClick={() => setShowAddExercise(true)}
                style={{
                  background: '#4ade80',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Add Exercise
              </button>
            </div>

            {/* Current Program Exercises */}
            {currentProgram && Object.keys(currentProgram.exercises.medium || {}).length > 0 ? (
              <div style={{ color: '#ccc', fontSize: '14px' }}>
                Current exercises: {Object.keys(currentProgram.exercises.medium || {})
                  .map(ex => EXERCISE_DISPLAY_NAMES[ex as keyof typeof EXERCISE_DISPLAY_NAMES] || ex)
                  .join(', ')}
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '14px' }}>
                No exercises in program yet. Add some to get started.
              </div>
            )}
          </div>

          {/* Add Exercise Modal */}
          {showAddExercise && (
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
                if (e.target === e.currentTarget) setShowAddExercise(false);
              }}
            >
              <div style={{
                background: '#111',
                borderRadius: '20px',
                padding: '32px',
                width: '400px',
                border: '1px solid #333'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Add Exercise to Program
                </div>

                {/* Exercise Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#888',
                    marginBottom: '8px'
                  }}>
                    Select Exercise
                  </div>
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    style={{
                      background: '#222',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#fff',
                      fontSize: '16px',
                      width: '100%'
                    }}
                  >
                    <option value="">Choose an exercise...</option>
                    {EXERCISE_OPTIONS.map(ex => (
                      <option key={ex} value={ex}>
                        {EXERCISE_DISPLAY_NAMES[ex as keyof typeof EXERCISE_DISPLAY_NAMES] || ex}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Week Configuration */}
                {selectedExercise && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#888',
                      marginBottom: '12px'
                    }}>
                      4-Week Progression
                    </div>
                    {[1, 2, 3, 4].map((week, index) => (
                      <div key={week} style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 1fr',
                        gap: '12px',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>
                          Week {week}:
                        </div>
                        <input
                          type="text"
                          value={newExerciseSets[index]}
                          onChange={(e) => {
                            const newSets = [...newExerciseSets];
                            newSets[index] = e.target.value;
                            setNewExerciseSets(newSets);
                          }}
                          placeholder="3×5"
                          style={{
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            padding: '8px',
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        />
                        <input
                          type="number"
                          value={newExerciseWeights[index]}
                          onChange={(e) => {
                            const newWeights = [...newExerciseWeights];
                            newWeights[index] = Number(e.target.value);
                            setNewExerciseWeights(newWeights);
                          }}
                          placeholder="Weight"
                          style={{
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            padding: '8px',
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setShowAddExercise(false)}
                    style={{
                      background: '#333',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addExerciseToProgram}
                    disabled={!selectedExercise}
                    style={{
                      background: selectedExercise ? '#4ade80' : '#333',
                      color: selectedExercise ? '#000' : '#666',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: selectedExercise ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Add Exercise
                  </button>
                </div>
              </div>
            </div>
          )}
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

      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} View</h2>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}
