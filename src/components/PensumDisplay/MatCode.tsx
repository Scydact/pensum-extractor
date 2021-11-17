import ActivePensumContext from 'contexts/active-pensum';
import { classnames } from 'lib/react-utils';
import { useContext } from 'react';
import './mat-code.scss';


type Props = {
  data: string | {text: string},
  type: 'prereq' | 'coreq'
}

/** Single matcode. */
function MatCode({ data, type }: Props) {
  const { state: { matData } } = useContext(ActivePensumContext);
  let className = ['mat-code', type];

  let content;
  if (typeof data === 'string') {
    content = data;
    className.push('code');

    if (matData.looseUnhandled.has(data)) 
      className.push('missing');

    

  } else {
    content = data.text;
    className.push('req-text');
  }

  return (<span className={classnames(className)}>{content}</span>)
}

export default MatCode;