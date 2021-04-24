const saveVer = 5;
const jsVer = 3;
const SAVE_DATA_LOCALSTORAGE = 'saveData';
var SAVE_TO_LOCALSTORAGE = true;
var CARRERAS: { codigo: string, nombre: string, escuela: string, }[] = [];
var unapecPensumUrl = 'https://servicios.unapec.edu.do/pensum/Main/Detalles/';
var allIgnored = {}; // Mats that are no longer available and should be ommited from the pensum

var currentPensumData: i_pensum = null;
var currentPensumCode: string = '';
var currentPensumMats: { [key: string]: i_mat } = {};
var errorCodes = new Set<string>();
var errorCodesLog = [];

const filterMode = {
    pending: true,
    onCourse: true,
    passed: true,
};
var currentProgress: Set<string> = new Set();
var userProgress = {
    passed: new Set<string>(),
    onCourse: new Set<string>(),
    selected: new Set<string>(),
}
enum SelectMode {
    Passed,
    OnCourse,
    Select,
}
var userSelectMode = SelectMode.Passed;
function getUserProgressList(mode: SelectMode) {
    const a = {
        [SelectMode.Passed]: 'passed',
        [SelectMode.OnCourse]: 'onCourse',
        [SelectMode.Select]: 'selected',
    }
    return userProgress[a[mode]] as Set<string>;
}

// The version of FileSaver used here places this method on the global namespace
declare const saveAs;
declare const FileSaver: { saveAs };
FileSaver.saveAs = saveAs;

// XLSX to export as excel
declare const XLSX;
// Autocomplete
declare const Awesomplete;
// OrgChart
declare const primitives;
// Export OrgChart as PDF
declare const PDFDocument;
// Render OrgChart PDF to PNG
declare const blobStream;
declare const pdfjsLib;


const MANAGEMENT_TAKEN_CSS_CLASS = 'managementMode-taken';
const MANAGEMENT_ONCOURSE_CSS_CLASS = 'managementMode-oncourse';
const MANAGEMENT_SELECTED_CSS_CLASS = 'managementMode-selected';
const MANAGEMENT_ERROR_CSS_CLASS = 'managementMode-error';
const CURRENT_PENSUM_VERSION = 2; // Update this if new mats are added to IgnoredMats.json

/** Loads the node given at 'input' into the DOM */
async function fetchPensumTable(pensumCode, requestCallback) {
    var urlToLoad = unapecPensumUrl + pensumCode;
    let text = await fetchHtmlAsText(
        urlToLoad,
        { cache: 'force-cache' },
        -1,
        requestCallback
    );

    let parser = new DOMParser();
    let doc = parser.parseFromString(text, 'text/xml');
    return doc;
}

/** Contenedor de un pensum generico. */
interface i_pensum {
    /** Nombre de carrera "INGENIERIA ELECTRICA". */
    carrera: string,
    /** Codigo de carrera "PUB10". */
    codigo: string,
    /** Fecha de publicacion de pensum. */
    vigencia: string,
    /** Informacion extra en pensum: cantidad de creditos, titulo, requisistos... */
    infoCarrera: string[],
    /** Cuatrimestres de la carrera */
    cuats: i_mat_raw[][],
    /** Error, en caso de no poder cargar el pensum. */
    error?: string | null,
    /** Version de programa que leyo este pensum (CURRENT_PENSUM_VERSION) */
    version: number,
}
/** Materia extraida directamente del pensum */
interface i_mat_raw {
    /** Codigo de la materia "ESP101". */
    codigo: string,
    /** Nombre de la materia "Analisis de textos discursivos I". */
    asignatura: string,
    /** Cantidad de creditos de la materia. */
    creditos: number,
    /** Codigos de materias prerequesitos. */
    prereq: string[],
    /** Prerequesitos que no son materias (para graduacion). */
    prereqExtra: string[],
    /** Numero de cuatrimestre al que pertenece esta materia. */
    cuatrimestre: number,
}

/** Materia procesada, con prerequisitos */
interface i_mat extends i_mat_raw {
    /** Codigos de materias que dependen de esta materia. */
    postreq: string[],
}

/** Materia sin partes extras, usada para guardar en formato JSON. */
interface i_mat_save {
    /** Codigo de la materia "ESP101". */
    codigo: string,
    /** Nombre de la materia "Analisis de textos discursivos I". */
    asignatura: string,
    /** Cantidad de creditos de la materia. */
    creditos: number,
    /** Codigos de materias prerequesitos. */
    prereq?: string | string[],
    /** Prerequesitos que no son materias (para graduacion). */
    prereqExtra?: string | string[],
}

interface i_pensum_save extends Omit<i_pensum, 'cuats'> {
    /** Cuatrimestres de la carrera */
    cuats: i_mat_save[][]
}

/**
 * Converts the node fetched from UNAPEC to a jObject.
 * @param {Element} node
 */
function extractPensumData(node) {
    let out: i_pensum = {
        carrera: '',
        codigo: '',
        vigencia: '',
        infoCarrera: [],
        cuats: [],
        error: null,
        version: CURRENT_PENSUM_VERSION,
    };

    // Verify if pensum is actually valid data
    if (
        node.getElementsByClassName('contPensum').length == 0 ||
        node.getElementsByClassName('contPensum')[0].children.length < 2
    ) {
        return null;
    }

    // Extract basic data
    var cabPensum = node.getElementsByClassName('cabPensum')[0];
    out.carrera = cabPensum.firstElementChild.textContent.trim();
    var pMeta = cabPensum.getElementsByTagName('p')[0].children;
    out.codigo = pMeta[0].textContent.trim();
    out.vigencia = pMeta[1].textContent.trim();

    // Extract infoCarrera
    var infoCarrera = node.getElementsByClassName('infoCarrera')[0].children;
    for (let i = 0; i < infoCarrera.length; ++i) {
        out.infoCarrera.push(
            infoCarrera[i].textContent.replace(/\n/g, ' ').trim()
        );
    }

    // Extract cuats
    var cuatrim = node.getElementsByClassName('cuatrim');
    var ignoredMats = new Set(allIgnored[out.codigo]);

    for (let i = 0; i < cuatrim.length; ++i) {
        /**
         * @type {HTMLTableElement}
         */
        let currentCuatTable = cuatrim[i];
        let rows = currentCuatTable.children;

        let outCuat: i_mat_raw[] = [];

        for (let j = 1; j < rows.length; ++j) {
            let outMat: i_mat_raw = {
                codigo: '',
                asignatura: '',
                creditos: 0,
                prereq: [],
                prereqExtra: [],
                cuatrimestre: 0,
            };
            let currentRows = rows[j].children;
            outMat.codigo = currentRows[0].textContent.trim();
            outMat.asignatura = currentRows[1].textContent.trim();
            outMat.creditos = parseFloat(currentRows[2].textContent);
            outMat.cuatrimestre = i + 1;

            // Prerequisitos
            var splitPrereq = currentRows[3].textContent
                .replace(/\n/g, ',')
                .split(',')
                .map((x) => x.trim())
                .filter((e) => e !== '');
            for (let i = 0; i < splitPrereq.length; i++) {
                let a = splitPrereq[i];
                if (a.length < 8) outMat.prereq.push(a);
                else outMat.prereqExtra.push(a);
            }

            if (!ignoredMats.has(outMat.codigo)) outCuat.push(outMat);
        }
        out.cuats.push(outCuat);
    }
    return out;
}

/** Maps an array of Mats to an dict where the keys are the Mats' code */
function matsToDict(arr: i_mat_raw[]) {
    let out: { [key: string]: i_mat } = {};
    errorCodes = new Set();
    errorCodesLog = [];

    // Map all mats
    for (let x of arr)
        out[x.codigo] = { ...x, postreq: [] };

    // find postreqs
    for (let x of arr) {
        for (let y of x.prereq) {
            let pre = out[y];
            if (!pre) {
                console.error(`[ERROR!]: No se encuentra la materia "${y}" (prerequisito de "${x.codigo}")`);
                errorCodes.add(y);
                errorCodesLog.push([y, x.codigo])
            } else {
                pre.postreq.push(x.codigo);
            }
        }
    }

    return out;
}

