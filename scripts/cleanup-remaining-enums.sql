-- 남아있는 enum 타입들 추가 삭제
DROP TYPE IF EXISTS public.language CASCADE;
DROP TYPE IF EXISTS public.timezone CASCADE;
DROP TYPE IF EXISTS public.currency CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.plan_type CASCADE;
DROP TYPE IF EXISTS public.billing_cycle CASCADE;
DROP TYPE IF EXISTS public.feature_type CASCADE;
DROP TYPE IF EXISTS public.permission_type CASCADE;
DROP TYPE IF EXISTS public.access_level CASCADE;
DROP TYPE IF EXISTS public.log_level CASCADE;
DROP TYPE IF EXISTS public.event_type CASCADE;
DROP TYPE IF EXISTS public.priority_level CASCADE;
DROP TYPE IF EXISTS public.status_type CASCADE;
DROP TYPE IF EXISTS public.visibility_type CASCADE;
DROP TYPE IF EXISTS public.approval_status CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;
DROP TYPE IF EXISTS public.communication_type CASCADE;
DROP TYPE IF EXISTS public.contact_method CASCADE;
DROP TYPE IF EXISTS public.relationship_type CASCADE;
DROP TYPE IF EXISTS public.source_type CASCADE;
DROP TYPE IF EXISTS public.tag_type CASCADE;
DROP TYPE IF EXISTS public.file_type CASCADE;
DROP TYPE IF EXISTS public.media_type CASCADE;
DROP TYPE IF EXISTS public.template_type CASCADE;
DROP TYPE IF EXISTS public.workflow_status CASCADE;
DROP TYPE IF EXISTS public.automation_type CASCADE;
DROP TYPE IF EXISTS public.trigger_type CASCADE;
DROP TYPE IF EXISTS public.condition_type CASCADE;
DROP TYPE IF EXISTS public.action_type CASCADE;

-- 완료 메시지
SELECT 'Additional enum cleanup completed!' as message; 