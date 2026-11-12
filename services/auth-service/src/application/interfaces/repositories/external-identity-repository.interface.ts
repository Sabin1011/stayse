export interface CreateExternalIdentityData {
  userId: string;
  provider: "GOOGLE";
  providerUserId: string;
  email: string;
}

export interface ExternalIdentity {
  id: string;
  userId: string;
  provider: "GOOGLE";
  providerUserId: string;
  email: string;
}

export interface ExternalIdentityRepository {
  findByProviderUserId(
    provider: "GOOGLE",
    providerUserId: string,
  ): Promise<ExternalIdentity | null>;

  create(data: CreateExternalIdentityData): Promise<ExternalIdentity>;
}