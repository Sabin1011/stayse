import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";

import type {
  GoogleIdTokenVerifier as GoogleIdTokenVerifierInterface,
  GoogleUserInfo,
} from "../../application/interfaces/security/google-id-token-verifier.interface.js";

export class GoogleIdTokenVerifierImpl
  implements GoogleIdTokenVerifierInterface {

  private readonly client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  async verify(idToken: string): Promise<GoogleUserInfo> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || !payload.name) {
      throw new Error("Invalid Google ID token");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true,
      fullName: payload.name,
      ...(payload.picture ? { profileImage: payload.picture } : {}),
    };
  }
}