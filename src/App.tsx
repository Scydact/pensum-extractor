import './App.scss';
import PensumExtractor from 'components/PensumExtractor';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import DarkModeSwitch from 'lib/DarkMode/DarkModeSwitch';
import { useEffect, useRef } from 'react';


function App() {
  const navbarRef = useRef(null as HTMLElement | null);

  // Navbar hide on scroll
  useEffect(() => {
    var prevScrollPos = window.scrollY;
    const onScrollFn = () => {
      if (!navbarRef.current) return;
      var currentScrollPos = window.scrollY;
      if (prevScrollPos > currentScrollPos) {
        navbarRef.current.classList.remove('hidden');
      } else {
        navbarRef.current.classList.add('hidden');
      }
      prevScrollPos = currentScrollPos;
    }

    window.addEventListener('scroll', onScrollFn);
    return () => window.removeEventListener('scroll', onScrollFn);
  }, []);

  return (<>
    <Navbar
      ref={navbarRef} 
      variant="dark" 
      className="App-header mb-3"
      fixed="top" >
      <Container>
        <Navbar.Brand>PENSUMS UNAPEC</Navbar.Brand>

        <DarkModeSwitch />
      </Container>
    </Navbar>

    <Container fluid className="App">
      <PensumExtractor />
    </Container>


    <footer className="mt-3 navbar navbar-expand navbar-light static-bottom">
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
  </>
  );
}

export default App;
