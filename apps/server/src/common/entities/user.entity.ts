import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import mongoose, { HydratedDocument } from "mongoose";
import { BaseEntity } from "./base.entity";

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
    virtuals: true,
  }
})
export class User extends BaseEntity {
  @Prop({
    type: String,
    required: false,
    default: null,
    minlength: 2,
    maxlength: 60,
    set: (value: string) => value ? value.trim() : null,
  })
  displayName: string | null;

  @Prop({
    type: String,
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    set: (value: string) => value.trim().toLowerCase(),
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: false,
    default: null,
  })
  defaultWallet: mongoose.Types.ObjectId | null;

  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('wallets', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'user',
})
