import React, { forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import {
    matSelectHelpers,
    MatSelectionDispatchContext,
    MatSelectionModeContext,
    MatSelectionTrackerContext,
} from '@/contexts/mat-selection'
import { classnames } from '@/lib/format-utils'

import MatCode from '@/components/MatCode'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Link } from 'react-router-dom'
import PensumRowNodesContext from '@/contexts/pensum-row-nodes'
import { useClassOnHover } from '@/hooks/use-hover-class'
import { useCombinedRefs } from '@/hooks/use-combined-refs'

export type MatRowProps = {
    mat: Pensum.Mat
    idx: number
}

export type MatRowTemplateProps = {
    elems: {
        checkmark: React.ReactNode
        code: React.ReactNode
        name: React.ReactNode
        cr: React.ReactNode
        reqs: React.ReactNode | React.ReactNode[]
    }

    checkmarkProps?: any
    rowProps?: any
}

export function MatRowTemplate(props: MatRowTemplateProps) {
    return (
        <Row {...props.rowProps}>
            <Col className="row-check click-target" {...props.checkmarkProps}>
                {props.elems.checkmark}
            </Col>

            <Col className="row-code code">{props.elems.code}</Col>

            <Col>
                <Row className="h-100 align-items-center">
                    <Col className="row-name">{props.elems.name}</Col>
                    <Col className="row-cr">{props.elems.cr}</Col>
                    <Col className="row-req">{props.elems.reqs}</Col>
                </Row>
            </Col>
        </Row>
    )
}

const trackerCheckmarks = new Map([
    ['passed', '✅'],
    ['course', '🔳'],
    [null, '⬜'],
])

const MatRow = forwardRef<unknown, MatRowProps>(function MR(props, ref) {
    const { scrollToRow } = useContext(PensumRowNodesContext)
    const { mat, idx, ...rest } = props

    const rowRef = useCombinedRefs<HTMLDivElement>(ref, useRef<HTMLDivElement>(null)) // innerRef in case no ref is given
    const clickableRef = useRef<HTMLDivElement>(null)

    const { updateNode } = useContext(PensumRowNodesContext)

    const tracker = useContext(MatSelectionTrackerContext)
    const trackerMode = useContext(MatSelectionModeContext)
    const dispatch = useContext(MatSelectionDispatchContext)

    const currentTracker = matSelectHelpers.getTracker(tracker, mat.code)

    // On hover INSIDE THE MAT CHECKBOX, change the background of the ENTIRE ROW.
    useClassOnHover('track-hover', rowRef, clickableRef)

    // Classes. Any falsy values will be discarded
    const cl = [
        'row-mat',
        idx & 1 && 'even', // Mark the mat as even, if the index is odd????? lol.
        currentTracker, // Color according to the tracker.

        // On hover, will clicking this set the tracker or not?
        'table-hover-' + (currentTracker === trackerMode ? 'default' : trackerMode),
    ]

    const onClick = useCallback(
        (evt: any) => {
            dispatch({ type: 'select', payload: mat.code })
        },
        [mat.code, dispatch],
    )

    //
    useEffect(() => {
        updateNode(mat.code, rowRef)
        return () => updateNode(mat.code, rowRef)
    }, [mat.code, updateNode, rowRef])

    const elems: MatRowTemplateProps['elems'] = {
        checkmark: trackerCheckmarks.get(currentTracker) || '⬜x',
        code: <Link to={`/mat/${mat.code}`}>{mat.code}</Link>,
        name: mat.name,
        cr: mat.cr,
        reqs: mat.req.map((code, i) => (
            <MatCode
                key={i}
                data={code}
                fromMat={mat.code}
                onClick={typeof code === 'string' ? () => scrollToRow(code) : undefined}
            />
        )),
    }

    return (
        <MatRowTemplate
            elems={elems}
            checkmarkProps={{ ref: clickableRef, onClick }}
            rowProps={{
                ref: rowRef,
                className: classnames(cl),
                'data-mat': mat.code,
                ...rest,
            }}
        />
    )
})

export default MatRow
