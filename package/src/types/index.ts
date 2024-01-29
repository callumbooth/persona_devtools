import { HookReturnType } from "leva/dist/declarations/src/useControls";
import { Schema } from "leva/src/types/public";
import { HttpHandler } from "msw";
import { StartOptions } from "msw/browser";

export type inferOptions<
	T extends Record<
		string,
		{
			options: Schema;
			handler: unknown;
		}
	>,
> = {
	[Key in keyof T]: HookReturnType<T[Key]["options"], T[Key]["options"]>;
};

export type PersonaConfig<H> = {
	readonly [key: string]: {
		label: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
