import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddTrackDto {
  //Title
  @MinLength(2, {
    message: 'حداقل طول عنوان پیگیری 2 حرف میباشد',
  })
  @MaxLength(250, {
    message: 'حداکثر طول عنوان پیگیری 250 حرف میباشد',
  })
  title: string;

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
