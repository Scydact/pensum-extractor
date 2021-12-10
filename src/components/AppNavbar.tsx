import DarkModeSwitch from "lib/DarkMode/DarkModeSwitch";
import { useEffect, useRef } from "react";
import { Container, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


function AppNavbar() {
  const navbarRef = useRef(null as HTMLElement | null);
  const navigate = useNavigate();

  // Navbar hide on scroll
  useEffect(() => {
    var prevScrollPos = window.scrollY;
    const onScrollFn = () => {
      if (!navbarRef.current) return;
      var currentScrollPos = window.scrollY;
      var { height } = navbarRef.current.getBoundingClientRect();

      if (prevScrollPos > currentScrollPos) {
        navbarRef.current.style.top = '0';
      } else {
        navbarRef.current.style.top = (height < currentScrollPos ? -height : -currentScrollPos) + 'px';
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
      <Navbar.Brand
       onClick={() => navigate("/")}>PENSUMS UNAPEC</Navbar.Brand>

      <DarkModeSwitch />
    </Container>
  </Navbar>
}

export default AppNavbar;