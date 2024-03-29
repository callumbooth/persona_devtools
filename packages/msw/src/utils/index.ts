import { RequestHandler } from "msw";

import { Schema, SchemaToValues } from "leva/src/types";
import { StringKeys } from "../types";

interface MyRequestHandler extends RequestHandler {}

interface withOptionReturn<
	Options = Schema,
	Handler = MyRequestHandler,
	ResponseData = unknown,
> {
	options: Options;
	handler: (
		getResponse: () => { passthrough: boolean; data: ResponseData },
	) => Handler;
	getResponse: (
		selectedOptions: SchemaToValues<
			{
				passthrough: boolean;
			} & Options
		>,
	) => {
		passthrough: boolean;
		data: ResponseData;
	};
}

export const withOptions = <
	Options extends Schema,
	Handler extends MyRequestHandler,
	ResponseData,
>(
	options: Options,
	getData: (selectionOptions: SchemaToValues<Options>) => ResponseData,
	cb: (
		getResponse: () => { passthrough: boolean; data: ResponseData },
	) => Handler,
): withOptionReturn<Options, Handler, ResponseData> => {
	return {
		options,
		getResponse: (selectedOptions) => {
			// biome-ignore lint/suspicious/noExplicitAny: any is fine here
			const { passthrough, ...options } = selectedOptions as unknown as any;
			return {
				data: getData(options as SchemaToValues<Options>),
				passthrough,
			};
		},
		handler: (getResponse: () => { passthrough: boolean; data: ResponseData }) =>
			cb(() => getResponse()),
	};
};

const getValue = <
	C extends Record<string, SchemaToValues<Schema>>,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	T extends React.MutableRefObject<any>,
>(
	key: keyof C,
	config: T,
) => {
	return config.current[key];
};

export const mapHandlersToSetup = <
	H extends {
		[Key in keyof Keys]: withOptionReturn;
	},
	Keys,
>(
	handlers: H,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	optionsRef: React.MutableRefObject<{ [Key in keyof H]: Record<string, any> }>,
) => {
	return (Object.keys(handlers) as StringKeys<H>[]).map((handlersKey) => {
		return handlers[handlersKey].handler(() => {
			return handlers[handlersKey].getResponse(getValue(handlersKey, optionsRef));
		});
	});
};

export const createStaticHandlers = <
	Keys,
	H extends {
		[K in keyof Keys]: withOptionReturn<
			Schema,
			MyRequestHandler,
			ReturnType<H[K]["getResponse"]>
		>;
	},
>(
	handlers: H,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	config: { [Key in keyof H]: Record<string, any> },
) => {
	const staticHandlers = {} as {
		[K in keyof H]: {
			getResponse: () => {
				data: ReturnType<H[K]["getResponse"]>;
				passthrough: boolean;
			};
			handler: H[K]["handler"];
		};
	};

	//go through each handler
	//go through each possible response
	//if response is function
	//call that function
	//replace that function with a new function that closes over the static response

	const handlerKeys = Object.keys(handlers) as unknown as (keyof H)[];

	for (let i = 0; i < handlerKeys.length; i++) {
		const handlerKey = handlerKeys[i];
		const handler = handlers[handlerKey];

		const actualResponse = handler.getResponse({
			...config[handlerKey],
			passthrough: false,
		});

		// //clone the existing function
		const newFn = handlers[handlerKey].handler.bind({});

		staticHandlers[handlerKey] = {
			getResponse: () => actualResponse,
			handler: () => {
				return newFn(() => actualResponse);
			},
		};
	}

	return {
		handlers: mapHandlersToSetup(staticHandlers as unknown as H, {
			current: config,
		}),
		config: staticHandlers,
	};
};

export const mapSelectedOptions = <SO extends Record<string, unknown>>(
	selectedOptions: SO,
) => {
	const keys = Object.keys(selectedOptions) as unknown as StringKeys<SO>[];

	return keys.reduce(
		(acc, key) => {
			const [group, option] = key.split("-");

			if (acc[group]) {
				acc[group][option] = selectedOptions[key];
			} else {
				acc[group] = { [option]: selectedOptions[key] };
			}

			return acc;
		},
		{} as Record<string, Record<string, unknown>>,
	);
};
