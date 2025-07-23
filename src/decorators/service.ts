import type { TLifecycle } from '../di';
import { DIContainer, Lifecycle } from '../di';
import 'reflect-metadata';

const Service = (token: symbol | string = Symbol(), lifecycle: TLifecycle = Lifecycle.SINGLETON) => {
  return <T extends { new (...args: any[]): object }>(target: T) => {
    let serviceToken: symbol | string = Symbol(target.name);
    if (typeof token === 'string' && token.trim() !== '') {
      serviceToken = token;
    }
    if (typeof token === 'symbol' && token.description) {
      serviceToken = token;
    }

    const container = DIContainer.getInstance();
    container.register(serviceToken, target, lifecycle);

    Reflect.defineMetadata('di:token', serviceToken, target);

    const params = Reflect.getMetadata('design:paramtypes', target);
    console.log(params);

    return target;
  };
};

export { Service };
