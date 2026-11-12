
import { Types } from "mongoose";

import type { HostApplicationRepository } from "../../domain/repositories/host-application.repository.js";

import { HostApplication } from "../../domain/entities/host-application.entity.js";

import { HostApplicationStatus } from "../../domain/enums/host-application.enum.js";

import { HostApplicationModel } from "../database/mongodb/models/host-application.model.js";

import {
  HostApplicationMapper,
  type PersistedHostApplication,
} from "../mappers/host-application.mapper.js";

import { ActiveHostApplicationExistsError } from "../../domain/errors/active-host-application-exists.error.js";

export class MongoHostApplicationRepository
  implements HostApplicationRepository
{
  // Create a new host application
  async create(
    application: HostApplication,
  ): Promise<HostApplication> {
    const persistenceData =
      HostApplicationMapper.toPersistence(application);

    try {
      const createdDocument =
        await HostApplicationModel.create(persistenceData);

      return HostApplicationMapper.toDomain(
        createdDocument.toObject() as unknown as PersistedHostApplication,
      );
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new ActiveHostApplicationExistsError();
      }

      throw error;
    }
  }

  // Update an existing host application
  async update(
    application: HostApplication,
  ): Promise<HostApplication> {
    const applicationId = application.props.id;

    if (!applicationId) {
      throw new Error(
        "Cannot update an application that has not been persisted",
      );
    }

    const persistenceData =
      HostApplicationMapper.toPersistence(application);

    const updatedDocument =
      await HostApplicationModel.findByIdAndUpdate(
        applicationId,
        { $set: persistenceData },
        {
          new: true,
          runValidators: true,
        },
      ).exec();

    if (!updatedDocument) {
      throw new Error("Host application not found for update");
    }

    return HostApplicationMapper.toDomain(
      updatedDocument.toObject() as unknown as PersistedHostApplication,
    );
  }

  // Find an application using its MongoDB ID
  async findById(
    id: string,
  ): Promise<HostApplication | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const document =
      await HostApplicationModel.findById(id).exec();

    if (!document) {
      return null;
    }

    return HostApplicationMapper.toDomain(
      document.toObject() as unknown as PersistedHostApplication,
    );
  }

  // Find the active application belonging to a host
  async findActiveByHostId(
    hostId: string,
  ): Promise<HostApplication | null> {
    const document =
      await HostApplicationModel.findOne({
        hostId,
        isActive: true,
      }).exec();

    if (!document) {
      return null;
    }

    return HostApplicationMapper.toDomain(
      document.toObject() as unknown as PersistedHostApplication,
    );
  }

  // Find all applications submitted by a host
  async findByHostId(
    hostId: string,
  ): Promise<HostApplication[]> {
    const documents =
      await HostApplicationModel.find({ hostId })
        .sort({ createdAt: -1 })
        .exec();

    return documents.map((document) =>
      HostApplicationMapper.toDomain(
        document.toObject() as unknown as PersistedHostApplication,
      ),
    );
  }

  // Find applications by status with pagination
  async findByStatus(
    status: HostApplicationStatus,
    page: number,
    limit: number,
  ): Promise<{
    applications: HostApplication[];
    total: number;
  }> {
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1
    ) {
      throw new Error("Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      HostApplicationModel.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      HostApplicationModel.countDocuments({ status }).exec(),
    ]);

    const applications = documents.map((document) =>
      HostApplicationMapper.toDomain(
        document.toObject() as unknown as PersistedHostApplication,
      ),
    );

    return {
      applications,
      total,
    };
  }
}
