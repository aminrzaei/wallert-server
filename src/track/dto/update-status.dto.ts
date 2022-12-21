import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateStatusDto {
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
