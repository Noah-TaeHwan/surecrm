import type { LoaderFunction } from 'react-router';
import type { Session } from '@supabase/supabase-js';

// 이 라우트의 loader 함수에 대한 타입을 정의합니다.
interface LoaderArgsInterface {
  request: Request;
}

// loader가 반환하는 데이터의 타입을 정의합니다.
interface LoaderDataInterface {
  session: Session;
}

// 이 라우트의 타입을 종합적으로 정의합니다.
export namespace Route {
  export type LoaderArgs = LoaderArgsInterface;
  export type LoaderData = LoaderDataInterface;
}
