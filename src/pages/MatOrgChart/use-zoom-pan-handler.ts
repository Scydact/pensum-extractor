import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (n: number, min: number, max: number) => (max < n) ? max : (min > n) ? min : n

export default function useZoomPanHandler(initial = 1.0, zoomMin = 0.01, zoomMax = Infinity) {
  // Zooming & panning stuff
  const panPos = useRef({ x: 0, y: 0, panning: false })
  // const [transform, setTransform] = useState("")
  const [zoom, setZoom] = useState(initial)
  const [cursor, setCursor] = useState("default")

  const containerRef = useRef<HTMLDivElement>(null)

  const panEndHandler = () => {
    panPos.current.panning = false
    setCursor("default");
  };

  const panHandler = (e: any) => {
    let x = 0;
    let y = 0;
    if (!e.targetTouches) {
      // pand on desktop
      x = e.pageX;
      y = e.pageY;
    } else if (e.targetTouches.length === 1) {
      // pan on mobile device
      x = e.targetTouches[0].pageX;
      y = e.targetTouches[0].pageY;
    } else if (e.targetTouches.length > 1) {
      return;
    }

    

    if (panPos.current.panning) {
      const { x: startX, y: startY } = panPos.current
  
      const parentNode = containerRef.current?.children[0]
      if (!parentNode) return
  
      [...parentNode.children].forEach(node => {
        node.scrollLeft = node.scrollLeft - (x - startX)
        node.scrollTop = node.scrollTop - (y - startY)
      })
    }

    panPos.current.x = x
    panPos.current.y = y

  };

  const panStartHandler = (e: any) => {
    if (e.target.closest(".oc-node")) {
      panPos.current.panning = false
      return;
    } else {
      panPos.current.panning = true
      setCursor("move");
    }

    let newX = 0;
    let newY = 0;

    if (!e.targetTouches) {
      // pand on desktop
      newX = e.pageX;
      newY = e.pageY;
    } else if (e.targetTouches.length === 1) {
      // pan on mobile device
      newX = e.targetTouches[0].pageX;
      newY = e.targetTouches[0].pageY;
    } else if (e.targetTouches.length > 1) {
      return;
    }

    panPos.current.x = newX
    panPos.current.y = newY

  };

  const setZoomClamped = useCallback((newScale: number) => {
    setZoom(p => clamp(p * newScale, zoomMin, zoomMax))
  }, [setZoom, zoomMin, zoomMax])

  const zoomHandler = useCallback((e: WheelEvent) => {
    e.preventDefault()
    let newScale = 1 - 0.2 * e.deltaY / 100;
    setZoomClamped(newScale)
  }, [setZoomClamped])

  useEffect(() => {
    const node = containerRef.current

    if (node) {
      node.addEventListener('wheel', zoomHandler, { passive: false })
      return () => node.removeEventListener('wheel', zoomHandler)
    }
  }, [zoomHandler])

  return {
    containerProps: {
      ref: containerRef,
      style: {
        width: '100%',
        height: '100%',
        cursor,
      },
      onMouseUp: panEndHandler,
      onMouseDown: panStartHandler,
      onMouseMove: panHandler,
    },
    zoom,
    scaleZoom: setZoomClamped, // For use in + - buttons
    setZoom,
  }
}