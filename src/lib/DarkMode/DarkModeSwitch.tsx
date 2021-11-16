import { useEffect, useState } from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip';

import { BsFillMoonStarsFill } from 'react-icons/bs';
import { FaSun } from 'react-icons/fa';
import { getDarkmode, setDarkmode } from ".";
import './btn-switch.scss';


function DarkModeSwitch() {
  const [dark, setDark] = useState(false);
  
  // onMount
  useEffect(() => {
    setDark(getDarkmode());
  }, [])

  // onChange
  useEffect(() => {
    setDarkmode(dark);
  }, [dark])
  

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setDark(e.target.checked);
  }

  return <OverlayTrigger
    placement="left"
    overlay={<Tooltip>{(dark ? 'Desactivar' : 'Activar') + ' modo oscuro'}</Tooltip>}>
    <label className={"darkmode-switch" + (dark ? ' dark' : '')}>
      {(dark) ? <BsFillMoonStarsFill/> : <FaSun />}
      <input
        type="checkbox"
        checked={dark}
        onChange={handleChange} />
    </label>
  </OverlayTrigger>
}

export default DarkModeSwitch;