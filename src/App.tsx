import './App.scss';
import './global-vars.scss';
import PensumExtractor from 'components/PensumExtractor';
import Container from 'react-bootstrap/Container';
import AppNavbar from 'components/AppNavbar';
import AppFooter from 'components/AppFooter';
import { UniversityProvider } from 'contexts/university-data';



function App() {

  return (
    <UniversityProvider>
      <AppNavbar />

      <Container fluid className="App">
        <PensumExtractor />
      </Container>

      <AppFooter />
    </UniversityProvider>
  );
}

export default App;
