import TooltipButton from "components/TooltipButton";
import ActivePensumContext from "contexts/active-pensum";
import { useContext } from "react";
import { Button, ButtonProps, OverlayTrigger, Tooltip } from "react-bootstrap";

import { BiFileFind } from "react-icons/bi";
import { BsGlobe2 } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa";
import { MdHistory, MdOutlineScanner } from "react-icons/md";



const src_tooltips: Record<Pensum.Pensum['src']['type'], React.ReactNode> = {
  'convert': 'Este pensum es una conversion desde el formato antiguo de pensum',
  'fetch': 'Este pensum ha sido conseguido automaticamente',
  'pdf': 'Este pensum fue registrado desde un pdf',
  'online': 'Este pensum fue registrado desde una pagina web',
  'scan': 'Este pensum fue registrado manualmente desde un escaneo de un pensum físico',
}

const src_logos: Record<Pensum.Pensum['src']['type'], React.ReactNode> = {
  'convert': <MdHistory />,
  'fetch': <BiFileFind />,
  'pdf': <FaRegFilePdf />,
  'online': <BsGlobe2 />,
  'scan': <MdOutlineScanner />,
}

export default function ViewPensumSourceBtn(props: ButtonProps) {
  const { state: { pensum } } = useContext(ActivePensumContext);
  if (!pensum) return null;
  const logo = src_logos[pensum.src.type] || `[${pensum.src.type}]`
  const tooltip = src_tooltips[pensum.src.type] || null;

  const onClick = () => {
    if (pensum.src.url) window.open(pensum.src.url)
  }

  const disabled = !(pensum.src.url)

  return <TooltipButton tooltip={tooltip} onClick={onClick} disabled={disabled} {...props}>
    {logo} Ver pensum original
  </TooltipButton>
}