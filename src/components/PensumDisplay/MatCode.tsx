import ActivePensumContext from 'contexts/active-pensum';
import { matSelectHelpers, MatSelectionTrackerContext } from 'contexts/mat-selection';
import { classnames } from 'lib/format-utils';
import { useContext } from 'react';
import './mat-code.scss';


type Props = {
  data: string | {text: string},
  type: 'prereq' | 'coreq'
}

/** Single matcode. */
function MatCode({ data, type }: Props) {
  const { state: { matData } } = useContext(ActivePensumContext);
  const tracker = useContext(MatSelectionTrackerContext);
  let className: any[] = ['mat-code', type];

  let content;
  if (typeof data === 'string') {
    content = data;
    className.push('code', 'click-target');

    if (matData.looseUnhandled.has(data)) 
      className.push('missing');

    className.push(matSelectHelpers.getTracker(tracker, data) || 'default');

  } else {
    content = data.text;
    className.push('req-text');
  }

  return (<span className={classnames(className)}>{content}</span>)
}

export default MatCode;