import { memo, useEffect, useState } from "react"
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap"
import { serviceWorkerRef } from "serviceWorkerRegistration"

const ServiceWorkerUpdateBanner = memo(() => {
  const [doUpdate, setDoUpdate] = useState<Function | null>(null)
  
  useEffect(() => {
    setTimeout(() => {
      if (serviceWorkerRef.wb) {
        const wb = serviceWorkerRef.wb

        // Taken from https://developers.google.com/web/tools/workbox/guides/advanced-recipes
        // This simple refresh takes change of updating the cache of js files. :)
        wb.addEventListener('waiting', event => {
          setDoUpdate(() => () => {
            wb.addEventListener('controlling', event => {
              window.location.reload()
            })

            wb.messageSkipWaiting();
          });
        })
      }
    }, 100)
  }, [])

  return (doUpdate) ? <OverlayTrigger
    placement="auto"
    overlay={
      <Tooltip>
        Actualización disponible! Click para refrescar la página
      </Tooltip>
    }>
    <Button 
      variant="outline-warning"
      onClick={doUpdate as any}>
      Actualizar
    </Button>
  </OverlayTrigger> : null
})

export default ServiceWorkerUpdateBanner;