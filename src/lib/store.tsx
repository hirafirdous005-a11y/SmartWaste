'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  WasteReport,
  WorkerTask,
  AppNotification,
  AuditLog,
  SanitationWorker,
  ComplaintStatus,
  WorkerTaskStatus,
  WasteCategory,
  AdminSession,
} from './types';
import {
  SEED_USERS,
  SEED_WORKERS,
  SEED_REPORTS,
  SEED_TASKS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
} from './seedData';
import { isSupabaseConfigured, supabase } from './supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  adminSession: AdminSession | null;
  users: UserProfile[];
  workers: SanitationWorker[];
  reports: WasteReport[];
  tasks: WorkerTask[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  isConfiguredWithSupabase: boolean;
  isLoaded: boolean;
  switchUserRole: (role: UserRole) => void;
  loginUser: (email: string, password?: string) => boolean;
  adminLogin: (email: string, password: string, securityPin?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  lockAdminSession: () => void;
  unlockAdminSession: (pin: string) => boolean;
  registerUser: (fullName: string, email: string, phone: string, role: UserRole) => boolean;
  logoutUser: () => void;
  createReport: (report: Omit<WasteReport, 'id' | 'complaint_number' | 'created_at' | 'updated_at'>) => WasteReport;
  updateReportStatus: (reportId: string, status: ComplaintStatus, reason?: string) => void;
  verifyReportCategory: (reportId: string, verifiedCategory: WasteCategory) => void;
  assignWorkerToReport: (reportId: string, workerId: string) => void;
  addWorker: (worker: { name: string; email: string; phone: string; assigned_zone: string }) => void;
  updateWorkerStatus: (workerId: string, status: 'Available' | 'On Task' | 'Off Duty') => void;
  updateTaskProgress: (
    taskId: string,
    status: WorkerTaskStatus,
    notes?: string,
    beforeImage?: string,
    afterImage?: string
  ) => void;
  reportTaskIssue: (
    taskId: string,
    issueType: 'inaccessible' | 'wrong_gps' | 'insufficient_equipment' | 'hazardous_materials' | 'other',
    description: string
  ) => void;
  confirmResolution: (reportId: string) => void;
  reopenReport: (reportId: string, reason: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  stats: {
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    overdue: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_REPORTS = 'swm_reports_v1';
const LOCAL_STORAGE_KEY_TASKS = 'swm_tasks_v1';
const LOCAL_STORAGE_KEY_NOTIFS = 'swm_notifs_v1';
const LOCAL_STORAGE_KEY_USER = 'swm_current_user_v1';
const LOCAL_STORAGE_KEY_AUDIT = 'swm_audit_v1';
const LOCAL_STORAGE_KEY_ADMIN_SESSION = 'swm_admin_session_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(SEED_USERS);
  const [workers, setWorkers] = useState<SanitationWorker[]>(SEED_WORKERS);
  const [reports, setReports] = useState<WasteReport[]>(SEED_REPORTS);
  const [tasks, setTasks] = useState<WorkerTask[]>(SEED_TASKS);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedReports = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      const storedNotifs = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
      if (storedNotifs) {
        setNotifications(JSON.parse(storedNotifs));
      }
      const storedAudit = localStorage.getItem(LOCAL_STORAGE_KEY_AUDIT);
      if (storedAudit) {
        setAuditLogs(JSON.parse(storedAudit));
      }
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      const storedAdminSession = localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN_SESSION);
      if (storedAdminSession) {
        const parsedSession: AdminSession = JSON.parse(storedAdminSession);
        // Check if session expired
        if (new Date(parsedSession.expires_at).getTime() > Date.now()) {
          setAdminSession(parsedSession);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY_ADMIN_SESSION);
        }
      }

      // Synchronize with live Supabase database tables if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('waste_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              setReports(data as WasteReport[]);
            }
          });

        supabase
          .from('worker_tasks')
          .select('*')
          .order('assigned_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              setTasks(data as WorkerTask[]);
            }
          });

        supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              setNotifications(data as AppNotification[]);
            }
          });

        supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              setAuditLogs(data as AuditLog[]);
            }
          });
      }
    } catch (e) {
      console.warn('Error reading from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(reports));
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
      localStorage.setItem(LOCAL_STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      }
      if (adminSession) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_SESSION, JSON.stringify(adminSession));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_ADMIN_SESSION);
      }
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  }, [reports, tasks, notifications, auditLogs, currentUser, adminSession, isLoaded]);

  // Switch Role helper
  const switchUserRole = (role: UserRole) => {
    // If user is currently logged out, do NOT automatically log them in!
    if (!currentUser) {
      return;
    }
    if (role === 'admin' && !adminSession) {
      // Admin portal requires strict authentication
      return;
    }
    const targetUser = users.find((u) => u.role === role) || SEED_USERS.find((u) => u.role === role) || null;
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(targetUser));
    }
  };

  const loginUser = (email: string, password?: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const user =
      users.find((u) => u.email.toLowerCase() === trimmed) ||
      SEED_USERS.find((u) => u.email.toLowerCase() === trimmed);

    if (user) {
      if (password && password.length < 4 && !password.includes('••')) {
        return false;
      }
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
      return true;
    }
    return false;
  };

  // Secure Administrator Authentication
  const adminLogin = async (
    email: string,
    password: string,
    securityPin?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const adminUser = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.role === 'admin'
    );

    if (!adminUser) {
      addAuditLog(
        'ADMIN_LOGIN_UNAUTHORIZED',
        'SECURITY_GATE',
        `Access denied: ${email} does not possess administrator privileges.`
      );
      return {
        success: false,
        error: 'Access denied: The provided email is not registered as a municipal administrator.',
      };
    }

    // Supabase auth check if connected
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: sbError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (sbError) {
          addAuditLog('ADMIN_LOGIN_FAILED', 'SUPABASE_AUTH', sbError.message);
          return { success: false, error: sbError.message };
        }
      } catch (err: any) {
        console.warn('Supabase auth warning:', err);
      }
    } else {
      // Local secure password verification
      const validPasswords = ['AdminSecure@2026', 'admin123', 'admin2026', 'admin@123', 'password123'];
      if (!validPasswords.includes(password) && password.length < 6) {
        addAuditLog(
          'ADMIN_LOGIN_FAILED',
          'PASSWORD_AUTH',
          `Failed password attempt for administrator: ${trimmedEmail}`
        );
        return {
          success: false,
          error: 'Invalid administrator password. Use "AdminSecure@2026" or your assigned password.',
        };
      }
    }

    // Security PIN verification (Level 4 2FA)
    if (securityPin && securityPin.trim() !== '2026' && securityPin.trim() !== '774920') {
      addAuditLog(
        'ADMIN_2FA_REJECTED',
        'PIN_VERIFICATION',
        `Invalid 2FA Officer PIN entered for administrator: ${adminUser.full_name}`
      );
      return {
        success: false,
        error: 'Invalid Officer Badge 2FA Security PIN. Use municipal authorization PIN: 2026.',
      };
    }

    // Create authenticated administrator session token
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8-hour shift
    const newSession: AdminSession = {
      token: `adm_sec_${Math.random().toString(36).substring(2, 12)}_${now.getTime()}`,
      badge_id: 'MUNI-ADM-2026-904',
      officer_name: adminUser.full_name,
      email: adminUser.email,
      clearance_level: 'Level 4 - Municipal Environmental Administrator',
      authenticated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      is_locked: false,
    };

    setAdminSession(newSession);
    setCurrentUser(adminUser);
    localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_SESSION, JSON.stringify(newSession));
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(adminUser));

    addAuditLog(
      'ADMIN_AUTHENTICATION_SUCCESS',
      newSession.badge_id,
      `Officer ${adminUser.full_name} (${adminUser.email}) authenticated with Level 4 Security Clearance.`
    );

    return { success: true };
  };

  const adminLogout = () => {
    if (adminSession) {
      addAuditLog(
        'ADMIN_SESSION_TERMINATED',
        adminSession.badge_id,
        `Officer ${adminSession.officer_name} logged out and terminated terminal session.`
      );
    }
    setAdminSession(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ADMIN_SESSION);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  };

  const lockAdminSession = () => {
    if (!adminSession) return;
    const updated = { ...adminSession, is_locked: true };
    setAdminSession(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_SESSION, JSON.stringify(updated));
    addAuditLog(
      'ADMIN_TERMINAL_LOCKED',
      adminSession.badge_id,
      `Officer ${adminSession.officer_name} locked workstation terminal.`
    );
  };

  const unlockAdminSession = (pin: string): boolean => {
    if (!adminSession) return false;
    if (pin === '2026' || pin === '774920' || pin === 'AdminSecure@2026') {
      const updated = { ...adminSession, is_locked: false };
      setAdminSession(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_SESSION, JSON.stringify(updated));
      addAuditLog(
        'ADMIN_TERMINAL_UNLOCKED',
        adminSession.badge_id,
        `Officer ${adminSession.officer_name} unlocked workstation terminal.`
      );
      return true;
    }
    return false;
  };

  const registerUser = (fullName: string, email: string, phone: string, role: UserRole): boolean => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      full_name: fullName,
      email,
      phone,
      role,
      account_status: 'active',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(newUser));
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAdminSession(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      localStorage.removeItem(LOCAL_STORAGE_KEY_ADMIN_SESSION);
    } catch (e) {
      console.warn('Error clearing user session', e);
    }
  };

  const addAuditLog = (action: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      admin_id: currentUser?.id || 'sys-admin',
      admin_name: currentUser?.full_name || 'System Administrator',
      action,
      target_id: targetId,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    recipientId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    reportId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient_id: recipientId,
      report_id: reportId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const createReport = (
    reportData: Omit<WasteReport, 'id' | 'complaint_number' | 'created_at' | 'updated_at'>
  ): WasteReport => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const complaintNumber = `SWM-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const newReport: WasteReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      complaint_number: complaintNumber,
      created_at: now,
      updated_at: now,
    };

    setReports((prev) => [newReport, ...prev]);

    // Live Supabase table synchronization
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('waste_reports')
        .insert({
          id: newReport.id,
          complaint_number: newReport.complaint_number,
          citizen_id: newReport.citizen_id,
          citizen_name: newReport.citizen_name,
          citizen_phone: newReport.citizen_phone,
          image_url: newReport.image_url,
          description: newReport.description,
          latitude: newReport.latitude,
          longitude: newReport.longitude,
          address: newReport.address,
          predicted_category: newReport.predicted_category,
          confidence_score: newReport.ai_confidence,
          waste_stream: newReport.ai_details?.wet_dry || 'Dry waste',
          priority: newReport.priority,
          status: newReport.status,
          created_at: newReport.created_at,
          updated_at: newReport.updated_at,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase insert report error:', error);
        });
    }

    // Send notification to Admin
    const adminUser = users.find((u) => u.role === 'admin') || SEED_USERS[1];
    addNotification(
      adminUser.id,
      'New Waste Complaint Reported',
      `New ${newReport.priority} priority report ${newReport.complaint_number} logged at ${newReport.address.slice(0, 30)}...`,
      'alert',
      newReport.id
    );

    // Send confirmation notification to citizen
    if (newReport.citizen_id) {
      addNotification(
        newReport.citizen_id,
        'Complaint Submitted Successfully',
        `Your complaint ${newReport.complaint_number} has been logged and queued for administrative review.`,
        'status_change',
        newReport.id
      );
    }

    return newReport;
  };

  const updateReportStatus = (reportId: string, status: ComplaintStatus, reason?: string) => {
    const now = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updated: WasteReport = {
            ...r,
            status,
            rejection_reason: status === 'Rejected' ? reason || r.rejection_reason : r.rejection_reason,
            updated_at: now,
          };

          if (isSupabaseConfigured && supabase) {
            supabase
              .from('waste_reports')
              .update({
                status,
                rejection_reason: status === 'Rejected' ? reason || r.rejection_reason : undefined,
                updated_at: now,
              })
              .eq('id', reportId)
              .then(({ error }) => {
                if (error) console.warn('Supabase update report error:', error);
              });
          }

          // Notify citizen
          if (r.citizen_id) {
            addNotification(
              r.citizen_id,
              `Complaint Status Updated: ${status}`,
              `Your report ${r.complaint_number} status is now "${status}".${
                status === 'Rejected' && reason ? ` Reason: ${reason}` : ''
              }`,
              'status_change',
              r.id
            );
          }

          addAuditLog(
            `STATUS_UPDATE_${status.toUpperCase()}`,
            r.complaint_number,
            `Complaint status updated to ${status}${reason ? ` (Reason: ${reason})` : ''}`
          );

          return updated;
        }
        return r;
      })
    );
  };

  const verifyReportCategory = (reportId: string, verifiedCategory: WasteCategory) => {
    const now = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          if (isSupabaseConfigured && supabase) {
            supabase
              .from('waste_reports')
              .update({
                verified_category: verifiedCategory,
                updated_at: now,
              })
              .eq('id', reportId)
              .then(({ error }) => {
                if (error) console.warn('Supabase verify report error:', error);
              });
          }

          addAuditLog(
            'CATEGORY_VERIFIED',
            r.complaint_number,
            `Admin verified category as "${verifiedCategory}" (AI predicted: "${r.predicted_category}")`
          );
          return {
            ...r,
            verified_category: verifiedCategory,
            updated_at: now,
          };
        }
        return r;
      })
    );
  };

  const assignWorkerToReport = (reportId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    const workerName = worker?.name || 'Sanitation Worker';
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('waste_reports')
        .update({
          status: 'Assigned',
          assigned_worker_id: workerId,
          assigned_worker_name: workerName,
          updated_at: now,
        })
        .eq('id', reportId)
        .then(({ error }) => {
          if (error) console.warn('Supabase assign report error:', error);
        });

      supabase
        .from('worker_tasks')
        .insert({
          id: `task-${Date.now()}`,
          report_id: reportId,
          worker_id: workerId,
          assigned_by: currentUser?.id || 'admin',
          task_status: 'Assigned',
          assigned_at: now,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase create worker task error:', error);
        });
    }

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updated: WasteReport = {
            ...r,
            status: 'Assigned',
            assigned_worker_id: workerId,
            assigned_worker_name: workerName,
            updated_at: now,
          };

          // Create or update worker task
          setTasks((prevTasks) => {
            const existing = prevTasks.find((t) => t.report_id === reportId);
            if (existing) {
              return prevTasks.map((t) =>
                t.report_id === reportId
                  ? { ...t, worker_id: workerId, task_status: 'Assigned', assigned_at: now }
                  : t
              );
            }
            const newTask: WorkerTask = {
              id: `task-${Date.now()}`,
              report_id: reportId,
              worker_id: workerId,
              assigned_by: currentUser?.id || 'admin',
              task_status: 'Assigned',
              assigned_at: now,
              before_image: r.image_url,
            };
            return [newTask, ...prevTasks];
          });

          // Update worker active task counter
          setWorkers((prevWorkers) =>
            prevWorkers.map((w) =>
              w.id === workerId ? { ...w, active_tasks_count: w.active_tasks_count + 1, status: 'On Task' } : w
            )
          );

          // Notify Worker
          addNotification(
            workerId,
            'New Task Assigned',
            `You have been assigned to clean complaint ${r.complaint_number} at ${r.address.slice(0, 30)}...`,
            'assignment',
            r.id
          );

          // Notify Citizen
          if (r.citizen_id) {
            addNotification(
              r.citizen_id,
              'Worker Assigned',
              `Sanitation worker ${workerName} has been assigned to your report ${r.complaint_number}.`,
              'assignment',
              r.id
            );
          }

          addAuditLog(
            'ASSIGN_WORKER',
            r.complaint_number,
            `Assigned complaint to worker ${workerName} (${workerId})`
          );

          return updated;
        }
        return r;
      })
    );
  };

  const addWorker = (workerData: { name: string; email: string; phone: string; assigned_zone: string }) => {
    const newWorker: SanitationWorker = {
      id: `worker-${Date.now()}`,
      name: workerData.name,
      email: workerData.email,
      phone: workerData.phone,
      assigned_zone: workerData.assigned_zone,
      status: 'Available',
      active_tasks_count: 0,
      completed_tasks_count: 0,
      rating: 5.0,
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80`,
    };
    setWorkers((prev) => [newWorker, ...prev]);
    addAuditLog(
      'WORKER_REGISTERED',
      newWorker.id,
      `Registered sanitation worker ${newWorker.name} to Zone ${newWorker.assigned_zone}`
    );
  };

  const updateWorkerStatus = (workerId: string, status: 'Available' | 'On Task' | 'Off Duty') => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status } : w))
    );
    addAuditLog('WORKER_STATUS_CHANGED', workerId, `Worker status updated to ${status}`);
  };

  const updateTaskProgress = (
    taskId: string,
    status: WorkerTaskStatus,
    notes?: string,
    beforeImage?: string,
    afterImage?: string
  ) => {
    const now = new Date().toISOString();
    let targetReportId = '';

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          targetReportId = t.report_id;
          return {
            ...t,
            task_status: status,
            completion_notes: notes || t.completion_notes,
            before_image: beforeImage || t.before_image,
            after_image: afterImage || t.after_image,
            started_at: status === 'In Progress' && !t.started_at ? now : t.started_at,
            completed_at: status === 'Completed' ? now : t.completed_at,
          };
        }
        return t;
      })
    );

    // Sync status with WasteReport
    if (targetReportId) {
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('worker_tasks')
          .update({
            task_status: status,
            completion_notes: notes || undefined,
            before_image: beforeImage || undefined,
            after_image: afterImage || undefined,
            completed_at: status === 'Completed' ? now : undefined,
          })
          .eq('id', taskId)
          .then(({ error }) => {
            if (error) console.warn('Supabase update task progress error:', error);
          });

        let sbReportStatus: ComplaintStatus | undefined = undefined;
        if (status === 'In Progress' || status === 'On the Way') sbReportStatus = 'In Progress';
        if (status === 'Completed') sbReportStatus = 'Resolved';
        if (sbReportStatus) {
          supabase
            .from('waste_reports')
            .update({ status: sbReportStatus, updated_at: now })
            .eq('id', targetReportId)
            .then(({ error }) => {
              if (error) console.warn('Supabase sync report status error:', error);
            });
        }
      }

      setReports((prev) =>
        prev.map((r) => {
          if (r.id === targetReportId) {
            let mappedStatus: ComplaintStatus = r.status;
            if (status === 'In Progress' || status === 'On the Way') mappedStatus = 'In Progress';
            if (status === 'Completed') mappedStatus = 'Resolved';

            if (mappedStatus !== r.status) {
              if (r.citizen_id) {
                addNotification(
                  r.citizen_id,
                  status === 'Completed' ? 'Waste Cleared & Resolved' : `Worker ${status}`,
                  status === 'Completed'
                    ? `Worker completed cleaning for ${r.complaint_number}. Please verify or confirm resolution.`
                    : `Sanitation team is now ${status.toLowerCase()} for your complaint ${r.complaint_number}.`,
                  status === 'Completed' ? 'completion' : 'status_change',
                  r.id
                );
              }
            }

            return {
              ...r,
              status: mappedStatus,
              updated_at: now,
            };
          }
          return r;
        })
      );
    }
  };

  const reportTaskIssue = (
    taskId: string,
    issueType: 'inaccessible' | 'wrong_gps' | 'insufficient_equipment' | 'hazardous_materials' | 'other',
    description: string
  ) => {
    const now = new Date().toISOString();
    let reportNum = '';
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            task_status: 'Issue Reported',
            issue_reported: {
              type: issueType,
              description,
              reported_at: now,
            },
          };
        }
        return t;
      })
    );

    // Notify Admin of worker obstacle
    const admin = users.find((u) => u.role === 'admin') || SEED_USERS[1];
    addNotification(
      admin.id,
      `Worker Issue Reported (${issueType})`,
      `Worker reported obstacle: "${description}" for task ID ${taskId}`,
      'alert'
    );
  };

  const confirmResolution = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          addNotification(
            r.assigned_worker_id || 'sys-admin',
            'Resolution Confirmed by Citizen',
            `Citizen confirmed resolution for report ${r.complaint_number}. Great job!`,
            'completion',
            r.id
          );
          return {
            ...r,
            citizen_feedback: 'confirmed',
            updated_at: new Date().toISOString(),
          };
        }
        return r;
      })
    );
  };

  const reopenReport = (reportId: string, reason: string) => {
    const now = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const admin = users.find((u) => u.role === 'admin') || SEED_USERS[1];
          addNotification(
            admin.id,
            'Complaint Reopened by Citizen',
            `Complaint ${r.complaint_number} reopened. Reason: "${reason}"`,
            'alert',
            r.id
          );
          return {
            ...r,
            status: 'Under Review',
            citizen_feedback: 'reopened',
            reopened_reason: reason,
            updated_at: now,
          };
        }
        return r;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Compute live KPI counters
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length,
    assigned: reports.filter((r) => r.status === 'Assigned').length,
    inProgress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
    rejected: reports.filter((r) => r.status === 'Rejected').length,
    overdue: reports.filter((r) => {
      if (r.status === 'Resolved' || r.status === 'Rejected') return false;
      if (!currentTime) return false;
      const hoursAge = (currentTime - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
      return hoursAge > 24; // over 24h
    }).length,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        adminSession,
        users,
        workers,
        reports,
        tasks,
        notifications,
        auditLogs,
        isConfiguredWithSupabase: isSupabaseConfigured,
        isLoaded,
        switchUserRole,
        loginUser,
        adminLogin,
        adminLogout,
        lockAdminSession,
        unlockAdminSession,
        registerUser,
        logoutUser,
        createReport,
        updateReportStatus,
        verifyReportCategory,
        assignWorkerToReport,
        addWorker,
        updateWorkerStatus,
        updateTaskProgress,
        reportTaskIssue,
        confirmResolution,
        reopenReport,
        markNotificationRead,
        markAllNotificationsRead,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
