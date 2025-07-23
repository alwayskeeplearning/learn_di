import 'reflect-metadata';

const Lifecycle = {
  SINGLETON: 'SINGLETON',
  TRANSIENT: 'TRANSIENT',
};

type TLifecycle = (typeof Lifecycle)[keyof typeof Lifecycle];

type Constructor<T> = new (...args: any[]) => T;

type TServiceRegistration<T = any> = {
  token: symbol | string;
  type: Constructor<T>;
  lifecycle: TLifecycle;
  instance?: T;
};

class DIContainer {
  private static instance: DIContainer | null = null;
  private services: Map<symbol | string, TServiceRegistration> = new Map();

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  public register<T>(token: symbol | string, type: Constructor<T>, lifecycle: TLifecycle = Lifecycle.SINGLETON): void {
    this.services.set(token, { token, type, lifecycle });
    console.log(`服务注册: ${String(token)}，生命周期: ${lifecycle}`);
  }

  resolve<T>(token: symbol | string): T {
    const registration = this.services.get(token);
    if (!registration) {
      throw new Error(`Service ${String(token)} not registered`);
    }

    if (registration.lifecycle === Lifecycle.SINGLETON) {
      if (!registration.instance) {
        registration.instance = new registration.type();
      }
      return registration.instance;
    }
    return new registration.type();
  }
}

export type { TLifecycle };
export { DIContainer, Lifecycle };
