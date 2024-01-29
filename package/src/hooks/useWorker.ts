import { useEffect, useRef, useState } from "react";

import { http, HttpHandler, passthrough } from "msw";
import { SetupWorker, StartOptions, setupWorker } from "msw/browser";

import { Schema } from "leva/src/types";
import { inferOptions } from "../types";
import { mapHandlersToSetup, mapSelectedOptions } from "../utils";

interface UseWorkerConfig<O extends Record<string, Schema>> {
	startOptions?: StartOptions;
	onHandlerUpdate?: (options: O) => void;
}

/** Start Mock Service Worker with the provided config and return true when ready. */
export const useWorker = <
	H extends Record<
		string,
		{
			options: Schema;
			handler: (getValue: () => unknown) => HttpHandler;
		}
	>,
	O extends inferOptions<H>,
>(
	handlers: H,
	selectedOptions: O,
	{ startOptions, onHandlerUpdate }: UseWorkerConfig<O>,
	enabled: boolean,
) => {
	const workerRef = useRef<SetupWorker>();
	const optionsRef = useRef(mapSelectedOptions(selectedOptions) as O);
	const workerInitialised = useRef(false);
	const prevEnabled = useRef(enabled);
	const [isReady, setIsReady] = useState(false);

	// Store the config in a ref so the useEffect below that starts
	// the worker runs only once, yet reads the latest config values
	// as they change in the devtools.
	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (workerInitialised.current !== false && enabled) {
			const mapped = mapSelectedOptions(selectedOptions) as O;
			optionsRef.current = mapped;

			onHandlerUpdate?.(mapped);
		}
	}, [selectedOptions, enabled]);

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		const startWorker = async () => {
			await workerRef.current?.start({
				...startOptions,
				serviceWorker: { url: "/mockServiceWorker.js" },
			});
			setIsReady(true);
			onHandlerUpdate && onHandlerUpdate(selectedOptions);
			prevEnabled.current = true;
		};
		if (workerInitialised.current && enabled) {
			void startWorker();
		}
		if (workerInitialised.current && !enabled && prevEnabled.current === true) {
			prevEnabled.current = false;
			onHandlerUpdate?.(selectedOptions);
			workerRef.current?.stop();
		}
	}, [enabled]);

	useEffect(() => {
		if (workerRef.current) {
			const mappedHandlers = mapHandlersToSetup(handlers, optionsRef);

			workerRef.current.resetHandlers(
				...[...mappedHandlers, http.get("*", () => passthrough())],
			);
		}
	}, [handlers]);

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (workerInitialised.current === false) {
			const mappedHandlers = mapHandlersToSetup(handlers, optionsRef);

			workerRef.current = setupWorker(
				...[...mappedHandlers, http.get("*", () => passthrough())],
			);

			workerInitialised.current = true;
		}
	}, []);

	return isReady;
};