/** Create mat dialog showing its dependencies and other options... */
function createMatDialog(code: string) {
    let codeData = currentPensumMats[code];
    if (!codeData)
        return new DialogBox().setMsg('Informacion no disponible para ' + code);

    let dialog = new DialogBox();
    let outNode = dialog.contentNode;

    createElement(
        outNode,
        'h3',
        `(${codeData.codigo}) '${codeData.asignatura}'`
    );
    createElement(outNode, 'p', `Codigo: \t${codeData.codigo}`);
    createElement(outNode, 'p', `Creditos: \t${codeData.creditos}`);
    createElement(outNode, 'p', `Cuatrimestre: \t${codeData.cuatrimestre}`);

    if (filterMats([codeData]).length === 0) {
        createElement(outNode, 'a', 'Localizar en pensum', ['btn-secondary', 'btn-disabled']);
        createElement(outNode, 'span', 'Esta materia no está visible actualmente.', ['explanatory']);
    } else {
        let a = createElement(outNode, 'a', 'Localizar en pensum', ['btn-secondary']);
        a.addEventListener('click', () => {
            dialog.hide();
            let x = safeForHtmlId(codeData.codigo); // im lazy, this part was moved.
            let targetCell = document.getElementById(`a_${x}`);
            let targetRow = document.getElementById(`r_${x}`);
            targetCell.scrollIntoView({ block: 'center' });
            targetRow.classList.remove('highlightRow');
            targetRow.classList.add('highlightRow');
            setTimeout(
                () => targetRow.classList.remove('highlightRow'),
                3e3
            );
        });
    }

    if (codeData.prereq.length > 0 || codeData.prereqExtra.length > 0) {
        createElement(outNode, 'h4', 'Pre-requisitos');
        for (let code of codeData.prereq)
            outNode.appendChild(createMatBtn(dialog, code));

        codeData.prereqExtra.forEach((x) => {
            let p = createElement(outNode, 'p');
            let s = document.createElement('a');
            s.innerText = x;
            s.classList.add('preReq');
            s.classList.add('preReqExtra');

            p.appendChild(s);
        });
    }

    if (codeData.postreq.length > 0) {
        createElement(outNode, 'h4', 'Es pre-requisito de: ');
        for (let code of codeData.postreq)
            outNode.appendChild(createMatBtn(dialog, code));
    }

    outNode.appendChild(dialog.createCloseButton());
    updateTakenPrereqClasses(outNode);
    return dialog;
}

// Creates a single clickable mat code, for use inside dialogs.
function createMatBtn(dialog, code) {
    let p = document.createElement('p');
    let s = document.createElement('a');
    s.innerText = `(${code}) ${currentPensumMats[code]?.asignatura || '?'}`;
    s.addEventListener('click', () => {
        dialog.hide();
        createMatDialog(code).show();
    });
    s.classList.add('preReq');
    s.classList.add('monospace');
    s.classList.add(`c_${safeForHtmlId(code)}`);
    s.classList.add(`c__`);

    p.appendChild(s);
    return p;
}

/** Adds or removes MANAGEMENT_TAKEN_CLASS to the related elements. */
function updateTakenPrereqClasses(node: HTMLElement | HTMLDocument = document) {
    for (let elem of node.getElementsByClassName('c__')) {
        elem.classList.remove(
            MANAGEMENT_TAKEN_CSS_CLASS,
            MANAGEMENT_ONCOURSE_CSS_CLASS,
            MANAGEMENT_SELECTED_CSS_CLASS,
            MANAGEMENT_ERROR_CSS_CLASS,
        );
    }

    for (let code of userProgress.passed) {
        code = safeForHtmlId(code);
        for (let elem of node.getElementsByClassName(`c_${code}`)) {
            elem.classList.add(MANAGEMENT_TAKEN_CSS_CLASS);
        }
    }
    for (let code of userProgress.onCourse) {
        code = safeForHtmlId(code);
        for (let elem of node.getElementsByClassName(`c_${code}`)) {
            elem.classList.add(MANAGEMENT_ONCOURSE_CSS_CLASS);
        }
    }
    for (let code of userProgress.selected) {
        code = safeForHtmlId(code);
        for (let elem of node.getElementsByClassName(`c_${code}`)) {
            elem.classList.add(MANAGEMENT_SELECTED_CSS_CLASS);
        }
    }
    for (let code of errorCodes) {
        code = safeForHtmlId(code);
        for (let elem of node.getElementsByClassName(`c_${code}`)) {
            elem.classList.add(MANAGEMENT_ERROR_CSS_CLASS);
        }
    }
}

/** Adds or removes MANAGEMENT_TAKEN_CLASS to a single element. */
function updateSingleTakenPrereqClasses(elem: HTMLElement) {
    var cl = elem.classList;
    if (!cl.contains('c__')) return;

    elem.classList.remove(
        MANAGEMENT_TAKEN_CSS_CLASS,
        MANAGEMENT_ONCOURSE_CSS_CLASS,
        MANAGEMENT_SELECTED_CSS_CLASS,
        MANAGEMENT_ERROR_CSS_CLASS,
    );

    for (let code of userProgress.passed) {
        code = safeForHtmlId(code);
        if (cl.contains(`c_${code}`))
            cl.add(MANAGEMENT_TAKEN_CSS_CLASS);
    }
    for (let code of userProgress.onCourse) {
        code = safeForHtmlId(code);
        if (cl.contains(`c_${code}`))
            cl.add(MANAGEMENT_ONCOURSE_CSS_CLASS);
    }
    for (let code of userProgress.selected) {
        code = safeForHtmlId(code);
        if (cl.contains(`c_${code}`))
            cl.add(MANAGEMENT_SELECTED_CSS_CLASS);
    }
    for (let code of errorCodes) {
        code = safeForHtmlId(code);
        if (cl.contains(`c_${code}`)) {
            cl.add(MANAGEMENT_ERROR_CSS_CLASS);
        }
    }
}

/**
 * Returns the following data for the given mats code array
 * (based on the loaded pensum):
 * - Current creds
 * - Total creds
 *
 * @param {*} matArray Array of mats codes (e.g. [ESP101, IDI033...])
 */
function analyseGradeProgress(matArray: typeof userProgress) {
    let out = {
        totalCreds: 0,
        passedCreds: 0,
        passedMats: 0,
        onCourseCreds: 0,
        onCourseMats: 0,
        totalMats: Object.keys(currentPensumMats).length,
    };

    for (let matCode in currentPensumMats) {
        let currentMatObj = currentPensumMats[matCode];
        out.totalCreds += currentMatObj.creditos;
        if (matArray.passed.has(matCode)) {
            out.passedCreds += currentMatObj.creditos;
            ++out.passedMats;
        }
        else if (matArray.onCourse.has(matCode)) {
            out.onCourseCreds += currentMatObj.creditos;
            ++out.onCourseMats;
        }
    }

    return out;
}

/** Creates n label-checkbox pairs */
function createCheckbox(node, labelName, onchange, initialState = false) {
    let objId = safeForHtmlId(labelName);

    let x = document.createElement('input');
    x.type = 'checkbox';
    x.id = objId;
    x.checked = initialState;
    x.addEventListener('change', onchange);
    node.appendChild(x);

    let l = document.createElement('label');
    l.innerText = labelName;
    l.htmlFor = objId;
    node.appendChild(l);

    return [x, l];
}

function createRadio(node, groupName = '', labelName = '', onchange = null, initialState = false) {
    let objId = safeForHtmlId(labelName);

    let x = document.createElement('input');
    x.type = 'radio';
    x.name = groupName;
    x.id = objId;
    x.checked = initialState;
    x.addEventListener('change', onchange);
    node.appendChild(x);

    let l = document.createElement('label');
    l.innerText = labelName;
    l.htmlFor = objId;
    node.appendChild(l);

    return [x, l];
}

