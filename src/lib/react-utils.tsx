import { createElement, Fragment } from "react";

type Component = [type: any, props?: Record<string, any>, ...children: React.ReactNode[]]
export function nestComponents(components: Component[]) {
  let i = components.length;
  let lastElem: React.ReactElement = createElement(Fragment);

  while (i--) {
    lastElem = createElement(...components[i], lastElem);
  }
  return lastElem;
}