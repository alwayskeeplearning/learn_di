import { Service } from '../decorators/service';
import { Lifecycle } from '../di';
import { Inject } from '../decorators/inject';
import { DatabaseService } from './database';
import { LoggerService } from './logger';

@Service(undefined, Lifecycle.TRANSIENT)
export class UserService {
  @Inject()
  private db!: DatabaseService;

  getUser(id: number, @Inject() logger: LoggerService) {
    logger.log(`Fetching user with id: ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}
