import { useEffect, useRef, useState } from "react";

import { RequestHandler } from "msw";
import { SetupWorker, StartOptions, setupWorker } from "msw/browser";

import { inferOptions } from "../types";
import { mapHandlersToSetup } from "../utils";

interface UseWorkerConfig<O extends Record<string, string>> {
  startOptions?: StartOptions;
  onHandlerUpdate?: (options: O) => void;
}

/** Start Mock Service Worker with the provided config and return true when ready. */
export const useWorker = <
  H extends Record<
    string,
    {
      handler: (getValue: () => string) => RequestHandler;
      options: readonly string[];
      responses: Record<string, unknown>;
    }
  >,
  O extends inferOptions<H>
>(
  handlers: H,
  selectedOptions: O,
  { startOptions, onHandlerUpdate }: UseWorkerConfig<O>,
  enabled: boolean
) => {
  const workerRef = useRef<SetupWorker>();
  const optionsRef = useRef(selectedOptions);
  const workerInitialised = useRef(false);
  const prevEnabled = useRef(enabled);
  const [isReady, setIsReady] = useState(false);

  // Store the config in a ref so the useEffect below that starts
  // the worker runs only once, yet reads the latest config values
  // as they change in the devtools.
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (workerInitialised.current !== false && enabled) {
      optionsRef.current = selectedOptions;

      onHandlerUpdate?.(selectedOptions);
    }
  }, [selectedOptions, enabled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const startWorker = async () => {
      await workerRef.current?.start({
        ...startOptions,
        serviceWorker: { url: "/apiMockServiceWorker.js" },
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

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (workerInitialised.current === false) {
      workerRef.current = setupWorker(
        ...mapHandlersToSetup(handlers, optionsRef)
      );

      workerInitialised.current = true;
    }
  }, []);

  return isReady;
};
