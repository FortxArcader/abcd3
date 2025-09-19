import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DAKDocument {
  id: string;
  dak_number: string;
  reference_number?: string;
  type: 'inward' | 'outward';
  subject: string;
  sender: string;
  sender_address?: string;
  receiver?: string;
  receiver_address?: string;
  department_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'received' | 'under_process' | 'forwarded' | 'closed' | 'escalated' | 'draft' | 'sent';
  date_received: string;
  date_sent?: string;
  due_date?: string;
  content?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  departments?: {
    name: string;
    code: string;
  };
}

export const useDAKData = () => {
  const [documents, setDocuments] = useState<DAKDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dak_documents')
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: Partial<DAKDocument>) => {
    try {
      const { data, error } = await supabase
        .from('dak_documents')
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the documents list
      await fetchDocuments();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateDocument = async (id: string, updates: Partial<DAKDocument>) => {
    try {
      const { data, error } = await supabase
        .from('dak_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the documents list
      await fetchDocuments();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
  };
};