# Seeding Utils

## What is this util

Seeding utils is a way of using falso a fake data generator library to work in both the browser for local dev and in tests.

Seeding allows us to control the randomness so that we can have deterministic values when we need them.

We utilise the Falso a fake data generator library, this spawned after the faker v6.6.6 incident and is a successor to fakerjs.

## Installation

There are two parts to how this works, getting our application to use the same seed in all files.

And setting the seed value to something we control.

### Setting up a global seed

To set up the global seed we need to call the `seed('some-val')` from falso before we call any of its other utils.

To do this we set up an alias to re export all the functions from falso whilst also setting the seed key.

Create a file in `src/utils/seeding-utils.ts`;

```ts
import { seed } from '@ngneat/falso';

seed('my seed');

export * from '@ngneat/falso';
```

In tsconfig add the alias

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "seeding-utils": ["src/utils/seeding-utils"]
        }
    }
}
```

### How to import the rand utils

We need to import from `seeding-utils` not `@ngneat/falso`

```ts
//path/to/other/file
import { rand } from 'seeding-utils';

//Not import { rand } '@ngneat/falso';
```

### Controlling the seed value

This util exposes a the function `findOrCreateSeedKey()`;

We can use this in our newly created `seeding-utils.ts` file;

```ts
import { seed } from '@ngneat/falso';

+ import { findOrCreateSeedKey } from './seeding';

+ const seedKey = findOrCreateSeedKey();

- seed('my seed');
+ seed(seedKey)

export * from '@ngneat/falso';
```

## How to use

### findOrCreateSeedKey

This util is step for the following use cases:

#### For local dev in the browser

If you are using in the browser, this util automatically generate a random seed key and set it to local storage. After 1 hour this key will expire and a new key is generated.

This should allow local dev to have some consistency but also have some variation.

We also store the previous key if there was one, so you can go back if you need.

#### In testing

If you are running tests jest will generate a new random key for each test suite. Every test suite will use a new key.

### Manually set the key.

If you need to manually set the key you can.

#### Pass the key to findOrCreateSeedKey

```ts
findOrCreateSeedKey('my-key'); //returns 'my-key'
```

#### Set the REACT_APP_SEED_KEY env var

```env
//.env
REACT_APP_SEED_KEY=some-key
```

```ts
//seeding-utils.ts
const seedKey = findOrCreateSeedKey();
//seedKey = 'some-key'
```

## Gotcha's

Right now there is no way to change the expiry - easy to add in the future

As a fallback if for example we are on the server we set the key to a fallback value. Although the env var should still work on the server if its set.

Possible SSR issue due to mismatching client and server seed key
