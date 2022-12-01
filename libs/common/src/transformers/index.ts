import { FindOperator, ValueTransformer } from 'typeorm';

export function deepTransform(value: any, transformer: (value) => any) {
  if (value instanceof FindOperator) {
    let newValue;

    if (Array.isArray(value.value)) {
      newValue = value.value.map(transformer);
    } else if (value.value instanceof FindOperator) {
      newValue = deepTransform(value.value, transformer);
    } else {
      newValue = transformer(value.value);
    }

    return new FindOperator(
      value.type,
      newValue,
      value.useParameter,
      value.multipleParameters,
      value.getSql,
      value.objectLiteralParameters,
    );
  } else {
    return transformer(value);
  }
}

export function bigintTransformer(): ValueTransformer {
  return {
    to: (value) => deepTransform(value, (value) => String(value)),
    from: (value) => BigInt(value),
  };
}

export function numberTransformer(): ValueTransformer {
  return {
    to: (value) => deepTransform(value, (value) => String(value)),
    from: (value) => Number(value),
  };
}
