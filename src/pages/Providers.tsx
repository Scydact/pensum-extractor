import { Fragment, memo } from 'react'

import { UniversityProvider } from '@/contexts/university-data'
import { ActivePensumProvider } from '@/contexts/active-pensum'
//@ts-ignore
import { MatSelectionProvider } from '@/contexts/mat-selection'
import { PensumRowNodesProvider } from '@/contexts/pensum-row-nodes'
//@ts-ignore
import { DeveloperModeProvider } from '@/contexts/developer-mode'
import { nestComponents } from '@/lib/react-utils'

const Providers = memo(function Providers(props: any) {
    return nestComponents([
        UniversityProvider,
        ActivePensumProvider,
        PensumRowNodesProvider,
        [Fragment, null, props.children],
    ])
})

export default Providers
