import { signal } from '@angular/core';
import { createSignalProxy } from './signal-proxy';

describe('SignalProxy', () => {
  it('should create a proxy that exposes read signals and write helpers', () => {
    const proxyWithEmptyConfig = createSignalProxy(
      {} as {
        name: string | undefined;
        age: number | undefined;
      }
    );

    expect(proxyWithEmptyConfig.name).toBeDefined();
    expect(proxyWithEmptyConfig.age).toBeDefined();
    expect(proxyWithEmptyConfig.name()).toBe(undefined);
    expect(proxyWithEmptyConfig.age()).toBe(undefined);

    const config = {
      name: signal('John'),
      age: signal(30),
    };

    proxyWithEmptyConfig.$set(config);

    expect(proxyWithEmptyConfig.name()).toBe('John');
    expect(proxyWithEmptyConfig.age()).toBe(30);
  });
});
