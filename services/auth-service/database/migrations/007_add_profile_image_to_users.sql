
BEGIN;

ALTER TABLE users
ADD COLUMN profile_image_url TEXT NULL,
ADD COLUMN profile_image_public_id VARCHAR(255) NULL;

COMMIT;