/** Updates the element #toolboxWrapper */
function createToolbox() {
    let node = document.getElementById('toolboxWrapper');
    node.innerHTML = '';

    {
        let wrapper = createElement(node, 'div');
        createElement(wrapper, 'h4', 'Filtrar materias');
        let d = createElement(wrapper, 'form', null, ['filter-mode']);

        let a = [
            { label: 'Pendientes', key: 'pending' },
            { label: 'Cursando', key: 'onCourse' },
            { label: 'Pasadas', key: 'passed' },
        ];
        for (let x of a) {
            let fn = obj => {
                filterMode[x.key] = obj.target.checked;
                loadPensum();
                // TODO: Try to make filtering a bit more dynamic (dont redraw entire table)
            }
            createCheckbox(d, x.label, fn, filterMode[x.key]);
        }
    }

    {
        let wrapper = createElement(node, 'div');
        createElement(wrapper, 'h4', 'Modo de interacción');
        let d = createElement(wrapper, 'form', null, ['select-mode']);

        let a = [
            { label: 'Pasar', key: SelectMode.Passed },
            { label: 'Cursar', key: SelectMode.OnCourse },
            { label: 'Seleccionar', key: SelectMode.Select },
        ];
        for (let x of a) {
            let fn = () => userSelectMode = x.key;
            let selected = userSelectMode === x.key;
            createRadio(d, 'userSelect', x.label, fn, selected);
        }
    }

    {
        let wrapper = createElement(node, 'div');
        createElement(wrapper, 'h4', 'Seleccionados:');

        {
            let dw = createElement(wrapper, 'div', null, []);
            dw.id = 'selectedWrapper';
            updateSelectionBox();
        }

        let ibw = createElement(wrapper, 'div', null, ['inline-btn-wrapper']);
        {
            let b = [
                {
                    label: 'Deseleccionar todo',
                    action: () => {
                        userProgress.selected.clear();
                        updateTakenPrereqClasses();
                        updateSelectionBox();
                    },
                },
                {
                    label: 'Seleccionar visibles',
                    action: () => {
                        userProgress.selected = new Set(
                            filterMats(Object.values(currentPensumMats))
                                .map(x => x.codigo));
                        updateTakenPrereqClasses();
                        updateSelectionBox();
                    },
                },
                {
                    label: 'Seleccionar Cursando',
                    action: () => {
                        userProgress.selected = new Set([...userProgress.onCourse]);
                        updateTakenPrereqClasses();
                        updateSelectionBox();
                    },
                },
                {
                    label: 'Invertir selección',
                    action: () => {
                        let new_select = new Set<string>();
                        Object.values(currentPensumMats)
                            .map(x => x.codigo)
                            .forEach(x => { if (!userProgress.selected.has(x)) new_select.add(x); })
                        userProgress.selected = new_select;
                        updateTakenPrereqClasses();
                        updateSelectionBox();
                    },
                },
            ];
            let di = createElement(ibw, 'div', null, ['dropdown-wrapper']);
            let dul = createElement(di, 'ul', null, ['dropdown-ul']);
            createElement(di, 'span', 'Seleccionar...', ['dropdown-text', 'btn-secondary']);
            for (let actionBtn of b) {
                createElement(dul, 'li', actionBtn.label, [])
                    .addEventListener('click', actionBtn.action);
            }
        }

        {
            let b = [
                {
                    label: 'Asignar como "Pendiente(s)"',
                    action: () => {
                        userProgress.selected.forEach(x => {
                            removeBySelectMode(x, SelectMode.Passed);
                            removeBySelectMode(x, SelectMode.OnCourse);
                        });
                        updateTakenPrereqClasses();
                        updateGradeProgress();
                    },
                },
                {
                    label: 'Asignar como "Cursando"',
                    action: () => {
                        userProgress.selected.forEach(x => {
                            addBySelectMode(x, SelectMode.OnCourse);
                        });
                        updateTakenPrereqClasses();
                        updateGradeProgress();
                    },
                },
                {
                    label: 'Asignar como "Pasada(s)"',
                    action: () => {
                        userProgress.selected.forEach(x => {
                            addBySelectMode(x, SelectMode.Passed);
                        });
                        updateTakenPrereqClasses();
                        updateGradeProgress();
                    },
                },
            ];
            let di = createElement(ibw, 'div', null, ['dropdown-wrapper']);
            let dul = createElement(di, 'ul', null, ['dropdown-ul']);
            createElement(di, 'span', 'Acciones...', ['dropdown-text', 'btn-secondary']);
            for (let actionBtn of b) {
                createElement(dul, 'li', actionBtn.label, [])
                    .addEventListener('click', actionBtn.action);
            }
        }
    }
}

function processSelectedData(data: Set<string>) {
    let mats = Object.values(currentPensumMats).filter(x => data.has(x.codigo));
    let out = {
        materias: mats.length,
        creditos: mats.reduce((acc, v) => acc += v.creditos, 0),
        // if any more iterations are needed, use traditional loop pls!
    }
    return out;
}

function updateSelectionBox() {
    let node = document.getElementById('selectedWrapper');
    if (!node) return;
    node.innerHTML = '';

    let data = userProgress.selected;
    let pData = processSelectedData(data);

    let dataTable = document.createElement('table');
    {
        let r = dataTable.insertRow();
        let c1 = r.insertCell();
        c1.innerText = 'Materias';
        let c2 = r.insertCell();
        c2.innerText = pData.materias.toString();
    }
    {
        let r = dataTable.insertRow();
        let c1 = r.insertCell();
        c1.innerText = 'Creditos';
        let c2 = r.insertCell();
        c2.innerText = pData.creditos.toString();
    }

    node.appendChild(dataTable);
}

/** Updates the element #progressWrapper with data
 * related to the user's mats selection */
function updateGradeProgress() {
    let progressData = analyseGradeProgress(userProgress);

    let node = document.getElementById('progressWrapper');
    node.innerHTML = '';

    var n1 = ((100 * progressData.passedCreds) / progressData.totalCreds);
    var n2 = ((100 * progressData.onCourseCreds) / progressData.totalCreds);
    let bg = [
        'linear-gradient(to right, ',
        `var(--progress-bar-green) ${n1.toFixed(2)}%, `,
        `var(--progress-bar-yellow) ${n1.toFixed(2)}%, `,
        `var(--progress-bar-yellow) ${(n1 + n2).toFixed(2)}%, `,
        `var(--background) ${(n1 + n2).toFixed(2)}%)`,
    ].join('');
    node.style.backgroundImage = bg;

    createElement(node, 'h3', 'Progreso en la carrera: ');
    let ul = createElement(node, 'ul');

    // Percent of mats
    var mp = ((100 * progressData.passedMats) / progressData.totalMats);
    var mc = ((100 * progressData.onCourseMats) / progressData.totalMats);
    createElement(ul, 'li', `Materias aprobadas: ${progressData.passedMats}/${progressData.totalMats} (${mp.toFixed(2)}%)`);
    createElement(ul, 'li', `Creditos aprobados: ${progressData.passedCreds}/${progressData.totalCreds} (${n1.toFixed(2)}%)`);
    createElement(ul, 'li', `Materias en curso: +${progressData.onCourseMats}/${progressData.totalMats} (+${mc.toFixed(2)}%)`);
    createElement(ul, 'li', `Creditos en curso: +${progressData.onCourseCreds}/${progressData.totalCreds} (+${n2.toFixed(2)}%)`);
}

/**
 * Recreates the pensumData, as a new formatted table.
 * Cols:
 *  - CUAT indicator
 *  - Codigo
 *  - Nombre
 *  - Creds
 *  - Prereq
 * @param {*} data
 */
function createNewPensumTable(data: i_pensum) {
    let out = document.createElement('table');

    // Create the header
    let headerRow = out.createTHead();
    for (let x of [
        'Ct',
        '✔',
        'Codigo',
        'Asignatura',
        'Créditos',
        'Pre-requisitos',
    ]) {
        let a = document.createElement('th');
        a.innerText = x;
        headerRow.appendChild(a);
    }

    for (const [idxCuat, cuat] of data.cuats.entries()) {

        // new table per cuat
        const filteredCuat = filterMats(cuat);
        if (filteredCuat.length === 0) continue;

        // First row (cuat number)
        {
            let row = out.insertRow();
            let a = document.createElement('th');

            a.rowSpan = filteredCuat.length + 1;
            let t = (filteredCuat.length === 1) ? 'C.' : 'Cuat. ';
            let p = createElement(a, 'p', `${t}${idxCuat + 1}`, ['vertical-text']);

            row.classList.add('cuatLimit');
            a.classList.add('cuatHeader');

            // Allow all cuats selection
            // TODO: Do with a SELECT_MODE TOOL instead
            a.addEventListener('click', () => {
                // Check if all are checked
                let currentCuatMats = cuat.map(x => x.codigo);

                if (userSelectMode === SelectMode.Select) {
                    // Standard behaviour
                    let selectSet = getUserProgressList(userSelectMode);
                    let selectedCuatMats = currentCuatMats.filter(x => selectSet.has(x));

                    // If all are checked, uncheck, else check.
                    if (currentCuatMats.length === selectedCuatMats.length) {
                        currentCuatMats.forEach(x => removeBySelectMode(x, userSelectMode));
                    } else {
                        currentCuatMats.forEach(x => addBySelectMode(x, userSelectMode));
                    }
                }
                else {
                    let { passed, onCourse } = userProgress;
                    let [main, second] = (userSelectMode === SelectMode.Passed) ? [passed, onCourse] : [onCourse, passed];

                    /**
                     * Cases:
                     * - All unselected: just add all
                     * - All on both, none unselected: finish adding all (same as prev.)
                     * - All on main: remove all;
                     * - Some holes: set holes only.
                     */
                    let onMain = currentCuatMats.filter(x => main.has(x));
                    let onSecond = currentCuatMats.filter(x => second.has(x));
                    let unselected = currentCuatMats.filter(x => !main.has(x) && !second.has(x));
                    let n = currentCuatMats.length;

                    let allOnMain = onMain.length === n;
                    let allOnBoth = onMain.length + onSecond.length === n;
                    let allUnselected = unselected.length === n;

                    if (allOnMain) {
                        onMain.forEach(x => removeBySelectMode(x, userSelectMode));
                    } else if (allUnselected || allOnBoth) {
                        currentCuatMats.forEach(x => addBySelectMode(x, userSelectMode));
                    } else { // someUnselected
                        unselected.forEach(x => addBySelectMode(x, userSelectMode));
                    }
                }

                loadPensum();
            });
            row.appendChild(a);
        }

        // Mat rows
        for (const mat of filteredCuat) {
            let row = out.insertRow();
            let code = safeForHtmlId(mat.codigo);
            row.id = `r_${code}`;
            row.classList.add(`c_${code}`);
            row.classList.add(`c__`);

            // Selection checkbox
            {
                let r = row.insertCell();
                r.classList.add('text-center');
                r.classList.add('managementMode-cell');

                let s = document.createElement('div');
                s.classList.add('mat-clickable')
                //if (userProgress.passed.has(mat.codigo)) s.checked = true;

                s.addEventListener('click', () => {
                    let selectSet = getUserProgressList(userSelectMode);
                    if (selectSet.has(mat.codigo))
                        removeBySelectMode(mat.codigo, userSelectMode);
                    else
                        addBySelectMode(mat.codigo, userSelectMode);

                    updateTakenPrereqClasses();
                    updateGradeProgress();

                    loadPensum();
                });

                r.appendChild(s);
            }


            // Codigo mat.
            {
                let r = row.insertCell();
                r.id = `a_${code}`;
                r.classList.add('text-center');
                r.classList.add(`c_${code}`);
                r.classList.add(`c__`);

                let s = document.createElement('a');
                s.innerText = `${mat.codigo}`;
                s.addEventListener('click', () => {
                    createMatDialog(mat.codigo).show();
                });
                s.classList.add('codigo');
                s.classList.add('monospace');

                r.appendChild(s);
            }


            // Asignatura
            row.insertCell().innerText = mat.asignatura;


            // Creditos
            {
                let r = row.insertCell();
                r.innerText = mat.creditos.toString();
                r.classList.add('text-center');
            }


            // Prereqs
            {
                let r = row.insertCell();

                mat.prereq.forEach((x) => {
                    let s = document.createElement('a');
                    s.innerText = x;
                    s.addEventListener('click', () => {
                        createMatDialog(x).show();
                    });
                    s.classList.add('preReq');
                    s.classList.add('monospace');
                    s.classList.add(`c_${safeForHtmlId(x)}`); // mat's code
                    s.classList.add(`c__`);

                    r.appendChild(s);
                    r.appendChild(document.createTextNode('\t'));
                });

                mat.prereqExtra.forEach((x) => {
                    let s = document.createElement('a');
                    s.innerText = x;
                    s.classList.add('preReq');
                    s.classList.add('preReqExtra');

                    r.appendChild(s);
                    r.appendChild(document.createTextNode('\t'));
                });
            }

        }
    }

    updateTakenPrereqClasses(out);
    updateGradeProgress();
    updateSelectionBox();

    return out;
}

