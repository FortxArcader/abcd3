/*
  # DAK Management System Database Schema

  1. New Tables
    - `departments` - Store department information
    - `users` - User management with roles and permissions
    - `dak_documents` - Main DAK documents table (inward/outward)
    - `attachments` - File attachments for DAK documents
    - `movement_logs` - Track DAK movement history
    - `escalations` - Escalation rules and alerts
    - `notifications` - System notifications
    - `audit_logs` - System audit trail

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure file upload handling

  3. Features
    - Auto-generated DAK numbers
    - Status tracking workflow
    - Department-wise access control
    - Comprehensive audit trail
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  head_name text,
  head_email text,
  branch text NOT NULL DEFAULT 'main',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'officer', 'clerk', 'viewer')),
  department_id uuid REFERENCES departments(id),
  branch text NOT NULL DEFAULT 'main',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create DAK documents table
CREATE TABLE IF NOT EXISTS dak_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dak_number text UNIQUE NOT NULL,
  reference_number text,
  type text NOT NULL CHECK (type IN ('inward', 'outward')),
  subject text NOT NULL,
  sender text NOT NULL,
  sender_address text,
  receiver text,
  receiver_address text,
  department_id uuid REFERENCES departments(id),
  branch text NOT NULL DEFAULT 'main',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_process', 'forwarded', 'closed', 'escalated', 'draft', 'sent')),
  date_received timestamptz DEFAULT now(),
  date_sent timestamptz,
  due_date timestamptz,
  content text,
  remarks text,
  created_by uuid REFERENCES users(id),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dak_id uuid REFERENCES dak_documents(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Create movement logs table
CREATE TABLE IF NOT EXISTS movement_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dak_id uuid REFERENCES dak_documents(id) ON DELETE CASCADE,
  action text NOT NULL,
  from_department_id uuid REFERENCES departments(id),
  to_department_id uuid REFERENCES departments(id),
  from_user_id uuid REFERENCES users(id),
  to_user_id uuid REFERENCES users(id),
  remarks text,
  action_by uuid REFERENCES users(id),
  action_at timestamptz DEFAULT now()
);

-- Create escalations table
CREATE TABLE IF NOT EXISTS escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dak_id uuid REFERENCES dak_documents(id) ON DELETE CASCADE,
  escalation_level integer NOT NULL DEFAULT 1,
  escalated_to uuid REFERENCES users(id),
  escalated_by uuid REFERENCES users(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  escalated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  dak_id uuid REFERENCES dak_documents(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES users(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dak_documents_dak_number ON dak_documents(dak_number);
CREATE INDEX IF NOT EXISTS idx_dak_documents_type ON dak_documents(type);
CREATE INDEX IF NOT EXISTS idx_dak_documents_status ON dak_documents(status);
CREATE INDEX IF NOT EXISTS idx_dak_documents_department ON dak_documents(department_id);
CREATE INDEX IF NOT EXISTS idx_dak_documents_created_at ON dak_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_dak_documents_due_date ON dak_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_movement_logs_dak_id ON movement_logs(dak_id);
CREATE INDEX IF NOT EXISTS idx_movement_logs_action_at ON movement_logs(action_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dak_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
CREATE POLICY "Users can view departments" ON departments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create RLS policies for users
CREATE POLICY "Users can view other users" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create RLS policies for DAK documents
CREATE POLICY "Users can view DAK documents in their department" ON dak_documents
  FOR SELECT TO authenticated
  USING (
    department_id IN (
      SELECT department_id FROM users 
      WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );

CREATE POLICY "Users can create DAK documents" ON dak_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update DAK documents they created or are assigned to" ON dak_documents
  FOR UPDATE TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
    OR
    assigned_to IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );

-- Create RLS policies for attachments
CREATE POLICY "Users can view attachments for accessible DAK documents" ON attachments
  FOR SELECT TO authenticated
  USING (
    dak_id IN (
      SELECT id FROM dak_documents
      WHERE department_id IN (
        SELECT department_id FROM users 
        WHERE auth_user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'officer')
      )
    )
  );

CREATE POLICY "Users can upload attachments" ON attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for movement logs
CREATE POLICY "Users can view movement logs for accessible DAK documents" ON movement_logs
  FOR SELECT TO authenticated
  USING (
    dak_id IN (
      SELECT id FROM dak_documents
      WHERE department_id IN (
        SELECT department_id FROM users 
        WHERE auth_user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'officer')
      )
    )
  );

CREATE POLICY "Users can create movement logs" ON movement_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    action_by IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for escalations
CREATE POLICY "Users can view escalations for accessible DAK documents" ON escalations
  FOR SELECT TO authenticated
  USING (
    dak_id IN (
      SELECT id FROM dak_documents
      WHERE department_id IN (
        SELECT department_id FROM users 
        WHERE auth_user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'officer')
      )
    )
  );

CREATE POLICY "Officers and admins can manage escalations" ON escalations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'officer')
    )
  );

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create function to generate DAK numbers
CREATE OR REPLACE FUNCTION generate_dak_number(dak_type text)
RETURNS text AS $$
DECLARE
  prefix text;
  year_part text;
  sequence_num integer;
  dak_number text;
BEGIN
  -- Set prefix based on type
  prefix := CASE 
    WHEN dak_type = 'inward' THEN 'IN'
    WHEN dak_type = 'outward' THEN 'OUT'
    ELSE 'DAK'
  END;
  
  -- Get current year
  year_part := EXTRACT(YEAR FROM NOW())::text;
  
  -- Get next sequence number for this year and type
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(dak_number FROM '\d+$') AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM dak_documents
  WHERE dak_number LIKE prefix || '/' || year_part || '/%';
  
  -- Format the DAK number
  dak_number := prefix || '/' || year_part || '/' || LPAD(sequence_num::text, 6, '0');
  
  RETURN dak_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate DAK numbers
CREATE OR REPLACE FUNCTION set_dak_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dak_number IS NULL OR NEW.dak_number = '' THEN
    NEW.dak_number := generate_dak_number(NEW.type);
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating DAK numbers
CREATE TRIGGER trigger_set_dak_number
  BEFORE INSERT OR UPDATE ON dak_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_dak_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample departments
INSERT INTO departments (name, code, head_name, head_email, branch) VALUES
  ('Finance Department', 'FIN', 'John Smith', 'john.smith@company.com', 'main'),
  ('Human Resources', 'HR', 'Sarah Johnson', 'sarah.johnson@company.com', 'main'),
  ('Information Technology', 'IT', 'Mike Wilson', 'mike.wilson@company.com', 'main'),
  ('Legal Department', 'LEG', 'Emily Davis', 'emily.davis@company.com', 'main'),
  ('Administration', 'ADM', 'Robert Brown', 'robert.brown@company.com', 'main'),
  ('Operations', 'OPS', 'Lisa Garcia', 'lisa.garcia@company.com', 'main'),
  ('Marketing', 'MKT', 'David Miller', 'david.miller@company.com', 'main'),
  ('Sales', 'SAL', 'Jennifer Wilson', 'jennifer.wilson@company.com', 'main')
ON CONFLICT (code) DO NOTHING;