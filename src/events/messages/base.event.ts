export class BaseMessage {
  constructor(pattern: string, data: {}) {
    this.pattern = pattern;
    this.data = data;
  }

  pattern: string;
  data: any;
}