//** Filters the given mat[] according to filterMode */
function filterMats(mats: i_mat_raw[]) {
    if (Object.values(filterMode).every(x => x))
        return mats;

    return mats.filter(x =>
        (filterMode.onCourse && userProgress.onCourse.has(x.codigo)) ||
        (filterMode.passed && userProgress.passed.has(x.codigo)) ||
        (filterMode.pending) && (!userProgress.onCourse.has(x.codigo) && !userProgress.passed.has(x.codigo)));
}

function addBySelectMode(mat: string, mode: SelectMode) {
    switch (mode) {
        case (SelectMode.Select):
            userProgress.selected.add(mat);
            updateSelectionBox();
            break;
        case (SelectMode.OnCourse):
            userProgress.passed.delete(mat);
            userProgress.onCourse.add(mat);
            break;
        case (SelectMode.Passed):
            userProgress.onCourse.delete(mat);
            userProgress.passed.add(mat);
            break;
        default:
            break;
    }
}

function removeBySelectMode(mat: string, mode: SelectMode) {
    switch (mode) {
        case (SelectMode.Select):
            userProgress.selected.delete(mat);
            updateSelectionBox();
            break;
        case (SelectMode.OnCourse):
            userProgress.onCourse.delete(mat);
            break;
        case (SelectMode.Passed):
            userProgress.passed.delete(mat);
            break;
        default:
            break;
    }
}

/**
 * Recreates the pensumData, as a new formatted table.
 * Cols:
 *  - CUAT indicator
 *  - Codigo
 *  - Nombre
 *  - Creds
 *  - Prereq
 */
function createExcelWorkbookFromPensum(data: i_pensum, progress = []) {
    let currentProgress = new Set(progress);

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Pensum');

    ws['!ref'] = 'A1:H300'; // Working range

    ws['!merges'] = [];
    function mergeCells(r1, c1, r2, c2) {
        ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
    }

    let COL_CUAT = 'A';
    let COL_CODIGO = 'B';
    let COL_NOMBRE = 'C';
    let COL_CREDITOS = 'D';
    let COL_PREREQ = 'EFG';
    let COL_APROB = 'H';

    let COLS = 'ABCDEFGH';

    ws['!cols'] = [
        { width: 3 },
        { width: 9 },
        { width: 50 },
        { width: 7 },
        { width: 9 },
        { width: 9 },
        { width: 9 },
        { width: 5 },
    ];

    let currentRow = 1;

    ws[COLS[0] + currentRow] = { v: data.carrera, t: 's' };
    mergeCells(0, 0, 0, 7);
    ++currentRow;

    // create the header
    let headers = [
        'Ct',
        'Codigo',
        'Asignatura',
        'Créditos',
        'Pre-req #1',
        'Pre-req #2',
        'Pre-req #3',
        'Aprobada?',
    ];
    for (let i = 0; i < headers.length; ++i) {
        ws[COLS[i] + currentRow] = { v: headers[i], t: 's' };
    }
    ++currentRow;

    // create the contents
    data.cuats.forEach((cuat, idxCuat) => {
        var filteredCuat = cuat;

        filteredCuat.forEach((mat, idxMat, currentCuat) => {
            ws[COL_CUAT + currentRow] = { v: idxCuat + 1, t: 'n' };
            if (idxMat === 0) {
                mergeCells(
                    currentRow - 1,
                    0,
                    currentRow - 1 + currentCuat.length - 1,
                    0
                );
            }

            // Codigo mat.
            ws[COL_CODIGO + currentRow] = { v: mat.codigo, t: 's' };

            // Asignatura
            ws[COL_NOMBRE + currentRow] = { v: mat.asignatura, t: 's' };

            // Creditos
            ws[COL_CREDITOS + currentRow] = { v: mat.creditos, t: 'n' };

            // Prereqs
            let prereqCount = 0;
            for (let x of mat.prereq) {
                ws[COL_PREREQ[prereqCount] + currentRow] = { v: x, t: 's' };
                ++prereqCount;
            }
            for (let x of mat.prereqExtra) {
                ws[COL_PREREQ[prereqCount] + currentRow] = { v: x, t: 's' };
                ++prereqCount;
            }

            // Aprobada
            let aprobVal = currentProgress.has(mat.codigo) ? 1 : 0;
            ws[COL_APROB + currentRow] = { v: aprobVal, t: 'n' };

            ++currentRow;
        });
    });

    try {
        let [cd_d, cd_m, cd_y] = data.vigencia
            .split('/')
            .map((x) => parseFloat(x));
        var createDate = new Date(cd_y, cd_m, cd_d);
    } catch {
        var createDate = new Date();
    }

    wb.Props = {
        Title: `Pensum ${data.codigo} ${titleCase(data.carrera)}`,
        CreatedDate: createDate,
    };

    return wb;
}

function createExcelWorkbookFromData(arrayOfArrays, SheetName, Props) {
    var wb = XLSX.utils.book_new();
    wb.Props = Props || { Title: SheetName };
    wb.SheetNames.push(SheetName);

    var ws = XLSX.utils.aoa_to_sheet(arrayOfArrays);
    wb.Sheets[SheetName] = ws;

    return wb;
}

function writeExcelWorkbookAsXlsx(wb) {
    var wb_out = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    return wb_out;
}

function downloadXlsx(wb_out, fileNameWithoutExt) {
    var fileName = fileNameWithoutExt + '.xlsx';

    // Convert binary data to octet stream
    var buf = new ArrayBuffer(wb_out.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf); //create uint8array as viewer
    for (var i = 0; i < wb_out.length; i++)
        view[i] = wb_out.charCodeAt(i) & 0xff; //convert to octet

    // Download
    let blob = new Blob([buf], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName);
}

function downloadCurrentPensumAsExcel() {
    let wb = createExcelWorkbookFromPensum(currentPensumData);
    let wb_out = writeExcelWorkbookAsXlsx(wb);
    downloadXlsx(wb_out, wb.Props.Title);
}

