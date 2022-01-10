import React from "react";
import { Button, Container, Modal, ModalProps } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";

type GModalProps = {
  title?: React.ReactNode,
  children?: React.ReactNode,
  footer?: React.ReactNode,

  hasCloseButton?: boolean,
  onClose?: () => any,
  onHide?: () => any,
} & ModalProps;

/** 
 * Simple modal with boilerplate Header, Title, Footer (with close button).
 * You must provide onHide to avoid buggyness.
 * 
 * If using react-router, you could use GenericModalNavBack instead.
 */
export function GenericModal({
  children,
  title,
  footer,
  hasCloseButton = true,
  onHide,
  onClose,
  ...rest
}: GModalProps) {

  return (
    <Modal show={true} onHide={onHide} {...rest}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Container className="my-3">

        {children}

        <Outlet />
      </Container>

      <Modal.Footer>
        {footer}
        {hasCloseButton && <Button variant="primary" onClick={onClose || onHide}>
          Cerrar
        </Button>}
      </Modal.Footer>
    </Modal>)
}

/**
 * Modal template that navigates back on hide. (react-router useNavigate()).
 * 
 * It's just a GenericModal with onHide set to `navigate(-1)`. 
 * 
 * See GenericModal for more details.
 */
export function GenericModalNavBack({ children, ...rest }: GModalProps) {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate('/')
  }
  const handleHide = () => {
    navigate(-1)
  }

  return <GenericModal onHide={handleHide} onClose={handleClose} {...rest}>{children}</GenericModal>
}