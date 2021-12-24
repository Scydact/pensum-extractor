import { memo, useEffect, useState } from "react"
import { serviceWorkerRef } from "serviceWorkerRegistration"

const ServiceWorkerUpdateBanner = memo(() => {
  const [updateAvailable, setUA] = useState(false)
  
  useEffect(() => {
    setTimeout(() => {
      console.log(serviceWorkerRef);
      if (serviceWorkerRef.wb) {
        const { wb } = serviceWorkerRef

        // Taken from https://developers.google.com/web/tools/workbox/guides/advanced-recipes
        // This simple refresh takes change of updating the cache of js files. :)
        // TODO: Make this a proper modal/alert/popup.
        wb.addEventListener('waiting', event => {
          setUA(true);
          if (window.confirm('New update available!\n Do you want to update?')) {
            wb.addEventListener('controlling', event => {
              window.location.reload()
            })

            wb.messageSkipWaiting();
          }
        })
      }
    }, 100)
  }, [])

  return (updateAvailable) ? <div>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    SERVICE WORKER UPDATE AVAILABLE!
    <br/>
    Press Ctrl + F5 to update NOW.
  </div> : null
})

export default ServiceWorkerUpdateBanner;