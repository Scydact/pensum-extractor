import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Outlet, useNavigate } from 'react-router-dom'

export default function MatInfo() {
    const navigate = useNavigate()

    const handleHide = () => {
        navigate(-1)
    }
    const handleClose = () => {
        navigate('/')
    }

    // Won't use GenericModal cuz title is set in the outlet...
    return (
        <Modal show={true} onHide={handleHide}>
            <Outlet />

            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
