import { memo, useEffect, useState } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

const ServiceWorkerUpdateBanner = memo(() => {
    const [doUpdate, setDoUpdate] = useState<Function | null>(null)

    useEffect(() => {
        const cb = () => setDoUpdate(() => window.location.reload())
        window.addEventListener('wb-need-refresh', cb)
        return () => window.removeEventListener('wb-need-refresh', cb)
    }, [])

    return doUpdate ? (
        <OverlayTrigger
            placement="auto"
            overlay={<Tooltip>Actualización disponible! Click para refrescar la página</Tooltip>}
        >
            <Button variant="outline-warning" onClick={doUpdate as any}>
                Actualizar
            </Button>
        </OverlayTrigger>
    ) : null
})

export default ServiceWorkerUpdateBanner
