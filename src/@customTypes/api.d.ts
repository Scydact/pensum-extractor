
/** Contains all the structures that can be fetched from a json file. */
declare namespace DataJson {

  /** Data format for universidades.json. */
  type Universities = {
    universities: University[],
  };

  /** Single university, inside Universities object. */
  type University = {
    code: string,
    shortName: string,
    longName: string,
    imgUrl: string | null,
  }

  /** Single carrera for autocomplete. */
  type Carrera = {
    /** Codigo de la carrera (eg. ADM10). */
    code: string,
    /** Nombre largo de la carrera. */
    name: string,
    /** Escuela a la que pertenece la carrera. */
    school: string,
  }

  /** Pensum Index file (path at $PUBLIC/pensum/$UNIVERSIRY/index.json) */
  type PensumIndex = {
    /** University name (ej UNAPEC). */
    university: string,
    /** API point to try to fetch unknown pensums from. */
    api: string | null,
    /** List of recorded pensums. */
    careers: Carrera[],
  }



  /**
   * TODO: Update to include new data:
   *  - universidad
   *  - prereq/extra is always an array
   *  - coreq
   */

  /** Materia dentro de una carrera. */
  type Mat = {
    /** Codigo de materia */
    codigo: string,
    /** Nombre de la materia */
    asignatura: string,
    /** Creditos de esta materia */
    creditos: number,
    /** Prerequisitos de esta materia (ej. MAT101) */
    prereq?: string | string[],
    /** Prerequisitos textuales de esta materia (ej. 90% de creditos) */
    prereqExtra?: string | string[],
  }

  /** Pensum singular de una carrera. */
  type Pensum = {
    /** Nombre largo de la carrera (ej. Lic. en Administracion de empresas) */
    carrera: string,
    /** Codigo de la carrera (ej. ADM10) */
    codigo: string,
    /** Fecha de publicacion del pensum */
    vigencia: string,
    /** Lineas de detalle extra en el pensum. */
    infoCarrera: string[],
    /** Version del pensum. Debe ser 2. */
    version: number,
    /** Cuatrimestres, cada uno con sus respectivas materias. */
    cuats: Mat[]
  }
}