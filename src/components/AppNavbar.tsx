import DarkModeSwitch from "lib/DarkMode/DarkModeSwitch";
import { useEffect, useRef } from "react";
import { Container, Navbar } from "react-bootstrap";


function AppNavbar() {
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

  return <Navbar
    ref={navbarRef}
    variant="dark"
    className="App-header mb-3"
    fixed="top" >
    <Container>
      <Navbar.Brand>PENSUMS UNAPEC</Navbar.Brand>

      <DarkModeSwitch />
    </Container>
  </Navbar>
}

export default AppNavbar;