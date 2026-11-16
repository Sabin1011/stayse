import { HostApplication } from "../../domain/entities/host-application.entity.js";
import { HostApplicationStatus } from "../../domain/enums/host-application.enum.js";

export interface HostApplicationRepository {
  create(application: HostApplication): Promise<HostApplication>;

  update(application: HostApplication): Promise<HostApplication>;

  findById(id: string): Promise<HostApplication | null>;

  findActiveByHostId(
    hostId: string,
  ): Promise<HostApplication | null>;

  findByHostId(hostId: string): Promise<HostApplication[]>;

  findPaginated(
    page: number,
    limit: number,
    status?: HostApplicationStatus,
  ): Promise<{
    applications: HostApplication[];
    total: number;
  }>;
}