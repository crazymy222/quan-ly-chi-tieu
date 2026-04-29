import { Prop } from '@nestjs/mongoose';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class BaseEntity {
  @Exclude({ toPlainOnly: true })
  @Transform(({ value }) => value.toString())
  _id: string;

  id: string;

  @Prop({ default: null, type: Date, nullable: true })
  @Exclude()
  deletedAt: Date | null;
}