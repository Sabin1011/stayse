
import { HostApplication } from "../entities/host-application.entity.js";
import { HostApplicationStatus } from "../enums/host-application.enum.js";

export interface HostApplicationRepository {
  create(application: HostApplication): Promise<HostApplication>;

  update(application: HostApplication): Promise<HostApplication>;

  findById(id: string): Promise<HostApplication | null>;

  findActiveByHostId(
    hostId: string,
  ): Promise<HostApplication | null>;

  findByHostId(hostId: string): Promise<HostApplication[]>;

  findByStatus(
    status: HostApplicationStatus,
    page: number,
    limit: number,
  ): Promise<{
    applications: HostApplication[];
    total: number;
  }>;
}
