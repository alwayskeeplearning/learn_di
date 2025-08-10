// 我们使用 Symbol 来创建一个唯一的元数据键，以避免与其他库或代码发生冲突。
export const INJECT_METADATA_KEY = Symbol('INJECT_METADATA');
export const CONSTRUCTOR_INJECT_METADATA_KEY = Symbol('CONSTRUCTOR_INJECT_METADATA');
export const METHOD_INJECT_METADATA_KEY = Symbol('METHOD_INJECT_METADATA');

// 定义一个类型，用于描述属性注入的元数据格式。
export interface InjectMetadata {
  propertyKey: string | symbol;
  type: any;
}

export interface ConstructorInjectMetadata {
  index: number;
  type: any;
}

export interface MethodInjectMetadata {
  methodName: string | symbol;
  index: number;
  type: any;
}

/**
 * @Inject() 属性装饰器。
 * 它的作用是标记一个属性，以便DI容器在实例化时自动注入依赖。
 */
export function Inject(token?: symbol | string) {
  return function (target: any, propertyKey?: string | symbol, parameterIndex?: number) {
    if (propertyKey !== undefined && parameterIndex === undefined) {
      // 对于属性装饰器 target是类的原型，propertyKey是属性名
      // "design:type" 是 TypeScript 在启用 emitDecoratorMetadata 后自动添加的元数据键。
      const type = token ?? Reflect.getMetadata('design:type', target, propertyKey);
      // target.constructor 指向类的构造函数。我们把元数据附加到类本身，而不是实例上。
      const existingMetadata: InjectMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, target.constructor) || [];
      existingMetadata.push({ propertyKey, type });
      Reflect.defineMetadata(INJECT_METADATA_KEY, existingMetadata, target.constructor);
    } else if (propertyKey === undefined && parameterIndex !== undefined) {
      // 对于构造参数装饰器 target是类的构造函数，parameterIndex是参数索引
      // "design:paramtypes" 是 TypeScript 在启用 emitDecoratorMetadata 后自动添加的元数据键。
      const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
      const type = token ?? paramTypes[parameterIndex];
      const existingMetadata: ConstructorInjectMetadata[] = Reflect.getMetadata(CONSTRUCTOR_INJECT_METADATA_KEY, target) || [];
      existingMetadata.push({ index: parameterIndex, type });
      Reflect.defineMetadata(CONSTRUCTOR_INJECT_METADATA_KEY, existingMetadata, target);
    } else if (propertyKey !== undefined && parameterIndex !== undefined) {
      // 对于方法装饰器 target是类的原型，propertyKey是方法名，parameterIndex是参数索引
      const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
      const type = token ?? paramTypes[parameterIndex];
      const existingMetadata: MethodInjectMetadata[] = Reflect.getMetadata(METHOD_INJECT_METADATA_KEY, target.constructor) || [];
      existingMetadata.push({ methodName: propertyKey, index: parameterIndex, type });
      Reflect.defineMetadata(METHOD_INJECT_METADATA_KEY, existingMetadata, target.constructor);
    }
  };
}
