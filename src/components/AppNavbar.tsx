import DarkModeSwitch from "lib/DarkMode/DarkModeSwitch";
import { useEffect, useRef } from "react";
import { Container, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactChild
}

function AppNavbar({ children }: Props) {
  const navbarRef = useRef(null as any as HTMLElement);
  const navigate = useNavigate();

  // Navbar hide on scroll
  useEffect(() => {
    var prevScrollPos = window.scrollY;
    var { height } = navbarRef.current.getBoundingClientRect();
    const onScrollFn = () => {
      if (!navbarRef.current) return;
      var currentScrollPos = window.scrollY;

      if (prevScrollPos > currentScrollPos) {
        navbarRef.current.style.transform = 'translate(0,0)';
      } else {
        var h = (height < currentScrollPos ? height : currentScrollPos);
        navbarRef.current.style.transform = `translate(0,-${h}px)`;
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
        onClick={() => navigate("/")}>
        PENSUMS UNAPEC
      </Navbar.Brand>

      <div className="flex-grow-1">
        {children}
      </div>

      <DarkModeSwitch />
    </Container>
  </Navbar>
}

export default AppNavbar;