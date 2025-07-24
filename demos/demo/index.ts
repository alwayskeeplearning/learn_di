import 'reflect-metadata'; // 全局导入一次
import { DIContainer } from '@/di';
import { Inject } from '@/decorators/inject';
import { Service } from '@/decorators/service';

@Service()
class Logger {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}
@Service()
class DatabaseService {
  constructor(@Inject() private logger: Logger) {}

  query(sql: string) {
    this.logger.log(`Executing query: ${sql}`);
    return 'Query result';
  }
}
@Service()
class UserService {
  @Inject() private db!: DatabaseService;

  getUser(id: number) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

const container = DIContainer.getInstance();

const userService = container.resolve<UserService>(UserService);
userService.getUser(1);
