import { Service } from '../decorators/service';
import { Lifecycle } from '../di';

@Service(undefined, Lifecycle.SINGLETON)
export class LoggerService {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}
