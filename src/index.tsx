import { useEffect, useRef, useState } from "react";

import { Leva, button, folder, useControls } from "leva";
import { Schema, SchemaToValues } from "leva/src/types/public";
import { CodeSquare } from "lucide-react";
import { HttpHandler, RequestHandler } from "msw";
import { useCopyToClipboard, useSessionStorage } from "usehooks-ts";

import { useWorker } from "./hooks/useWorker";
import {
	DexoryDevToolsProps,
	PersonaConfig,
	StringKeys,
	inferOptions,
} from "./types";
import { mapSelectedOptions } from "./utils";

// const DexoryDevTools = <
// 	Keys,
// 	H extends {
// 		[Key in keyof Keys]: {
// 			handler: (getValue: () => H[Key]["options"][number]) => RequestHandler;
// 			options: readonly string[];
// 			responses: Record<string, unknown>;
// 		};
// 	},
// 	P extends PersonaConfig<inferOptions<H>>,
// 	AD extends Schema,
// >({
// 	onPersonaUpdate,
// 	personas,
// 	defaultPersona,
// 	handlers,
// 	onHandlerUpdate,
// 	startOptions,
// 	additionalOptions,
// 	onAdditionalUpdate,
// 	initialIsEnabled = false,
// }: DexoryDevToolsProps<Keys, H, P, AD>) => {
// 	const things = useControls("testing", {
// 		foo: { options: { a: "do A", b: "do B" } },
// 	});
// 	const [, copy] = useCopyToClipboard();

// 	const params = new URLSearchParams(window.location.search);
// 	const urlConfig = params.get("dvdt");

// 	// const personasKeys = Object.keys(personas) as StringKeys<typeof personas>[];

// 	const handlerKeys = Object.keys(handlers) as StringKeys<Keys>[];

// 	const [persistedData, setSettings] = useSessionStorage("dvdt", {
// 		enabled: !!urlConfig || initialIsEnabled,
// 		persona: { persona: defaultPersona },
// 		handlers: handlerKeys.reduce((acc, key) => {
// 			return Object.assign(acc, {
// 				[key]: personas[defaultPersona].options[key],
// 			});
// 		}, {}),
// 	});

// 	// const [{ persona }, setPersona] = useControls("persona", () => ({
// 	// 	persona: {
// 	// 		value: persistedData.persona.persona as string,
// 	// 		options: personasKeys as string[],
// 	// 		transient: false,
// 	// 		onChange: (v: StringKeys<P>) => {
// 	// 			onPersonaUpdate(personas[v]);

// 	// 			setSettings((prev) => ({
// 	// 				...prev,
// 	// 				persona: {
// 	// 					...(prev?.persona || {}),
// 	// 					persona: v,
// 	// 				},
// 	// 				handlers: personas[v].options,
// 	// 			}));
// 	// 		},
// 	// 	},
// 	// }));

// 	const [enabled, enable] = useState(persistedData.enabled);

// 	useEffect(() => {
// 		setSettings((prev) => {
// 			return {
// 				...prev,
// 				enabled,
// 			};
// 		});
// 	}, [enabled]);

// 	const overrideConfig = urlConfig
// 		? (JSON.parse(urlConfig) as {
// 				persona: Extract<keyof P, string>;
// 				handlers: Record<string, string>;
// 				additional: Record<string, string>;
// 		  })
// 		: {
// 				persona: persistedData.persona.persona,
// 				handlers: persistedData.handlers,
// 				additional: undefined,
// 		  };

// 	// const oldpersona = useRef(persona);

// 	// const [handlerData, setHandlerOptions] = useControls<
// 	// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	// 	any,
// 	// 	"handlers",
// 	// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	// 	() => any
// 	// >("handlers", () =>
// 	// 	handlerKeys.reduce((acc, key) => {
// 	// 		return Object.assign(acc, {
// 	// 			[key]: {
// 	// 				value: personas[persona].options[key],
// 	// 				options: [...handlers[key].options, "passthrough"],
// 	// 				transient: false,
// 	// 				onChange: (v: unknown) => {
// 	// 					setSettings((prev) => ({
// 	// 						...prev,
// 	// 						handlers: {
// 	// 							...(prev.handlers ? prev?.handlers : {}),
// 	// 							[key]: v,
// 	// 						},
// 	// 					}));
// 	// 				},
// 	// 			},
// 	// 		} as Schema);
// 	// 	}, {} as Schema),
// 	// );

// 	const [handlerData, setHandlerOptions] = useControls<
// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 		any,
// 		"handlers",
// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 		() => any
// 	>("handlers", () =>
// 		handlerKeys.reduce((acc, key) => {
// 			return Object.assign(acc, {
// 				[key]: {
// 					value: handlers[key].options[0],
// 					options: [...handlers[key].options, "passthrough"],
// 					transient: false,
// 					onChange: (v: unknown) => {
// 						setSettings((prev) => ({
// 							...prev,
// 							handlers: {
// 								...(prev.handlers ? prev?.handlers : {}),
// 								[key]: v,
// 							},
// 						}));
// 					},
// 				},
// 			} as Schema);
// 		}, {} as Schema),
// 	);

// 	// if (oldpersona.current !== persona) {
// 	// 	setHandlerOptions(personas[persona].options);
// 	// 	oldpersona.current = persona;
// 	// }

// 	// const [additionalData, setAdditionalOptions] = useControls(
// 	// 	"additional",
// 	// 	() => additionalOptions || {},
// 	// );

// 	// useControls(
// 	// 	{
// 	// 		"Share URL": button(() => {
// 	// 			const baseUrl = window.location.origin + window.location.pathname;

