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

interface Program {
  id: string;
  name: string;
}

interface OneRMs {
  squat: number;
  deadlift: number;
  bench_press: number;
  overhead_press: number;
}

export default function PTCommand() {
  const [currentTab, setCurrentTab] = useState('today');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programSlots, setProgramSlots] = useState<ProgramSlot[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // Program Tab State  
  const [oneRMs, setOneRMs] = useState<OneRMs>({
    squat: 385,
    deadlift: 415,
    bench_press: 200,
    overhead_press: 210
  });

  // Add debug log function
  const addDebugLog = (message: string) => {
    console.log('[PT Command Debug]:', message);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Load data on mount
  useEffect(() => {
    addDebugLog('Component mounted, loading programs...');
    loadPrograms();
    loadOneRMs();
  }, []);

  const loadPrograms = async () => {
    addDebugLog('loadPrograms() called');
    try {
      addDebugLog('Making Supabase call to fetch programs...');
      const { data, error } = await supabase
        .from('programs')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      addDebugLog(`Supabase response: data=${JSON.stringify(data)}, error=${JSON.stringify(error)}`);
      
      if (error) {
        addDebugLog(`ERROR in loadPrograms: ${error.message}`);
        throw error;
      }
      
      addDebugLog(`Programs loaded: ${data?.length || 0} programs`);
      setPrograms(data || []);
      
      if (data && data.length > 0) {
        addDebugLog(`Setting current program to: ${data[0].name} (${data[0].id})`);
        setCurrentProgram(data[0]);
      } else {
        addDebugLog('No programs found in database');
      }
    } catch (error) {
      addDebugLog(`EXCEPTION in loadPrograms: ${error}`);
      console.error('Error loading programs:', error);
    }
  };

  const loadOneRMs = async () => {
    addDebugLog('loadOneRMs() called');
    // Implementation skipped for brevity in debug version
  };

  const addProgramSlot = async (week: number, day: string) => {
    addDebugLog(`addProgramSlot called: week=${week}, day=${day}`);
    addDebugLog(`currentProgram=${JSON.stringify(currentProgram)}`);
    
    if (!currentProgram) {
      addDebugLog('ERROR: currentProgram is null, cannot add exercise!');
      alert('ERROR: No program loaded. Cannot add exercise.');
      return;
    }

    try {
      addDebugLog('Attempting to insert into program_slots...');
      const { data, error } = await supabase
        .from('program_slots')
        .insert({
          program_id: currentProgram.id,
          week_number: week,
          day_of_week: day,
          exercise: 'squat',
          sets: '3×5',
          weight: 135,
          sort_order: 0
        })
        .select()
        .single();

      addDebugLog(`Insert result: data=${JSON.stringify(data)}, error=${JSON.stringify(error)}`);

      if (error) {
        addDebugLog(`ERROR in addProgramSlot: ${error.message}`);
        alert(`Database error: ${error.message}`);
        throw error;
      }

      addDebugLog('Successfully added exercise!');
      alert(`Successfully added exercise: ${JSON.stringify(data)}`);
    } catch (error) {
      addDebugLog(`EXCEPTION in addProgramSlot: ${error}`);
      console.error('Error adding program slot:', error);
    }
  };

  return (
    <div style={{
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      background: '#000',
      minHeight: '100vh',
      color: '#fff',
      padding: '20px'
    }}>
      {/* Debug Info */}
      <div style={{
        background: '#1a1a1a',
        border: '2px solid #ff4444',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <h3 style={{ color: '#ff4444', marginBottom: '12px', fontSize: '16px' }}>
          🐛 DEBUG INFO
        </h3>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {debugInfo.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px', color: '#ccc' }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        background: '#111',
        borderRadius: '16px',
        padding: '8px',
        marginBottom: '24px',
        gap: '8px'
      }}>
        {[
          { key: 'today', label: 'Today' },
          { key: 'program', label: 'Program' }
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

      {/* Current Status */}
      <div style={{
        background: '#111',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#4ade80' }}>Current Status</h3>
        <p>Programs loaded: {programs.length}</p>
        <p>Current program: {currentProgram ? `${currentProgram.name} (${currentProgram.id})` : 'NULL'}</p>
        <p>Program slots: {programSlots.length}</p>
      </div>

      {/* Test Add Exercise Button */}
      <div style={{
        background: '#111',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#fbbf24' }}>Test Add Exercise</h3>
        <button
          onClick={() => addProgramSlot(1, 'monday')}
          style={{
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🧪 Test Add Exercise (Monday/Week 1)
        </button>
      </div>

      {/* Manual Program Loading */}
      <div style={{
        background: '#111',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#8b5cf6' }}>Manual Controls</h3>
        <button
          onClick={loadPrograms}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 600,
            marginRight: '12px'
          }}
        >
          🔄 Reload Programs
        </button>
        
        <button
          onClick={() => {
            setDebugInfo([]);
            addDebugLog('Debug log cleared');
          }}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🗑️ Clear Debug Log
        </button>
      </div>
    </div>
  );
}
