import 'reflect-metadata'; // 全局导入一次
import { DIContainer, Lifecycle } from '@/di';
import { Service } from '@/decorators/service';
import { Inject } from '@/decorators/inject';

// 定义一个简单的日志服务（来自步骤4.2.1）
@Service('LoggerService', Lifecycle.SINGLETON)
class LoggerService {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

@Service('TaskService', Lifecycle.SINGLETON)
class TaskService {
  performTask(@Inject('LoggerService') logger: LoggerService, taskName: string) {
    logger.log(`[TaskService]: Performing task: ${taskName}`);
    return `Task ${taskName} completed`;
  }
}

// // 定义一个配置服务（来自步骤4.2.2）
// @Service() // 不指定token，使用类本身作为token
// class ConfigService {
//   getConfig(key: string) {
//     return `Config value for ${key}`;
//   }
// }

// // 定义一个Transient日志服务，每次解析新建实例
// @Service('TransientLogger', Lifecycle.TRANSIENT)
// class TransientLogger {
//   private id = Math.random(); // 随机ID，用于区分实例

//   log(message: string) {
//     console.log(`[Transient LOG ${this.id}]: ${message}`);
//   }
// }

// // 定义一个用户服务，使用属性注入多个依赖，包括Transient的
// @Service('UserService', Lifecycle.SINGLETON) // UserService本身是Singleton
// class UserService {
//   @Inject('LoggerService')
//   logger!: LoggerService; // Singleton

//   @Inject()
//   config!: ConfigService; // Singleton（默认）

//   @Inject('TransientLogger')
//   transientLogger!: TransientLogger; // Transient，每次UserService解析时新建

//   getUser(id: number) {
//     this.logger.log(`Fetching user with id: ${id}`);
//     const configValue = this.config.getConfig('userEndpoint');
//     this.logger.log(`Using config: ${configValue}`);
//     this.transientLogger.log(`Transient log for user ${id}`);
//     return { id, name: 'Test User' };
//   }
// }

const container = DIContainer.getInstance();
// // 第一次解析
// const userService1 = container.resolve<UserService>('UserService');
// userService1.getUser(1); // 使用一个TransientLogger实例

// // 第二次解析（由于UserService是Singleton，返回同一实例，但Transient属性已在首次注入）
// const userService2 = container.resolve<UserService>('UserService');
// userService2.getUser(2); // 使用相同的TransientLogger实例（因为属性注入只在Singleton创建时执行一次）

// console.log(userService1 === userService2); // true
// console.log(userService1.transientLogger === userService2.transientLogger); // false

const taskService = container.resolve<TaskService>('TaskService');
const result = container.invoke(taskService, 'performTask', ['MyTask']);
console.log(result);

// src/index.ts (追加到文件末尾或单独测试)
// 假设已有 import { DIContainer, Lifecycle } from './di';
// 假设已有 class Logger { log() { console.log('Logging...'); } }
