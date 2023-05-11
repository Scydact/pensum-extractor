import { useContext } from "react";


import ActivePensumContext from "contexts/active-pensum";
import PensumMeta from "./PensumMeta";
import PensumDisplayCards from "./PensumDisplayCards";
import DeveloperModeContext, { DeveloperModeProvider } from "contexts/developer-mode";

type Props = any;


// TODO Edit mode per row
/**
 * TODO: Each element should be editable if debugMode (developModeContext) is ON.
 * - Prereqs should be one those fancy selector.
 * - Code should be a selector with any unreferenced type
 * - Checkmark becomes delete + drag
 * - Headers have a + button
 * - Period number have a <add mat> and <add period after> and <delete>
 * - Loose mats appear, with the option to "formalize" any unregistered mat.
 * - MatFilter disabled. Instead, pensum properties editor is used.
 * - MatProgress disabled. Instead, pensum statistics (amount of mats, loose mats, total cr, etc... is used)
 */


/** Pensum developer tab for the Pensum app. */
function PensumDevelop(props: Props) {
  const { pensum } = useContext(DeveloperModeContext);

  return (<>
    <PensumMeta />
    {pensum ? <PensumDisplayCards pensum={pensum} /> : <>Favor crear pensum nuevo.</>}
  </>)
} 

export default function PensumDevelopWithContext() {
  return <DeveloperModeProvider>
    <PensumDevelop/>
  </DeveloperModeProvider>
};