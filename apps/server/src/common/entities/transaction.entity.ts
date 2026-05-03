import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import mongoose, { HydratedDocument } from "mongoose";
import { BaseEntity } from "./base.entity";

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
    virtuals: true,
  }
})
export class Transaction extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.UUID,
    required: true,
    index: true,
  })
  transferId: string;

  @Prop({
    enum: TransactionType,
    required: true,
  })
  transactionType: TransactionType;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  note: string | null;

  @Prop({
    type: String,
    required: true,
  })
  transactionCategory: string;
  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  })
  wallet: mongoose.Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  runningBalance: number;

  createdAt: Date;
  
  @Exclude()
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index(
  { user: 1, wallet: 1, createdAt: -1 },
  { partialFilterExpression: { deletedAt: null }},
);

TransactionSchema.index(
  { user: 1, transactionType: 1 },
  { partialFilterExpression: { deletedAt: null }},
);