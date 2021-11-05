export class BaseMessage {
  constructor(pattern: string, data: Record<string, unknown>) {
    this.pattern = pattern;
    this.data = data;
  }

  pattern: string;
  data: any;
}
