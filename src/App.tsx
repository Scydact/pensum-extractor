import './App.scss'
import './global-vars.scss'

import { memo } from 'react'
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'

import { Container } from 'react-bootstrap'

import AppNavbar from '@/components/AppNavbar'
import AppFooter from '@/components/AppFooter'

import Providers from '@/pages/Providers'
import PensumExtractor from '@/pages/PensumExtractor'

import MatInfo from '@/pages/MatInfo'
import MatInfoDetails from '@/pages/MatInfo/Details'
import MatInfoIndex from '@/pages/MatInfo/MatIndex'
import DebugPage from '@/pages/Debug'
import CalcIndice from '@/pages/CalcIndice'
import ServiceWorkerUpdateBanner from '@/pages/ServiceWorkerUpdateBanner'
import MatOrgChart from '@/pages/MatOrgChart/MatOrgChart'
import PensumDevelop from '@/pages/PensumDevelop'

function App() {
    return (
        <Providers>
            <HashRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route
                            path="/"
                            element={
                                <>
                                    <PensumExtractor />
                                    <Outlet />
                                </>
                            }
                        >
                            <Route path="mat" element={<MatInfo />}>
                                <Route index element={<MatInfoIndex />} />
                                <Route path=":code" element={<MatInfoDetails />} />
                            </Route>

                            <Route path="calcular-indice" element={<CalcIndice />} />

                            <Route path="diagrama" element={<MatOrgChart />} />
                        </Route>

                        <Route path="dev" element={<PensumDevelop />} />
                        <Route path="debug" element={<DebugPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                </Routes>
            </HashRouter>
        </Providers>
    )
}

const Layout = memo(() => (
    <>
        <AppNavbar>
            <ServiceWorkerUpdateBanner />
        </AppNavbar>
        <Container fluid className="App">
            <Outlet />
        </Container>
        <AppFooter />
    </>
))

export default App
