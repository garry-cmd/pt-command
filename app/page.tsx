'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://vvuysqzgscdsmqgmlqwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXlzcXpnc2Nkc21xZ21scXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NzE5NTIsImV4cCI6MjA5MjA0Nzk1Mn0.8jP4S91KZfJS9lqrUWHJPYuG09j5MX3chDsfFlnTpFU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface ProgramSlot {
  id: string;
  program_id: string;
  week_number: number;
  day_of_week: string;
  exercise: string;
  sets: string;
  weight: number;
  sort_order: number;
}

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
}

// NEW: Workout tracking interface
interface Workout {
  id: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
}

// Exercise options
const EXERCISE_OPTIONS = [
  'squat',
  'bench_press', 
  'overhead_press',
  'deadlift',
  'kettlebell_swings'
];

const EXERCISE_DISPLAY_NAMES: { [key: string]: string } = {
  squat: 'Squat',
  bench_press: 'Bench Press',
  overhead_press: 'Overhead Press', 
  deadlift: 'Deadlift',
  kettlebell_swings: 'KB Swings'
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_DISPLAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  if (oneRM === 0) return 0;
  return Math.round((weight / oneRM) * 100);
};

const calculateVolume = (setsReps: string, weight: number) => {
  const { sets, reps } = parseSetReps(setsReps);
  return sets * reps * weight;
};

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programSlots, setProgramSlots] = useState<ProgramSlot[]>([]);
  
  // Today Tab State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null); // NEW: Track current workout
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

  // Load data on mount
  useEffect(() => {
    loadPrograms();
    loadOneRMs();
  }, []);

  // Load program slots when program changes
  useEffect(() => {
    if (currentProgram) {
      loadProgramSlots();
    }
  }, [currentProgram]);

  // FIXED: Load current workout when programSlots or currentWeek changes
  useEffect(() => {
    if (currentProgram && programSlots.length > 0) {
      loadCurrentWorkout();
    }
  }, [currentProgram, currentWeek, programSlots]);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name')
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

  const loadProgramSlots = async () => {
    if (!currentProgram) return;

    try {
      const { data, error } = await supabase
        .from('program_slots')
        .select('*')
        .eq('program_id', currentProgram.id)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      setProgramSlots(data || []);
    } catch (error) {
      console.error('Error loading program slots:', error);
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

    // FIXED: Get current day correctly
    const today = new Date().getDay();
    const dayMap: { [key: number]: string } = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 
      4: 'thursday', 5: 'friday', 6: 'saturday'
    };
    const currentDay = dayMap[today];

    console.log(`[Today Tab] Loading workout for: ${currentDay}, Week ${currentWeek}`);
    console.log(`[Today Tab] Current program:`, currentProgram);
    console.log(`[Today Tab] Total program slots:`, programSlots.length);
    console.log(`[Today Tab] All program slots:`, programSlots);

    // ENHANCED DEBUGGING: Filter slots step by step
    console.log(`[Today Tab] Filtering for week_number === ${currentWeek}:`);
    const weekFiltered = programSlots.filter(slot => slot.week_number === currentWeek);
    console.log(`[Today Tab] Week filtered slots (${weekFiltered.length}):`, weekFiltered);

    console.log(`[Today Tab] Filtering for day_of_week === '${currentDay}':`);
    const dayFiltered = weekFiltered.filter(slot => slot.day_of_week === currentDay);
    console.log(`[Today Tab] Day filtered slots (${dayFiltered.length}):`, dayFiltered);

    // FIXED: Get slots for today from the current programSlots state
    const todaySlots = programSlots.filter(
      slot => slot.week_number === currentWeek && slot.day_of_week === currentDay
    );

    console.log(`[Today Tab] Final today slots (${todaySlots.length}):`, todaySlots);

    if (todaySlots.length === 0) {
      console.log(`[Today Tab] No exercises scheduled for ${currentDay} Week ${currentWeek}`);
      setExercises([]);
      setCurrentWorkout(null); // NEW: Clear current workout
      return;
    }

    // Continue with existing logic...
    try {
      // Check if workout already exists for today
      const { data: existingWorkout, error: workoutError } = await supabase
        .from('workouts')
        .select('*, workout_sets(*)')
        .eq('program_id', currentProgram.id)
        .eq('week_number', currentWeek)
        .eq('workout_type', currentDay)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (existingWorkout) {
        console.log('[Today Tab] Found existing workout, converting...');
        setCurrentWorkout({
          id: existingWorkout.id,
          started_at: existingWorkout.started_at,
          completed_at: existingWorkout.completed_at,
          duration_seconds: existingWorkout.duration_seconds
        }); // NEW: Set current workout
        convertWorkoutToExercises(existingWorkout);
      } else {
        console.log('[Today Tab] Creating new workout from slots...');
        await createWorkoutFromSlots(currentDay, todaySlots);
      }
    } catch (error) {
      console.error('Error loading current workout:', error);
    }
  };

  const createWorkoutFromSlots = async (workoutType: string, slots: ProgramSlot[]) => {
    if (!currentProgram) return;

    try {
      console.log(`[Today Tab] Creating workout from ${slots.length} slots`);

      // NEW: Create workout with started_at timestamp
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          program_id: currentProgram.id,
          workout_type: workoutType,
          week_number: currentWeek,
          date: new Date().toISOString().split('T')[0],
          started_at: new Date().toISOString() // NEW: Mark workout as started
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // NEW: Set current workout
      setCurrentWorkout({
        id: workout.id,
        started_at: workout.started_at,
        completed_at: workout.completed_at,
        duration_seconds: workout.duration_seconds
      });

      // Create sets from program slots
      const workoutSets = [];
      for (const slot of slots) {
        const { sets, reps } = parseSetReps(slot.sets);
        
        for (let i = 1; i <= sets; i++) {
          workoutSets.push({
            workout_id: workout.id,
            exercise: slot.exercise,
            set_number: i,
            prescribed_weight: slot.weight,
            prescribed_reps: reps,
            completed: false
          });
        }
      }

      if (workoutSets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(workoutSets);

        if (setsError) throw setsError;
      }

      console.log(`[Today Tab] Created workout with ${workoutSets.length} sets`);

      // Reload workout with sets
      loadCurrentWorkout();
    } catch (error) {
      console.error('Error creating workout from slots:', error);
    }
  };

  const convertWorkoutToExercises = (workout: any) => {
    if (!workout.workout_sets) return;

    console.log(`[Today Tab] Converting workout with ${workout.workout_sets.length} sets`);

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

    console.log(`[Today Tab] Converted to ${exerciseList.length} exercises`);
    setExercises(exerciseList);
  };

  const updateProgramSlot = async (id: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('program_slots')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProgramSlots(prev => prev.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      ));
    } catch (error) {
      console.error('Error updating program slot:', error);
    }
  };

  // Get slots for a specific week and day
  const getSlotsForCell = (week: number, day: string): ProgramSlot[] => {
    return programSlots.filter(
      slot => slot.week_number === week && slot.day_of_week === day
    );
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

          {/* ENHANCED DEBUG INFO */}
          <div style={{
            background: '#1a1a1a',
            border: '2px solid #ff4444',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '12px',
            color: '#ccc',
            fontFamily: 'monospace'
          }}>
            <h3 style={{ color: '#ff4444', marginBottom: '12px' }}>🐛 ENHANCED DEBUG</h3>
            <div>Current day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}</div>
            <div>Current week: {currentWeek}</div>
            <div>Current program: {currentProgram?.name || 'null'} ({currentProgram?.id || 'no-id'})</div>
            <div>Program slots total: {programSlots.length}</div>
            <div>Today exercises found: {exercises.length}</div>
            
            <h4 style={{ color: '#fbbf24', marginTop: '12px', marginBottom: '8px' }}>Program Slots Sample (first 3):</h4>
            {programSlots.slice(0, 3).map((slot, i) => (
              <div key={i} style={{ marginBottom: '4px', fontSize: '11px' }}>
                {i+1}. Week {slot.week_number}, {slot.day_of_week}, {slot.exercise} ({slot.weight}lbs)
              </div>
            ))}

            <h4 style={{ color: '#fbbf24', marginTop: '12px', marginBottom: '8px' }}>Monday Week 1 Slots:</h4>
            {getSlotsForCell(1, 'monday').map((slot, i) => (
              <div key={i} style={{ marginBottom: '4px', fontSize: '11px', color: '#4ade80' }}>
                {i+1}. {slot.exercise} - {slot.sets} @ {slot.weight}lbs
              </div>
            ))}
            {getSlotsForCell(1, 'monday').length === 0 && (
              <div style={{ color: '#ef4444' }}>❌ No Monday Week 1 slots found in programSlots array!</div>
            )}
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
              <div style={{ fontSize: '14px' }}>Go to Program tab to add exercises</div>
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
                      borderBottom: '1px solid #222'
                    }}
                  >
                    <div style={{ fontSize: '15px', color: '#ccc' }}>
                      Set {set.setNumber}: {set.prescribed.weight} × {set.prescribed.reps}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      background: '#000',
      minHeight: '100vh',
      color: '#fff',
      padding: '40px',
      textAlign: 'center',
      color: '#666'
    }}>
      <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} View</h2>
      <p>Coming soon...</p>
    </div>
  );
}
