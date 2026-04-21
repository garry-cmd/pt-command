'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with CORRECT API key
const supabaseUrl = 'https://vvuysqzgscdsmqgmlqwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXlzcXpnc2Nkc21xZ21scXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NzE5NTIsImV4cCI6MjA5MjA0Nzk1Mn0.8jP4S91KZfJS9lqrUWHJPYuG09j5MX3chDsfFlnTpFU';

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

interface WeekData {
  sets: string;
  weight: number;
}

interface ExerciseData {
  week_1: WeekData;
  week_2: WeekData;
  week_3: WeekData;
  week_4: WeekData;
}

interface Program {
  id: string;
  name: string;
  exercises: {
    [workoutType: string]: {
      [exerciseName: string]: ExerciseData;
    };
  };
  workout_type: string;
}

// Exercise options for adding
const STRENGTH_EXERCISE_OPTIONS = [
  'squat',
  'bench_press', 
  'overhead_press',
  'deadlift'
];

const KETTLEBELL_EXERCISE_OPTIONS = [
  'kettlebell_swings',
  'kettlebell_clean',
  'kettlebell_press', 
  'kettlebell_snatch',
  'turkish_getup'
];

const EXERCISE_DISPLAY_NAMES: { [key: string]: string } = {
  squat: 'Squat',
  bench_press: 'Bench Press',
  overhead_press: 'Overhead Press', 
  deadlift: 'Deadlift',
  kettlebell_swings: 'KB Swings',
  kettlebell_clean: 'KB Clean',
  kettlebell_press: 'KB Press',
  kettlebell_snatch: 'KB Snatch',
  turkish_getup: 'Turkish Get-up'
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

const calculateVolume = (setsReps: string, weight: number) => {
  const { sets, reps } = parseSetReps(setsReps);
  return sets * reps * weight;
};

const isKettlebellExercise = (exerciseName: string) => {
  return exerciseName.toLowerCase().includes('kettlebell') || exerciseName.toLowerCase().includes('turkish');
};

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<'strength' | 'kettlebells'>('strength');
  
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

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState('');

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
        const typedExerciseData = exerciseData as ExerciseData;
        const weekData = typedExerciseData[`week_${currentWeek}` as keyof ExerciseData];
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
        name: EXERCISE_DISPLAY_NAMES[exerciseName] || exerciseName,
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

  const updateProgramData = async (day: string, exercise: string, week: number, field: 'sets' | 'weight', value: string | number) => {
    if (!currentProgram) return;

    const currentExercises = { ...currentProgram.exercises };
    
    if (currentExercises[day] && currentExercises[day][exercise]) {
      const weekKey = `week_${week}` as keyof ExerciseData;
      currentExercises[day][exercise][weekKey] = {
        ...currentExercises[day][exercise][weekKey],
        [field]: value
      };

      try {
        const { error } = await supabase
          .from('programs')
          .update({ exercises: currentExercises })
          .eq('id', currentProgram.id);

        if (error) throw error;

        setCurrentProgram({ ...currentProgram, exercises: currentExercises });
      } catch (error) {
        console.error('Error updating program data:', error);
      }
    }
  };

  const deleteExercise = async (exerciseName: string) => {
    if (!currentProgram) return;

    try {
      const currentExercises = { ...currentProgram.exercises };
      
      // Remove exercise from all workout types
      ['heavy', 'medium', 'light'].forEach((workoutType) => {
        if (currentExercises[workoutType] && currentExercises[workoutType][exerciseName]) {
          delete currentExercises[workoutType][exerciseName];
        }
      });

      // Update program in database
      const { error } = await supabase
        .from('programs')
        .update({ exercises: currentExercises })
        .eq('id', currentProgram.id);

      if (error) throw error;

      // Update local state
      setCurrentProgram({ ...currentProgram, exercises: currentExercises });
      
      // Close confirmation modal
      setShowDeleteConfirm(false);
      setExerciseToDelete('');
      
    } catch (error) {
      console.error('Error deleting exercise:', error);
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
      ['heavy', 'medium', 'light'].forEach((workoutType) => {
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

  // Get all exercises from the program, organized by type
  const getAllExercises = () => {
    if (!currentProgram) return { strength: [], kettlebells: [] };
    
    const allExercises = new Set<string>();
    
    // Collect all exercise names from all workout types
    ['heavy', 'medium', 'light'].forEach(workoutType => {
      if (currentProgram.exercises[workoutType]) {
        Object.keys(currentProgram.exercises[workoutType]).forEach(exercise => {
          allExercises.add(exercise);
        });
      }
    });

    const strength: string[] = [];
    const kettlebells: string[] = [];

    allExercises.forEach(exercise => {
      if (isKettlebellExercise(exercise)) {
        kettlebells.push(exercise);
      } else {
        strength.push(exercise);
      }
    });

    return { strength, kettlebells };
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
    const { strength, kettlebells } = getAllExercises();
    
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
              Configure your training by exercise
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

          {/* Section Tabs */}
          <div style={{
            background: '#111',
            borderRadius: '12px',
            padding: '6px',
            marginBottom: '24px',
            display: 'flex',
            gap: '4px'
          }}>
            {[
              { key: 'strength', label: 'Strength Training', count: strength.length },
              { key: 'kettlebells', label: 'Kettlebells', count: kettlebells.length }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setCurrentSection(section.key as 'strength' | 'kettlebells')}
                style={{
                  flex: 1,
                  background: currentSection === section.key ? '#4ade80' : 'transparent',
                  color: currentSection === section.key ? '#000' : '#888',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {section.label}
                {section.count > 0 && (
                  <span style={{
                    background: currentSection === section.key ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {section.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Exercise Lists by Section */}
          {currentSection === 'strength' && (
            <>
              {strength.length > 0 ? (
                strength.map(exerciseName => (
                  <div key={exerciseName} style={{
                    background: '#111',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    border: '1px solid #333'
                  }}>
                    {/* Exercise Header with Delete Button */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: '#fbbf24', 
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {EXERCISE_DISPLAY_NAMES[exerciseName] || exerciseName}
                      </h3>
                      <button
                        onClick={() => {
                          setExerciseToDelete(exerciseName);
                          setShowDeleteConfirm(true);
                        }}
                        style={{
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    {/* Day Tabs for this Exercise */}
                    <div style={{
                      background: '#0a0a0a',
                      borderRadius: '8px',
                      padding: '4px',
                      marginBottom: '16px',
                      display: 'flex',
                      gap: '2px'
                    }}>
                      {['heavy', 'medium', 'light'].map(day => {
                        const hasData = currentProgram?.exercises[day]?.[exerciseName];
                        return (
                          <div
                            key={day}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'center',
                              textTransform: 'capitalize',
                              background: hasData ? '#333' : '#222',
                              color: hasData ? '#fff' : '#666'
                            }}
                          >
                            {day} Day
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Progression Table */}
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
                              Day / Week
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
                          {['heavy', 'medium', 'light'].map(day => {
                            const exerciseData = currentProgram?.exercises[day]?.[exerciseName];
                            if (!exerciseData) {
                              return (
                                <tr key={day}>
                                  <td style={{ 
                                    padding: '12px', 
                                    border: '1px solid #222', 
                                    background: '#0a0a0a',
                                    color: '#666',
                                    textTransform: 'capitalize'
                                  }}>
                                    {day}
                                  </td>
                                  <td colSpan={4} style={{ 
                                    padding: '12px', 
                                    border: '1px solid #222', 
                                    background: '#0a0a0a',
                                    textAlign: 'center',
                                    color: '#666',
                                    fontStyle: 'italic'
                                  }}>
                                    Not programmed
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <React.Fragment key={day}>
                                {/* Sets × Reps Row */}
                                <tr>
                                  <td style={{ 
                                    padding: '8px 12px', 
                                    border: '1px solid #222', 
                                    background: '#0a0a0a',
                                    color: '#ccc',
                                    textTransform: 'capitalize',
                                    fontSize: '12px'
                                  }}>
                                    {day} Sets
                                  </td>
                                  {[1, 2, 3, 4].map(week => {
                                    const weekData = (exerciseData as ExerciseData)[`week_${week}` as keyof ExerciseData];
                                    return (
                                      <td key={week} style={{ 
                                        padding: '8px', 
                                        border: '1px solid #222', 
                                        background: '#0a0a0a',
                                        textAlign: 'center'
                                      }}>
                                        <input
                                          type="text"
                                          value={weekData.sets}
                                          onChange={(e) => updateProgramData(day, exerciseName, week, 'sets', e.target.value)}
                                          style={{
                                            background: 'transparent',
                                            border: '1px solid transparent',
                                            color: '#4ade80',
                                            textAlign: 'center',
                                            width: '100%',
                                            padding: '4px',
                                            fontFamily: '"JetBrains Mono", monospace',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            borderRadius: '4px'
                                          }}
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                                
                                {/* Weight Row */}
                                <tr>
                                  <td style={{ 
                                    padding: '8px 12px', 
                                    border: '1px solid #222', 
                                    background: '#0a0a0a',
                                    color: '#ccc',
                                    fontSize: '12px'
                                  }}>
                                    {day} Weight
                                  </td>
                                  {[1, 2, 3, 4].map(week => {
                                    const weekData = (exerciseData as ExerciseData)[`week_${week}` as keyof ExerciseData];
                                    return (
                                      <td key={week} style={{ 
                                        padding: '8px', 
                                        border: '1px solid #222', 
                                        background: '#0a0a0a',
                                        textAlign: 'center'
                                      }}>
                                        <input
                                          type="number"
                                          value={weekData.weight}
                                          onChange={(e) => updateProgramData(day, exerciseName, week, 'weight', Number(e.target.value))}
                                          style={{
                                            background: 'transparent',
                                            border: '1px solid transparent',
                                            color: '#fff',
                                            textAlign: 'center',
                                            width: '100%',
                                            padding: '4px',
                                            fontFamily: '"JetBrains Mono", monospace',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            borderRadius: '4px'
                                          }}
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  background: '#111',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <p style={{ marginBottom: '16px' }}>No strength exercises yet.</p>
                  <button
                    onClick={() => setShowAddExercise(true)}
                    style={{
                      background: '#4ade80',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Strength Exercise
                  </button>
                </div>
              )}

              {/* Add Exercise Button for Strength */}
              {strength.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => setShowAddExercise(true)}
                    style={{
                      background: '#4ade80',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Strength Exercise
                  </button>
                </div>
              )}
            </>
          )}

          {currentSection === 'kettlebells' && (
            <div style={{
              background: '#111',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fbbf24', marginBottom: '16px' }}>
                Kettlebell Training
              </h3>
              <p style={{ marginBottom: '16px' }}>
                {kettlebells.length > 0 
                  ? `${kettlebells.length} kettlebell exercises configured`
                  : 'No kettlebell exercises yet. Coming soon!'}
              </p>
              {kettlebells.length > 0 && (
                <div style={{ fontSize: '14px', color: '#888' }}>
                  {kettlebells.map(ex => EXERCISE_DISPLAY_NAMES[ex] || ex).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
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
                if (e.target === e.currentTarget) setShowDeleteConfirm(false);
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
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: '#ef4444'
                }}>
                  Delete Exercise
                </div>
                
                <p style={{
                  fontSize: '14px',
                  color: '#ccc',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Are you sure you want to delete{' '}
                  <strong style={{ color: '#fff' }}>
                    {EXERCISE_DISPLAY_NAMES[exerciseToDelete] || exerciseToDelete}
                  </strong>
                  ? This will remove it from all workout days and cannot be undone.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
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
                    onClick={() => deleteExercise(exerciseToDelete)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    <optgroup label="Strength Training">
                      {STRENGTH_EXERCISE_OPTIONS.map(ex => (
                        <option key={ex} value={ex}>
                          {EXERCISE_DISPLAY_NAMES[ex] || ex}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Kettlebells">
                      {KETTLEBELL_EXERCISE_OPTIONS.map(ex => (
                        <option key={ex} value={ex}>
                          {EXERCISE_DISPLAY_NAMES[ex] || ex}
                        </option>
                      ))}
                    </optgroup>
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
                      4-Week Progression (applies to all days)
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
