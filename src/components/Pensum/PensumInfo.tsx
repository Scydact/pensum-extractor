import Card from "react-bootstrap/Card";

type Props = {
  info: Pensum.Pensum['info']
};

export default function PensumInfo({ info }: Props) {
  return <Card>
    <Card.Header className="text-center pt-3">
      <h5>Detalles de la carrera</h5>
    </Card.Header>
    <Card.Body className="m-auto">
      <ul>
        {info.map((line, idx) => <li><InfoLine key={idx} info={line} /></li>)}
      </ul>
    </Card.Body>
  </Card>;
}

function InfoLine({ info }: { info: string }) {
  const parsed = parseInfoLine(info);
  switch (parsed.type) {
    case 'double': {
      const [key, val] = parsed.data;
      return <span><strong>{key}: </strong>{val}</span>;
    }
    
    case 'double_sublist': {
      const [key, val] = parsed.data;
      return <>
        <strong>{key}: </strong>
        <ul>
          {val.map((str, idx) => <li key={idx}>{str}</li>)}
        </ul>
      </>
    }

    case 'simple':
    default: 
      return <span>{parsed.data}</span>
  }
}



/** Separates the info in 3 ways:
 *  1. Text with no colon: 
 *  ```
 * "Informatica" -> {type: "simple", data: "Informatica"}
 * ```
 * 
 * 2. Text with single colon (usually a equivalence?:
 * ```
 * "Materia: Informatica" -> {
 *    type: "double", 
 *    data: ["Materia", "Informatica"]
 * }
 * ```
 * 
 * 3. Text with 
 * ```
 * "Materias: Informatica. Mecatronica." -> {
 *    type: "double", 
 *    data: ["Materias", ["Informatica", "Mecatronica"]]
 * }
 * ```
 */
function parseInfoLine(str: string) {
  let splitOnFirstColon = [
    str.substring(0, str.indexOf(': ')),
    str.substring(str.indexOf(': ') + 2),
  ];

  // No colon == just plain text. (x)
  if (splitOnFirstColon[0] === '') 
    return { type: 'simple', data: str } as { type: 'simple', data: string };

  let splitOnDots = splitOnFirstColon[1].split('. ');

  // Colon + Single period == Equivalence (x: y)
  if (splitOnDots.length === 1)
    return { type: 'double', data: splitOnFirstColon } as { type: 'double', data: [string, string] };

  // Multiple list: (x: y. z. w. a.)
  return {
    type: 'double_sublist',
    data: [splitOnFirstColon[0], splitOnDots],
  } as { type: 'double_sublist', data: [string, string[]] };
}