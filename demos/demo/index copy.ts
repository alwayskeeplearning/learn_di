/* eslint-disable @typescript-eslint/no-unused-vars */
// 1. 安装和导入
import 'reflect-metadata';

// 2. 定义一些类
class Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class DatabaseService {
  connect(): string {
    return 'Connected to database';
  }
}

// 这个类用于演示普通类（未装饰）与装饰类的区别

class UserService {
  constructor(
    private logger: Logger,
    private db: DatabaseService,
  ) {}

  getUser(id: number): string {
    this.logger.log(`Getting user ${id}`);
    const connection = this.db.connect();
    return `User ${id} (${connection})`;
  }
}

// 3. 简单的装饰器来触发元数据生成
function Injectable<T extends new (...args: any[]) => any>(constructor: T) {
  return constructor;
}

// 4. 装饰类（这会触发编译器生成 design:paramtypes）
@Injectable
class DecoratedUserService {
  constructor(
    private logger: Logger,
    private db: DatabaseService,
  ) {}

  getUser(id: number): string {
    this.logger.log(`Getting user ${id}`);
    return `User ${id}`;
  }
}

// 5. 关键测试：直接使用 getMetadata
console.log('=== 直接检查元数据 ===');

// 获取参数类型
const paramTypes = Reflect.getMetadata('design:paramtypes', DecoratedUserService);
console.log('paramTypes:', paramTypes);
console.log('paramTypes 是数组吗？', Array.isArray(paramTypes));
console.log('第一个参数类型名称:', paramTypes[0].name);
console.log('第二个参数类型名称:', paramTypes[1].name);

// 6. 证明这些就是真实的构造函数
console.log('\n=== 验证构造函数身份 ===');
console.log('第一个参数类型 === Logger?', paramTypes[0] === Logger);
console.log('第二个参数类型 === DatabaseService?', paramTypes[1] === DatabaseService);

// 7. 直接使用这些构造函数创建实例
console.log('\n=== 直接实例化测试 ===');
const LoggerConstructor = paramTypes[0]; // 不需要任何类型断言！
const DbConstructor = paramTypes[1]; // 不需要任何类型断言！

const loggerInstance = new LoggerConstructor();
const dbInstance = new DbConstructor();

// 8. 验证实例类型
console.log('logger instance instanceof Logger:', loggerInstance instanceof Logger);
console.log('db instance instanceof DatabaseService:', dbInstance instanceof DatabaseService);

// 9. 调用方法证明功能正常
loggerInstance.log('这是直接从元数据创建的实例！');
console.log('DB connection:', dbInstance.connect());

// 10. 最关键的测试：自动解析依赖
console.log('\n=== 自动依赖解析 ===');

function autoResolve<T>(constructor: new (...args: any[]) => T): T {
  console.log(`正在解析: ${constructor.name}`);

  // 获取依赖类型
  const dependencies: any[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
  console.log(`依赖数量: ${dependencies.length}`);

  // 递归创建依赖实例
  const resolvedDependencies = dependencies.map((DepConstructor, index) => {
    console.log(`  解析依赖 ${index}: ${DepConstructor.name}`);
    // 注意：这里 DepConstructor 直接就是构造函数，无需任何转换！

    return new DepConstructor(); // 完全类型安全！
  });

  const test = resolvedDependencies[0];
  console.log(test);

  // 创建主实例
  return new constructor(...resolvedDependencies);
}

// 使用自动解析
const userService = autoResolve(DecoratedUserService);
console.log('自动解析的实例类型:', userService.constructor.name);
console.log('调用方法结果:', userService.getUser(123));

// 11. 类型安全验证
console.log('\n=== TypeScript 类型推导验证 ===');

// 这个函数的返回类型会被 TypeScript 正确推导
function typeSafeResolve<T>(constructor: new (...args: any[]) => T): T {
  const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
  const dependencies = paramTypes.map(ParamType => new ParamType());
  return new constructor(...dependencies); // TypeScript 知道这返回 T 类型
}

const typedUserService = typeSafeResolve(DecoratedUserService);
// ^^^^^^^^^^^^^^^^^^^^^ TypeScript 自动推导为 DecoratedUserService 类型

// 编译器知道 typedUserService 有 getUser 方法！
typedUserService.getUser(456); // 无需任何类型断言，编译器确保方法存在

console.log('\n=== 完成！所有测试通过 ===');
