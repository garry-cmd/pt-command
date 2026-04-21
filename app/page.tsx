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

// Drag and drop functionality
const ExerciseCard: React.FC<{
  slot: ProgramSlot;
  oneRMs: OneRMs;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
  onExerciseChange: (id: string, exercise: string) => void;
}> = ({ slot, oneRMs, onUpdate, onDelete, onExerciseChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showExerciseSelect, setShowExerciseSelect] = useState(false);

  const exerciseKey = slot.exercise.toLowerCase() as keyof OneRMs;
  const oneRM = oneRMs[exerciseKey] || oneRMs.squat;
  const percentage = calculatePercentage(slot.weight, oneRM);
  const volume = calculateVolume(slot.sets, slot.weight);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const dragData = {
      id: slot.id,
      exercise: slot.exercise,
      sets: slot.sets,
      weight: slot.weight,
      sourceWeek: slot.week_number,
      sourceDay: slot.day_of_week
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        background: '#111',
        border: '2px solid #333',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
      onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
      onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
    >
      {/* Exercise Header - FIXED: Single gold header, click to change */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div 
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#fbbf24',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowExerciseSelect(!showExerciseSelect);
          }}
        >
          {EXERCISE_DISPLAY_NAMES[slot.exercise] || slot.exercise}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slot.id);
          }}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* Exercise selector dropdown - only shows when clicked */}
      {showExerciseSelect && (
        <div style={{ marginBottom: '12px' }}>
          <select
            value={slot.exercise}
            onChange={(e) => {
              onExerciseChange(slot.id, e.target.value);
              setShowExerciseSelect(false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              background: '#222',
              border: '1px solid #fbbf24',
              borderRadius: '4px',
              padding: '4px 8px',
              color: '#fff',
              fontSize: '12px',
              width: '100%'
            }}
          >
            {EXERCISE_OPTIONS.map(ex => (
              <option key={ex} value={ex}>
                {EXERCISE_DISPLAY_NAMES[ex] || ex}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Exercise Details */}
      <div style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", monospace' }}>
        {/* Sets x Reps */}
        <div style={{ marginBottom: '6px' }}>
          <span style={{ color: '#888', marginRight: '8px' }}>Sets:</span>
          <input
            type="text"
            value={slot.sets}
            onChange={(e) => onUpdate(slot.id, 'sets', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '2px 6px',
              color: '#4ade80',
              fontSize: '12px',
              width: '60px'
            }}
          />
        </div>

        {/* Weight */}
        <div style={{ marginBottom: '6px' }}>
          <span style={{ color: '#888', marginRight: '8px' }}>Weight:</span>
          <input
            type="number"
            value={slot.weight}
            onChange={(e) => onUpdate(slot.id, 'weight', Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '2px 6px',
              color: '#fff',
              fontSize: '12px',
              width: '60px'
            }}
          />
        </div>

        {/* Calculated metrics */}
        <div style={{ 
          borderTop: '1px solid #333', 
          paddingTop: '6px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px'
        }}>
          <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600 }}>
            {percentage}% 1RM
          </div>
          <div style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 600 }}>
            {volume} vol
          </div>
        </div>
      </div>
    </div>
  );
};

