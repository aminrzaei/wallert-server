import { Transform } from 'class-transformer';
import { IsBoolean, IsInt } from 'class-validator';

export class ToggleStatusDto {
  // Track Id
  @Transform(({ value }) => Number(value))
  @IsInt({
    message: 'شناسه پیگیری وارد شده نامعتبر است',
  })
  id: number;

  // Is Track Active
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({
    message: 'وضعیت وارد شده نامعتبر است',
  })
  isActive: boolean;
}
