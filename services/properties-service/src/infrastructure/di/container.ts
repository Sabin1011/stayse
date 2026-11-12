import { MongoHostApplicationRepository } from "../repositories/mongo-host-application.repository.js";

import { SubmitHostApplicationUseCase } from "../../application/use-cases/submit-host-application.use-case.js";

import { HostApplicationController } from "../../presentation/controllers/host-application.controller.js";

import { JwtAccessTokenVerifier } from "../security/jwt-access-token-verifier.js";
import { AuthenticateMiddleware } from "../../presentation/middleware/authenticate.middleware.js";
import { GetMyHostApplicationUseCase } from "../../application/use-cases/get-my-host-application.use-case.js";

import { GetMyHostApplicationController } from "../../presentation/controllers/get-my-host-application.controller.js";

// Repository
const hostApplicationRepository =
  new MongoHostApplicationRepository();

// Use case
export const submitHostApplicationUseCase =
  new SubmitHostApplicationUseCase(
    hostApplicationRepository,
  );

export const getMyHostApplicationUseCase =
  new GetMyHostApplicationUseCase(
    hostApplicationRepository,
  );

// Controller
export const hostApplicationController =
  new HostApplicationController(
    submitHostApplicationUseCase,
  );

export const getMyHostApplicationController =
  new GetMyHostApplicationController(getMyHostApplicationUseCase);

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

const accessTokenVerifier = new JwtAccessTokenVerifier(jwtAccessSecret);

export const authenticateMiddleware = new AuthenticateMiddleware(
  accessTokenVerifier,
);