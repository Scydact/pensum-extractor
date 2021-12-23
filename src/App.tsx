import './App.scss';
import './global-vars.scss';

import { memo } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import { Container } from 'react-bootstrap';

import AppNavbar from 'components/AppNavbar';
import AppFooter from 'components/AppFooter';

import Providers from 'pages/Providers';
import PensumExtractor from 'pages/PensumExtractor/PensumExtractor';

import MatInfo from 'pages/MatInfo';
import MatInfoDetails from 'pages/MatInfo/Details';
import MatInfoIndex from 'pages/MatInfo/MatIndex';
import DebugPage from 'pages/Debug';
import CalcIndice from 'pages/CalcIndice';


function App() {

  return (
    <Providers>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route element={<Layout />}>

            <Route path="/" element={<><PensumExtractor /><Outlet /></>}>
              
              <Route path="mat" element={<MatInfo />}>
                <Route index element={<MatInfoIndex />} />
                <Route path=":code" element={<MatInfoDetails />} />
              </Route>

              <Route path="calcular-indice" element={<CalcIndice />} />

            </Route>

            <Route path="debug" element={<DebugPage />} />
            <Route path="*" element={<Navigate to="/" />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

const Layout = memo(() => <>
  <AppNavbar />
  <Container fluid className="App">
    <Outlet />
  </Container>
  <AppFooter />
</>)

export default App;
