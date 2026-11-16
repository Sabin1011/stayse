export interface HostRoleAssigner {
  assignHostRole(userId: string): Promise<void>;
}