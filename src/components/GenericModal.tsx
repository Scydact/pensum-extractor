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

      <Container className="d-flex flex-column gap-3 my-3">

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

/** Modal that navigates back on hide.  */
export function GenericModalNavBack({ children, ...rest }: GModalProps) {
  const navigate = useNavigate();
  const handleHide = () => {
    navigate(-1)
  }

  return <GenericModal onHide={handleHide} {...rest}>{children}</GenericModal>
}