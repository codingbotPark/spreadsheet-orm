export default function ExecuteAllPrototypes(methodName:string):MethodDecorator{
    return (target:Object, propertyKey:string | symbol, descriptor:PropertyDescriptor) => {
        const originalMethod = descriptor.value

        descriptor.value = function (this: any, ...args: any[]): any {
            let currentPrototype = Object.getPrototypeOf(this);

            while (currentPrototype) {
                const method = currentPrototype[methodName];
                if (typeof method === "function") {
                    method.call(this, ...args);
                }
                currentPrototype = Object.getPrototypeOf(currentPrototype);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    }
}