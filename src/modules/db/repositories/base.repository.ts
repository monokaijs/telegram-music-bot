import {
  AggregateOptions,
  FilterQuery,
  HydratedDocument,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery
} from "mongoose";

export class BaseRepository<T> {
  constructor(private readonly _repository: Model<T>) {
  }

  find(filter: FilterQuery<T>) {
    return this._repository.find(filter);
  }

  exists(filter: FilterQuery<T>) {
    return this._repository.exists(filter);
  }

  // paginate(filter: FilterQuery<T>, options?: PaginateOptions) {
  //   return this._repository.paginate(filter, options);
  // }
  //
  // aggregatePaginate(query: Aggregate<T[]>, options: PaginateOptions) {
  //   return this._repository.aggregatePaginate(query, options);
  // }

  findOne(filter: FilterQuery<T>) {
    return this._repository.findOne(filter);
  }

  findOneAndUpdate(filter: FilterQuery<T>, update?: UpdateQuery<T>, options?: QueryOptions<T>) {
    return this._repository.findOneAndUpdate(filter, update, options);
  }

  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>) {
    return this._repository.updateMany(filter, update);
  }

  deleteMany(filter: FilterQuery<T>) {
    return this._repository.deleteMany(filter);
  }

  deleteOne(filter: FilterQuery<T>) {
    return this._repository.deleteOne(filter);
  }

  getAll(): Promise<T[]> {
    return this._repository.find();
  }

  getById(id: any, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<HydratedDocument<T>> {
    return this._repository.findById(id, projection);
  }

  create(item: Omit<T, "_id">): Promise<HydratedDocument<T>> {
    return this._repository.create(item);
  }

  count(filter: FilterQuery<T>) {
    return this._repository.countDocuments(filter);
  }

  aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this._repository.aggregate(pipeline, options);
  }

  insertMany(items: Omit<T, "_id">[]) {
    return this._repository.insertMany(items);
  }

  getCollectionName() {
    return this._repository.collection.name;
  }
}
