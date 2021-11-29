const BASE_PATH = process.env.PUBLIC_URL + '/pensum';
const UNIVERSITIES_PATH = BASE_PATH + '/universities.json';
const CAREERS_FILE = 'index.json';

/** Fetches universities.json */
export async function fetchUniversities() {
  const response = await fetch(UNIVERSITIES_PATH);
  const unisObj: PensumJson.Universities = await response.json();

  if (typeof unisObj !== 'object') {
    throw TypeError('Invalid universities.json format.');
  }

  // In the future, check if all props are valid.
  if (!unisObj.universities) {
    throw TypeError('Invalid universities.json format.');
  }

  return unisObj;
}

/** Fetches ./pensum/$UNIVERSITY/index.json */
export async function fetchCarreras(universityCode?: string) {
  if (!universityCode) return {
      university: '',
      api: null,
      careers: []
  } as PensumJson.PensumIndex;

  const path = BASE_PATH + '/' + universityCode.toLowerCase() + '/' + CAREERS_FILE
  const response = await fetch(path);
  const carrerasObj: PensumJson.PensumIndex = await response.json();

  if (typeof carrerasObj !== 'object') {
    throw TypeError('Invalid careers.json format.');
  }

  // In the future, check if all props are valid.
  if ( !carrerasObj.api
    || !carrerasObj.university
    || !carrerasObj.careers
  ) {
    throw TypeError('Invalid careers.json format.');
  }

  return carrerasObj;
}
