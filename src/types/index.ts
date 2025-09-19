export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'officer' | 'clerk' | 'viewer';
  department: string;
  branch: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  branch: string;
}

export interface DAKDocument {
  id: string;
  dakNumber: string;
  referenceNumber?: string;
  type: 'inward' | 'outward';
  subject: string;
  sender: string;
  receiver: string;
  department: string;
  branch: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'received' | 'under_process' | 'forwarded' | 'closed' | 'escalated';
  dateReceived: string;
  dueDate?: string;
  attachments: Attachment[];
  movementLog: MovementLog[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface MovementLog {
  id: string;
  dakId: string;
  action: string;
  fromDepartment: string;
  toDepartment: string;
  remarks?: string;
  actionBy: string;
  actionAt: string;
}

export interface DashboardStats {
  totalInward: number;
  totalOutward: number;
  pending: number;
  overdue: number;
  closedToday: number;
  departmentWiseStats: DepartmentStats[];
}

export interface DepartmentStats {
  department: string;
  inward: number;
  outward: number;
  pending: number;
  overdue: number;
}

export interface SearchFilters {
  dakNumber?: string;
  referenceNumber?: string;
  subject?: string;
  sender?: string;
  department?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: 'inward' | 'outward';
}