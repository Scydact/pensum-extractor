import './App.scss';
import './global-vars.scss';
import PensumExtractor from 'components/PensumExtractor';
import Container from 'react-bootstrap/Container';
import AppNavbar from 'components/AppNavbar';
import AppFooter from 'components/AppFooter';
import { UniversityProvider } from 'contexts/university-data';
import { ActivePensumProvider } from 'contexts/active-pensum';
import { useCallback } from 'react';


function App() {

  // Nested ContextProviders
  const Providers = useCallback(function Providers(props: any) {
    return (
      <UniversityProvider>
        <ActivePensumProvider>
          {props.children}
        </ActivePensumProvider>
      </UniversityProvider>
    )
  }, []);

  return (  
    <Providers>
      <AppNavbar />

      <Container fluid className="App">
        <PensumExtractor />
      </Container>

      <AppFooter />
    </Providers>
  );
}

export default App;
