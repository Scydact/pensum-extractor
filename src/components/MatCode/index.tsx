import ActivePensumContext from 'contexts/active-pensum';
import { matSelectHelpers, MatSelectionTrackerContext } from 'contexts/mat-selection';
import { classnames } from 'lib/format-utils';
import { useContext } from 'react';
import './mat-code-colors.scss';
import './mat-code.scss';


type Props = React.ComponentPropsWithRef<'span'> & {
  data: Pensum.Requirement,
  type?: 'prereq' | 'coreq',
  children?: React.ReactNode,
  className?: string,
  onClick?: React.MouseEventHandler<HTMLSpanElement>
};

/** Single matcode. */
function MatCode({ data, type = "prereq", children, onClick, className: ogClass, ...rest }: Props) {
  const { state: { matData } } = useContext(ActivePensumContext);
  const tracker = useContext(MatSelectionTrackerContext);
  let className: any[] = ['mat-code', type];

  if (ogClass) className.push(...ogClass.split(' '));

  let content;
  if (typeof data === 'string') {
    content = children || data;
    className.push('code');

    if (onClick)
      className.push('click-target');

    if (matData.looseUnhandled.has(data)) 
      className.push('missing');

    className.push(matSelectHelpers.getTracker(tracker, data) || 'default');

  } else {
    content = children || data.text;
    className.push('req-text');
  }

  return (<span className={classnames(className)} onClick={onClick} {...rest}>{content}</span>)
}

/** Same as mat code, but formatted as `[CODE] Name` */
export function LongMatCode({children, ...rest}: Props) {
  const { state: { matData } } = useContext(ActivePensumContext);

  // Override
  if (children) return <MatCode {...rest}>{children}</MatCode>

  let name;
  if (typeof rest.data === 'string') {
    name = matData.codeMap.get(rest.data)?.name;
  }

  if (name) {
    return <MatCode {...rest}>
      {`[${rest.data}] ${name}`}
    </MatCode>
  } else {
    return <MatCode {...rest}/>
  }
}

export default MatCode;