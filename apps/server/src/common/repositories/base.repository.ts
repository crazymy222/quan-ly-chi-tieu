import { ClientSession, Model, QueryFilter, QueryOptions, SaveOptions, Types, UpdateQuery } from "mongoose";
import { BaseEntity } from "../entities/base.entity";

export type FindAllResponse<T> = { count: number; items: T[] };
export type RepositoryOptions = {
  session?: ClientSession;
};

export interface BaseRepositoryInterface<T> {
  create(dto: T | any, options?: RepositoryOptions): Promise<T>;

  findOneById(id: string, options?: RepositoryOptions): Promise<T | null>;

  findOneByCondition(condition?: object, options?: RepositoryOptions): Promise<T | null>;

  findAll(
    condition: object,
    options?: QueryOptions<T>,
    repositoryOptions?: RepositoryOptions,
  ): Promise<FindAllResponse<T>>;

  findOneAndUpdate(filter: QueryFilter<T>, dto: UpdateQuery<T>, options?: RepositoryOptions): Promise<T | null>;

  softDelete(id: string, options?: RepositoryOptions): Promise<boolean>;
}

export abstract class BaseRepositoryAbstract<T extends BaseEntity> implements BaseRepositoryInterface<T> {
  protected constructor(
    private readonly model: Model<T>,
  ) {
    this.model = model;
  }

  async isExist(condition: QueryFilter<T>,): Promise<string | null> {
    const item = await this.model.exists(condition).exec();
    return item?._id?.toString() || null;
  }

  async create(dto: any, options?: RepositoryOptions): Promise<T> {
    const createdData = new this.model(dto);
    const savedData = await createdData.save(options as SaveOptions);
    return savedData.toJSON<T>({ virtuals: true });
  }

  async findOneById(id: string, options?: RepositoryOptions): Promise<T | null> {
    const item = await this.model.findOne({ _id: new Types.ObjectId(id), deletedAt: null }, null, { ...options, session: options?.session }).exec();
    return item?.toJSON<T>({ virtuals: true }) ?? null;
  }

  async findOneByCondition(condition: QueryFilter<T>, options?: RepositoryOptions): Promise<T | null> {
    const item = await this.model.findOne(condition, null, { ...options, session: options?.session }).exec();
    return item?.toJSON<T>({ virtuals: true }) ?? null;
  }

  async findAll(
    condition: QueryFilter<T>,
    options?: QueryOptions<T>,
    repositoryOptions?: RepositoryOptions,
  ): Promise<FindAllResponse<T>> {
    const [count, items] = await Promise.all([
      this.model.countDocuments(condition, repositoryOptions).exec(),
      this.model.find(condition, options?.projection, { ...options, session: repositoryOptions?.session }).exec(),
    ]);
    return { count, items: items.map(item => item.toJSON<T>({ virtuals: true })) };
  }

  async findOneAndUpdate(filter: QueryFilter<T>, dto: UpdateQuery<T>, options?: RepositoryOptions): Promise<T | null> {
    const item = await this.model.findOneAndUpdate(
      filter,
      dto,
      { ...options, returnDocument: 'after' },
    ).exec();
    return item?.toJSON<T>({ virtuals: true }) ?? null;
  }

  async softDelete(id: string, options?: RepositoryOptions): Promise<boolean> {
    const deleteItem = await this.model.findById(id, null, options);
    if (!deleteItem) {
      return false;
    }

    return !!(await this.model
      .findByIdAndUpdate<T>(id, { deletedAt: new Date() }, options)
      .exec());
  }
}
