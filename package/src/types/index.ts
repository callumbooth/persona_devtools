import { Schema, SchemaToValues } from "leva/src/types/public";
import { HttpHandler } from "msw";
import { StartOptions } from "msw/browser";

export type inferOptions<
	T extends Record<
		string,
		{
			options: Schema;
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			handler: any;
		}
	>,
> = {
	[Key in keyof T]: SchemaToValues<T[Key]["options"]>;
};

export type PersonaConfig<H> = {
	readonly [key: string]: {
		label: string;

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		user?: Record<string, any>;
		options: H;
	};
};

export interface DexoryDevToolsProps<
	Keys,
	H extends {
		[Key in keyof Keys]: {
			handler: (getValue: () => unknown) => HttpHandler;
			options: Schema;
		};
	},
> {
	handlers: H;
	onHandlerUpdate?: (options: inferOptions<H>) => void;
	startOptions?: StartOptions;
	initialIsEnabled?: boolean;
}

export type StringKeys<T> = Extract<keyof T, string>;
