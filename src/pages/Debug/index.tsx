import { Button, Container, Row } from 'react-bootstrap'

export default function DebugPage() {
    return (
        <Container>
            <div className="d-flex gap-2 flex-column">
                <Button
                    onClick={() => {
                        import('@/functions/debug/test-legacy-localstorage').then((testLegacyLocalStorage) =>
                            testLegacyLocalStorage.default(),
                        )
                    }}
                >
                    Set localstorage debug data
                </Button>

                <Button
                    onClick={() => {
                        import('@/functions/debug/convert-old-pensum-jsons').then((convertOldLegacyPensums) =>
                            convertOldLegacyPensums.default(),
                        )
                    }}
                >
                    Download all pensums in new format.
                </Button>
            </div>
        </Container>
    )
}
