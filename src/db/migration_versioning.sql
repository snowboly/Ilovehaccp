-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HACCP Plan Versions (Immutable Snapshots)
CREATE TABLE haccp_plan_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    
    -- Metadata
    framework_version VARCHAR(50) NOT NULL, -- e.g. "v1.0"
    question_set_versions JSONB NOT NULL,   -- e.g. { "product": "v1", "process": "v1" }
    
    -- The Core Data
    data_snapshot JSONB NOT NULL,           -- Full answers + narrative
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    change_reason TEXT,                     -- Why was this version created?
    
    -- Locking state at time of snapshot
    locked_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enhance existing 'plans' table (if needed, adding locking columns)
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS current_version INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- 3. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'VALIDATE', 'EXPORT', 'LOCK', 'NEW_VERSION'
    details JSONB,               -- Extra info (e.g., "Exported to PDF")
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX idx_haccp_versions_plan_id ON haccp_plan_versions(plan_id);
CREATE INDEX idx_audit_logs_plan_id ON audit_logs(plan_id);
