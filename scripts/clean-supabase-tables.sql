-- Supabase public 스키마의 모든 테이블 삭제
-- 주의: 이 스크립트는 모든 데이터를 삭제합니다!

do $$ declare
    r record;
begin
    -- 모든 테이블을 cascade로 삭제
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
    end loop;
    
    -- 모든 enum 타입 삭제
    for r in (select typname from pg_type where typtype = 'e' and typnamespace = (select oid from pg_namespace where nspname = 'public')) loop
        execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
    end loop;
    
    -- 모든 함수 삭제 (사용자 정의)
    for r in (select proname, oidvectortypes(proargtypes) as argtypes from pg_proc where pronamespace = (select oid from pg_namespace where nspname = 'public')) loop
        execute 'drop function if exists public.' || quote_ident(r.proname) || '(' || r.argtypes || ') cascade';
    end loop;
end $$;

-- 성공 메시지
SELECT 'Supabase public 스키마가 성공적으로 정리되었습니다!' as message; 