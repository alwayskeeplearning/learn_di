/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata'; // 全局导入一次
import { DIContainer, Lifecycle } from '@/di';
import { Service } from '@/decorators/service';

// 定义一个简单的日志服务（来自步骤4.2.1）
@Service('Logger', Lifecycle.SINGLETON)
class Logger {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}
// src/index.ts (追加到文件末尾或单独测试)
// 假设已有 import { DIContainer, Lifecycle } from './di';
// 假设已有 class Logger { log() { console.log('Logging...'); } }

// 测试自定义工厂
const container = DIContainer.getInstance();

// 注册一个工厂
container.register(
  'CustomService',
  () => {
    const logger = container.resolve('Logger'); // 假设Logger已注册
    return { message: 'Created by factory', logger };
  },
  Lifecycle.TRANSIENT,
);

// 解析并测试
const customInstance1 = container.resolve('CustomService') as any;
console.log(customInstance1.message); // 输出: Created by factory
customInstance1.logger.log('test log'); // 输出: Logging...

const customInstance2 = container.resolve('CustomService');
console.log(customInstance1 === customInstance2); // false (Transient)

// 如果改为Singleton，测试缓存
container.register('CustomSingleton', () => ({ message: 'Singleton factory' }), Lifecycle.SINGLETON);
const singleton1 = container.resolve('CustomSingleton');
const singleton2 = container.resolve('CustomSingleton');
console.log(singleton1 === singleton2); // true
