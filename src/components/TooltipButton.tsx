import { Button, ButtonProps, OverlayTrigger, OverlayTriggerProps, Tooltip } from "react-bootstrap"

type Props = ButtonProps & {
  tooltip: React.ReactNode,
  placement: OverlayTriggerProps['placement'],
  overlayProps?: OverlayTriggerProps,
}

/** Button with tooltip */
export default function TooltipButton({
  children,
  tooltip,
  placement = 'auto-start',
  overlayProps,
  ...rest
}: Props) {
  return <OverlayTrigger
    {...overlayProps}
    placement={placement}
    overlay={<Tooltip>{tooltip}</Tooltip>}>
    <Button {...rest}>
      {children}
    </Button>
  </OverlayTrigger>
}