
-- 1. Verification challenges
CREATE TABLE verification_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    challenge_type VARCHAR(30) NOT NULL,
    target VARCHAR(255) NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,

    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT verification_challenge_type_check
        CHECK (challenge_type IN (
            'email_verification',
            'email_otp',
            'password_reset'
        )),

    CONSTRAINT verification_attempt_count_check
        CHECK (attempt_count >= 0 AND max_attempts > 0)
);

CREATE INDEX idx_verification_challenges_user
    ON verification_challenges(user_id);

CREATE INDEX idx_verification_challenges_expiry
    ON verification_challenges(expires_at);


-- 2. External identities (Google OAuth, etc.)
CREATE TABLE external_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    provider VARCHAR(30) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT external_identity_provider_check
        CHECK (provider IN ('google')),

    CONSTRAINT external_identity_provider_subject_unique
        UNIQUE (provider, provider_subject)
);

CREATE INDEX idx_external_identities_user
    ON external_identities(user_id);


-- 3. Refresh sessions
CREATE TABLE refresh_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,
    family_id UUID NOT NULL DEFAULT gen_random_uuid(),

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    replaced_by_session_id UUID
        REFERENCES refresh_sessions(id) ON DELETE SET NULL,

    last_used_at TIMESTAMPTZ,
    user_agent TEXT,
    ip_address INET,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_sessions_user
    ON refresh_sessions(user_id);

CREATE INDEX idx_refresh_sessions_family
    ON refresh_sessions(family_id);

CREATE INDEX idx_refresh_sessions_expiry
    ON refresh_sessions(expires_at);
