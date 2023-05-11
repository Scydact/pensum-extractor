import React, { createElement, Fragment, useEffect, useRef } from "react";

type ComponentDef = [type: any, props?: Record<string, any>, ...children: React.ReactNode[]]
export function nestComponents(components: (ComponentDef | any)[]) {
  let i = components.length;
  let lastElem: React.ReactElement = createElement(Fragment);

  while (i--) {
    const c = components[i];
    if (Array.isArray(c)) {
      const [comp, props, ...children] = c;
      lastElem = createElement(comp, props, ...children, lastElem);
    } else {
      lastElem = createElement(c, null, lastElem);
    }
  }
  return lastElem;
}



