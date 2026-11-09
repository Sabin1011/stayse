BEGIN;

ALTER TABLE users
DROP CONSTRAINT users_status_check;

UPDATE users
SET status = 'pending_verification'
WHERE status = 'pending';

ALTER TABLE users
ADD CONSTRAINT users_status_check
CHECK (
    status IN (
        'active',
        'suspended',
        'deleted',
        'pending_verification'
    )
);

COMMIT;