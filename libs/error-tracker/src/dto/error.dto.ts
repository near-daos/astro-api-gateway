import { ErrorType } from '../types';

export class ErrorDto {
  id: string;
  type: ErrorType;
  reason: string;
  metadata: Record<string, any>;
  timestamp?: string;
}
