const saveVer = 4;
const jsVer = 1;
var unapecPensumUrl = "https://servicios.unapec.edu.do/pensum/Main/Detalles/";
var allIgnored = {}; // Mats that are no longer available and should be ommited from the pensum

var currentPensumData = null;
var currentPensumCode = "";
var currentPensumMats = {};

var filterMode = "noFilter";
var currentProgress = new Set();

// The version of FileSaver used here places this method on the global namespace
declare const saveAs;
declare const FileSaver: { saveAs };
FileSaver.saveAs = saveAs;

// XLSX to export as excel
declare const XLSX;
// Autocomplete
declare const Awesomplete;

const MANAGEMENT_TAKEN_CSS_CLASS = "managementMode-taken";
const CURRENT_PENSUM_VERSION = 2; // Update this if new mats are added to IgnoredMats.json

/** Loads the node given at 'input' into the DOM */
async function fetchPensumTable(pensumCode, requestCallback) {
    var urlToLoad = unapecPensumUrl + pensumCode;
    let text = await fetchHtmlAsText(
        urlToLoad,
        { cache: "force-cache" },
        -1,
        requestCallback
    );

    let parser = new DOMParser();
    let doc = parser.parseFromString(text, "text/xml");
    return doc;
}

interface i_pensum {
    carrera: string,
    codigo: string,
    vigencia: string,
    infoCarrera: string[],
    cuats: i_mat[][],
    error: string | null,
    version: number,
}
interface i_mat {
    codigo: string,
    asignatura: string,
    creditos: number,
    prereq: string[],
    prereqExtra: string[],
    cuatrimestre: number,
}

/**
 * Converts the node fetched from UNAPEC to a jObject.
 * @param {Element} node
 */
