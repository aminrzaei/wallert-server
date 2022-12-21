import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class DeleteTrackDto {
  // Track Id
  @Transform(({ value }) => Number(value))
  @IsInt({
    message: 'شناسه پیگیری وارد شده نامعتبر است',
  })
  id: number;
}
