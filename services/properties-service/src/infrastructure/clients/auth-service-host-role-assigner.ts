import type { HostRoleAssigner } from "../../application/interfaces/host-role-assigner.interface.js";

export class AuthServiceHostRoleAssigner
  implements HostRoleAssigner
{
  constructor(
    private readonly baseUrl: string,
    private readonly internalSecret: string,
  ) {}

  async assignHostRole(userId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl.replace(/\/$/, "")}/internal/users/assign-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-service-secret": this.internalSecret,
        },
        body: JSON.stringify({ userId }),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      const responseBody = await response.text();

      throw new Error(
        `Auth Service role assignment failed (${response.status}): ${responseBody}`,
      );
    }
  }
}