// 	// 			const config = {
// 	// 				// persona,
// 	// 				handlers: handlerData,
// 	// 				// additional: additionalData,
// 	// 			};

// 	// 			const params = new URLSearchParams({
// 	// 				dvdt: JSON.stringify(config),
// 	// 			});

// 	// 			console.log(baseUrl + "?" + params.toString());

// 	// 			void copy(baseUrl + "?" + params.toString());
// 	// 		}),
// 	// 	},
// 	// 	[persona, handlerData, additionalData],
// 	// );

// 	useEffect(() => {
// 		// if (overrideConfig?.persona) {
// 		// 	setPersona({ persona: overrideConfig.persona });
// 		// }

// 		if (overrideConfig?.persona === "custom" && overrideConfig?.handlers) {
// 			setHandlerOptions(overrideConfig.handlers);
// 			setSettings((prev) => ({
// 				...prev,
// 				handlers: overrideConfig.handlers,
// 			}));
// 		}

// 		// if (
// 		// 	overrideConfig?.persona === "custom" &&
// 		// 	additionalData &&
// 		// 	Object.keys(additionalData).length > 0 &&
// 		// 	overrideConfig?.additional
// 		// ) {
// 		// 	setAdditionalOptions(overrideConfig.additional);
// 		// }
// 	}, []);

// 	// useEffect(() => {
// 	// 	onAdditionalUpdate &&
// 	// 		onAdditionalUpdate(additionalData as SchemaToValues<AD>);
// 	// }, [additionalData]);

// 	useWorker(
// 		handlers,
// 		handlerData as inferOptions<H>,
// 		{
// 			onHandlerUpdate,
// 			startOptions,
// 		},
// 		enabled,
// 	);

// 	return (
// 		<>
// 			<button type="button" onClick={() => enable((prev) => !prev)}>
// 				<CodeSquare />
// 			</button>
// 			<Leva hidden={!enabled} />
// 		</>
// 	);
// };

const DexoryDevTools = <
	Keys,
	H extends {
		[Key in keyof Keys]: {
			handler: (getValue: () => unknown) => HttpHandler;
			options: Schema;
		};
	},
>({
	handlers,
	onHandlerUpdate,
	startOptions,
}: DexoryDevToolsProps<Keys, H>) => {
	const [, copy] = useCopyToClipboard();

	const persistedDataHydrated = useRef(false);
	const params = new URLSearchParams(window.location.search);
	const urlConfig = params.get("dvdt");
	const parsedUrlConfig = urlConfig && JSON.parse(urlConfig);

	const handlerKeys = Object.keys(handlers) as StringKeys<Keys>[];

	const [handlerData, setHandlerData] = useControls(
		"handlers",
		() =>
			parsedUrlConfig ||
			handlerKeys.reduce((acc, key) => {
				const handlerOptions = handlers[key].options;
				const handlerOptionsKeys = Object.keys(handlerOptions);

				acc[key] = folder({
					[`${key}-passthrough`]: { value: false, label: "passthrough" },
					...handlerOptionsKeys.reduce((acc2, optionKey) => {
						const data = handlerOptions[optionKey];

						if (typeof data === "object") {
							acc2[`${key}-${optionKey}`] = {
								label: optionKey,
								...data,
								render: (get) => get(`handlers.${key}.${key}-passthrough`) === false,
							};
						} else {
							acc2[`${key}-${optionKey}`] = {
								label: optionKey,
								value: data,
								render: (get) => get(`handlers.${key}.${key}-passthrough`) === false,
							};
						}
						return acc2;
					}, {} as Schema),
				});

				return acc;
			}, {} as Schema),
	);

	const [persistedData, setSettings] = useSessionStorage<
		| {
				enabled: boolean;
				handlers: {
					[x: string]: any;
				};
		  }
		| undefined
	>("dvdt", undefined);

	useControls(
		{
			"Share URL": button(() => {
				const baseUrl = window.location.origin + window.location.pathname;

				const config = handlerData;

				const params = new URLSearchParams({
					dvdt: JSON.stringify(config),
				});

				console.log(baseUrl + "?" + params.toString());

				void copy(baseUrl + "?" + params.toString());
			}),
		},
		[handlerData],
	);

	useWorker(
		handlers,
		handlerData as inferOptions<H>,
		{
			onHandlerUpdate,
			startOptions,
		},
		persistedData?.enabled ?? false,
	);

	useEffect(() => {
		if (
			persistedData !== undefined &&
			parsedUrlConfig === undefined &&
			persistedDataHydrated.current === false
		) {
			console.log("hydrating handler data");
			setHandlerData(persistedData.handlers);
			persistedDataHydrated.current = true;
		}
	}, [persistedData, setHandlerData, parsedUrlConfig]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on initialize
	useEffect(() => {
		if (parsedUrlConfig) {
			const newUrl = new URL(window.location.toString());

			newUrl.searchParams.delete("dvdt");

			// setSettings({ enabled: true, handlers: parsedUrlConfig });
			window.history.replaceState(history.state, "", newUrl);
		}
	}, []);

	useEffect(() => {
		if (handlerData && persistedDataHydrated.current === true) {
			setSettings((prev) =>
				prev === undefined
					? { enabled: false, handlers: handlerData }
					: { ...prev, handlers: handlerData },
			);
		}
	}, [handlerData, setSettings]);

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setSettings((prev) => {
						return prev === undefined
							? { enabled: false, handlers: handlerData }
							: { ...prev, enabled: !prev.enabled };
					});
				}}
			>
				<CodeSquare />
			</button>
			<Leva hidden={!persistedData?.enabled ?? false} />
		</>
	);
};

export default DexoryDevTools;
