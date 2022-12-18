import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsUrl, Matches } from 'class-validator';

export class AddTrackDto {
  // Interval
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsIn([5, 10, 30, 60, 120, 300, 720, 1440], {
    message: 'بازه زمانی انتخاب شده نامعتبر است',
  })
  interval: number;

  // Query
  @IsUrl(undefined, { message: 'آدرس وارد شده صحیح نمی باشد' })
  @Matches(/https:\/\/divar\.ir\/s\/[-a-zA-Z0-9@:%_\+.~#?&//=]*/i, {
    message: 'آدرس وارد شده متعلق به دیوار نمی باشد',
  })
  query: string;
}
