import type { TLifecycle } from '../di';
import { DIContainer, Lifecycle } from '../di';

const Service = (token?: symbol | string, lifecycle: TLifecycle = Lifecycle.SINGLETON) => {
  return <T extends { new (...args: any[]): object }>(target: T) => {
    let serviceToken: any = target;

    if (typeof token === 'string' && token.trim() !== '') {
      serviceToken = token;
    }
    if (typeof token === 'symbol' && token.description) {
      serviceToken = token;
    }

    const container = DIContainer.getInstance();
    container.register(serviceToken, target, lifecycle);

    Reflect.defineMetadata('di:token', serviceToken, target);

    return target;
  };
};

export { Service };
