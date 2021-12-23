
import { Button, Container, Row } from "react-bootstrap";

export default function DebugPage() {


  return <Container>
    <Row>
      <Button onClick={() => {
        import("functions/debug/test-legacy-localstorage").then(
          testLegacyLocalStorage => testLegacyLocalStorage.default()
        )
      }}>Set localstorage debug data</Button>

    </Row>
  </Container>
}