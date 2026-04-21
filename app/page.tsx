'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://vvuysqzgscdsmqgmlqwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXlzcXpnc2Nkc21xZ21scXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTYzNTIsImV4cCI6MjA5MjI3MjM1Mn0.nYT1vQ2I52lY_sS7yOQIf-NbXKr0YLUCnJdx_sxDCPE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PTCommandDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [userLifts, setUserLifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addDebug = (message: string) => {
    console.log(`[DEBUG] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebug('Component mounted');
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    addDebug('Testing Supabase connection...');
    
    try {
      // Test programs
      addDebug('Fetching programs...');
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*');
      
      if (programsError) {
        addDebug(`Programs Error: ${programsError.message}`);
      } else {
        addDebug(`Programs Success: Found ${programsData?.length || 0} programs`);
        setPrograms(programsData || []);
      }

      // Test user lifts
      addDebug('Fetching user lifts...');
      const { data: liftsData, error: liftsError } = await supabase
        .from('user_lifts')
        .select('*');
      
      if (liftsError) {
        addDebug(`User Lifts Error: ${liftsError.message}`);
      } else {
        addDebug(`User Lifts Success: Found ${liftsData?.length || 0} lifts`);
        setUserLifts(liftsData || []);
      }

    } catch (error) {
      addDebug(`Unexpected Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdate1RM = async () => {
    addDebug('Testing 1RM update...');
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_lifts')
        .update({ one_rm: 400 })
        .eq('exercise', 'squat');

      if (error) {
        addDebug(`1RM Update Error: ${error.message}`);
      } else {
        addDebug('1RM Update Success!');
        testConnection(); // Reload data
      }
    } catch (error) {
      addDebug(`1RM Update Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAddExercise = async () => {
    addDebug('Testing Add Exercise...');
    setLoading(true);
    
    try {
      if (programs.length === 0) {
        addDebug('No programs found - cannot add exercise');
        return;
      }

      const currentProgram = programs[0];
      addDebug(`Using program: ${currentProgram.name}`);

      const currentExercises = { ...currentProgram.exercises };
      
      // Add squat to all workout types
      ['heavy', 'medium', 'light'].forEach((workoutType) => {
        if (!currentExercises[workoutType]) {
          currentExercises[workoutType] = {};
        }
        
        currentExercises[workoutType]['squat'] = {
          week_1: { sets: '3×5', weight: 225 },
          week_2: { sets: '3×5', weight: 235 },
          week_3: { sets: '3×5', weight: 245 },
          week_4: { sets: '3×5', weight: 255 }
        };
      });

      addDebug('Updating program in database...');
      const { error } = await supabase
        .from('programs')
        .update({ exercises: currentExercises })
        .eq('id', currentProgram.id);

      if (error) {
        addDebug(`Add Exercise Error: ${error.message}`);
      } else {
        addDebug('Add Exercise Success!');
        testConnection(); // Reload data
      }

    } catch (error) {
      addDebug(`Add Exercise Exception: ${error}`);
    } finally {
      setLoading(false);
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
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#4ade80' }}>
          PT Command Debug Mode
        </h1>
        <p style={{ fontSize: '14px', color: '#888' }}>
          Testing database connectivity and functionality
        </p>
      </div>

      {/* Test Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Test Connection'}
        </button>

        <button
          onClick={testUpdate1RM}
          disabled={loading}
          style={{
            background: '#fbbf24',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Test 1RM Update'}
        </button>

        <button
          onClick={testAddExercise}
          disabled={loading}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Test Add Exercise'}
        </button>

        <button
          onClick={() => setDebugInfo([])}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Clear Debug
        </button>
      </div>

      {/* Current Data */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#111',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#4ade80', marginBottom: '16px' }}>
            Programs ({programs.length})
          </h3>
          {programs.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No programs found</p>
          ) : (
            programs.map(program => (
              <div key={program.id} style={{
                background: '#0a0a0a',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{program.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Exercises: {JSON.stringify(program.exercises, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{
          background: '#111',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#4ade80', marginBottom: '16px' }}>
            User Lifts ({userLifts.length})
          </h3>
          {userLifts.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No lifts found</p>
          ) : (
            userLifts.map((lift, index) => (
              <div key={index} style={{
                background: '#0a0a0a',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 600 }}>{lift.exercise}</span>
                <span style={{ color: '#4ade80' }}>{lift.one_rm} lbs</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Debug Log */}
      <div style={{
        background: '#111',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#4ade80', marginBottom: '16px' }}>
          Debug Log
        </h3>
        <div style={{
          background: '#0a0a0a',
          borderRadius: '8px',
          padding: '16px',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: '"Courier New", monospace',
          fontSize: '12px'
        }}>
          {debugInfo.length === 0 ? (
            <div style={{ color: '#888' }}>No debug messages yet. Click "Test Connection" to start.</div>
          ) : (
            debugInfo.map((message, index) => (
              <div key={index} style={{ 
                marginBottom: '4px',
                color: message.includes('Error') ? '#ef4444' : 
                      message.includes('Success') ? '#4ade80' : '#ccc'
              }}>
                {message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
