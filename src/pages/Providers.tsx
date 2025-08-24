import { Fragment, memo } from 'react'

import { UniversityProvider } from '@/contexts/university-data'
import { ActivePensumProvider } from '@/contexts/active-pensum'
import { MatSelectionProvider } from '@/contexts/mat-selection'
import { PensumRowNodesProvider } from '@/contexts/pensum-row-nodes'
import { DeveloperModeProvider } from '@/contexts/developer-mode'
import { nestComponents } from '@/lib/react-utils'

const Providers = memo(function Providers(props: any) {
    return nestComponents([
        UniversityProvider,
        ActivePensumProvider,
        MatSelectionProvider,
        PensumRowNodesProvider,
        [Fragment, null, props.children],
    ])
})

export default Providers
