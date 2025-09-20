import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface DAKDocument {
    id: string;
    dak_number: string;
    reference_number?: string;
    type: "inward" | "outward";
    subject: string;
    sender: string;
    sender_address?: string;
    receiver?: string;
    receiver_address?: string;
    department_id?: string;
    priority: "low" | "medium" | "high" | "urgent";
    status:
        | "received"
        | "under_process"
        | "forwarded"
        | "closed"
        | "escalated"
        | "draft"
        | "sent";
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
                .from("dak_documents")
                .select(
                    `
          *,
          departments (
            name,
            code
          )
        `
                )
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;
            setDocuments(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const createDocument = async (documentData: any) => {
        try {
            // Clean the data - remove undefined values and ensure required fields
            const cleanData = {
                reference_number: documentData.reference_number || null,
                subject: documentData.subject,
                sender: documentData.sender,
                sender_address: documentData.sender_address || null,
                receiver: documentData.receiver || null,
                receiver_address: documentData.receiver_address || null,
                department_id: documentData.department_id || null,
                branch: documentData.branch || "main",
                priority: documentData.priority || "medium",
                status: documentData.status || "received",
                type: documentData.type,
                date_received:
                    documentData.date_received || new Date().toISOString(),
                date_sent: documentData.date_sent || null,
                due_date: documentData.due_date || null,
                content: documentData.content || null,
                remarks: documentData.remarks || null,
                created_by: documentData.created_by || null,
                assigned_to: documentData.assigned_to || null,
            };

            console.log("Inserting data:", cleanData);

            const { data, error } = await supabase
                .from("dak_documents")
                .insert(cleanData)
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }

            console.log("Insert successful:", data);

            // Refresh the documents list
            await fetchDocuments();
            return { data, error: null };
        } catch (err) {
            console.error("Create document error:", err);
            return {
                data: null,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    };

    const updateDocument = async (
        id: string,
        updates: Partial<DAKDocument>
    ) => {
        try {
            const { data, error } = await supabase
                .from("dak_documents")
                .update(updates)
                .eq("id", id);

            if (error) throw error;

            // Refresh the documents list
            await fetchDocuments();
            return { data, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : "An error occurred",
            };
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