/** Extracts and separates the information on 'data.infoCarrera' */
function getInfoList(data) {
    return data.infoCarrera.map((x) => {
        let splitOnFirstColon = [
            x.substring(0, x.indexOf(': ')),
            x.substring(x.indexOf(': ') + 2),
        ];
        if (splitOnFirstColon[0] == '') return { type: 'simple', data: x };
        else {
            let splitOnDots = splitOnFirstColon[1].split('. ');
            if (splitOnDots.length == 1)
                return { type: 'double', data: splitOnFirstColon };
            else
                return {
                    type: 'double_sublist',
                    data: [splitOnFirstColon[0], splitOnDots],
                };
        }
    });
}

/**
 * Creates a table that contains the pensum's general info.
 * @param {*} data
 */
function createInfoList(data) {
    /** @type {HTMLTableElement} */
    let out = document.createElement('ul');

    // Separate the text before outputting.
    let outTextArr = getInfoList(data);

    // Format the text as a list
    for (let x of outTextArr) {
        let li = document.createElement('li');
        switch (x.type) {
            case 'simple':
                li.innerText = x.data;
                break;
            case 'double':
                li.innerHTML = `<b>${sentenceCase(x.data[0])}:</b>\t${x.data[1]
                    }`;
                break;
            case 'double_sublist':
                li.innerHTML = `<b>${sentenceCase(x.data[0])}: </b>`;
                var subul = document.createElement('ul');
                x.data[1].forEach((elem) => {
                    let subli = document.createElement('li');
                    subli.innerHTML = elem + '.';
                    subul.appendChild(subli);
                });
                li.appendChild(subul);
                break;
        }
        out.appendChild(li);
    }

    return out;
}

//#endregion

//#region Dialogs
function createImportExportDialog() {
    let dialog = new DialogBox();
    let node = dialog.contentNode;

    createElement(node, 'h3', 'Exportar/importar progreso');
    [
        'Las materias aprobadas seleccionadas se guardan localmente en la cache del navegador. ' +
        'Al estar guardados en la cache, estos datos podrian borrarse con una actualización. ',
        'Para evitar la perdida de estos datos, se recomienda exportar la seleccion como un archivo (<code>progreso.json</code>). ',
    ].forEach((x) => createElement(node, 'p', x));

    node.appendChild(document.createElement('br'));

    node.appendChild(
        createSecondaryButton('Exportar progreso.json', downloadProgress)
    );
    node.appendChild(
        createSecondaryButton('Importar progreso.json', uploadProgress)
    );
    node.appendChild(
        createSecondaryButton('Reiniciar selección', () => {
            if (confirm('Seguro que desea reiniciar la selección?')) {
                userProgress.passed = new Set();
                userProgress.onCourse = new Set();
                userProgress.selected = new Set();
                alert('Selección reiniciada.');
                dialog.hide();
                drawPensumTable();
            }
        })
    );

    node.appendChild(document.createElement('br'));

    createElement(node, 'h3', 'Descargar pensum en otros formatos');
    node.appendChild(
        createSecondaryButton(
            `Descargar .xlsx (Excel)`,
            downloadCurrentPensumAsExcel
        )
    );
    node.appendChild(
        createSecondaryButton(
            `[Para pruebas] Descargar .json`,
            () => downloadPensumJson(currentPensumData),
            ['note']
        )
    );
    node.appendChild(
        createSecondaryButton(
            `[Para pruebas] Cargar desde .json`,
            loadPensumFromJson,
            ['note']
        )
    );

    node.appendChild(document.createElement('br'));
    node.appendChild(dialog.createCloseButton());
    return dialog;
}

//#endregion


//#region Org chart

function createOrgChartOptions(onTemplateRender = null, selected = null) {
    // Generate orgchart
    var options = new primitives.FamConfig();
    var items = matsToOrgChart(currentPensumData.cuats.flat(), errorCodes);

    options = {
        ...options,
        pageFitMode: primitives.PageFitMode.None,
        items: items,

        // Rendering
        arrowsDirection: primitives.GroupByType.Children,
        linesWidth: 3,
        linesColor: 'black',
        normalLevelShift: 30,
        lineLevelShift: 20,
        dotLevelShift: 20,
        alignBylevels: true,
        hideGrandParentsConnectors: true,

        // templates
        templates: [getMatTemplate()],
        onItemRender: onTemplateRender,

        // Buttons
        hasButtons: primitives.Enabled.True,
        buttonsPanelSize: 38,

        // Extras
        hasSelectorCheckbox: primitives.Enabled.False,
        showCallout: false,
        scale: 0.7,
        selectedItems: selected || [],
    }
    return options;
}


function createOrgChartDialog(selected = null) {
    let dialog = new DialogBox();
    let node = dialog.contentNode;

    // Title
    createElement(node, 'h3', currentPensumData.carrera || 'Diagrama de pensum');


    // Diagram
    let chartContainer = createElement(node, 'div');
    chartContainer.style.width = '90vw';
    chartContainer.style.height = '60vh';

    var options = createOrgChartOptions((e, d) => onWebTemplateRender(e, d, dialog), selected);
    var control = primitives.FamDiagram(chartContainer, options);
    window['control'] = control;


    // Zoom slider
    node.appendChild(document.createElement('br'));

    var sizeContainer = createElement(node, 'div');
    createElement(sizeContainer, 'span', 'Zoom: ');
    var size = createElement(sizeContainer, 'input') as any;
    size.type = 'range';
    size.min = -4;
    size.max = 2;
    size.step = 0.01;
    size.value = Math.log(0.7) / Math.log(2);
    size.style.width = '100%';
    size.addEventListener('input', () => {
        var pVal = parseFloat(size.value);
        var newVal = 2 ** pVal;
        control.setOption('scale', newVal);
        control.update(primitives.UpdateMode.Refresh);
    })


    // Buttons
    node.appendChild(
        createSecondaryButton(
            `📄 Descargar documento .pdf`,
            () => downloadOrgChartPdf()
        )
    );
    node.appendChild(
        createSecondaryButton(
            `🖼 Descargar imagen .png`,
            () => downloadOrgChartPng()
        )
    );
    node.appendChild(dialog.createCloseButton());
    dialog.show();

    // @ts-ignore
    new ResizeObserver(() => control.update(primitives.UpdateMode.Refresh)).observe(node);

    return [dialog, control];
}

function createOrgChartPdf() {
    var options = createOrgChartOptions(onPdfTemplateRender);
    var chart = primitives.FamDiagramPdfkit({
        ...options,
        cursorItem: null,
        hasSelectorCheckbox: primitives.Enabled.False
    });

    var chartSize = chart.getSize();

    var doc = new PDFDocument({
        size: [chartSize.width + 100, chartSize.height + 150]
    });
    var stream = doc.pipe(blobStream());

    doc.save();
    doc.fontSize(25).text(`[${currentPensumData.codigo}] ${currentPensumData.carrera}`);


    chart.draw(doc, 30, 100);
    doc.restore();
    doc.end();
    return stream;
}

function downloadOrgChartPng(resize = 1.5) {
    var stream = createOrgChartPdf();

    if (typeof stream !== 'undefined') {
        stream.on('finish', async function () {
            var blob = stream.toBlob('application/pdf');
            var buffer = await blob.arrayBuffer();

            // Load page
            var pdf = await pdfjsLib.getDocument(buffer).promise;
            console.log(pdf);
            var page = await pdf.getPage(1)
            var scale = 1;
            var viewport = page.getViewport(scale).viewBox;

            // Render to canvas
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            var context = canvas.getContext('2d');
            canvas.width = resize * viewport[2];
            canvas.height = resize * viewport[3];

            // Flip before rendering
            context.save();
            context.translate(0, canvas.height);
            context.scale(resize, -resize);
            var task = page.render({ canvasContext: context, viewport: viewport })
            await task.promise;
            context.restore();

            // Save as png string
            var png = canvas.toDataURL('image/png');

            // Remove canvas
            document.body.removeChild(canvas);

            // Download
            let name = currentPensumData.codigo + '_' + getDateIdentifier();
            FileSaver.saveAs(png, name + '.png');
        });
    } else {
        alert('Error: Failed to create file pdf!');
    }
}

function downloadOrgChartPdf() {
    var stream = createOrgChartPdf();
    if (typeof stream !== 'undefined') {
        stream.on('finish', function () {
            var string = stream.toBlob('application/pdf');
            let name = currentPensumData.codigo + '_' + getDateIdentifier();
            FileSaver.saveAs(string, name + '.pdf');
        });
    } else {
        alert('Error: Failed to create file pdf!');
    }
}

//#endregion

//#region OrgChart templates

function matsToOrgChart(mats: i_mat_raw[], errorCodes: Set<string> = new Set()) {
    let o = [];
    for (let i = 0; i < mats.length; ++i) {
        let x = mats[i];
        let y = {
            id: x.codigo,
            parents: x.prereq || "base",
            primaryParent: x.prereq || null,
            //relativeItem: mats[i - 1] || null,
            templateName: 'matTemplate',
            error: false,
            ...x
        };
        o.push(y);
    }
    for (let i = 0, ec = [...errorCodes], l = ec.length; i < l; ++i) {
        let x = ec[i];
        let y = {
            id: x,
            parents: "base",
            templateName: 'matTemplate',
            asignatura: '???',
            codigo: x,
            creditos: '0',
            cuatrimestre: '???',
            error: true,
        };
        o.push(y);
    }
    return o;
}

