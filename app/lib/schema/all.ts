import * as core from './core';
import * as billing from './billing';
import * as publicSchema from './public';
import * as calendarSchema from '~/features/calendar/lib/schema';
import * as pipelineSchema from '~/features/pipeline/lib/schema';
// 다른 스키마 파일이 있다면 여기에 추가
// 예: import * as posts from './posts';

export default {
  ...core,
  ...billing,
  ...publicSchema,
  ...calendarSchema,
  ...pipelineSchema,
  // ...posts,
};