// Drop zone component
const DropZone: React.FC<{
  week: number;
  day: string;
  slots: ProgramSlot[];
  oneRMs: OneRMs;
  onDrop: (week: number, day: string, cardData: any) => void;
  onUpdateSlot: (id: string, field: string, value: any) => void;
  onDeleteSlot: (id: string) => void;
  onAddCard: (week: number, day: string) => void;
  onExerciseChange: (id: string, exercise: string) => void;
}> = ({ week, day, slots, oneRMs, onDrop, onUpdateSlot, onDeleteSlot, onAddCard, onExerciseChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're leaving the drop zone completely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const cardData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onDrop(week, day, cardData);
    } catch (error) {
      console.error('Error parsing dropped card data:', error);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isDragOver ? '#1a1a1a' : '#0a0a0a',
        border: `2px dashed ${isDragOver ? '#4ade80' : '#333'}`,
        borderRadius: '8px',
        minHeight: '120px',
        padding: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {slots.map(slot => (
        <ExerciseCard
          key={slot.id}
          slot={slot}
          oneRMs={oneRMs}
          onUpdate={onUpdateSlot}
          onDelete={onDeleteSlot}
          onExerciseChange={onExerciseChange}
        />
      ))}
      
      {/* FIXED: Add Exercise Button - now properly functional */}
      <button
        onClick={() => onAddCard(week, day)}
        style={{
          background: '#333',
          color: '#888',
          border: '1px dashed #555',
          borderRadius: '8px',
          padding: '8px',
          width: '100%',
          fontSize: '12px',
          cursor: 'pointer',
          marginTop: slots.length > 0 ? '8px' : '0',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#444';
          e.currentTarget.style.color = '#aaa';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#333';
          e.currentTarget.style.color = '#888';
        }}
      >
        + Add Exercise
      </button>
    </div>
  );
};

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programSlots, setProgramSlots] = useState<ProgramSlot[]>([]);
  
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

    // FIXED: Get slots for today from the current programSlots state
    const todaySlots = programSlots.filter(
      slot => slot.week_number === currentWeek && slot.day_of_week === currentDay
    );

    console.log(`[Today Tab] Found ${todaySlots.length} slots for today:`, todaySlots);

    if (todaySlots.length === 0) {
      console.log(`[Today Tab] No exercises scheduled for ${currentDay} Week ${currentWeek}`);
      setExercises([]);
      return;
    }

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

  const updateOneRM = async (exercise: keyof OneRMs, value: number) => {
    try {
      const { error } = await supabase
        .from('user_lifts')
        .upsert({
          exercise: exercise,
          one_rm: value,
          training_max: Math.round(value * 0.9)
        });

      if (error) throw error;
      
      setOneRMs(prev => ({ ...prev, [exercise]: value }));
    } catch (error) {
      console.error('Error updating 1RM:', error);
    }
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

  const updateExerciseType = async (id: string, exercise: string) => {
    await updateProgramSlot(id, 'exercise', exercise);
  };

  const deleteProgramSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('program_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProgramSlots(prev => prev.filter(slot => slot.id !== id));
    } catch (error) {
      console.error('Error deleting program slot:', error);
    }
  };

  // FIXED: Add Exercise function with PROPER sort_order calculation
  const addProgramSlot = async (week: number, day: string) => {
    if (!currentProgram) return;

    // FIXED: Calculate proper sort_order based on existing slots
    const existingSlotsInCell = programSlots.filter(
      slot => slot.week_number === week && slot.day_of_week === day
    );
    const nextSortOrder = existingSlotsInCell.length; // This gives us the next available sort_order

    try {
      const { data, error } = await supabase
        .from('program_slots')
        .insert({
          program_id: currentProgram.id,
          week_number: week,
          day_of_week: day,
          exercise: 'squat',
          sets: '3×5',
          weight: 135,
          sort_order: nextSortOrder // FIXED: Use calculated sort_order instead of hardcoded 0
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      if (data) {
        setProgramSlots(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding program slot:', error);
    }
  };

  // FIXED: Drag & drop - single operation, no delete/create sequence
  const handleCardDrop = async (week: number, day: string, cardData: any) => {
    if (!currentProgram) return;

    // Don't do anything if dropping in the same location
    if (cardData.sourceWeek === week && cardData.sourceDay === day) {
      return;
    }

    try {
      // Find the next sort order in the target cell
      const existingSlotsInCell = programSlots.filter(
        slot => slot.week_number === week && slot.day_of_week === day && slot.id !== cardData.id
      );
      const nextSortOrder = existingSlotsInCell.length;

      // FIXED: Update card in ONE operation instead of delete/create
      const { error } = await supabase
        .from('program_slots')
        .update({
          week_number: week,
          day_of_week: day,
          sort_order: nextSortOrder
        })
        .eq('id', cardData.id);

      if (error) throw error;

      // Update local state
      setProgramSlots(prev => prev.map(slot => 
        slot.id === cardData.id 
          ? { ...slot, week_number: week, day_of_week: day, sort_order: nextSortOrder }
          : slot
      ));
    } catch (error) {
      console.error('Error moving card:', error);
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

          {/* FIXED: Debug info for troubleshooting */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#888'
          }}>
            <div>Current day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}</div>
            <div>Program slots loaded: {programSlots.length}</div>
            <div>Today exercises found: {exercises.length}</div>
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
              Program Grid
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              Drag exercise cards between days and weeks
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

          {/* Program Grid */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #333',
            overflowX: 'auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px repeat(4, 1fr)',
              gap: '12px',
              minWidth: '800px'
            }}>
              {/* Header Row */}
              <div></div> {/* Empty corner */}
              {[1, 2, 3, 4].map(week => (
                <div key={week} style={{
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#4ade80',
                  padding: '12px'
                }}>
                  Week {week}
                </div>
              ))}

              {/* Grid Rows */}
              {DAYS.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {/* Day Label */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#888',
                    textTransform: 'capitalize'
                  }}>
                    {DAY_DISPLAY_NAMES[dayIndex]}
                  </div>

                  {/* Week Cells */}
                  {[1, 2, 3, 4].map(week => {
                    const slots = getSlotsForCell(week, day);
                    return (
                      <DropZone
                        key={`${week}-${day}`}
                        week={week}
                        day={day}
                        slots={slots}
                        oneRMs={oneRMs}
                        onDrop={handleCardDrop}
                        onUpdateSlot={updateProgramSlot}
                        onDeleteSlot={deleteProgramSlot}
                        onAddCard={addProgramSlot}
                        onExerciseChange={updateExerciseType}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
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

      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} View</h2>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}