function onWebTemplateRender(event, data, dialog = null) {
    switch (data.renderingMode) {
        case primitives.RenderingMode.Create:
            /* Initialize template content here */
            break;
        case primitives.RenderingMode.Update:
            /* Update template content here */
            break;
    }

    var itemConfig = data.context as i_mat;


    if (data.templateName == "matTemplate") {
        var e = data.element as HTMLElement;
        var en = (name) => getElementByName(e, name);

        // Remove old classes, since this OrgChart lib reuses elements
        var removeOld = [];
        for (
            var i = 0, l = e.classList.length, comp = 'c_' + safeForHtmlId(itemConfig.codigo);
            i < l; ++i) {
            if (/c_.{2,}/.test(e.classList[i]) && comp !== e.classList[i]) {
                removeOld.push(e.classList[i]);
            }
        }
        e.classList.remove(...removeOld);

        e.classList.add(`c_${safeForHtmlId(itemConfig.codigo)}`);
        updateSingleTakenPrereqClasses(e);


        // var titleBackground = en('titleBackground'); //data.element.firstChild;
        // titleBackground.style.backgroundColor = primitives.Colors.RoyalBlue;//itemConfig.itemTitleColor || primitives.Colors.RoyalBlue;

        en('title').textContent = itemConfig.asignatura;
        en('codigo').textContent = '[' + itemConfig.codigo + ']';
        en('cred_top').textContent = itemConfig.creditos.toString();
        en('cred_top').setAttribute('value', itemConfig.creditos.toString())
        en('creditos').textContent = 'Cuatrim.: ' + itemConfig.cuatrimestre;
    }
}

function onPdfTemplateRender(doc, pos, data) {
    var itemConfig = data.context as i_mat;

    if (data.templateName != "matTemplate") return

    var contentSize = new primitives.Size(200, 100);

    // Container box color
    let code = itemConfig.codigo;
    let statusColor;
    if (userProgress.passed.has(code))
        statusColor = '#e6ffe8';    // Green
    else if (userProgress.onCourse.has(code))
        statusColor = '#fff9de';    // Yellow
    else if (errorCodes.has(code))
        statusColor = '#ff4444';    // Red (error)
    else
        statusColor = '#f2f9ff'; // Default Blue

    // Container box
    doc.roundedRect(pos.x, pos.y, pos.width, pos.height, 5)
        .fill(statusColor);

    doc.roundedRect(pos.x + 0.5, pos.y + 0.5, pos.width - 1, pos.height - 1, 5)
        .lineWidth(1)
        .stroke('#dddddd');

    // Credito value
    let credValue = {
        0: '#eb9cff',
        1: '#c5f25c',
        2: '#ffc773',
        3: '#f57936',
        def: '#cf1f1f'
    };

    doc.polygon(
        [pos.x + pos.width - 30, pos.y],
        [pos.x + pos.width, pos.y],
        [pos.x + pos.width, pos.y + 30],
    ).fill(credValue[itemConfig.creditos] || credValue['def']);

    doc.fillColor('white')
        .font('Helvetica', 12)
        .text(itemConfig.creditos,
            pos.x + pos.width - 12,
            pos.y + 7,
            {
                ellipsis: false,
                width: 10,
                height: 1,
                align: 'right'
            });

    // Codigo
    doc.fillColor('black')
        .font('Helvetica', 14)
        .text(`[${itemConfig.codigo}]`,
            pos.x + 7,
            pos.y + 7,
            {
                ellipsis: false,
                width: (contentSize.width - 7 - 7),
                height: 16,
                align: 'center'
            });

    // Title (asignatura)
    doc.fillColor('black')
        .font('Helvetica', 18)
        .text(itemConfig.asignatura,
            pos.x + 7,
            pos.y + 7 + 16 + 5, {
            ellipsis: false,
            width: (contentSize.width - 7 - 7),
            height: 60,
            align: 'center'
        });

    doc.restore;
}

function getElementByName(parent: HTMLElement, name: string) {
    return parent.querySelector(`[name = ${name}]`);
}

function getMatTemplate() {
    var result = new primitives.TemplateConfig();
    result.name = "matTemplate";
    result.itemSize = new primitives.Size(200, 100);
    result.minimizedItemSize = new primitives.Size(3, 3);

    /* the following example demonstrates JSONML template see http://http://www.jsonml.org/ for details: */
    result.itemTemplate = ["div",
        {
            "style": {
                "width": result.itemSize.width + "px",
                "height": result.itemSize.height + "px"
            },
            "class": ["bp-item", "bp-corner-all", "monospace", "c__", "preReq"]
        },
        ["div",
            {
                "name": "cred_top",
                "class": ["bp-cred"],
            }
        ],
        ["div",
            {
                "name": "codigo",
                "class": ["bp-txt"],
                "style": {
                    fontSize: "12px",
                    margin: "0 .5em",
                    "text-align": "center",
                }
            }
        ],
        ["div",
            {
                "name": "title",
                "class": ["bp-title", "bp-head"],
                "style": {
                    width: "100%",
                    margin: ".5em .5em 0",
                }
            }
        ],
        ["div",
            {
                "name": "creditos",
                "class": ["bp-txt"],
                "style": {
                    fontSize: "12px",
                    margin: "0 .5em",
                }
            }
        ],
        ["div",
            {
                "name": "cuatrimestre",
                "class": ["bp-txt"],
                "style": {
                    fontSize: "12px",
                    margin: "0 .5em",
                }
            }
        ],
    ];
    return result;
}

//#region LocalStorage Funcs

/** Creates a SaveObject */
function createSaveObject() {
    return {
        saveVer: saveVer,
        currentCodeAtInputForm: (document.getElementById(
            'codigoMateria'
        ) as HTMLInputElement).value,
        userData: {
            passed: [...userProgress.passed],
            onCourse: [...userProgress.onCourse],
            selected: [...userProgress.selected],
        },
        filterMode: { ...filterMode },
        selectMode: userSelectMode,
    };
}

/** Loads a SaveObject from saveToObject */
function loadFromObject(obj) {
    (document.getElementById('codigoMateria') as HTMLInputElement).value =
        obj.currentCodeAtInputForm;

    // Up to SaveVer 4
    if (obj.progress) userProgress.passed = new Set(obj.progress);

    // > SaveVer 5
    if (obj.userData) {
        let ud = obj.userData;
        if (ud.passed) userProgress.passed = new Set(ud.passed);
        if (ud.onCourse) userProgress.onCourse = new Set(ud.onCourse);
        if (ud.selected) userProgress.selected = new Set(ud.selected);
    }

    if (obj.filterMode) Object.assign(filterMode, obj.filterMode);
    if (obj.selectMode) userSelectMode = obj.selectMode;
    return true;
}




function saveToLocalStorage() {
    let out = createSaveObject();
    if (!SAVE_TO_LOCALSTORAGE) return false;

    try {
        localStorage.setItem(SAVE_DATA_LOCALSTORAGE, JSON.stringify(out));
        return true;
    } catch (err) {
        console.warn('Could not save saveData to localStorage');
        console.warn(err);
        return false;
    }
}


function loadFromLocalStorage() {
    let saveData = localStorage.getItem(SAVE_DATA_LOCALSTORAGE);
    if (saveData === null) return false;

    let out = JSON.parse(saveData);
    loadFromObject(out);

    // Version management and cache clearing.
    if (out.saveVer !== saveVer) {
        console.info(`Updated from ${out.saveVer} to version ${saveVer}.`);
        localStorage.clear();
    }
    return true;
}

//#endregion

//#region Helper functions

/**
 *
 * @param {String} url address for the HTML to fetch
 * @param {String} cacheOpt cache policy, defaults to force-cache,
 * but if cache must be reloaded, do 'relaod'.
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
 * @return {String} the resulting HTML string fragment
 */
