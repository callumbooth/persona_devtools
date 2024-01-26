/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
import { RequestHandler } from "msw";

import { StringKeys, inferOptions } from "../types";

export const isValidKey = <T extends Record<string, unknown>>(
	key: keyof T,
	object: T,
): key is keyof T => {
	return object[key] !== undefined;
};

//Leaving as a reference to a possible alternative that closes over the msw handlers and injects the selected option
// const get =
//   (
//     cb: (
//       ...args: Parameters<Parameters<(typeof rest)['get']>[1]>
//     ) => ReturnType<(typeof rest)['get']>
//   ) =>
//   (path: string, option: string) =>
//     rest.get(path, (req, res, ctx) => cb(req, res, ctx, option));

export const withOption = <T, C extends Record<string, unknown>>(
	config: C,
	cb: (getValue: () => keyof C | "passthrough", responses: Readonly<C>) => T,
): {
	options: readonly (keyof C)[];
	responses: Readonly<C>;
	handler: (
		getValue: () => keyof C | "passthrough",
		overrideResponses?: Partial<Readonly<C>>,
	) => T;
} => {
	const responses = Object.freeze(config);
	return {
		options: Object.freeze(Object.keys(config) as unknown as (keyof C)[]),
		responses,
		handler: (
			getValue: () => keyof C | "passthrough",
			overrideResponses?: Partial<Readonly<C>>,
		) =>
			cb(
				getValue,
				overrideResponses ? { ...responses, ...overrideResponses } : responses,
			),
	};
};

const getValue = <
	C extends Record<string, string>,
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
			handler: (getValue: () => H[Key]["options"][number]) => RequestHandler;
			options: readonly string[];
			responses: Record<string, any>;
		};
	},
	Keys,
>(
	handlers: H,
	optionsRef: React.MutableRefObject<inferOptions<H>>,
) => {
	return (Object.keys(handlers) as StringKeys<H>[]).map((handlersKey) => {
		return handlers[handlersKey].handler(() =>
			getValue(handlersKey, optionsRef),
		);
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
