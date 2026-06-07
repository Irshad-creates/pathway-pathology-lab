// Role-based permissions for Lab Workflow
export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  TECHNICIAN: "technician",
  RECEPTIONIST: "receptionist",
};

export const PERMISSIONS = {
  // Admin permissions - Full access
  [ROLES.ADMIN]: {
    canViewAllRegistrations: true,
    canViewStats: true,
    canViewBatchMode: true,
    canAssignTechnicians: true,
    canGenerateReports: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canViewAllTechnicians: true,
    canExportData: true,
    canDeleteRegistrations: true,
    canViewPayments: true,
    canAccessSettings: true,
  },

  // Staff permissions - Full access to Lab Workflow
  [ROLES.STAFF]: {
    canViewAllRegistrations: true,
    canViewStats: true,
    canViewBatchMode: true,
    canAssignTechnicians: true,
    canGenerateReports: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canViewAllTechnicians: true,
    canExportData: true,
    canDeleteRegistrations: false,
    canViewPayments: true,
    canAccessSettings: false,
    canEnterResults: true,
    canMarkProcessing: true,
    canMarkSampleCollected: true,
    canMarkReportReady: true,
  },

  // Technician permissions - Process samples
  [ROLES.TECHNICIAN]: {
    canViewAllRegistrations: false, // Can only see assigned
    canViewStats: false,
    canViewBatchMode: false,
    canAssignTechnicians: false,
    canGenerateReports: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canViewAllTechnicians: false,
    canExportData: false,
    canDeleteRegistrations: false,
    canViewPayments: false,
    canAccessSettings: false,
    canEnterResults: true,
    canMarkProcessing: true,
  },

  // Receptionist permissions - Register patients
  [ROLES.RECEPTIONIST]: {
    canViewAllRegistrations: true,
    canViewStats: false,
    canViewBatchMode: false,
    canAssignTechnicians: false,
    canGenerateReports: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canViewAllTechnicians: false,
    canExportData: false,
    canDeleteRegistrations: false,
    canViewPayments: false,
    canAccessSettings: false,
    canRegisterPatients: true,
    canMarkSampleCollected: true,
  },
};

export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISSIONS[userRole];
  return rolePermissions?.[permission] || false;
};

export const canAccessLabWorkflow = (userRole) => {
  return (
    userRole === ROLES.ADMIN ||
    userRole === ROLES.STAFF ||
    userRole === ROLES.TECHNICIAN
  );
};
