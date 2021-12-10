import './App.scss';
import './global-vars.scss';

import { useCallback } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import AppNavbar from 'components/AppNavbar';
import AppFooter from 'components/AppFooter';

import PensumExtractor from 'components/Pensum/PensumExtractor';
import { UniversityProvider } from 'contexts/university-data';
import { ActivePensumProvider } from 'contexts/active-pensum';
import { MatSelectionProvider } from 'contexts/mat-selection';

import MatInfo from 'components/MatInfo';
import MatInfoDetails from 'components/MatInfo/Details';
import MatInfoIndex from 'components/MatInfo/MatIndex';
import { PensumRowNodesProvider } from 'contexts/pensum-row-nodes';
import DebugPage from 'components/Debug';
import CalcIndice from 'components/Pensum/Actions/CalcIndice';


function App() {

  // Nested ContextProviders
  const Providers = useCallback(function Providers(props: any) {
    return (
      <UniversityProvider>
        <ActivePensumProvider>
          <MatSelectionProvider>
            <PensumRowNodesProvider>
              {props.children}
            </PensumRowNodesProvider>
          </MatSelectionProvider>
        </ActivePensumProvider>
      </UniversityProvider>
    )
  }, []);

  return (
    <Providers>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <AppNavbar />
        <Container fluid className="App">

          <Routes>

            <Route path="/" element={<LayoutWithPensum />}>

              <Route path="mat" element={<MatInfo />}>
                <Route index element={<MatInfoIndex />} />
                <Route path=":code" element={<MatInfoDetails />} />
              </Route>

              <Route path="calcular-indice" element={<CalcIndice />} />
            
            </Route>

            <Route path="debug" element={<DebugPage />} />
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>

        </Container>
        <AppFooter />
      </BrowserRouter>
    </Providers>
  );
}

/** Layout with the outlet as a modal. */
function LayoutWithPensum() {
  return (<>
    <PensumExtractor />
    <Outlet />
  </>)
}


export default App;
