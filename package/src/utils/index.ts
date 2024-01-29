/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
import { HttpHandler, RequestHandler } from "msw";

import { HookReturnType } from "leva/dist/declarations/src/useControls";
import { Schema } from "leva/src/types";
import { StringKeys, inferOptions } from "../types";

export const isValidKey = <T extends Record<string, unknown>>(
	key: keyof T,
	object: T,
): key is keyof T => {
	return object[key] !== undefined;
};

export const withOptions = <T, C extends Schema>(
	config: C,
	cb: (
		getValues: () => HookReturnType<
			C & {
				passthrough: boolean;
			},
			C & {
				passthrough: boolean;
			}
		>,
	) => T,
): {
	options: C;
	handler: (
		getValue: () => HookReturnType<
			C & {
				passthrough: boolean;
			},
			C & {
				passthrough: boolean;
			}
		>,
	) => T;
} => {
	// const options = Object.keys(config) as unknown as (keyof C)[];

	return {
		options: config,
		handler: (
			getValue: () => HookReturnType<
				C & {
					passthrough: boolean;
				},
				C & {
					passthrough: boolean;
				}
			>,
		) => cb(getValue),
	};
};

const getValue = <
	C extends Record<string, HookReturnType<Schema, Schema>>,
	T extends React.MutableRefObject<C>,
>(
	key: keyof C,
	config: T,
) => {
	return config.current[key];
};

export const mapHandlersToSetup = <
	H extends {
		[Key in keyof Keys]: {
			options: Schema;
			handler: (getValue: () => unknown) => HttpHandler;
		};
	},
	Keys,
>(
	handlers: H,
	optionsRef: React.MutableRefObject<inferOptions<H>>,
) => {
	return (Object.keys(handlers) as StringKeys<H>[]).map((handlersKey) => {
		return handlers[handlersKey].handler(() => getValue(handlersKey, optionsRef));
	});
};

export const createStaticHandlers = <
	Keys,
	H extends {
		[Key in keyof Keys]: {
			handler: (
				getValue: () => H[Key]["options"][number],
				responses: Record<string, any>,
			) => RequestHandler;
			options: readonly string[];
			responses: Record<string, any>;
		};
	},
>(
	handlers: H,
) => {
	const staticHandlers = {} as H;
	//go through each handler
	//go through each possible response
	//if response is function
	//call that function
	//replace that function with a new function that closes over the static response

	const handlerKeys = Object.keys(handlers) as unknown as (keyof H)[];

	for (let i = 0; i < handlerKeys.length; i++) {
		const handlerKey = handlerKeys[i];
		const handler = handlers[handlerKey];

		const fakedResponses = {} as Record<string, any>;

		for (let j = 0; j < handler.options.length; j++) {
			const responseKey = handler.options[j];
			const response = handler.responses[responseKey];

			if (typeof response === "function") {
				const fakedResponse = response();

				fakedResponses[responseKey] = () => {
					return fakedResponse;
				};
			} else {
				fakedResponses[responseKey] = response;
			}
		}

		//clone the existing function
		const newFn = handlers[handlerKey].handler.bind({});

		staticHandlers[handlerKey] = {} as H[keyof H];

		staticHandlers[handlerKey].responses = fakedResponses;
		staticHandlers[handlerKey].handler = (
			getValue: () => any,
			overrideResponses: Record<string, any>,
		) => {
			return newFn(getValue, { ...fakedResponses, ...overrideResponses });
		};
	}

	return staticHandlers;
};

export const mapSelectedOptions = (selectedOptions) => {
	const keys = Object.keys(selectedOptions);

	return keys.reduce((acc, key) => {
		const [group, option] = key.split("-");

		if (acc[group]) {
			acc[group][option] = selectedOptions[key];
		} else {
			acc[group] = { [option]: selectedOptions[key] };
		}

		return acc;
	}, {});
};
