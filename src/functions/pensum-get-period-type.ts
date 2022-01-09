

export const defaultPeriodType: Pensum.Pensum['periodType'] = {
  name: 'Periodo',
  acronym: 'Per',
  two: 'Pr'
};


export function getPeriodType(pensum?: Pensum.Pensum | null): Pensum.Pensum['periodType'] {
  if (pensum)
    return pensum.periodType
  return defaultPeriodType
}

export default getPeriodType

