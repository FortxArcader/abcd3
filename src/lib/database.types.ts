export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          code: string
          head_name: string | null
          head_email: string | null
          branch: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          head_name?: string | null
          head_email?: string | null
          branch?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          head_name?: string | null
          head_email?: string | null
          branch?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          name: string
          email: string
          role: 'admin' | 'officer' | 'clerk' | 'viewer'
          department_id: string | null
          branch: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          name: string
          email: string
          role: 'admin' | 'officer' | 'clerk' | 'viewer'
          department_id?: string | null
          branch?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          name?: string
          email?: string
          role?: 'admin' | 'officer' | 'clerk' | 'viewer'
          department_id?: string | null
          branch?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dak_documents: {
        Row: {
          id: string
          dak_number: string
          reference_number: string | null
          type: 'inward' | 'outward'
          subject: string
          sender: string
          sender_address: string | null
          receiver: string | null
          receiver_address: string | null
          department_id: string | null
          branch: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'received' | 'under_process' | 'forwarded' | 'closed' | 'escalated' | 'draft' | 'sent'
          date_received: string
          date_sent: string | null
          due_date: string | null
          content: string | null
          remarks: string | null
          created_by: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dak_number?: string
          reference_number?: string | null
          type: 'inward' | 'outward'
          subject: string
          sender: string
          sender_address?: string | null
          receiver?: string | null
          receiver_address?: string | null
          department_id?: string | null
          branch?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'received' | 'under_process' | 'forwarded' | 'closed' | 'escalated' | 'draft' | 'sent'
          date_received?: string
          date_sent?: string | null
          due_date?: string | null
          content?: string | null
          remarks?: string | null
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dak_number?: string
          reference_number?: string | null
          type?: 'inward' | 'outward'
          subject?: string
          sender?: string
          sender_address?: string | null
          receiver?: string | null
          receiver_address?: string | null
          department_id?: string | null
          branch?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'received' | 'under_process' | 'forwarded' | 'closed' | 'escalated' | 'draft' | 'sent'
          date_received?: string
          date_sent?: string | null
          due_date?: string | null
          content?: string | null
          remarks?: string | null
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          dak_id: string
          file_name: string
          file_size: number
          file_type: string
          file_path: string
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          dak_id: string
          file_name: string
          file_size: number
          file_type: string
          file_path: string
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          dak_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_path?: string
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
      movement_logs: {
        Row: {
          id: string
          dak_id: string
          action: string
          from_department_id: string | null
          to_department_id: string | null
          from_user_id: string | null
          to_user_id: string | null
          remarks: string | null
          action_by: string | null
          action_at: string
        }
        Insert: {
          id?: string
          dak_id: string
          action: string
          from_department_id?: string | null
          to_department_id?: string | null
          from_user_id?: string | null
          to_user_id?: string | null
          remarks?: string | null
          action_by?: string | null
          action_at?: string
        }
        Update: {
          id?: string
          dak_id?: string
          action?: string
          from_department_id?: string | null
          to_department_id?: string | null
          from_user_id?: string | null
          to_user_id?: string | null
          remarks?: string | null
          action_by?: string | null
          action_at?: string
        }
      }
      escalations: {
        Row: {
          id: string
          dak_id: string
          escalation_level: number
          escalated_to: string | null
          escalated_by: string | null
          reason: string
          status: 'active' | 'resolved' | 'cancelled'
          escalated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          dak_id: string
          escalation_level?: number
          escalated_to?: string | null
          escalated_by?: string | null
          reason: string
          status?: 'active' | 'resolved' | 'cancelled'
          escalated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          dak_id?: string
          escalation_level?: number
          escalated_to?: string | null
          escalated_by?: string | null
          reason?: string
          status?: 'active' | 'resolved' | 'cancelled'
          escalated_at?: string
          resolved_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          dak_id: string | null
          title: string
          message: string
          type: 'info' | 'warning' | 'error' | 'success'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dak_id?: string | null
          title: string
          message: string
          type?: 'info' | 'warning' | 'error' | 'success'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dak_id?: string | null
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'error' | 'success'
          is_read?: boolean
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values: Json | null
          new_values: Json | null
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: Json | null
          new_values?: Json | null
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: Json | null
          new_values?: Json | null
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_dak_number: {
        Args: {
          dak_type: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}