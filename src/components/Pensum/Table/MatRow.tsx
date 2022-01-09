import React, { forwardRef, useCallback, useContext, useEffect, useRef } from "react";
import { matSelectHelpers, MatSelectionDispatchContext, MatSelectionModeContext, MatSelectionTrackerContext } from 'contexts/mat-selection';
import { classnames } from 'lib/format-utils';

import MatCode from 'components/MatCode';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from "react-router-dom";
import PensumRowNodesContext from "contexts/pensum-row-nodes";

type MatRowProps = {
  mat: Pensum.Mat,
  idx: number
};

const trackerCheckmarks = new Map([
  ['passed', '✅'],
  ['course', '🔳'],
  [null, '⬜'],
]);

/**
 * 
 * @param refs 
 * @returns 
 * @src https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
 */
function useCombinedRefs<T>(...refs: any[]) {
  const targetRef = useRef<T>(null)

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return

      if (typeof ref === 'function') {
        ref(targetRef.current)
      } else {
        ref.current = targetRef.current
      }
    })
  }, [refs])

  return targetRef as React.RefObject<T>
}

/** Displays a single Mat as from the pensum a table row. */
const MatRow = forwardRef(({ mat, idx, ...rest }: MatRowProps, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const rowRef = useCombinedRefs<HTMLDivElement>(ref, innerRef)
  const clickableRef = useRef<HTMLDivElement>(null);

  const { updateNode } = useContext(PensumRowNodesContext);

  const dispatch = useContext(MatSelectionDispatchContext);
  const tracker = useContext(MatSelectionTrackerContext);
  const trackerMode = useContext(MatSelectionModeContext);

  const currentTracker = matSelectHelpers.getTracker(tracker, mat.code);
  
  // Classes. Any falsy values will be discarded
  const cl = [
    "row-mat",
    (idx & 1) && 'even',  // Mark the mat as even, if the index is odd????? lol.
    currentTracker,       // Color according to the tracker.

    // On hover, will clicking this set the tracker or not?
    'table-hover-' + (currentTracker === trackerMode ? 'default' : trackerMode),
  ];

  const reqs = [
    ...mat.prereq.map((x, i) => <MatCode key={i       } data={x} type='prereq'/>),
    ...mat.coreq.map( (x, i) => <MatCode key={i + 1000} data={x} type='coreq' />),
  ] as JSX.Element[];

  // On hover INSIDE THE MAT CHECKBOX, change the background of the ENTIRE ROW.
  useEffect(() => {
    const cbMouseEnter = () => {
      rowRef.current?.classList.add('track-hover');
    }
    const cbMouseLeave = () => {
      rowRef.current?.classList.remove('track-hover');
    }

    const clickable = clickableRef.current;

    if (!clickable) return;

    clickable.addEventListener('mouseenter', cbMouseEnter);
    clickable.addEventListener('mouseleave', cbMouseLeave);
    return () => {
      clickable.removeEventListener('mouseenter', cbMouseEnter);
      clickable.removeEventListener('mouseleave', cbMouseLeave);
    }
  }, [rowRef, clickableRef]);

  useEffect(() => {
    updateNode(mat.code, rowRef);
    return () => updateNode(mat.code, rowRef);
  }, [mat.code, updateNode, rowRef]);

  const onClick = useCallback((evt: any) => {
    dispatch({ type: 'select', payload: mat.code });
  }, [mat.code, dispatch])

  return <Row
    ref={rowRef}
    className={classnames(cl)}
    data-mat={mat.code}
    {...rest}>
    <Col ref={clickableRef} onClick={onClick} className="row-check click-target">
      {trackerCheckmarks.get(currentTracker) || '⬜x'}
    </Col>
    <Col className="row-code code"><Link to={`/mat/${mat.code}`}>{mat.code}</Link></Col>
    <Col>
      <Row className="h-100 align-items-center">
        <Col className="row-name">{mat.name}</Col>
        <Col className="row-cr">{mat.cr}</Col>
        <Col className="row-req">{reqs}</Col>
      </Row>
    </Col>
  </Row>
})

export default MatRow;