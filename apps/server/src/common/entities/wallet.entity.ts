import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import mongoose, { HydratedDocument } from "mongoose";
import { BaseEntity } from "./base.entity";

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
    virtuals: true,
  }
})
export class Wallet extends BaseEntity {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  accountNumber: string | null;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  balance: number;

  createdAt: Date;
  
  @Exclude()
  updatedAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  })
  user: mongoose.Types.ObjectId;
}

const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.index({ name: 1, user: 1 }, { unique: true });
WalletSchema.index({ user: 1 }, {partialFilterExpression: { deletedAt: null }});

export { WalletSchema };
