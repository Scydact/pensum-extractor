import './mat-code.scss';


type Props = {
  data: string | {text: string},
  type: 'prereq' | 'coreq'
}


function MatCode({ data, type }: Props) {

  let className = 'mat-code code ' + type;

  let content;
  if (typeof data === 'string') {
    content = data;
  } else {
    content = data.text;
  }

  return (<span className={className}>{content}</span>)
}

export default MatCode;