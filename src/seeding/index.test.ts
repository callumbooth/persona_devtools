import { add, sub } from 'date-fns';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { SeedKeyConfig, findOrCreateSeedKey } from '.';

vi.stubEnv('NODE_ENV', 'test');

vi.spyOn(global.Math, 'random').mockReturnValue(0.1235);

describe('findOrCreateSeedKey', () => {
  afterEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('should return the fixed key', () => {
    const res = findOrCreateSeedKey(123);

    expect(res).toBe(123);
  });

  it('should create a random key when the node env is test', () => {
    const res = findOrCreateSeedKey();

    expect(res).toBe(1235);
  });

  it('should get the seed key from session storage when it exists', () => {
    process.env.NODE_ENV = 'development';

    window.sessionStorage.setItem(
      'seed-key',
      JSON.stringify({
        value: 0.5678,
        expiry: add(new Date(), { hours: 1 }),
      })
    );
    const res = findOrCreateSeedKey();

    expect(res).toBe(5678);
  });

  it('should create and set a new key into session storage when no key exists', () => {
    process.env.NODE_ENV = 'development';

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T18:01:02Z'));

    const res = findOrCreateSeedKey();

    expect(res).toBe(1235);

    const storageValue = JSON.parse(
      window.sessionStorage.getItem('seed-key') as string
    ) as SeedKeyConfig;

    expect(storageValue).toEqual(
      expect.objectContaining({
        value: 0.1235,
        previousKey: null,
      })
    );
    expect(new Date(storageValue.expiry).getHours()).toBe(
      new Date().getHours() + 1
    );
    vi.useRealTimers();
  });

  it('should create and set a new key into session storage when key exists but is expired', () => {
    process.env.NODE_ENV = 'development';

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T18:01:02Z'));

    window.sessionStorage.setItem(
      'seed-key',
      JSON.stringify({
        value: 0.5678,
        expiry: sub(new Date(), { hours: 1 }),
      })
    );

    const res = findOrCreateSeedKey();

    expect(res).toBe(1235);

    const storageValue = JSON.parse(
      window.sessionStorage.getItem('seed-key') as string
    ) as SeedKeyConfig;
    expect(storageValue).toEqual(
      expect.objectContaining({
        value: 0.1235,
        previousKey: 0.5678,
      })
    );
    expect(new Date(storageValue.expiry).getHours()).toBe(
      new Date().getHours() + 1
    );
    vi.useRealTimers();
  });

  it('should use the fallback key as a fallback', () => {
    vi.stubGlobal('window', undefined);

    process.env.NODE_ENV = 'development';

    const res = findOrCreateSeedKey();

    expect(res).toBe(0);

    vi.unstubAllGlobals();
  });
});
