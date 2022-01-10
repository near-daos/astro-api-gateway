import { Provider } from 'near-api-js/lib/providers';

export abstract class NearProvider extends Provider {
  abstract sendJsonRpc<T>(method: string, params: unknown): Promise<T>;
}
