import type { HostApplicationRepository } from "../../domain/repositories/host-application.repository.js";

import type { HostApplication } from "../../domain/entities/host-application.entity.js";

export class GetMyHostApplicationUseCase {
  constructor(
    private readonly hostApplicationRepository: HostApplicationRepository,
  ) {}

  async execute(hostId: string): Promise<HostApplication | null> {
    const applications =
      await this.hostApplicationRepository.findByHostId(hostId);

    if (applications.length === 0) {
      return null;
    }

    return applications[0] ?? null;
  }
}