async function fetchHtmlAsText(
    url,
    opts: any = {},
    forceProxy = -1,
    currentProxyCallback = null
) {
    const corsOverride = [
        '',                                     // no proxy
        'https://api.allorigins.win/raw?url=',
        'https://yacdn.org/serve/',
        'https://cors-anywhere.herokuapp.com/', // has request limit (200 per hour)
        'https://crossorigin.me/',
        'https://cors-proxy.htmldriven.com/?url=', // Fails with CORS (what!?)
        'https://thingproxy.freeboard.io/fetch/', // problems with https requests
        'http://www.whateverorigin.org/get?url=', // problems with https requests, deprecated?
    ];

    let i = 0;
    while (i < corsOverride.length) {
        var currProxy = corsOverride[i];
        if (forceProxy !== -1) {
            if (typeof forceProxy == 'number')
                currProxy = corsOverride[forceProxy];
            else currProxy = forceProxy;
        }

        try {
            var controller = new AbortController();
            var signal = controller.signal;
            opts.signal = signal;

            var timeoutId = setTimeout(() => {
                controller.abort();
                console.warn('Timed out!');
            }, 4e3);
            var sendDate = new Date().getTime();

            var currUrl = currProxy + url;
            var response = await fetch(currUrl, opts);

            if (currentProxyCallback)
                currentProxyCallback('request', currProxy, i);

            clearTimeout(timeoutId);
            if (response.ok) {
                var recieveDate = new Date().getTime();
                console.info(`CORS proxy '${currUrl}' succeeded in ${recieveDate - sendDate} ms.'`);

                if (currentProxyCallback)
                    currentProxyCallback('success', currProxy, i);

                return await response.text();
            } else {
                throw 'Response was not OK!';
            }
        } catch (err) {
            clearTimeout(timeoutId);
            var recieveDate = new Date().getTime();
            console.warn(`CORS proxy '${currProxy}' failed in ${recieveDate - sendDate}ms.'`);
            console.warn(err);

            if (currentProxyCallback)
                currentProxyCallback('error', currProxy, i);
        } finally {
            ++i;
        }
    }
    return null;
}

function titleCase(string) {
    var sentence = string.toLowerCase().split(' ');
    for (var i = 0; i < sentence.length; i++) {
        sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(' ');
}

function sentenceCase(string) {
    var sentence = string.toLowerCase();
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/** Simple class that creates a full-screen node */
class DialogBox {
    /** The node that will contain the info to show.
     *
     * Remember to add a close button! */
    contentNode;

    /** Wrapper node that holds contentNode.
     *
     * This node determines the visibility of the DialogBox,
     * and will display as a fixed fullscreen element. */
    wrapperNode;

    constructor() {
        this.wrapperNode = document.createElement('div');
        this.wrapperNode.classList.add('fullscreen');
        this.wrapperNode.classList.add('dialogWrapper');

        this.contentNode = document.createElement('div');
        this.contentNode.classList.add('dialogCard');
        this.wrapperNode.appendChild(this.contentNode);

        this.wrapperNode.addEventListener('click', (evt) => {
            if (evt.target === this.wrapperNode) {
                this.hide();
            }
        })

        return this;
    }

    /** Sets the contentNode to a single <p> element with the given text. */
    setMsg(str) {
        createElement(this.contentNode, 'p', str);
        this.contentNode.appendChild(this.createCloseButton());
        return this;
    }

    /** Adds the wrapperNode to the document, thus showing the DialogBox. */
    show() {
        document.body.appendChild(this.wrapperNode);
        return this;
    }

    /** Removes the wrapperNode from the document, thus hiding the DialogBox. */
    hide() {
        document.body.removeChild(this.wrapperNode);
        return this;
    }

    /** Creates a generic 'close' button that can be appended to contentNode. */
    createCloseButton() {
        let a = document.createElement('a');
        a.innerText = 'Cerrar';
        a.addEventListener('click', () => this.hide());
        a.classList.add('btn-primary');
        return a;
    }
}

function downloadObjectAsJson(exportObj, exportNameWithoutExt) {
    var blob = new Blob([JSON.stringify(exportObj)], {
        type: 'data:text/json;charset=utf-8',
    });
    FileSaver.saveAs(blob, exportNameWithoutExt + '.json');
}

function createElement(
    parentNode,
    tag = 'div',
    innerHTML = null,
    classes = []
) {
    let x = document.createElement(tag);
    parentNode.appendChild(x);
    if (innerHTML !== null) x.innerHTML = innerHTML;
    if (classes.length)
        x.classList.add(...classes);
    return x;
}

function createSecondaryButton(text, callback, classes = []) {
    let a = document.createElement('a');
    a.addEventListener('click', callback);
    a.innerHTML = text;
    a.classList.add('btn-secondary', ...classes);
    return a;
}

function findAllpostreqs(code) {
    function subFindArr(code) {
        let hideList = [code];
        for (let x of currentPensumMats[code].postreq)
            hideList.push(...subFindArr(x));
        return hideList;
    }

    // Set to remove duplicates.
    return [...new Set(subFindArr(code))];
}

/** Replaces spaces to underscores. */
function safeForHtmlId(str: string) {
    return str.replace(/ /g, '_')
}

//#endregion

//#region Init

/** This function is called by the <search> button */
async function loadPensum(customPensum: i_pensum = null) {
    var infoWrap = document.getElementById('infoWrapper');

    // currentProxyCallback('request', currProxy, i);
    let codigoMateriaInput = document.getElementById(
        'codigoMateria'
    ) as HTMLInputElement;
    currentPensumCode = codigoMateriaInput.value.trim().toUpperCase();

    // helper functions
    const clearInfoWrap = () => {
        infoWrap.innerHTML = '';
    };
    const setInfoWrap = (str) => {
        infoWrap.innerHTML = str;
    };

    if (currentPensumCode === '') {
        let carr = CARRERAS.slice(0, 16); // 17 and onward are too long and not so popular.
        let rpci = Math.round(Math.random() * (carr.length - 1));
        let rpc = carr[rpci] ?? { codigo: "DIG10", nombre: "LICENCIATURA EN DISEÑO GRAFICO", escuela: "Decanato de Artes y Comunicación" };
        let rpcn = rpc.nombre.split(' ').filter(x => !['LICENCIATURA', 'EN', 'DE', 'INGENIERIA'].includes(x)).join(' ');
        let rpcn_r = rpcn.slice(0, Math.round(rpcn.length * (0.5 + 0.25 * (Math.random() - 0.3)))) + '...';
        let x = [
            `Favor inserte un codigo de pensum (ej ${rpc.codigo}).`,
            '',
            'Tambien puede empezar a escribir el nombre de la carrera ' +
            `(${rpcn_r}), ` +
            'y aparecerá un listado con las distintas carreras y sus respectivos códigos.',
        ];
        setInfoWrap(x.join('<br>'));
        return;
    }

    let loadedFromCustomPensum = false;
    if (customPensum) {
        // LOAD FROM LOCAL FILE
        if (customPensum.carrera
            && customPensum.codigo
            && customPensum.cuats) {
            currentPensumData = customPensum;
            loadedFromCustomPensum = true;
            console.info(customPensum.codigo + ' loaded from local import (.json).');
        } else {
            return false;
        }

    } else {
        // LOAD FROM INTERNET
        // try to check if its on localStorage, else check online and cache if successful.
        setInfoWrap(`Buscando ${currentPensumCode} en cache local.`);
        currentPensumData = getPensumFromLocalStorage(currentPensumCode);
        if (currentPensumData === null || !currentPensumData['version'] || currentPensumData.version < CURRENT_PENSUM_VERSION) {
            currentPensumData = null;
            // Try from ./pensum first
            setInfoWrap(`Buscando ${currentPensumCode} en versiones de respaldo.`);
            try {
                let pResponse = await fetch('./pensum/' + currentPensumCode + '.json');
                let obj = await pResponse.json();
                if (obj !== null && obj['version']) {
                    currentPensumData = convertSaveToPensum(obj);
                    console.info(currentPensumCode + ' found inside ./pensum/!');
                }

            } catch (e) {
                console.info(currentPensumCode + ' not found inside ./pensum/...');
            }

            // Try to fetch from site (with proxies)
            if (!currentPensumData) {
                let pensumNode = await fetchPensumTable(
                    currentPensumCode,
                    (returnCode, proxy, index) => {
                        let n = index + 1;
                        switch (returnCode) {
                            case 'success':
                                setInfoWrap(
                                    `Pensum ${currentPensumCode} encontrado en ${proxy} (intento ${n})`
                                );
                                break;
                            case 'request':
                                setInfoWrap(
                                    `Buscando pensum ${currentPensumCode} en ${proxy} (intento ${n})`
                                );
                                break;
                            case 'error':
                                setInfoWrap(`Error en ${proxy} (intento ${n})`);
                                break;
                            default:
                                setInfoWrap(`??? (${proxy}) (intento ${n})`);
                                break;
                        }
                    }
                );
                currentPensumData = extractPensumData(pensumNode);
            }

            // Update cache and currentPensumCode if successfuly fetched.
            if (currentPensumData) {
                let newCode = currentPensumData.codigo;
                codigoMateriaInput.value = newCode;
                currentPensumCode = newCode;
                setPensumToLocalStorage(currentPensumData);
            }
        } else {
            console.info(currentPensumData.codigo + ' loaded from localStorage.');
        }
    }


    // If data was succesfully found
    if (currentPensumData) {
        // Set the search bar
        currentPensumMats = matsToDict(currentPensumData.cuats.flat());
        codigoMateriaInput.value = currentPensumData.codigo;

        // Display the table
        drawPensumTable();

        // Set 'Detalles de la carrera'
        {
            clearInfoWrap();
            let h = document.createElement('h3');
            h.innerText = 'Detalles de la carrera: ';
            infoWrap.appendChild(h);

            infoWrap.appendChild(createInfoList(currentPensumData));
            var t0 = 'Recuerde guardar una copia de su selección en su disco local (o en las nubes).';
            createElement(infoWrap, 'p', t0, ['note']);

            let btnwrp = createElement(infoWrap, 'div', '', ['inline-btn-wrapper']);

            // Original Pensum link from UNAPEC
            let a = createElement(btnwrp, 'a', '', ['btn-secondary']) as HTMLAnchorElement;
            a.href = unapecPensumUrl + currentPensumCode;
            a.target = '_blank';
            a.innerText = '🌐 Ver pensum original';
            if (loadedFromCustomPensum)
                a.classList.add('disabled');

            btnwrp.appendChild(
                createSecondaryButton('💾 Guardar/Cargar selección', () =>
                    createImportExportDialog().show()
                )
            );

            btnwrp.appendChild(
                createSecondaryButton('🌳 Diagrama (β)', () =>
                    createOrgChartDialog()
                )
            );

            return currentPensumData.cuats.flat().length;
        }
    } else {
        infoWrap.innerText = 'No se ha encontrado el pensum!';
        clearPensumTable();
        return false;
    }
}

function drawPensumTable() {
    var wrapper = document.getElementById('pensumWrapper');
    let div = document.createElement('div');
    {
        let h = document.createElement('h1');
        h.innerText = currentPensumData.carrera;
        div.appendChild(h);
    }
    div.appendChild(createNewPensumTable(currentPensumData));

    if (wrapper.firstChild) wrapper.replaceChild(div, wrapper.firstChild);
    else wrapper.appendChild(div);
}

function clearPensumTable() {
    var wrapper = document.getElementById('pensumWrapper');
    while (wrapper.firstChild)
        wrapper.removeChild(wrapper.firstChild);
}

function convertPensumToSave(data: i_pensum) {
    let newCuats = data.cuats.map(cuat =>
        cuat.map(mat => {
            let newMat = { ...mat } as any;

            delete newMat.cuatrimestre;

            if (!newMat.prereq.length)
                delete newMat.prereq
            else if (newMat.prereq.length === 1) {
                newMat.prereq = newMat.prereq[0];
            }

            if (!newMat.prereqExtra.length)
                delete newMat.prereqExtra
            else if (newMat.prereqExtra.length === 1) {
                newMat.prereqExtra = newMat.prereqExtra[0];
            }
            return newMat as i_mat_save;
        })
    )
    return { ...data, cuats: newCuats } as i_pensum_save
}

function convertSaveToPensum(data: i_pensum_save) {
    let newCuats = [];
    for (let i = 0, l = data.cuats.length; i < l; ++i) {
        newCuats.push(data.cuats[i].map(mat => {
            let newMat = { ...mat } as any;

            newMat.cuatrimestre = i + 1;

            if (newMat.prereq === undefined)
                newMat.prereq = [];
            else if (typeof newMat.prereq === 'string')
                newMat.prereq = [newMat.prereq];

            if (newMat.prereqExtra === undefined)
                newMat.prereqExtra = [];
            else if (typeof newMat.prereqExtra === 'string')
                newMat.prereqExtra = [newMat.prereqExtra];

            return newMat as i_mat_raw;
        }))
    }
    return { ...data, cuats: newCuats } as i_pensum
}

function setPensumToLocalStorage(data: i_pensum) {
    try {
        let code = 'cache_' + data.codigo;
        let d = convertPensumToSave(data);
        let json = JSON.stringify(d);
        window.localStorage.setItem(code, json);
        return true;
    } catch {
        return false;
    }
}

function getPensumFromLocalStorage(pensumCode: string) {
    try {
        let code = 'cache_' + pensumCode;
        let json = window.localStorage.getItem(code);
        let p = JSON.parse(json) as i_pensum_save;
        return convertSaveToPensum(p);
    } catch {
        return null;
    }
}

function downloadPensumJson(data: i_pensum) {
    downloadObjectAsJson(convertPensumToSave(data), data.codigo);
}

function getDateIdentifier() {
    let d = new Date();
    return `${d.getFullYear()}${d.getMonth()}${d.getDate()}_${d.getHours()}h${d.getMinutes()}m${d.getSeconds()}s`;
}


function loadPensumFromJson() {
    let input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.addEventListener('change', () => {
        let ext = input.files[0]['name']
            .substring(input.files[0]['name'].lastIndexOf('.') + 1)
            .toLowerCase();
        if (input.files && input.files[0] && ext == 'json') {
            let reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    let txt = e.target.result as string;
                    let obj = JSON.parse(txt);

                    if (obj && typeof (obj) === 'object') {
                        let p = convertSaveToPensum(obj);
                        let numMatsLoaded = await loadPensum(p);
                        if (numMatsLoaded) {
                            let t = `${numMatsLoaded} materias cargadas.`;
                            if (errorCodes.size) {
                                t += `\n${errorCodes.size} materias no presentes!: \n`
                                t += errorCodesLog.map(x => '    ' + x[0] + ' (prerequisito de ' + x[1] + ')').join('\n');
                            }
                            alert(t)
                        } else {
                            alert('Formato incorrecto!')
                        }
                        return;
                    } else {
                        throw 'No hay información dentro del .json!';
                    }
                } catch (e) {
                    let t = 'No se pudo cargar el archivo!'
                    alert(t + '\n' + e.toString())
                    console.warn(t);
                    console.warn(e);
                }
            };
            reader.readAsText(input.files[0]);
        } else {
            console.info('progress.json file could not be uploaded.');
        }
    });
}


