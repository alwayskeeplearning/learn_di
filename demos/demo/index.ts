import 'reflect-metadata'; // 全局导入一次
import { DIContainer, Lifecycle } from '@/di';
import { Service } from '@/decorators/service';
import { Inject } from '@/decorators/inject';

// 假设已有这些服务（从之前部分复制或添加）
@Service()
class LoggerService {
  log(message: string) {
    console.log(`Log: ${message}`);
  }
}

@Service()
class UserService {
  constructor(private logger: LoggerService) {} // 无 @Inject，自动注入

  getUser() {
    this.logger.log('Fetching user');
    return { id: 1, name: 'Test User' };
  }
}

// 测试
const container = DIContainer.getInstance();
const userService = container.resolve<UserService>(UserService);
console.log(userService.getUser()); // 应输出 Log: Fetching user 和用户对象

// 自定义 token
const ILoggerToken = Symbol('ILogger');
// 注册时用自定义 token
container.register(ILoggerToken, LoggerService, Lifecycle.SINGLETON);
@Service()
class UserService1 {
  constructor(@Inject(ILoggerToken) private logger: LoggerService) {} // 这里用 @Inject(token) 指定自定义 token

  getUser() {
    this.logger.log('Fetching user with custom token');
    return { id: 1, name: 'Test User' };
  }
}

// 测试
const userService1 = container.resolve<UserService1>(UserService1);
console.log(userService1.getUser()); // 输出: Console Log: Fetching user with custom token
