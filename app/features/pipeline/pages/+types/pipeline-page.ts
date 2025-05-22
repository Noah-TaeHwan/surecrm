import type { MetaFunction } from 'react-router';

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  referredBy?: {
    id: string;
    name: string;
  };
  importance: 'high' | 'medium' | 'low';
  lastContactDate?: string;
  nextMeeting?: {
    date: string;
    time: string;
    type: string;
  };
  note?: string;
  tags?: string[];
  stageId: string;
}

export interface LoaderData {
  stages: PipelineStage[];
  clients: Client[];
}
