import { AuditAction } from '../enums/audit-action.enum';

export interface IAuditContext {
  requestId: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  serviceName: string;
}

export interface IAuditLogEntry {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  operationName?: string;
  operationType?: 'query' | 'mutation' | 'subscription';
  resolverName?: string;
  inputVariables?: Record<string, unknown>;
  success: boolean;
  statusCode?: number;
  errorMessage?: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  durationMs?: number;
}

export interface IAuditLogCreate extends IAuditContext, IAuditLogEntry {}
