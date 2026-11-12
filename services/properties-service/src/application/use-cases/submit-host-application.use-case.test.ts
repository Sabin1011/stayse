
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { SubmitHostApplicationUseCase } from "./submit-host-application.use-case.js";

import type { HostApplicationRepository } from "../../domain/repositories/host-application.repository.js";

import { HostApplication } from "../../domain/entities/host-application.entity.js";

import {
  VerificationType,
  HostApplicationStatus,
} from "../../domain/enums/host-application.enum.js";

import { HostApplicationError } from "../../domain/errors/host-application.error.js";

import { ActiveHostApplicationExistsError } from "../../domain/errors/active-host-application-exists.error.js";

import type { SubmitHostApplicationDTO } from "../dto/submit-host-application.dto.js";

// Fake repository: no MongoDB connection required.
class FakeHostApplicationRepository
  implements HostApplicationRepository
{
  existingApplication: HostApplication | null = null;
  shouldFailOnCreate = false;
  createdApplication: HostApplication | null = null;

  async create(
    application: HostApplication,
  ): Promise<HostApplication> {
    if (this.shouldFailOnCreate) {
      throw new Error("Database failure");
    }

    application.props.id = "test-application-id";
    this.createdApplication = application;

    return application;
  }

  async update(
    application: HostApplication,
  ): Promise<HostApplication> {
    return application;
  }

  async findById(): Promise<HostApplication | null> {
    return null;
  }

  async findActiveByHostId(): Promise<HostApplication | null> {
    return this.existingApplication;
  }

  async findByHostId(): Promise<HostApplication[]> {
    return [];
  }

  async findByStatus(): Promise<{
    applications: HostApplication[];
    total: number;
  }> {
    return {
      applications: [],
      total: 0,
    };
  }
}

function createIndividualApplicationDTO(): SubmitHostApplicationDTO {
  return {
    hostId: "test-user-id",
    verificationType: VerificationType.INDIVIDUAL,
    applicantDetails: {
      legalName: "Test User",
      contactPhone: "+919876543210",
      contactEmail: "test@example.com",
      residentialAddress: {
        addressLine: "Test Street",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        countryCode: "IN",
      },
    },
    documentReferences: [],
  };
}

describe("SubmitHostApplicationUseCase", () => {
  it("should successfully submit an individual application", async () => {
    const repository = new FakeHostApplicationRepository();

    const useCase = new SubmitHostApplicationUseCase(repository);

    const result = await useCase.execute(
      createIndividualApplicationDTO(),
    );

    assert.equal(result.props.id, "test-application-id");

    assert.equal(
      result.props.status,
      HostApplicationStatus.SUBMITTED,
    );

    assert.equal(result.props.hostId, "test-user-id");

    assert.equal(result.props.isActive, true);

    assert.equal(
      result.props.applicationHistory.length,
      1,
    );
  });

  it("should reject a second active application", async () => {
    const repository = new FakeHostApplicationRepository();

    repository.existingApplication = {} as HostApplication;

    const useCase = new SubmitHostApplicationUseCase(repository);

    await assert.rejects(
      useCase.execute(createIndividualApplicationDTO()),
      ActiveHostApplicationExistsError,
    );
  });

  it("should reject a business application without a business name", async () => {
    const repository = new FakeHostApplicationRepository();

    const useCase = new SubmitHostApplicationUseCase(repository);

    const dto: SubmitHostApplicationDTO = {
      ...createIndividualApplicationDTO(),
      verificationType: VerificationType.BUSINESS,
    };

    await assert.rejects(
      useCase.execute(dto),
      HostApplicationError,
    );
  });

  it("should propagate repository failures", async () => {
    const repository = new FakeHostApplicationRepository();

    repository.shouldFailOnCreate = true;

    const useCase = new SubmitHostApplicationUseCase(repository);

    await assert.rejects(
      useCase.execute(createIndividualApplicationDTO()),
      /Database failure/,
    );
  });
});
