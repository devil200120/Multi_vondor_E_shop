/**
 * Role-Based Access Control (RBAC) Permissions
 * 
 * Roles:
 * - Admin: Full access to everything
 * - SubAdmin: Approval-focused role (vendors, products, ads, reviews)
 * - Manager: Operational controls (no access to Setup/Settings)
 * - User: Regular user
 * - Supplier: Vendor/Seller
 */

// Default permissions for each role
const ROLE_PERMISSIONS = {
  Admin: {
    // Full access to everything
    canApproveVendors: true,
    canApproveProducts: true,
    canApproveAds: true,
    canModerateReviews: true,
    canManageOrders: true,
    canManageProducts: true,
    canManageCoupons: true,
    canManageCategories: true,
    canManageUsers: true,
    canManageVendors: true,
    canViewAnalytics: true,
    canManageContent: true,
    canAccessSetup: true,
  },
  SubAdmin: {
    // Approval-focused permissions
    canApproveVendors: true,
    canApproveProducts: true,
    canApproveAds: true,
    canModerateReviews: true,
    // Limited operational access
    canManageOrders: false,
    canManageProducts: false,
    canManageCoupons: false,
    canManageCategories: false,
    canManageUsers: false,
    canManageVendors: false,
    canViewAnalytics: true,
    canManageContent: false,
    canAccessSetup: false,
  },
  Manager: {
    // All operational controls
    canApproveVendors: false,
    canApproveProducts: false,
    canApproveAds: false,
    canModerateReviews: false,
    canManageOrders: true,
    canManageProducts: true,
    canManageCoupons: true,
    canManageCategories: true,
    canManageUsers: true,
    canManageVendors: true,
    canViewAnalytics: true,
    canManageContent: true,
    // NO access to Setup section
    canAccessSetup: false,
  },
  User: {
    // No admin permissions
    canApproveVendors: false,
    canApproveProducts: false,
    canApproveAds: false,
    canModerateReviews: false,
    canManageOrders: false,
    canManageProducts: false,
    canManageCoupons: false,
    canManageCategories: false,
    canManageUsers: false,
    canManageVendors: false,
    canViewAnalytics: false,
    canManageContent: false,
    canAccessSetup: false,
  },
  Supplier: {
    // No admin permissions
    canApproveVendors: false,
    canApproveProducts: false,
    canApproveAds: false,
    canModerateReviews: false,
    canManageOrders: false,
    canManageProducts: false,
    canManageCoupons: false,
    canManageCategories: false,
    canManageUsers: false,
    canManageVendors: false,
    canViewAnalytics: false,
    canManageContent: false,
    canAccessSetup: false,
  },
};

/**
 * Get default permissions for a role
 */
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.User;
};

/**
 * Check if user has a specific permission
 */
const hasPermission = (user, permission) => {
  // Admin always has all permissions
  if (user.role === 'Admin') return true;
  
  // Check custom permissions first (if explicitly set to true or false)
  if (user.permissions && user.permissions[permission] !== undefined && user.permissions[permission] !== null) {
    return user.permissions[permission];
  }
  
  // Fall back to role-based permissions
  const rolePerms = getRolePermissions(user.role);
  return rolePerms[permission] || false;
};

/**
 * Check if user has any of the specified permissions
 */
const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a user
 */
const getUserPermissions = (user) => {
  if (user.role === 'Admin') {
    return ROLE_PERMISSIONS.Admin;
  }
  
  // Merge role permissions with custom permissions
  const rolePerms = getRolePermissions(user.role);
  const customPerms = user.permissions || {};
  
  return { ...rolePerms, ...customPerms };
};

/**
 * Check if role is admin-level (Admin, SubAdmin, Manager)
 */
const isAdminRole = (role) => {
  return ['Admin', 'SubAdmin', 'Manager'].includes(role);
};

module.exports = {
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  isAdminRole,
};