function extractPensumData(node) {
    let out: i_pensum = {
        carrera: "",
        codigo: "",
        vigencia: "",
        infoCarrera: [],
        cuats: [],
        error: null,
        version: CURRENT_PENSUM_VERSION,
    };

    // Verify if pensum is actually valid data
    if (
        node.getElementsByClassName("contPensum").length == 0 ||
        node.getElementsByClassName("contPensum")[0].children.length < 2
    ) {
        return null;
    }

    // Extract basic data
    var cabPensum = node.getElementsByClassName("cabPensum")[0];
    out.carrera = cabPensum.firstElementChild.textContent.trim();
    var pMeta = cabPensum.getElementsByTagName("p")[0].children;
    out.codigo = pMeta[0].textContent.trim();
    out.vigencia = pMeta[1].textContent.trim();

    // Extract infoCarrera
    var infoCarrera = node.getElementsByClassName("infoCarrera")[0].children;
    for (let i = 0; i < infoCarrera.length; ++i) {
        out.infoCarrera.push(
            infoCarrera[i].textContent.replace(/\n/g, " ").trim()
        );
    }

    // Extract cuats
    var cuatrim = node.getElementsByClassName("cuatrim");
    var ignoredMats = new Set(allIgnored[out.codigo]);

    for (let i = 0; i < cuatrim.length; ++i) {
        /**
         * @type {HTMLTableElement}
         */
        let currentCuatTable = cuatrim[i];
        let rows = currentCuatTable.children;

        let outCuat: i_mat[] = [];

        for (let j = 1; j < rows.length; ++j) {
            let outMat: i_mat = {
                codigo: "",
                asignatura: "",
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
                .replace(/\n/g, ",")
                .split(",")
                .map((x) => x.trim())
                .filter((e) => e !== "");
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
function matsToDict(arr) {
    let out = {};
    for (let x of arr) {
        out[x.codigo] = x;
        out[x.codigo].postreq = [];
    }

    // find postreqs
    for (let x of arr) {
        for (let y of x.prereq) {
            out[y].postreq.push(x.codigo);
        }
    }

    return out;
}

/** Create mat dialog showing its dependencies and other options... */
function createMatDialog(code) {
    // let outMat = {
    //     codigo: '',
    //     asignatura: '',
    //     creditos: 0,
    //     prereq: [],
    //     prereqExtra: [],
    // };
    let codeData = currentPensumMats[code];
    if (!codeData)
        return new DialogBox().setMsg("Informacion no disponible para " + code);

    let dialog = new DialogBox();
    let outNode = dialog.contentNode;

    createElement(
        outNode,
        "h3",
        `(${codeData.codigo}) '${codeData.asignatura}'`
    );
    createElement(outNode, "p", `Codigo: \t${codeData.codigo}`);
    createElement(outNode, "p", `Creditos: \t${codeData.creditos}`);
    createElement(outNode, "p", `Cuatrimestre: \t${codeData.cuatrimestre}`);

    if (codeData.prereq.length > 0 || codeData.prereqExtra.length > 0) {
        createElement(outNode, "h4", "Pre-requisitos");
        for (let x of codeData.prereq) {
            let p = createElement(outNode, "p");
            let s = document.createElement("a");
            s.innerText = `(${x}) ${currentPensumMats[x].asignatura}`;
            s.addEventListener("click", () => {
                dialog.hide();
                createMatDialog(x).show();
            });
            s.classList.add("preReq");
            s.classList.add("monospace");
            s.classList.add(`c_${x}`);
            s.classList.add(`c__`);

            p.appendChild(s);
        }

        codeData.prereqExtra.forEach((x) => {
            let p = createElement(outNode, "p");
            let s = document.createElement("a");
            s.innerText = x;
            s.classList.add("preReq");
            s.classList.add("preReqExtra");

            p.appendChild(s);
        });
    }

    if (codeData.postreq.length > 0) {
        createElement(outNode, "h4", "Es pre-requisito de: ");
        codeData.postreq.forEach((x) => {
            let p = createElement(outNode, "p");
            let s = document.createElement("a");
            s.innerText = `(${x}) ${currentPensumMats[x].asignatura}`;
            s.addEventListener("click", () => {
                dialog.hide();
                createMatDialog(x).show();
            });
            s.classList.add("preReq");
            s.classList.add("monospace");
            s.classList.add(`c_${x}`);
            s.classList.add(`c__`);

            p.appendChild(s);
        });
    }

    outNode.appendChild(dialog.createCloseButton());
    updateTakenPrereqClasses(outNode);
    return dialog;
}

/** Adds or removes MANAGEMENT_TAKEN_CLASS to the related elements */
function updateTakenPrereqClasses(node: HTMLElement | HTMLDocument = document) {
    for (let elem of node.getElementsByClassName("c__"))
        elem.classList.remove(MANAGEMENT_TAKEN_CSS_CLASS);

    for (let code of currentProgress) {
        for (let elem of node.getElementsByClassName(`c_${code}`)) {
            elem.classList.add(MANAGEMENT_TAKEN_CSS_CLASS);
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
function analyseGradeProgress(matArray) {
    let matSet = new Set(matArray);
    let out = {
        totalCreds: 0,
        currentCreds: 0,
        currentMats: 0,
        totalMats: Object.keys(currentPensumMats).length,
    };

    for (let matCode in currentPensumMats) {
        let currentMatObj = currentPensumMats[matCode];
        out.totalCreds += currentMatObj.creditos;
        if (matSet.has(matCode)) {
            out.currentCreds += currentMatObj.creditos;
            ++out.currentMats;
        }
    }

    return out;
}

/** Updates the element #progressWrapper with data
 * related to the user's mats selection */
function updateGradeProgress() {
    let progressData = analyseGradeProgress(currentProgress);

    let node = document.getElementById("progressWrapper");
    node.innerHTML = "";

    var n = ((100 * progressData.currentCreds) / progressData.totalCreds).toFixed(2);
    let bg = `linear-gradient(to right, var(--progress-bar-green) ${n}%, var(--background) ${n}%)`;
    node.style.backgroundImage = bg;

    if (progressData.currentCreds == 0) return;

    createElement(node, "h3", "Progreso en la carrera: ");

    let ul = createElement(node, "ul");

    // Percent of mats
    var m = ((100 * progressData.currentMats) / progressData.totalMats).toFixed(2);
    createElement(ul, "li", `Materias aprobadas: ${progressData.currentMats}/${progressData.totalMats} (${m}%)`);
    createElement(ul, "li", `Creditos aprobados: ${progressData.currentCreds}/${progressData.totalCreds} (${n}%)`);

    {
        createElement(node, "label", "Mostrar materias en pensum: ");
        let sel = createElement(node, "select") as HTMLSelectElement;
        (createElement(
            sel,
            "option",
            "Mostrar todas"
        ) as HTMLOptionElement).value = "noFilter";
        (createElement(
            sel,
            "option",
            "Esconder aprobadas"
        ) as HTMLOptionElement).value = "hidePassed";
        (createElement(
            sel,
            "option",
            "Solo mostrar aprobadas"
        ) as HTMLOptionElement).value = "showPassed";
        sel.value = filterMode;
        sel.addEventListener("change", () => {
            filterMode = sel.value;
            loadPensum();
        });
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
 * @param {*} data
 */
function createNewPensumTable(data) {
    // Just for reference, this is the 'data' param schema.
    // let out = {
    //     carrera: '',
    //     codigo: '',
    //     vigencia: '',
    //     infoCarrera: [],
    //     cuats: [
    //         {
    //             codigo: '',
    //             asignatura: '',
    //             creditos: 0,
    //             prereq: [],
    //             prereqExtra: [],
    //         },
    //     ],
    // };

    /** @type {HTMLTableElement} */
    let out = document.createElement("table");

    // create the header
    let headerRow = out.createTHead();
    for (let x of [
        "Ct",
        "✔",
        "Codigo",
        "Asignatura",
        "Créditos",
        "Pre-requisitos",
    ]) {
        let a = document.createElement("th");
        a.innerText = x;
        headerRow.appendChild(a);
    }

    // This allows global showing/hiding of management.
    headerRow.children[1].classList.add("managementMode-cell");

    // create the contents
    data.cuats.forEach((cuat, idxCuat) => {
        var filteredCuat;
        switch (filterMode) {
            default:
            case "noFilter":
                filteredCuat = cuat;
                break;
            case "showPassed":
                filteredCuat = cuat.filter((mat) =>
                    currentProgress.has(mat.codigo)
                );
                break;
            case "hidePassed":
                filteredCuat = cuat.filter(
                    (mat) => !currentProgress.has(mat.codigo)
                );
                break;
        }

        filteredCuat.forEach((mat, idxMat, currentCuat) => {
            let row = out.insertRow();
            row.id = `r_${mat.codigo}`;
            row.classList.add(`c_${mat.codigo}`);
            row.classList.add(`c__`);

            if (idxMat === 0) {
                let a = document.createElement("th");
                row.appendChild(a);
                a.rowSpan = currentCuat.length;
                let p = createElement(a, "p", `Cuat. ${idxCuat + 1}`, [
                    "vertical-text",
                ]);
                row.classList.add("cuatLimit");
                a.classList.add("cuatHeader");

                // Allow all cuats selection
                a.addEventListener("click", () => {
                    // Check if all are checked
                    let currentCuatMats = cuat.map((x) => x.codigo);
                    let selectedCuatMats = currentCuatMats.filter((x) =>
                        currentProgress.has(x)
                    );

                    // If all are checked, uncheck, else check.
                    if (currentCuatMats.length == selectedCuatMats.length) {
                        for (let x of currentCuatMats)
                            currentProgress.delete(x);
                    } else {
                        for (let x of currentCuatMats) currentProgress.add(x);
                    }
                    loadPensum();
                });
            }

            // Selection check
            {
                let r = row.insertCell();
                r.classList.add("text-center");
                r.classList.add("managementMode-cell");

                let s = document.createElement("input");
                s.type = "checkbox";
                if (currentProgress.has(mat.codigo)) s.checked = true;

                s.addEventListener("change", () => {
                    if (s.checked) currentProgress.add(mat.codigo);
                    else currentProgress.delete(mat.codigo);

                    updateTakenPrereqClasses();
                    updateGradeProgress();
                    if (filterMode !== "noFilter") {
                        let allMats = Object.keys(currentPensumMats);
                        let matsLeft = new Set(
                            allMats.filter((x) => !currentProgress.has(x))
                        );
                        if (matsLeft.size == allMats.length)
                            filterMode = "noFilter";
                        loadPensum();
                    }
                });

                r.appendChild(s);
            }

            // Codigo mat.
            {
                let r = row.insertCell();
                r.id = `a_${mat.codigo}`;
                r.classList.add("text-center");
                r.classList.add(`c_${mat.codigo}`);
                r.classList.add(`c__`);

                let s = document.createElement("a");
                s.innerText = `${mat.codigo}`;
                s.addEventListener("click", () => {
                    createMatDialog(mat.codigo).show();
                });
                s.classList.add("codigo");
                s.classList.add("monospace");

                r.appendChild(s);
            }

            // Asignatura
            row.insertCell().innerText = mat.asignatura;

            // Creditos
            {
                let r = row.insertCell();
                r.innerText = mat.creditos;
                r.classList.add("text-center");
            }

            // Prereqs
            {
                let r = row.insertCell();

                mat.prereq.forEach((x) => {
                    let s = document.createElement("a");
                    s.innerText = x;
                    s.addEventListener("click", () => {
                        let targetCell = document.getElementById(`a_${x}`);
                        let targetRow = document.getElementById(`r_${x}`);
                        targetCell.scrollIntoView({ block: "center" });
                        targetRow.classList.remove("highlightRow");
                        targetRow.classList.add("highlightRow");
                        setTimeout(
                            () => targetRow.classList.remove("highlightRow"),
                            2e3
                        );
                    });
                    s.classList.add("preReq");
                    s.classList.add("monospace");
                    s.classList.add(`c_${x}`); // mat's code
                    s.classList.add(`c__`);

                    r.appendChild(s);
                    r.appendChild(document.createTextNode("\t"));
                });

                mat.prereqExtra.forEach((x) => {
                    let s = document.createElement("a");
                    s.innerText = x;
                    s.classList.add("preReq");
                    s.classList.add("preReqExtra");

                    r.appendChild(s);
                    r.appendChild(document.createTextNode("\t"));
                });
            }
        });
    });

    updateTakenPrereqClasses(out);
    updateGradeProgress();

    return out;
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
function createExcelWorkbookFromPensum(data, progress = []) {
    let currentProgress = new Set(progress);

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.book_append_sheet(wb, ws, "Pensum");

    ws["!ref"] = "A1:H300"; // Working range

    ws["!merges"] = [];
    function mergeCells(r1, c1, r2, c2) {
        ws["!merges"].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
    }

    let COL_CUAT = "A";
    let COL_CODIGO = "B";
    let COL_NOMBRE = "C";
    let COL_CREDITOS = "D";
    let COL_PREREQ = "EFG";
    let COL_APROB = "H";

    let COLS = "ABCDEFGH";

    ws["!cols"] = [
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

    ws[COLS[0] + currentRow] = { v: data.carrera, t: "s" };
    mergeCells(0, 0, 0, 7);
    ++currentRow;

    // create the header
    let headers = [
        "Ct",
        "Codigo",
        "Asignatura",
        "Créditos",
        "Pre-req #1",
        "Pre-req #2",
        "Pre-req #3",
        "Aprobada?",
    ];
    for (let i = 0; i < headers.length; ++i) {
        ws[COLS[i] + currentRow] = { v: headers[i], t: "s" };
    }
    ++currentRow;

    // create the contents
    data.cuats.forEach((cuat, idxCuat) => {
        var filteredCuat;
        switch (filterMode) {
            default:
            case "noFilter":
                filteredCuat = cuat;
                break;
            // case 'showPassed':
            //     filteredCuat = cuat.filter((mat) => currentProgress.has(mat.codigo));
            //     break;
            // case 'hidePassed':
            //     filteredCuat = cuat.filter((mat) => !currentProgress.has(mat.codigo));
            //     break;
        }

        filteredCuat.forEach((mat, idxMat, currentCuat) => {
            ws[COL_CUAT + currentRow] = { v: idxCuat + 1, t: "n" };
            if (idxMat === 0) {
                mergeCells(
                    currentRow - 1,
                    0,
                    currentRow - 1 + currentCuat.length - 1,
                    0
                );
            }

            // Codigo mat.
            ws[COL_CODIGO + currentRow] = { v: mat.codigo, t: "s" };

            // Asignatura
            ws[COL_NOMBRE + currentRow] = { v: mat.asignatura, t: "s" };

            // Creditos
            ws[COL_CREDITOS + currentRow] = { v: mat.creditos, t: "n" };

            // Prereqs
            let prereqCount = 0;
            for (let x of mat.prereq) {
                ws[COL_PREREQ[prereqCount] + currentRow] = { v: x, t: "s" };
                ++prereqCount;
            }
            for (let x of mat.prereqExtra) {
                ws[COL_PREREQ[prereqCount] + currentRow] = { v: x, t: "s" };
                ++prereqCount;
            }

            // Aprobada
            let aprobVal = currentProgress.has(mat.codigo) ? 1 : 0;
            ws[COL_APROB + currentRow] = { v: aprobVal, t: "n" };

            ++currentRow;
        });
    });

    try {
        let [cd_d, cd_m, cd_y] = data.vigencia
            .split("/")
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
    var wb_out = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    return wb_out;
}

function downloadXlsx(wb_out, fileNameWithoutExt) {
    var fileName = fileNameWithoutExt + ".xlsx";

    // Convert binary data to octet stream
    var buf = new ArrayBuffer(wb_out.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf); //create uint8array as viewer
    for (var i = 0; i < wb_out.length; i++)
        view[i] = wb_out.charCodeAt(i) & 0xff; //convert to octet

    // Download
    let blob = new Blob([buf], { type: "application/octet-stream" });
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
            x.substring(0, x.indexOf(": ")),
            x.substring(x.indexOf(": ") + 2),
        ];
        if (splitOnFirstColon[0] == "") return { type: "simple", data: x };
        else {
            let splitOnDots = splitOnFirstColon[1].split(". ");
            if (splitOnDots.length == 1)
                return { type: "double", data: splitOnFirstColon };
            else
                return {
                    type: "double_sublist",
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
    let out = document.createElement("ul");

    // Separate the text before outputting.
    let outTextArr = getInfoList(data);

    // Format the text as a list
    for (let x of outTextArr) {
        let li = document.createElement("li");
        switch (x.type) {
            case "simple":
                li.innerText = x.data;
                break;
            case "double":
                li.innerHTML = `<b>${sentenceCase(x.data[0])}:</b>\t${x.data[1]
                    }`;
                break;
            case "double_sublist":
                li.innerHTML = `<b>${sentenceCase(x.data[0])}: </b>`;
                var subul = document.createElement("ul");
                x.data[1].forEach((elem) => {
                    let subli = document.createElement("li");
                    subli.innerHTML = elem + ".";
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
function createAllDownloadsDialog() {
    let dialog = new DialogBox();
    let node = dialog.contentNode;

    createElement(node, "h3", "Descargar pensum");
    node.appendChild(
        createSecondaryButton(
            `Descargar .xlsx (Excel)`,
            downloadCurrentPensumAsExcel
        )
    );

    node.appendChild(document.createElement("br"));
    node.appendChild(dialog.createCloseButton());
    return dialog;
}

function createImportExportDialog() {
    let dialog = new DialogBox();
    let node = dialog.contentNode;

    createElement(node, "h3", "Exportar/importar progreso");
    [
        "Las materias aprobadas seleccionadas se guardan localmente en la cache del navegador. ",
        "Al estar guardados en la cache, estos datos podrian borrarse en cualquier momento. ",
        "Para evitar la perdida de estos datos, se recomienda exportar la seleccion (<code>progreso.json</code>). ",
        "Luego, en caso de que se haya eliminado la selección, solo es necesario importarlo nuevamente.",
    ].forEach((x) => createElement(node, "p", x));

    node.appendChild(document.createElement("br"));

    node.appendChild(
        createSecondaryButton("Exportar progreso.json", downloadProgress)
    );
    node.appendChild(
        createSecondaryButton("Importar progreso.json", uploadProgress)
    );

    node.appendChild(document.createElement("br"));
    node.appendChild(dialog.createCloseButton());
    return dialog;
}

//#region LocalStorage Funcs

function saveToLocalStorage() {
    let out = {
        saveVer: saveVer,
        currentCodeAtInputForm: (document.getElementById(
            "codigoMateria"
        ) as HTMLInputElement).value,
        progress: [...currentProgress],
    };

    try {
        localStorage.setItem("saveData", JSON.stringify(out));
        return true;
    } catch (err) {
        console.warn("Could not save saveData to localStorage");
        console.warn(err);
        return false;
    }
}

function loadFromLocalStorage() {
    let saveData = localStorage.getItem("saveData");
    if (saveData === null) return false;

    let out = JSON.parse(saveData);

    (document.getElementById("codigoMateria") as HTMLInputElement).value =
        out.currentCodeAtInputForm;

    if (out.progress) currentProgress = new Set(out.progress);

    // Version management and cache clearing.
    if (out.saveVer !== saveVer) {
        console.info(`Updated to version ${saveVer} and cleared localStorage.`);
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
        "https://api.allorigins.win/raw?url=",
        "https://yacdn.org/serve/",
        "https://cors-anywhere.herokuapp.com/", // has request limit (200 per hour)
        "https://crossorigin.me/",
        "https://cors-proxy.htmldriven.com/?url=", // Fails with CORS (what!?)
        "https://thingproxy.freeboard.io/fetch/", // problems with https requests
        "http://www.whateverorigin.org/get?url=", // problems with https requests, deprecated?
    ];

    let i = 0;
    while (i < corsOverride.length) {
        var currProxy = corsOverride[i];
        if (forceProxy !== -1) {
            if (typeof forceProxy == "number")
                currProxy = corsOverride[forceProxy];
            else currProxy = forceProxy;
        }

        try {
            var controller = new AbortController();
            var signal = controller.signal;
            opts.signal = signal;

            var timeoutId = setTimeout(() => {
                controller.abort();
                console.warn("Timed out!");
            }, 3e3);
            var sendDate = new Date().getTime();

            var response = await fetch(currProxy + url, opts);

            if (currentProxyCallback)
                currentProxyCallback("request", currProxy, i);

            clearTimeout(timeoutId);
            if (response.ok) {
                var recieveDate = new Date().getTime();
                console.info(
                    `CORS proxy '${currProxy}' succeeded in ${recieveDate - sendDate
                    }ms.'`
                );

                if (currentProxyCallback)
                    currentProxyCallback("success", currProxy, i);

                return await response.text();
            } else {
                throw "Response was not OK!";
            }
        } catch (err) {
            clearTimeout(timeoutId);
            var recieveDate = new Date().getTime();
            console.warn(
                `CORS proxy '${currProxy}' failed in ${recieveDate - sendDate
                }ms.'`
            );
            console.warn(err);

            if (currentProxyCallback)
                currentProxyCallback("error", currProxy, i);
        } finally {
            ++i;
        }
    }
    return null;
}

function titleCase(string) {
    var sentence = string.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
        sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(" ");
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
        this.wrapperNode = document.createElement("div");
        this.wrapperNode.classList.add("fullscreen");
        this.wrapperNode.classList.add("dialogWrapper");

        this.contentNode = document.createElement("div");
        this.contentNode.classList.add("dialogCard");
        this.wrapperNode.appendChild(this.contentNode);

        return this;
    }

    /** Sets the contentNode to a single <p> element with the given text. */
    setMsg(str) {
        createElement(this.contentNode, "p", str);
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
        let a = document.createElement("a");
        a.innerText = "Cerrar";
        a.addEventListener("click", () => this.hide());
        a.classList.add("btn-primary");
        return a;
    }
}

function downloadObjectAsJson(exportObj, exportNameWithoutExt) {
    var blob = new Blob([JSON.stringify(exportObj)], {
        type: "data:text/json;charset=utf-8",
    });
    FileSaver.saveAs(blob, exportNameWithoutExt + ".json");
}

function createElement(
    parentNode,
    tag = "div",
    innerHTML = null,
    classes = []
) {
    let x = document.createElement(tag);
    parentNode.appendChild(x);
    if (innerHTML !== null) x.innerHTML = innerHTML;
    classes.forEach((clss) => x.classList.add(clss));
    return x;
}

function createSecondaryButton(text, callback) {
    let a = document.createElement("a");
    a.addEventListener("click", callback);
    a.innerHTML = text;
    a.classList.add("btn-secondary");
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

//#endregion

//#region Init

/** This function is called by the <search> button */
async function loadPensum() {
    try {
        var infoWrap = document.getElementById("infoWrapper");

        // currentProxyCallback('request', currProxy, i);
        let codigoMateriaInput = document.getElementById(
            "codigoMateria"
        ) as HTMLInputElement;
        currentPensumCode = codigoMateriaInput.value.toUpperCase();

        // helper functions
        const clearInfoWrap = () => {
            infoWrap.innerHTML = "";
        };
        const setInfoWrap = (str) => {
            infoWrap.innerHTML = str;
        };

        // try to check if its on localStorage, else check online and cache if successful.
        setInfoWrap(`Buscando ${currentPensumCode} en cache local.`);
        currentPensumData = getPensumFromLocalStorage(currentPensumCode);
        if (currentPensumData === null || !currentPensumData['version'] || currentPensumData.version < CURRENT_PENSUM_VERSION) {
            let pensumNode = await fetchPensumTable(
                currentPensumCode,
                (returnCode, proxy, index) => {
                    let n = index + 1;
                    switch (returnCode) {
                        case "success":
                            setInfoWrap(
                                `Pensum encontrado en ${proxy} (intento ${n})`
                            );
                            break;
                        case "request":
                            setInfoWrap(
                                `Buscando pensum en ${proxy} (intento ${n})`
                            );
                            break;
                        case "error":
                            setInfoWrap(`Error en ${proxy} (intento ${n})`);
                            break;
                        default:
                            setInfoWrap(`??? (${proxy}) (intento ${n})`);
                            break;
                    }
                }
            );
            currentPensumData = extractPensumData(pensumNode);

            // Update cache and currentPensumCode if successfuly fetched.
            if (currentPensumData) {
                let newCode = currentPensumData.codigo;
                codigoMateriaInput.value = newCode;
                currentPensumCode = newCode;
                setPensumToLocalStorage(currentPensumData);
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
                let h = document.createElement("h3");
                h.innerText = "Detalles de la carrera: ";
                infoWrap.appendChild(h);

                infoWrap.appendChild(createInfoList(currentPensumData));

                let btnwrp = createElement(infoWrap, "div", "", [
                    "inline-btn-wrapper",
                ]);

                // Original Pensum link from UNAPEC
                let a = createElement(btnwrp, "a", "", [
                    "btn-secondary",
                ]) as HTMLAnchorElement;
                a.href = unapecPensumUrl + currentPensumCode;
                a.target = "_blank";
                a.innerText = "Ver pensum original";

                btnwrp.appendChild(
                    createSecondaryButton("Descargar...", () =>
                        createAllDownloadsDialog().show()
                    )
                );
                btnwrp.appendChild(
                    createSecondaryButton("Guardar/Cargar selección", () =>
                        createImportExportDialog().show()
                    )
                );
            }
        } else {
            infoWrap.innerText = "No se ha encontrado el pensum!";
        }
    } catch (err) {
        alert(err);
    }
}

function drawPensumTable() {
    var wrapper = document.getElementById("pensumWrapper");
    let div = document.createElement("div");
    {
        let h = document.createElement("h1");
        h.innerText = currentPensumData.carrera;
        div.appendChild(h);
    }
    div.appendChild(createNewPensumTable(currentPensumData));

    if (wrapper.firstChild) wrapper.replaceChild(div, wrapper.firstChild);
    else wrapper.appendChild(div);
}

function setPensumToLocalStorage(data) {
    try {
        let code = "cache_" + data.codigo;
        let json = JSON.stringify(data);
        window.localStorage.setItem(code, json);
        return true;
    } catch {
        return false;
    }
}

function getPensumFromLocalStorage(matCode) {
    try {
        let code = "cache_" + matCode;
        let json = window.localStorage.getItem(code);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function downloadProgress() {
    let obj = [...currentProgress];
    let d = new Date();
    let date = `${d.getFullYear()}${d.getMonth()}${d.getDate()}_${d.getHours()}h${d.getMinutes()}m${d.getSeconds()}s`;
    let name = `materias-aprobadas_${date}`;
    downloadObjectAsJson(obj, name);
}

function uploadProgress() {
    let input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", () => {
        let ext = input.files[0]["name"]
            .substring(input.files[0]["name"].lastIndexOf(".") + 1)
            .toLowerCase();
        if (input.files && input.files[0] && ext == "json") {
            let reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let txt = e.target.result as string;
                    let obj = JSON.parse(txt);

                    if (obj && Array.isArray(obj)) {
                        currentProgress = new Set(obj);
                        loadPensum();
                        alert(
                            `Se han seleccionado ${currentProgress.size} materias de ${input.files[0].name}.`
                        );
                        return;
                    }
                } catch (e) {
                    console.warn("Could not load progress.json file!");
                    console.warn(e);
                }
            };
            reader.readAsText(input.files[0]);
        } else {
            console.info("progress.json file could not be uploaded.");
        }
    });
}

async function onWindowLoad() {
    {
        let a = document.getElementById('versionSpan');
        let b = document.getElementById('saveVersionSpan');
        if (a) a.innerText = jsVer.toString();
        if (b) b.innerText = saveVer.toString();
    }


    try {
        let carr = await (await fetch("carreras.json")).json();
        let input = document.getElementById("codigoMateria");

        let list = carr.carreras.map((x) => [
            `(${x.codigo}) ${x.nombre}`,
            x.codigo,
        ]);

        // from awesomplete.min.js
        new Awesomplete(input, { minChars: 0, list: list });
    } catch {
        console.warn(
            "carreras.json could not be loaded.\n Search autocomplete will not be available."
        );
    }

    try {
        let tempIgnored = await (await fetch("ignoredMats.json")).json();
        if (tempIgnored) allIgnored = tempIgnored;
    } catch {
        console.warn("ignoredMats.json could not be loaded.");
    }

    // Associate input with Enter.
    document.getElementById("codigoMateria").addEventListener("keyup", (e) => {
        if (e.key === "Enter") loadPensum();
    });

    // Try to get saved data
    loadFromLocalStorage();

    // Do first load
    loadPensum();
}

window.addEventListener("load", onWindowLoad);

window.addEventListener("beforeunload", (event) => {
    saveToLocalStorage();
});
//#endregion
