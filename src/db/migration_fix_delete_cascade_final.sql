-- Final Deletion Cascade Fix
-- Ensures that deleting a plan removes all related technical/admin records.

-- 1. Review Requests (if it exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_requests') THEN
        ALTER TABLE public.review_requests DROP CONSTRAINT IF EXISTS review_requests_plan_id_fkey;
        ALTER TABLE public.review_requests ADD CONSTRAINT review_requests_plan_id_fkey 
            FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Leads (if it exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_plan_id_fkey;
        ALTER TABLE public.leads ADD CONSTRAINT leads_plan_id_fkey 
            FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Admin Audit Logs (if it exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_logs') THEN
        ALTER TABLE public.admin_audit_logs DROP CONSTRAINT IF EXISTS admin_audit_logs_plan_id_fkey;
        ALTER TABLE public.admin_audit_logs ADD CONSTRAINT admin_audit_logs_plan_id_fkey 
            FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;
    END IF;
END $$;
