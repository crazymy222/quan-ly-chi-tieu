import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepositoryAbstract, BaseRepositoryInterface } from "./base.repository";
import { User } from "../entities/user.entity";

export interface UserRepositoryInterface extends BaseRepositoryInterface<User>{}

@Injectable()
export class UserRepository extends BaseRepositoryAbstract<User> implements UserRepositoryInterface {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>
  ) {
    super(userRepository);
   }
}