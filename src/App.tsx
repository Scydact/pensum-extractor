import './App.css';
import PensumExtractor from 'components/PensumExtractor';
import { Container, Row } from 'react-bootstrap';
import DarkModeSwitch from 'lib/DarkMode/DarkModeSwitch';


function App() {
  return (
    <Container fluid className="App">
      <DarkModeSwitch/>
      <Row>
        <PensumExtractor />

        <footer>
          <span>Pensum Extractor DO</span>
          <span>Fernando Rivas, 2021</span>
          <span><a href="http://scydact.github.io/">scydact.github.io</a></span>
          <span>Version v{process.env.REACT_APP_VERSION} | save v{process.env.REACT_APP_SAVE_VERSION}</span>
          <span>
            En caso de problemas o sugerencias,
            favor escribir a <a
              href="mailto:scydact@gmail.com?subject=[Pensum Extractor]">
              scydact@gmail.com</a>.
          </span>
        </footer>
      </Row>
    </Container>
  );
}

export default App;
