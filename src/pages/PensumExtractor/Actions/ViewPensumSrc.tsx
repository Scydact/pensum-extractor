import TooltipButton from '@/components/TooltipButton'
import ActivePensumContext from '@/contexts/active-pensum'
import { useContext } from 'react'
import { type ButtonProps } from 'react-bootstrap'

import { BiFileFind } from 'react-icons/bi'
import { BsGlobe2 } from 'react-icons/bs'
import { FaRegFilePdf } from 'react-icons/fa'
import { MdHistory, MdOutlineScanner } from 'react-icons/md'

type SourceMeta = {
    tooltip: React.ReactNode
    icon: React.ReactNode
}

const srcMeta: Record<Pensum.Pensum['src']['type'], SourceMeta> = {
    convert: {
        tooltip: 'Este pensum es una conversion desde el formato antiguo de pensum',
        icon: <MdHistory />,
    },
    fetch: {
        tooltip: 'Este pensum ha sido conseguido automaticamente',
        icon: <BiFileFind />,
    },
    pdf: {
        tooltip: 'Este pensum fue registrado desde un pdf',
        icon: <FaRegFilePdf />,
    },
    online: {
        tooltip: 'Este pensum fue registrado desde una pagina web',
        icon: <BsGlobe2 />,
    },
    scan: {
        tooltip: 'Este pensum fue registrado manualmente desde un escaneo de un pensum físico',
        icon: <MdOutlineScanner />,
    },
}

export default function ViewPensumSourceBtn(props: ButtonProps) {
    const {
        state: { pensum },
    } = useContext(ActivePensumContext)
    if (!pensum) return null
    const logo = srcMeta[pensum.src.type]?.icon || `[${pensum.src.type}]`
    const tooltip = srcMeta[pensum.src.type]?.tooltip

    const onClick = () => {
        if (pensum.src.url) window.open(pensum.src.url)
    }

    const disabled = !pensum.src.url

    return (
        <TooltipButton tooltip={tooltip} onClick={onClick} disabled={disabled} {...props}>
            {logo} Ver pensum original
        </TooltipButton>
    )
}
