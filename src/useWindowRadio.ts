// import

import {isServer} from '@sitearcade/is-env';
import {useEffect, useCallback, useRef} from 'react';

// types

export type OnMessage<O = unknown> = (data: O, event: MessageEvent) => void;
export type PostMessage = <P = unknown>(msg: P) => void;

// vars

const listenerOpts = {capture: false, passive: true};

// export

export function useWindowRadio<O>(
  target?: Window,
  origin: string = '',
  onMessage?: OnMessage<O>,
) {
  useEffect(() => {
    if (isServer) {
      return;
    }

    const handler = (event: MessageEvent) => {
      if (origin === '*' || event.origin === origin) {
        onMessage?.(event.data, event);
      }
    };

    window.addEventListener('message', handler, listenerOpts);

    return () => window.removeEventListener('message', handler);
  }, [origin, onMessage]);

  return useCallback<PostMessage>(
    (msg) => target?.postMessage(msg, origin),
    [target, origin],
  );
}

export function useFrameRadio<O>(
  origin?: string,
  onMessage?: OnMessage<O>,
) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const target = isServer ? undefined :
    frameRef.current?.contentWindow ?? undefined;

  return [
    frameRef,
    useWindowRadio(target, origin, onMessage),
  ] as const;
}
