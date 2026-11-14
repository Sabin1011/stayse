
import { MongoHostApplicationRepository } from "../repositories/mongo-host-application.repository.js";

import { SubmitHostApplicationUseCase } from "../../application/use-cases/submit-host-application.use-case.js";

import { GetMyHostApplicationUseCase } from "../../application/use-cases/get-my-host-application.use-case.js";

import { UploadHostApplicationDocumentUseCase } from "../../application/use-cases/upload-host-application-document.use-case.js";

import { GetHostApplicationDocumentUseCase } from "../../application/use-cases/get-host-application-document.use-case.js";

import { HostApplicationController } from "../../presentation/controllers/host-application.controller.js";

import { GetMyHostApplicationController } from "../../presentation/controllers/get-my-host-application.controller.js";

import { HostApplicationDocumentController } from "../../presentation/controllers/host-application-document.controller.js";

import { JwtAccessTokenVerifier } from "../security/jwt-access-token-verifier.js";

import { AuthenticateMiddleware } from "../../presentation/middleware/authenticate.middleware.js";

import { LocalHostDocumentStorage } from "../storage/local-host-document.storage.js";

import { MongoHostApplicationDocumentRepository } from "../repositories/mongo-host-application-document.repository.js";

import { UpdateAndResubmitHostApplicationUseCase } from "../../application/use-cases/update-and-resubmit-host-application.use-case.js";

// --------------------------------------------------
// Repositories
// --------------------------------------------------

const hostApplicationRepository =
  new MongoHostApplicationRepository();

const hostDocumentStorage =
  new LocalHostDocumentStorage();

const hostApplicationDocumentRepository =
  new MongoHostApplicationDocumentRepository(
    hostDocumentStorage,
  );

// --------------------------------------------------
// Use cases
// --------------------------------------------------

export const submitHostApplicationUseCase =
  new SubmitHostApplicationUseCase(
    hostApplicationRepository,
    hostApplicationDocumentRepository,
  );


export const updateAndResubmitHostApplicationUseCase =
  new UpdateAndResubmitHostApplicationUseCase(
    hostApplicationRepository,
    hostApplicationDocumentRepository,
  );

export const getMyHostApplicationUseCase =
  new GetMyHostApplicationUseCase(
    hostApplicationRepository,
  );

export const uploadHostApplicationDocumentUseCase =
  new UploadHostApplicationDocumentUseCase(
    hostApplicationDocumentRepository,
  );

export const getHostApplicationDocumentUseCase =
  new GetHostApplicationDocumentUseCase(
    hostApplicationDocumentRepository,
  );

// --------------------------------------------------
// Controllers
// --------------------------------------------------

export const hostApplicationController =
  new HostApplicationController(
    submitHostApplicationUseCase,
    updateAndResubmitHostApplicationUseCase,
  );

export const getMyHostApplicationController =
  new GetMyHostApplicationController(
    getMyHostApplicationUseCase,
  );

export const hostApplicationDocumentController =
  new HostApplicationDocumentController(
    uploadHostApplicationDocumentUseCase,
    getHostApplicationDocumentUseCase,
  );

// --------------------------------------------------
// Authentication
// --------------------------------------------------

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

const accessTokenVerifier =
  new JwtAccessTokenVerifier(jwtAccessSecret);

export const authenticateMiddleware =
  new AuthenticateMiddleware(accessTokenVerifier);
