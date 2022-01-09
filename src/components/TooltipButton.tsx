import { Button, ButtonProps, OverlayTrigger, OverlayTriggerProps, Tooltip } from "react-bootstrap"

type Props = ButtonProps & {
  tooltip: React.ReactNode,
  overlayProps?: OverlayTriggerProps,
}

/** Button with tooltip */
export default function TooltipButton({
  children,
  tooltip,
  overlayProps,
  ...rest
}: Props) {
  return <OverlayTrigger
    placement="auto-start"
    {...overlayProps}
    overlay={<Tooltip>{tooltip}</Tooltip>}>
    <Button {...rest}>
      {children}
    </Button>
  </OverlayTrigger>
}