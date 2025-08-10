/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata'; // 全局导入一次
import { DIContainer } from '@/di';
import { Lifecycle } from '@/di';
import { Service } from '@/decorators/service';
import { Inject } from '@/decorators/inject';

const container = DIContainer.getInstance();
container.register('B_FACTORY', () => () => container.resolve('B'), Lifecycle.SINGLETON);
// // ===== 循环依赖验证 =====

// 使用字符串 token，避免前向引用的元数据问题
@Service('A')
class AService {
  constructor(@Inject('B_FACTORY') private getB: () => any) {}

  work() {
    const b = this.getB(); // 这里调用函数，安全获取 B 实例（不会环）
    b.ping(); // 现在可以正常使用 B 的方法
  }
}

@Service('B')
class BService {
  constructor(@Inject('A') private a: any) {}

  ping() {
    console.log('B pinged, with A:', this.a); // 演示 B 能访问 A
  }
}

// 测试打破循环
try {
  const a = container.resolve<any>('A');
  console.log('A resolved successfully:', a); // 成功

  a.work(); // 调用方法：获取 B 并 ping（输出 'B pinged, with A: [AService 实例]'）

  const b = container.resolve<any>('B'); // B 也能解析
  console.log('B resolved successfully:', b);
} catch (e) {
  console.log('Cycle error:', (e as Error).message); // 不会触发
}
