ALTER TABLE resources
DROP CONSTRAINT IF EXISTS chk_resources_storage_provider;

ALTER TABLE resources
ADD CONSTRAINT chk_resources_storage_provider
CHECK (storage_provider IN ('firebase_storage', 'minio', 'local', 's3', 'r2', 'external'));
