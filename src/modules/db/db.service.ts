import {Injectable} from "@nestjs/common";

@Injectable()
export class DbService {

  constructor(
    // @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    // this.user = new BaseRepository<User>(this.userModel);
  }
}
