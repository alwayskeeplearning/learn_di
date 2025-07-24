import 'reflect-metadata';
import { INJECT_METADATA_KEY, InjectMetadata } from './decorators/inject';
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
    const injectMetadata: ConstructorInjectMetadata[] = Reflect.getMetadata(CONSTRUCTOR_INJECT_METADATA_KEY, registration.type) || [];

    // 构建参数数组
    const params: any[] = [];
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
}

export type { TLifecycle };
export { DIContainer, Lifecycle };
