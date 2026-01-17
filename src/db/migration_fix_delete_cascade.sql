-- Fix Delete Cascade for Review Requests
-- Allows deleting a plan even if a review request exists.

-- 1. Drop existing constraint
ALTER TABLE public.review_requests
DROP CONSTRAINT review_requests_plan_id_fkey;

-- 2. Add new constraint with CASCADE
ALTER TABLE public.review_requests
ADD CONSTRAINT review_requests_plan_id_fkey
FOREIGN KEY (plan_id)
REFERENCES public.plans(id)
ON DELETE CASCADE;

-- 3. Add RLS Policy for Deleting Review Requests (Clean up)
create policy "Users can delete their own review requests" 
  on public.review_requests for delete 
  using (
    exists (
      select 1 from public.plans 
      where id = plan_id and user_id = auth.uid()
    )
  );