
export default function ExecuteBefore(beforeMethodName: string): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (this: any, ...args: any[]) {
            if (typeof this[beforeMethodName] === "function") {
                this[beforeMethodName](...args); // execute before 
            }
            return originalMethod.apply(this, args);
        };
    };
}