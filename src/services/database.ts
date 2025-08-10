import { Service } from '../decorators/service';
import { Lifecycle } from '../di';
import { Inject } from '../decorators/inject';
import { LoggerService } from './logger';

@Service(undefined, Lifecycle.SINGLETON)
export class DatabaseService {
  constructor(@Inject() private logger: LoggerService) {
    this.logger.log('DatabaseService initialized');
  }

  query(sql: string) {
    this.logger.log(`Executing query: ${sql}`);
    return 'mock data';
  }
}
