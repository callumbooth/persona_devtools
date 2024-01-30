import { useEffect, useRef } from "react";

import { Leva, button, folder, useControls } from "leva";
import { Schema } from "leva/src/types/public";
import { CodeSquare } from "lucide-react";
import { HttpHandler } from "msw";
import { useCopyToClipboard, useSessionStorage } from "usehooks-ts";

import { useWorker } from "./hooks/useWorker";
import { DexoryDevToolsProps, StringKeys, inferOptions } from "./types";

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
