/**
 * Enumeration of all system roles with associated permission sets.
 */
export enum UserRole {
  ADMIN = 'admin',
  PATIENT = 'patient',
  HOSPITAL = 'hospital',
  DOCTOR = 'doctor',
  EMERGENCY_DOCTOR = 'emergency_doctor',
  PHARMACY = 'pharmacy',
}

/**
 * Role permission definitions.
 * Each role has a distinct set of allowed actions.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'user:read', 'user:write', 'user:delete',
    'patient:read', 'patient:write', 'patient:delete',
    'report:read', 'report:write', 'report:delete',
    'prescription:read', 'prescription:write',
    'nfc:read', 'nfc:write', 'nfc:delete',
    'audit:read',
  ],
  [UserRole.PATIENT]: [
    'patient:read:own',
    'report:read:own',
    'prescription:read:own',
    'timeline:read:own',
  ],
  [UserRole.HOSPITAL]: [
    'patient:read', 'patient:write',
    'report:read', 'report:write',
    'doctor:read', 'doctor:write',
  ],
  [UserRole.DOCTOR]: [
    'patient:read',
    'report:read', 'report:write',
    'prescription:read', 'prescription:write',
    'timeline:read',
  ],
  [UserRole.EMERGENCY_DOCTOR]: [
    'patient:read:emergency',
    'report:read:emergency',
    'prescription:read:emergency',
  ],
  [UserRole.PHARMACY]: [
    'prescription:read',
  ],
};

/** HTTP Status Code constants */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const;
