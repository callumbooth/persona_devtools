import { useEffect, useRef, useState } from 'react';

import { CodeSquare02 } from '@untitled-ui/icons-react';
import { Leva, useControls, button } from 'leva';
import { Schema, SchemaToValues } from 'leva/src/types/public';
import { RequestHandler } from 'msw';
import { useSessionStorage, useCopyToClipboard } from 'usehooks-ts';

import { useWorker } from './hooks/useWorker';
import {
  DexoryDevToolsProps,
  PersonaConfig,
  StringKeys,
  inferOptions,
} from './types';

const DexoryDevTools = <
  Keys,
  H extends {
    [Key in keyof Keys]: {
      handler: (getValue: () => H[Key]['options'][number]) => RequestHandler;
      options: readonly string[];
      responses: Record<string, unknown>;
    };
  },
  P extends PersonaConfig<inferOptions<H>>,
  AD extends Schema,
>({
  onPersonaUpdate,
  personas,
  defaultPersona,
  handlers,
  onHandlerUpdate,
  startOptions,
  additionalOptions,
  onAdditionalUpdate,
  initialIsEnabled = false,
}: DexoryDevToolsProps<Keys, H, P, AD>) => {
  const [, copy] = useCopyToClipboard();

  const params = new URLSearchParams(window.location.search);
  const urlConfig = params.get('dvdt');

  const personasKeys = Object.keys(personas) as StringKeys<typeof personas>[];

  const handlerKeys = Object.keys(handlers) as StringKeys<Keys>[];

  const [persistedData, setSettings] = useSessionStorage('dvdt', {
    enabled: !!urlConfig || initialIsEnabled,
    persona: { persona: defaultPersona },
    handlers: handlerKeys.reduce((acc, key) => {
      return Object.assign(acc, {
        [key]: personas[defaultPersona].options[key],
      });
    }, {}),
  });

  const [{ persona }, setPersona] = useControls('persona', () => ({
    persona: {
      value: persistedData.persona.persona as string,
      options: personasKeys as string[],
      transient: false,
      onChange: (v: StringKeys<P>) => {
        onPersonaUpdate(personas[v].user);

        setSettings((prev) => ({
          ...prev,
          persona: {
            ...(prev?.persona || {}),
            persona: v,
          },
          handlers: personas[v].options,
        }));
      },
    },
  }));

  const [enabled, enable] = useState(persistedData.enabled);

  useEffect(() => {
    setSettings((prev) => {
      return {
        ...prev,
        enabled,
      };
    });
  }, [enabled]);

  const overrideConfig = urlConfig
    ? (JSON.parse(urlConfig) as {
        persona: Extract<keyof P, string>;
        handlers: Record<string, string>;
        additional: Record<string, string>;
      })
    : {
        persona: persistedData.persona.persona,
        handlers: persistedData.handlers,
        additional: undefined,
      };

  const oldpersona = useRef(persona);

  const [handlerData, setHandlerOptions] = useControls<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'handlers',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => any
  >(
    'handlers',
    () =>
      handlerKeys.reduce((acc, key) => {
        return Object.assign(acc, {
          [key]: {
            value: personas[persona].options[key],
            options: [...handlers[key].options, 'passthrough'],
            transient: false,
            onChange: (v: unknown) => {
              setSettings((prev) => ({
                ...prev,
                handlers: {
                  ...(prev.handlers ? prev?.handlers : {}),
                  [key]: v,
                },
              }));
            },
          },
        } as Schema);
      }, {} as Schema),
    { render: (get) => get('persona.persona') === 'custom' },
    [persona]
  );

  if (oldpersona.current !== persona) {
    setHandlerOptions(personas[persona].options);
    oldpersona.current = persona;
  }

  const [additionalData, setAdditionalOptions] = useControls(
    'additional',
    () => additionalOptions || {}
  );

  useControls(
    {
      'Share URL': button(() => {
        const baseUrl = window.location.origin + window.location.pathname;

        const config = {
          persona,
          handlers: handlerData,
          additional: additionalData,
        };

        const params = new URLSearchParams({
          dvdt: JSON.stringify(config),
        });

        console.log(baseUrl + '?' + params.toString());

        void copy(baseUrl + '?' + params.toString());
      }),
    },
    [persona, handlerData, additionalData]
  );

  useEffect(() => {
    if (overrideConfig?.persona) {
      setPersona({ persona: overrideConfig.persona });
    }

    if (overrideConfig?.persona === 'custom' && overrideConfig?.handlers) {
      setHandlerOptions(overrideConfig.handlers);
      setSettings((prev) => ({
        ...prev,
        handlers: overrideConfig.handlers,
      }));
    }

    if (
      overrideConfig?.persona === 'custom' &&
      additionalData &&
      Object.keys(additionalData).length > 0 &&
      overrideConfig?.additional
    ) {
      setAdditionalOptions(overrideConfig.additional);
    }
  }, []);

  useEffect(() => {
    onAdditionalUpdate &&
      onAdditionalUpdate(additionalData as SchemaToValues<AD>);
  }, [additionalData]);

  useWorker(
    handlers,
    handlerData as inferOptions<H>,
    {
      onHandlerUpdate,
      startOptions,
    },
    enabled
  );

  return (
    <>
      <button onClick={() => enable((prev) => !prev)}>
        <CodeSquare02 />
      </button>
      <Leva hidden={!enabled} />
    </>
  );
};

export default DexoryDevTools;
