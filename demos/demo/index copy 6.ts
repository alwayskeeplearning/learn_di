import 'reflect-metadata'; // 全局导入一次
import { DIContainer, Lifecycle } from '@/di';
import { UserService } from '@/services/user';

// 测试代码
const container = DIContainer.getInstance();

// 解析 UserService（会自动注入属性依赖，如 db）
const userService = container.resolve(UserService);

// 使用 invoke 调用带方法注入的函数
const user = container.invoke(userService, 'getUser', [1]);
console.log('User data:', user);

// 验证生命周期：UserService 是 Transient（应为 false）
const userService2 = container.resolve(UserService);
console.log('UserService same instance?', userService === userService2);

// 验证生命周期：DatabaseService 是 Singleton（应为 true）
import { DatabaseService } from '@/services/database';
const db1 = container.resolve(DatabaseService);
const db2 = container.resolve(DatabaseService);
console.log('DatabaseService same instance?', db1 === db2);

// 演示工厂注册（SINGLETON）
container.register('Config', () => ({ env: 'dev' }), Lifecycle.SINGLETON);
const config1 = container.resolve<any>('Config');
const config2 = container.resolve<any>('Config');
console.log('Config same instance?', config1 === config2, config1);
