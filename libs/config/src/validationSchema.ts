import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { BaseValidationSchema } from './validation/base.schema';

export default function validate(
  classname: ClassConstructor<BaseValidationSchema>,
  config: Record<string, unknown>,
) {
  const validatedConfig = plainToClass(classname, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
