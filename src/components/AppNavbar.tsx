import DarkModeSwitch from '@/lib/DarkMode/DarkModeSwitch'
import { useEffect, useRef } from 'react'
import { Container, Navbar } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

type Props = {
    children: React.ReactNode
}

function AppNavbar({ children }: Props) {
    const navbarRef = useRef(null as any as HTMLElement)
    const navigate = useNavigate()

    // Navbar hide on scroll
    useEffect(() => {
        let prevScrollPos = window.scrollY
        const { height } = navbarRef.current.getBoundingClientRect()
        const onScrollFn = () => {
            if (!navbarRef.current) return
            const currentScrollPos = window.scrollY

            if (prevScrollPos > currentScrollPos) {
                navbarRef.current.style.transform = 'translate(0,0)'
            } else {
                const h = height < currentScrollPos ? height : currentScrollPos
                navbarRef.current.style.transform = `translate(0,-${h}px)`
            }
            prevScrollPos = currentScrollPos
        }

        window.addEventListener('scroll', onScrollFn)
        return () => window.removeEventListener('scroll', onScrollFn)
    }, [])

    return (
        <Navbar ref={navbarRef} variant="dark" className="App-header mb-3" fixed="top">
            <Container>
                <Navbar.Brand onClick={() => navigate('/')}>
                    <img
                        src="./favicon/favicon-256x256.png"
                        alt="Logo"
                        style={{
                            height: '50px',
                            marginInlineEnd: '0.5rem',
                            marginBlock: '-1rem',
                            marginBlockEnd: '-0.75rem',
                        }}
                    />
                    Pensum Extractor
                </Navbar.Brand>

                <div className="flex-grow-1">{children}</div>

                <DarkModeSwitch />
            </Container>
        </Navbar>
    )
}

export default AppNavbar
