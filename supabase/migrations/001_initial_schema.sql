-- PT Command Database Schema
-- Heavy/Medium/Light Training Protocol

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE workout_type AS ENUM ('heavy', 'medium', 'light');
CREATE TYPE exercise_name AS ENUM ('bench_press', 'overhead_press', 'deadlift', 'squat', 'kettlebell_swings');
CREATE TYPE kb_protocol AS ENUM ('for_time', 'timed_rest', 'emom');

-- User lifts table (1RMs and training maxes)
CREATE TABLE user_lifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise exercise_name NOT NULL,
    one_rm INTEGER NOT NULL, -- in pounds
    training_max INTEGER NOT NULL, -- in pounds (usually 90-95% of 1RM)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, exercise)
);

-- Program templates (H/M/L structure)
CREATE TABLE programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    workout_type workout_type NOT NULL,
    is_default BOOLEAN DEFAULT false,
    exercises JSONB NOT NULL, -- Exercise structure with sets/reps/percentages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sessions
CREATE TABLE workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    workout_type workout_type NOT NULL,
    week_number INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER, -- total workout time
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sets within workouts
CREATE TABLE workout_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise exercise_name NOT NULL,
    set_number INTEGER NOT NULL,
    prescribed_weight INTEGER NOT NULL,
    prescribed_reps INTEGER NOT NULL,
    actual_weight INTEGER,
    actual_reps INTEGER,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    rest_time_seconds INTEGER, -- how long they rested before this set
    notes TEXT,
    
    -- For KB swings
    kb_protocol kb_protocol,
    kb_total_reps INTEGER,
    kb_time_seconds INTEGER -- for "for_time" protocol
);

-- Week progression tracking
CREATE TABLE week_progression (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    heavy_completed BOOLEAN DEFAULT false,
    light_completed BOOLEAN DEFAULT false,
    medium_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, week_number)
);

-- Create indexes for performance
CREATE INDEX idx_user_lifts_user_id ON user_lifts(user_id);
CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);
CREATE INDEX idx_week_progression_user_id ON week_progression(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE user_lifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_progression ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- user_lifts policies
CREATE POLICY "Users can view own lifts" ON user_lifts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lifts" ON user_lifts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lifts" ON user_lifts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lifts" ON user_lifts
    FOR DELETE USING (auth.uid() = user_id);

-- programs policies
CREATE POLICY "Users can view own programs" ON programs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own programs" ON programs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own programs" ON programs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own programs" ON programs
    FOR DELETE USING (auth.uid() = user_id);

-- workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts
    FOR DELETE USING (auth.uid() = user_id);

-- workout_sets policies
CREATE POLICY "Users can view own workout sets" ON workout_sets
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id));
CREATE POLICY "Users can insert own workout sets" ON workout_sets
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id));
CREATE POLICY "Users can update own workout sets" ON workout_sets
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id));
CREATE POLICY "Users can delete own workout sets" ON workout_sets
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id));

-- week_progression policies
CREATE POLICY "Users can view own week progression" ON week_progression
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own week progression" ON week_progression
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own week progression" ON week_progression
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert default H/M/L programs for new users
CREATE OR REPLACE FUNCTION create_default_programs()
RETURNS TRIGGER AS $$
BEGIN
    -- Heavy Day Program (Monday)
    INSERT INTO programs (user_id, name, workout_type, is_default, exercises) VALUES
    (NEW.id, 'Heavy Day - Deadlifts + Bench', 'heavy', true, 
     '[
        {
          "name": "deadlift",
          "sets": [
            {"weight_percent": 70, "reps": 5, "type": "warmup"},
            {"weight_percent": 80, "reps": 3, "type": "warmup"},
            {"weight_percent": 90, "reps": 1, "type": "work"},
            {"weight_percent": 94, "reps": 1, "type": "max"}
          ]
        },
        {
          "name": "bench_press", 
          "sets": [
            {"weight_percent": 70, "reps": 5, "type": "warmup"},
            {"weight_percent": 80, "reps": 3, "type": "warmup"},
            {"weight_percent": 90, "reps": 1, "type": "work"},
            {"weight_percent": 94, "reps": 1, "type": "max"}
          ]
        },
        {
          "name": "kettlebell_swings",
          "sets": [
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"}
          ],
          "protocol": "for_time"
        }
      ]'::jsonb);

    -- Light Day Program (Wednesday) 
    INSERT INTO programs (user_id, name, workout_type, is_default, exercises) VALUES
    (NEW.id, 'Light Day - Squats + OHP', 'light', true,
     '[
        {
          "name": "squat",
          "sets": [
            {"weight_percent": 60, "reps": 8, "type": "work"},
            {"weight_percent": 65, "reps": 6, "type": "work"},
            {"weight_percent": 70, "reps": 4, "type": "work"},
            {"weight_percent": 70, "reps": 4, "type": "work"}
          ]
        },
        {
          "name": "overhead_press",
          "sets": [
            {"weight_percent": 60, "reps": 8, "type": "work"},
            {"weight_percent": 65, "reps": 6, "type": "work"},
            {"weight_percent": 70, "reps": 4, "type": "work"},
            {"weight_percent": 70, "reps": 4, "type": "work"}
          ]
        },
        {
          "name": "kettlebell_swings",
          "sets": [
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"},
            {"weight": 35, "reps": 20, "type": "work"}
          ],
          "protocol": "timed_rest",
          "rest_seconds": 60
        }
      ]'::jsonb);

    -- Medium Day Program (Friday)
    INSERT INTO programs (user_id, name, workout_type, is_default, exercises) VALUES  
    (NEW.id, 'Medium Day - Squats + OHP', 'medium', true,
     '[
        {
          "name": "squat", 
          "sets": [
            {"weight_percent": 70, "reps": 5, "type": "work"},
            {"weight_percent": 75, "reps": 3, "type": "work"},
            {"weight_percent": 80, "reps": 1, "type": "work"},
            {"weight_percent": 85, "reps": 1, "type": "work"}
          ]
        },
        {
          "name": "overhead_press",
          "sets": [
            {"weight_percent": 70, "reps": 5, "type": "work"},
            {"weight_percent": 75, "reps": 3, "type": "work"},
            {"weight_percent": 80, "reps": 1, "type": "work"},
            {"weight_percent": 85, "reps": 1, "type": "work"}
          ]
        },
        {
          "name": "kettlebell_swings",
          "sets": [
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"},
            {"weight": 35, "reps": 10, "type": "work"}
          ],
          "protocol": "timed_rest",
          "rest_seconds": 60
        }
      ]'::jsonb);

    -- Insert default lift values
    INSERT INTO user_lifts (user_id, exercise, one_rm, training_max) VALUES
    (NEW.id, 'bench_press', 275, 250),
    (NEW.id, 'overhead_press', 185, 170), 
    (NEW.id, 'deadlift', 450, 410),
    (NEW.id, 'squat', 315, 285);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default programs for new users
CREATE TRIGGER create_default_programs_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_programs();

-- Function to get current week number
CREATE OR REPLACE FUNCTION get_current_week()
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(week FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate weight from percentage of training max
CREATE OR REPLACE FUNCTION calculate_weight(exercise_name exercise_name, percentage DECIMAL, user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    training_max INTEGER;
BEGIN
    SELECT ul.training_max INTO training_max 
    FROM user_lifts ul 
    WHERE ul.user_id = $3 AND ul.exercise = $1;
    
    RETURN ROUND(training_max * percentage / 100);
END;
$$ LANGUAGE plpgsql;
