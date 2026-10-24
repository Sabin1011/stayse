
BEGIN;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate emails regardless of letter case.
CREATE UNIQUE INDEX users_email_lower_unique
    ON users (LOWER(email));

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL
        REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Seed the standard roles.
INSERT INTO roles (name, description)
VALUES
    ('guest', 'Can search and book accommodation'),
    ('host', 'Can manage accommodation listings'),
    ('admin', 'Can administer the platform');

COMMIT;