function downloadProgress() {
    let obj = createSaveObject();
    let date = getDateIdentifier();
    let name = `materias-aprobadas_${date}`;
    downloadObjectAsJson(obj, name);
}

function uploadProgress() {
    let input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.addEventListener('change', () => {
        let ext = input.files[0]['name']
            .substring(input.files[0]['name'].lastIndexOf('.') + 1)
            .toLowerCase();
        if (input.files && input.files[0] && ext == 'json') {
            let reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let txt = e.target.result as string;
                    let obj = JSON.parse(txt);

                    if (obj) {
                        if (Array.isArray(obj)) {
                            userProgress.passed = new Set(obj);
                            loadPensum();
                            alert(`Se han seleccionado ${userProgress.passed.size} materias de ${input.files[0].name}.`);
                            return;
                        }
                        if (typeof (obj) === 'object') {
                            loadFromObject(obj);
                            loadPensum();
                            alert(`Se han seleccionado ${userProgress.passed.size} materias de ${input.files[0].name}.`);
                            return;
                        }
                    } else {
                        throw 'No hay información dentro del .json!';
                    }
                } catch (e) {
                    let t = 'No se pudo cargar el archivo!'
                    alert(t + '\n' + e.toString())
                    console.warn(t);
                    console.warn(e);
                }
            };
            reader.readAsText(input.files[0]);
        } else {
            console.info('progress.json file could not be uploaded.');
        }
    });
}

function RESET_PROGRESS() {
    SAVE_TO_LOCALSTORAGE = false;
    localStorage.removeItem(SAVE_DATA_LOCALSTORAGE);
    location.reload();
}

async function onWindowLoad() {
    {
        let a = document.getElementById('versionSpan');
        let b = document.getElementById('saveVersionSpan');
        if (a) a.innerText = jsVer.toString();
        if (b) b.innerText = saveVer.toString();
    }


    try {
        let carr = await (await fetch('carreras.json')).json();
        if (carr && carr.carreras) {
            CARRERAS = [...carr.carreras];
        }
        let input = document.getElementById('codigoMateria');

        let list = CARRERAS.map((x) => [
            `(${x.codigo}) ${x.nombre}`,
            x.codigo,
        ]);

        // from awesomplete.min.js
        new Awesomplete(input, { minChars: 0, list: list });
    } catch {
        console.warn(
            'carreras.json could not be loaded.\n Search autocomplete will not be available.'
        );
    }

    try {
        let tempIgnored = await (await fetch('ignoredMats.json')).json();
        if (tempIgnored) allIgnored = tempIgnored;
    } catch {
        console.warn('ignoredMats.json could not be loaded.');
    }

    // Associate input with Enter.
    document.getElementById('codigoMateria').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loadPensum();
    });

    // Try to get saved data
    loadFromLocalStorage();

    // Load toolbox
    createToolbox();

    // Do first load
    loadPensum();
}

window.addEventListener('load', onWindowLoad);

window.addEventListener('beforeunload', (event) => {
    saveToLocalStorage();
});
//#endregion
