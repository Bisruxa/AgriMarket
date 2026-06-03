-- New traders require admin approval before login
ALTER TABLE "users" ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';
