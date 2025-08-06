import 'reflect-metadata';
import { INJECT_METADATA_KEY, InjectMetadata, METHOD_INJECT_METADATA_KEY, MethodInjectMetadata } from './decorators/inject';
import { CONSTRUCTOR_INJECT_METADATA_KEY, ConstructorInjectMetadata } from './decorators/inject';

const Lifecycle = {
  SINGLETON: 'SINGLETON',
  TRANSIENT: 'TRANSIENT',
};

type TLifecycle = (typeof Lifecycle)[keyof typeof Lifecycle];

type Constructor<T> = new (...args: any[]) => T;

// 修改 TServiceRegistration 的 token 为 any
type TServiceRegistration<T = any> = {
  token: any;
  type: Constructor<T>;
  lifecycle: TLifecycle;
  instance?: T;
};

class DIContainer {
  private static instance: DIContainer | null = null;
  // 修改 Map 的键为 any
  private services: Map<any, TServiceRegistration> = new Map();

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // 修改 register 的 token 为 any
  public register<T>(token: any, type: Constructor<T>, lifecycle: TLifecycle = Lifecycle.SINGLETON): void {
    this.services.set(token, { token, type, lifecycle });
    console.log(`服务注册: ${token.name || String(token)}，生命周期: ${lifecycle}`);
  }

  // 修改 resolve 的 token 为 any
  resolve<T>(token: any): T {
    const registration = this.services.get(token) as TServiceRegistration<T>;
    if (!registration) {
      throw new Error(`Service ${token.name || String(token)} not registered`);
    }

    // 准备构造函数参数
    const paramTypes = Reflect.getMetadata('design:paramtypes', registration.type) || [];
    const injectMetadata: ConstructorInjectMetadata[] = Reflect.getMetadata(CONSTRUCTOR_INJECT_METADATA_KEY, registration.type) || [];

    // 构建参数数组
    const params = paramTypes.map((defaultType: any, index: number) => {
      const metadata = injectMetadata.find(metadata => metadata.index === index);
      const resolveType = metadata ? metadata.type : defaultType;
      if (resolveType === undefined) {
        throw new Error(`cannot resolve parameter at index ${index} of ${registration.type.name}`);
      }
      return this.resolve(resolveType);
    });

    injectMetadata.forEach(({ index, type }) => {
      params[index] = this.resolve(type);
    });

    let instance: T;

    if (registration.lifecycle === Lifecycle.SINGLETON) {
      if (!registration.instance) {
        instance = new registration.type(...params);
        const propInjectMetadata: InjectMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, registration.type) || [];
        propInjectMetadata.forEach(({ propertyKey, type }) => {
          (instance as any)[propertyKey] = this.resolve(type);
        });
        registration.instance = instance;
      }
      return registration.instance;
    } else {
      instance = new registration.type(...params);
      const propInjectMetadata: InjectMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, registration.type) || [];
      propInjectMetadata.forEach(({ propertyKey, type }) => {
        (instance as any)[propertyKey] = this.resolve(type);
      });
      return instance;
    }
  }

  invoke(target: any, methodName: string, additionalArgs: any[]): any {
    const targetClass = target.constructor || target;
    const injectMetadata: MethodInjectMetadata[] = Reflect.getMetadata(METHOD_INJECT_METADATA_KEY, targetClass) || [];
    console.log('injectMetadata', injectMetadata);
    const paramTypes = Reflect.getMetadata('design:paramtypes', target, methodName) || [];
    console.log('paramTypes', paramTypes);
    const methodMetadata = injectMetadata.filter(metadata => metadata.methodName === methodName);
    console.log('methodMetadata', methodMetadata);
    const nonInjectedIndexes: number[] = [];
    paramTypes.forEach((_: any, index: number) => {
      if (!methodMetadata.some(m => m.index === index)) {
        nonInjectedIndexes.push(index);
      }
    });
    console.log('nonInjectedIndexes', nonInjectedIndexes);
    const params = paramTypes.map((defaultType: any, index: number) => {
      const metadata = methodMetadata.find(m => m.index === index);
      if (metadata) {
        return this.resolve(metadata.type);
      }
      const argIndex = nonInjectedIndexes.indexOf(index);
      return additionalArgs[argIndex] ?? undefined;
    });

    console.log('params', params);
    const method = target[methodName];
    return method.apply(target, params);
  }
}

export type { TLifecycle };
export { DIContainer, Lifecycle };
