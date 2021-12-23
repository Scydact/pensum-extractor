import {memo} from 'react';

import { UniversityProvider } from 'contexts/university-data';
import { ActivePensumProvider } from 'contexts/active-pensum';
import { MatSelectionProvider } from 'contexts/mat-selection';
import { PensumRowNodesProvider } from 'contexts/pensum-row-nodes';


const Providers = memo(function Providers(props: any) {
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
});

export default Providers;