# DAK Management System - Database Setup Guide

## Overview
This document provides comprehensive instructions for setting up the database schema for the DAK Management System on Neon (PostgreSQL) or Supabase.

## Database Schema

### Tables Structure

#### 1. **departments**
Stores department information across different branches.
- `id` (UUID, Primary Key)
- `name` (Text, NOT NULL) - Department name
- `code` (Text, UNIQUE, NOT NULL) - Department code (e.g., 'FIN', 'HR')
- `head_name` (Text) - Department head name
- `head_email` (Text) - Department head email
- `branch` (Text, DEFAULT 'main') - Branch identifier
- `is_active` (Boolean, DEFAULT true)
- `created_at`, `updated_at` (Timestamp)

#### 2. **users**
User management with role-based access control.
- `id` (UUID, Primary Key)
- `auth_user_id` (UUID, Foreign Key to auth.users)
- `name` (Text, NOT NULL)
- `email` (Text, UNIQUE, NOT NULL)
- `role` (Enum: 'admin', 'officer', 'clerk', 'viewer')
- `department_id` (UUID, Foreign Key to departments)
- `branch` (Text, DEFAULT 'main')
- `is_active` (Boolean, DEFAULT true)
- `last_login` (Timestamp)
- `created_at`, `updated_at` (Timestamp)

#### 3. **dak_documents**
Main table for storing DAK documents (inward/outward).
- `id` (UUID, Primary Key)
- `dak_number` (Text, UNIQUE, NOT NULL) - Auto-generated
- `reference_number` (Text) - External reference
- `type` (Enum: 'inward', 'outward')
- `subject` (Text, NOT NULL)
- `sender` (Text, NOT NULL)
- `sender_address` (Text)
- `receiver` (Text)
- `receiver_address` (Text)
- `department_id` (UUID, Foreign Key)
- `branch` (Text, DEFAULT 'main')
- `priority` (Enum: 'low', 'medium', 'high', 'urgent')
- `status` (Enum: 'received', 'under_process', 'forwarded', 'closed', 'escalated', 'draft', 'sent')
- `date_received` (Timestamp, DEFAULT now())
- `date_sent` (Timestamp)
- `due_date` (Timestamp)
- `content` (Text) - Document content
- `remarks` (Text)
- `created_by` (UUID, Foreign Key to users)
- `assigned_to` (UUID, Foreign Key to users)
- `created_at`, `updated_at` (Timestamp)

#### 4. **attachments**
File attachments for DAK documents.
- `id` (UUID, Primary Key)
- `dak_id` (UUID, Foreign Key to dak_documents)
- `file_name` (Text, NOT NULL)
- `file_size` (BigInt, NOT NULL)
- `file_type` (Text, NOT NULL)
- `file_path` (Text, NOT NULL)
- `uploaded_by` (UUID, Foreign Key to users)
- `uploaded_at` (Timestamp, DEFAULT now())

#### 5. **movement_logs**
Track DAK movement history and actions.
- `id` (UUID, Primary Key)
- `dak_id` (UUID, Foreign Key to dak_documents)
- `action` (Text, NOT NULL) - Action performed
- `from_department_id` (UUID, Foreign Key to departments)
- `to_department_id` (UUID, Foreign Key to departments)
- `from_user_id` (UUID, Foreign Key to users)
- `to_user_id` (UUID, Foreign Key to users)
- `remarks` (Text)
- `action_by` (UUID, Foreign Key to users)
- `action_at` (Timestamp, DEFAULT now())

#### 6. **escalations**
Escalation management for overdue DAKs.
- `id` (UUID, Primary Key)
- `dak_id` (UUID, Foreign Key to dak_documents)
- `escalation_level` (Integer, DEFAULT 1)
- `escalated_to` (UUID, Foreign Key to users)
- `escalated_by` (UUID, Foreign Key to users)
- `reason` (Text, NOT NULL)
- `status` (Enum: 'active', 'resolved', 'cancelled')
- `escalated_at` (Timestamp, DEFAULT now())
- `resolved_at` (Timestamp)

#### 7. **notifications**
System notifications for users.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `dak_id` (UUID, Foreign Key to dak_documents)
- `title` (Text, NOT NULL)
- `message` (Text, NOT NULL)
- `type` (Enum: 'info', 'warning', 'error', 'success')
- `is_read` (Boolean, DEFAULT false)
- `created_at` (Timestamp, DEFAULT now())

#### 8. **audit_logs**
Comprehensive audit trail for all system actions.
- `id` (UUID, Primary Key)
- `table_name` (Text, NOT NULL)
- `record_id` (UUID, NOT NULL)
- `action` (Enum: 'INSERT', 'UPDATE', 'DELETE')
- `old_values` (JSONB)
- `new_values` (JSONB)
- `user_id` (UUID, Foreign Key to users)
- `ip_address` (INET)
- `user_agent` (Text)
- `created_at` (Timestamp, DEFAULT now())

## Key Features

### 1. **Auto-Generated DAK Numbers**
- Format: `IN/2024/000001` (Inward) or `OUT/2024/000001` (Outward)
- Automatic sequence generation per year and type
- Implemented via PostgreSQL function `generate_dak_number()`

### 2. **Row Level Security (RLS)**
- Department-based access control
- Role-based permissions (admin, officer, clerk, viewer)
- Secure data isolation between departments

### 3. **Comprehensive Indexing**
- Optimized queries for DAK number, status, department
- Date-based indexing for reporting
- Full-text search capabilities

### 4. **Audit Trail**
- Complete tracking of all database changes
- User action logging with IP and user agent
- JSONB storage for flexible audit data

## Setup Instructions

### For Neon Database:

1. **Create a new Neon project**
2. **Copy the migration SQL** from `supabase/migrations/create_dak_management_schema.sql`
3. **Execute the SQL** in your Neon SQL editor
4. **Update environment variables** in your application:
   ```env
   DATABASE_URL=your_neon_connection_string
   ```

### For Supabase:

1. **Create a new Supabase project**
2. **Enable authentication** in Supabase dashboard
3. **Run the migration** by copying the SQL to Supabase SQL editor
4. **Update environment variables**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Sample Data

The migration includes sample departments:
- Finance Department (FIN)
- Human Resources (HR)
- Information Technology (IT)
- Legal Department (LEG)
- Administration (ADM)
- Operations (OPS)
- Marketing (MKT)
- Sales (SAL)

## Security Considerations

1. **Row Level Security** is enabled on all tables
2. **Role-based access control** restricts data access
3. **Audit logging** tracks all system activities
4. **File upload security** with type and size validation
5. **Department isolation** ensures data privacy

## Performance Optimizations

1. **Strategic indexing** on frequently queried columns
2. **JSONB storage** for flexible audit data
3. **Efficient foreign key relationships**
4. **Optimized RLS policies** for minimal performance impact

## Backup and Maintenance

1. **Regular database backups** (automated in Neon/Supabase)
2. **Audit log archival** for long-term storage
3. **Index maintenance** for optimal performance
4. **Security updates** and monitoring

## API Integration

The schema is designed to work seamlessly with:
- Supabase client libraries
- PostgreSQL drivers
- REST API endpoints
- Real-time subscriptions

This database schema provides a robust foundation for the DAK Management System with enterprise-grade security, performance, and scalability features.