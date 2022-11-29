import { ValueTransformer } from 'typeorm';

export function bigintTransformer(): ValueTransformer {
  return {
    from: (value) => BigInt(value),
    to: (value) => String(value),
  };
}

export function numberTransformer(): ValueTransformer {
  return {
    from: (value) => Number(value),
    to: (value) => String(value),
  };
}
