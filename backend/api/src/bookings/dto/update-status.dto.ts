import { IsEnum } from 'class-validator';

export enum BookingStatusDto {
  accepted = 'accepted',
  on_the_way = 'on_the_way',
  washing = 'washing',
  complete = 'complete',
  cancel = 'cancel',
}

export class UpdateStatusDto {
  @IsEnum(BookingStatusDto)
  status!: BookingStatusDto;
}


