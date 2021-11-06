// TODO: Use the class in dark mode to actually use this thing.
// TODO: Set the switcher to use bootstrap classes...

import { useEffect, useReducer, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { getDarkmode, setDarkmode } from ".";



function DarkModeSwitch() {
  const [value, setValue] = useState(false);
  
  // onMount
  useEffect(() => {
    setValue(getDarkmode());
  }, [])

  // onChange
  useEffect(() => {
    setDarkmode(value);
  }, [value])
  

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.checked);
  }

  return <Form.Check
    type="switch"
    checked={value}
    onChange={handleChange}
    className="position-fixed top-0 end-0" />
}

export default DarkModeSwitch;