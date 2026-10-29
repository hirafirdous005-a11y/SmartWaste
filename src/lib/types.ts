export type UserRole = 'citizen' | 'admin' | 'worker';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  account_status: 'active' | 'suspended' | 'pending';
  avatar_url?: string;
  zone?: string;
  created_at: string;
}

export type WasteCategory =
  | 'Wet waste'
  | 'Dry waste'
  | 'Organic waste'
  | 'Plastic waste'
  | 'Paper waste'
  | 'Glass waste'
  | 'Metal waste'
  | 'E-waste'
  | 'Hazardous waste'
  | 'Mixed waste';

export const ALL_WASTE_CATEGORIES: WasteCategory[] = [
  'Wet waste',
  'Dry waste',
  'Organic waste',
  'Plastic waste',
  'Paper waste',
  'Glass waste',
  'Metal waste',
  'E-waste',
  'Hazardous waste',
  'Mixed waste',
];

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type WorkerTaskStatus =
  | 'Assigned'
  | 'Accepted'
  | 'On the Way'
  | 'In Progress'
  | 'Completed'
  | 'Issue Reported';

export interface AIClassificationResult {
  predicted_category: WasteCategory;
  confidence: number; // 0 - 100
  wet_dry: 'Wet waste' | 'Dry waste' | 'Mixed/Uncertain';
  recyclable: boolean;
  hazard_level: 'None' | 'Low' | 'Moderate' | 'High';
  disposal_instructions: string;
  needs_review: boolean;
  raw_analysis?: string;
}

export interface WasteReport {
  id: string;
  complaint_number: string;
  citizen_id: string;
  citizen_name: string;
  citizen_phone?: string;
  description: string;
  quantity: string;
  image_url: string;
  latitude: number;
  longitude: number;
  address: string;
  predicted_category: WasteCategory;
  verified_category: WasteCategory | null;
  ai_confidence: number;
  ai_details?: AIClassificationResult;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_worker_id?: string | null;
  assigned_worker_name?: string | null;
  rejection_reason?: string | null;
  reopened_reason?: string | null;
  citizen_feedback?: 'confirmed' | 'reopened' | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerTask {
  id: string;
  report_id: string;
  worker_id: string;
  assigned_by: string;
  task_status: WorkerTaskStatus;
  assigned_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  completion_notes?: string | null;
  before_image?: string | null;
  after_image?: string | null;
  issue_reported?: {
    type: 'inaccessible' | 'wrong_gps' | 'insufficient_equipment' | 'hazardous_materials' | 'other';
    description: string;
    reported_at: string;
  } | null;
}

export interface TaskImage {
  id: string;
  task_id: string;
  image_url: string;
  image_type: 'before' | 'after';
  uploaded_at: string;
}

export interface AppNotification {
  id: string;
  recipient_id: string;
  report_id?: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'completion' | 'alert' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface SanitationWorker {
  id: string;
  name: string;
  email: string;
  phone: string;
  assigned_zone: string;
  status: 'Available' | 'On Task' | 'Off Duty';
  active_tasks_count: number;
  completed_tasks_count: number;
  rating: number;
  avatar: string;
  vehicle_number?: string;
  current_latitude?: number;
  current_longitude?: number;
}

export interface AdminSession {
  token: string;
  badge_id: string;
  officer_name: string;
  email: string;
  clearance_level: string;
  authenticated_at: string;
  expires_at: string;
  is_locked: boolean;
}
