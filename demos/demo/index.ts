import { DIContainer, Lifecycle } from '@/di';

class TestService {
  constructor() {}
  test(): void {
    console.log('test');
  }
}

const run = () => {
  const container = DIContainer.getInstance();

  //注册
  const singletonToken = Symbol('SingletonTest');
  container.register(singletonToken, TestService, Lifecycle.SINGLETON);
  const transientToken = Symbol('TransientTest');
  container.register(transientToken, TestService, Lifecycle.TRANSIENT);

  //解析
  const single1 = container.resolve(singletonToken);
  const single2 = container.resolve(singletonToken);
  const transient1 = container.resolve(transientToken);
  const transient2 = container.resolve(transientToken);
  console.log(single1 === single2);
  console.log(transient1 === transient2);

  //测试未注册
  try {
    container.resolve<TestService>(Symbol('TestService2'));
  } catch (error) {
    console.log(error);
  }
};

run();
