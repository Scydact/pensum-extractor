import { createContext, createElement, memo, useState } from "react";

type DeveloperModeContextProps = {
  isDevMode: boolean,
  setDevMode: React.Dispatch<React.SetStateAction<boolean>>
}

const defaultContext: DeveloperModeContextProps = {
  isDevMode: false,
  setDevMode: () => { },
}

/** Context for the current loaded pensum. */
const DeveloperModeContext = createContext(defaultContext);

type Props = { children: any};

// this double naming thing is so the React chrome extension gets the name correctly.
export const DeveloperModeProvider = memo(function ActivePensumProvider({ children }: Props) { 
  const [isDevMode, setDevMode] = useState(true)

  return createElement(
    DeveloperModeContext.Provider,
    { value: { isDevMode, setDevMode } },
    children
  )
})


export default DeveloperModeContext;