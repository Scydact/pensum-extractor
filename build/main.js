var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var saveVer = 4;
var jsVer = 1;
var unapecPensumUrl = "https://servicios.unapec.edu.do/pensum/Main/Detalles/";
var allIgnored = {}; // Mats that are no longer available and should be ommited from the pensum
var currentPensumData = null;
var currentPensumCode = "";
var currentPensumMats = {};
var filterMode = "noFilter";
var currentProgress = new Set();
FileSaver.saveAs = saveAs;
var MANAGEMENT_TAKEN_CSS_CLASS = "managementMode-taken";
var CURRENT_PENSUM_VERSION = 2; // Update this if new mats are added to IgnoredMats.json
/** Loads the node given at 'input' into the DOM */
function fetchPensumTable(pensumCode, requestCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var urlToLoad, text, parser, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urlToLoad = unapecPensumUrl + pensumCode;
                    return [4 /*yield*/, fetchHtmlAsText(urlToLoad, { cache: "force-cache" }, -1, requestCallback)];
                case 1:
                    text = _a.sent();
                    parser = new DOMParser();
                    doc = parser.parseFromString(text, "text/xml");
                    return [2 /*return*/, doc];
            }
        });
    });
}
/**
 * Converts the node fetched from UNAPEC to a jObject.
 * @param {Element} node
 */
function extractPensumData(node) {
    var out = {
        carrera: "",
        codigo: "",
        vigencia: "",
        infoCarrera: [],
        cuats: [],
        error: null,
        version: CURRENT_PENSUM_VERSION,
    };
    // Verify if pensum is actually valid data
    if (node.getElementsByClassName("contPensum").length == 0 ||
        node.getElementsByClassName("contPensum")[0].children.length < 2) {
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
    for (var i = 0; i < infoCarrera.length; ++i) {
        out.infoCarrera.push(infoCarrera[i].textContent.replace(/\n/g, " ").trim());
    }
    // Extract cuats
    var cuatrim = node.getElementsByClassName("cuatrim");
    var ignoredMats = new Set(allIgnored[out.codigo]);
    for (var i = 0; i < cuatrim.length; ++i) {
        /**
         * @type {HTMLTableElement}
         */
        var currentCuatTable = cuatrim[i];
        var rows = currentCuatTable.children;
        var outCuat = [];
        for (var j = 1; j < rows.length; ++j) {
            var outMat = {
                codigo: "",
                asignatura: "",
                creditos: 0,
                prereq: [],
                prereqExtra: [],
                cuatrimestre: 0,
            };
            var currentRows = rows[j].children;
            outMat.codigo = currentRows[0].textContent.trim();
            outMat.asignatura = currentRows[1].textContent.trim();
            outMat.creditos = parseFloat(currentRows[2].textContent);
            outMat.cuatrimestre = i + 1;
            // Prerequisitos
            var splitPrereq = currentRows[3].textContent
                .replace(/\n/g, ",")
                .split(",")
                .map(function (x) { return x.trim(); })
                .filter(function (e) { return e !== ""; });
            for (var i_1 = 0; i_1 < splitPrereq.length; i_1++) {
                var a = splitPrereq[i_1];
                if (a.length < 8)
                    outMat.prereq.push(a);
                else
                    outMat.prereqExtra.push(a);
            }
            if (!ignoredMats.has(outMat.codigo))
                outCuat.push(outMat);
        }
        out.cuats.push(outCuat);
    }
    return out;
}
/** Maps an array of Mats to an dict where the keys are the Mats' code */
function matsToDict(arr) {
    var e_1, _a, e_2, _b, e_3, _c;
    var out = {};
    try {
        for (var arr_1 = __values(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
            var x = arr_1_1.value;
            out[x.codigo] = x;
            out[x.codigo].postreq = [];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (arr_1_1 && !arr_1_1.done && (_a = arr_1.return)) _a.call(arr_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        // find postreqs
        for (var arr_2 = __values(arr), arr_2_1 = arr_2.next(); !arr_2_1.done; arr_2_1 = arr_2.next()) {
            var x = arr_2_1.value;
            try {
                for (var _d = (e_3 = void 0, __values(x.prereq)), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var y = _e.value;
                    out[y].postreq.push(x.codigo);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_c = _d.return)) _c.call(_d);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (arr_2_1 && !arr_2_1.done && (_b = arr_2.return)) _b.call(arr_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return out;
}
/** Create mat dialog showing its dependencies and other options... */
function createMatDialog(code) {
    var e_4, _a;
    // let outMat = {
    //     codigo: '',
    //     asignatura: '',
    //     creditos: 0,
    //     prereq: [],
    //     prereqExtra: [],
    // };
    var codeData = currentPensumMats[code];
    if (!codeData)
        return new DialogBox().setMsg("Informacion no disponible para " + code);
    var dialog = new DialogBox();
    var outNode = dialog.contentNode;
    createElement(outNode, "h3", "(" + codeData.codigo + ") '" + codeData.asignatura + "'");
    createElement(outNode, "p", "Codigo: \t" + codeData.codigo);
    createElement(outNode, "p", "Creditos: \t" + codeData.creditos);
    createElement(outNode, "p", "Cuatrimestre: \t" + codeData.cuatrimestre);
    if (codeData.prereq.length > 0 || codeData.prereqExtra.length > 0) {
        createElement(outNode, "h4", "Pre-requisitos");
        var _loop_1 = function (x) {
            var p = createElement(outNode, "p");
            var s = document.createElement("a");
            s.innerText = "(" + x + ") " + currentPensumMats[x].asignatura;
            s.addEventListener("click", function () {
                dialog.hide();
                createMatDialog(x).show();
            });
            s.classList.add("preReq");
            s.classList.add("monospace");
            s.classList.add("c_" + x);
            s.classList.add("c__");
            p.appendChild(s);
        };
        try {
            for (var _b = __values(codeData.prereq), _c = _b.next(); !_c.done; _c = _b.next()) {
                var x = _c.value;
                _loop_1(x);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        codeData.prereqExtra.forEach(function (x) {
            var p = createElement(outNode, "p");
            var s = document.createElement("a");
            s.innerText = x;
            s.classList.add("preReq");
            s.classList.add("preReqExtra");
            p.appendChild(s);
        });
    }
    if (codeData.postreq.length > 0) {
        createElement(outNode, "h4", "Es pre-requisito de: ");
        codeData.postreq.forEach(function (x) {
            var p = createElement(outNode, "p");
            var s = document.createElement("a");
            s.innerText = "(" + x + ") " + currentPensumMats[x].asignatura;
            s.addEventListener("click", function () {
                dialog.hide();
                createMatDialog(x).show();
            });
            s.classList.add("preReq");
            s.classList.add("monospace");
            s.classList.add("c_" + x);
            s.classList.add("c__");
            p.appendChild(s);
        });
    }
    outNode.appendChild(dialog.createCloseButton());
    updateTakenPrereqClasses(outNode);
    return dialog;
}
/** Adds or removes MANAGEMENT_TAKEN_CLASS to the related elements */
function updateTakenPrereqClasses(node) {
    var e_5, _a, e_6, _b, e_7, _c;
    if (node === void 0) { node = document; }
    try {
        for (var _d = __values(node.getElementsByClassName("c__")), _e = _d.next(); !_e.done; _e = _d.next()) {
            var elem = _e.value;
            elem.classList.remove(MANAGEMENT_TAKEN_CSS_CLASS);
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_5) throw e_5.error; }
    }
    try {
        for (var currentProgress_1 = __values(currentProgress), currentProgress_1_1 = currentProgress_1.next(); !currentProgress_1_1.done; currentProgress_1_1 = currentProgress_1.next()) {
            var code = currentProgress_1_1.value;
            try {
                for (var _f = (e_7 = void 0, __values(node.getElementsByClassName("c_" + code))), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var elem = _g.value;
                    elem.classList.add(MANAGEMENT_TAKEN_CSS_CLASS);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (currentProgress_1_1 && !currentProgress_1_1.done && (_b = currentProgress_1.return)) _b.call(currentProgress_1);
        }
        finally { if (e_6) throw e_6.error; }
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
    var matSet = new Set(matArray);
    var out = {
        totalCreds: 0,
        currentCreds: 0,
        currentMats: 0,
        totalMats: Object.keys(currentPensumMats).length,
    };
    for (var matCode in currentPensumMats) {
        var currentMatObj = currentPensumMats[matCode];
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
    var progressData = analyseGradeProgress(currentProgress);
    var node = document.getElementById("progressWrapper");
    node.innerHTML = "";
    var n = ((100 * progressData.currentCreds) / progressData.totalCreds).toFixed(2);
    var bg = "linear-gradient(to right, var(--progress-bar-green) " + n + "%, var(--background) " + n + "%)";
    node.style.backgroundImage = bg;
    if (progressData.currentCreds == 0)
        return;
    createElement(node, "h3", "Progreso en la carrera: ");
    var ul = createElement(node, "ul");
    // Percent of mats
    var m = ((100 * progressData.currentMats) / progressData.totalMats).toFixed(2);
    createElement(ul, "li", "Materias aprobadas: " + progressData.currentMats + "/" + progressData.totalMats + " (" + m + "%)");
    createElement(ul, "li", "Creditos aprobados: " + progressData.currentCreds + "/" + progressData.totalCreds + " (" + n + "%)");
    {
        createElement(node, "label", "Mostrar materias en pensum: ");
        var sel_1 = createElement(node, "select");
        createElement(sel_1, "option", "Mostrar todas").value = "noFilter";
        createElement(sel_1, "option", "Esconder aprobadas").value = "hidePassed";
        createElement(sel_1, "option", "Solo mostrar aprobadas").value = "showPassed";
        sel_1.value = filterMode;
        sel_1.addEventListener("change", function () {
            filterMode = sel_1.value;
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
    var e_8, _a;
    /** @type {HTMLTableElement} */
    var out = document.createElement("table");
    // create the header
    var headerRow = out.createTHead();
    try {
        for (var _b = __values([
            "Ct",
            "✔",
            "Codigo",
            "Asignatura",
            "Créditos",
            "Pre-requisitos",
        ]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var x = _c.value;
            var a = document.createElement("th");
            a.innerText = x;
            headerRow.appendChild(a);
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_8) throw e_8.error; }
    }
    // This allows global showing/hiding of management.
    headerRow.children[1].classList.add("managementMode-cell");
    // create the contents
    data.cuats.forEach(function (cuat, idxCuat) {
        var filteredCuat;
        switch (filterMode) {
            default:
            case "noFilter":
                filteredCuat = cuat;
                break;
            case "showPassed":
                filteredCuat = cuat.filter(function (mat) {
                    return currentProgress.has(mat.codigo);
                });
                break;
            case "hidePassed":
                filteredCuat = cuat.filter(function (mat) { return !currentProgress.has(mat.codigo); });
                break;
        }
        filteredCuat.forEach(function (mat, idxMat, currentCuat) {
            var row = out.insertRow();
            row.id = "r_" + mat.codigo;
            row.classList.add("c_" + mat.codigo);
            row.classList.add("c__");
            if (idxMat === 0) {
                var a = document.createElement("th");
                row.appendChild(a);
                a.rowSpan = currentCuat.length;
                var p = createElement(a, "p", "Cuat. " + (idxCuat + 1), [
                    "vertical-text",
                ]);
                row.classList.add("cuatLimit");
                a.classList.add("cuatHeader");
                // Allow all cuats selection
                a.addEventListener("click", function () {
                    var e_9, _a, e_10, _b;
                    // Check if all are checked
                    var currentCuatMats = cuat.map(function (x) { return x.codigo; });
                    var selectedCuatMats = currentCuatMats.filter(function (x) {
                        return currentProgress.has(x);
                    });
                    // If all are checked, uncheck, else check.
                    if (currentCuatMats.length == selectedCuatMats.length) {
                        try {
                            for (var currentCuatMats_1 = __values(currentCuatMats), currentCuatMats_1_1 = currentCuatMats_1.next(); !currentCuatMats_1_1.done; currentCuatMats_1_1 = currentCuatMats_1.next()) {
                                var x = currentCuatMats_1_1.value;
                                currentProgress.delete(x);
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (currentCuatMats_1_1 && !currentCuatMats_1_1.done && (_a = currentCuatMats_1.return)) _a.call(currentCuatMats_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                    }
                    else {
                        try {
                            for (var currentCuatMats_2 = __values(currentCuatMats), currentCuatMats_2_1 = currentCuatMats_2.next(); !currentCuatMats_2_1.done; currentCuatMats_2_1 = currentCuatMats_2.next()) {
                                var x = currentCuatMats_2_1.value;
                                currentProgress.add(x);
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (currentCuatMats_2_1 && !currentCuatMats_2_1.done && (_b = currentCuatMats_2.return)) _b.call(currentCuatMats_2);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                    }
                    loadPensum();
                });
            }
            // Selection check
            {
                var r = row.insertCell();
                r.classList.add("text-center");
                r.classList.add("managementMode-cell");
                var s_1 = document.createElement("input");
                s_1.type = "checkbox";
                if (currentProgress.has(mat.codigo))
                    s_1.checked = true;
                s_1.addEventListener("change", function () {
                    if (s_1.checked)
                        currentProgress.add(mat.codigo);
                    else
                        currentProgress.delete(mat.codigo);
                    updateTakenPrereqClasses();
                    updateGradeProgress();
                    if (filterMode !== "noFilter") {
                        var allMats = Object.keys(currentPensumMats);
                        var matsLeft = new Set(allMats.filter(function (x) { return !currentProgress.has(x); }));
                        if (matsLeft.size == allMats.length)
                            filterMode = "noFilter";
                        loadPensum();
                    }
                });
                r.appendChild(s_1);
            }
            // Codigo mat.
            {
                var r = row.insertCell();
                r.id = "a_" + mat.codigo;
                r.classList.add("text-center");
                r.classList.add("c_" + mat.codigo);
                r.classList.add("c__");
                var s = document.createElement("a");
                s.innerText = "" + mat.codigo;
                s.addEventListener("click", function () {
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
                var r = row.insertCell();
                r.innerText = mat.creditos;
                r.classList.add("text-center");
            }
            // Prereqs
            {
                var r_1 = row.insertCell();
                mat.prereq.forEach(function (x) {
                    var s = document.createElement("a");
                    s.innerText = x;
                    s.addEventListener("click", function () {
                        var targetCell = document.getElementById("a_" + x);
                        var targetRow = document.getElementById("r_" + x);
                        targetCell.scrollIntoView({ block: "center" });
                        targetRow.classList.remove("highlightRow");
                        targetRow.classList.add("highlightRow");
                        setTimeout(function () { return targetRow.classList.remove("highlightRow"); }, 2e3);
                    });
                    s.classList.add("preReq");
                    s.classList.add("monospace");
                    s.classList.add("c_" + x); // mat's code
                    s.classList.add("c__");
                    r_1.appendChild(s);
                    r_1.appendChild(document.createTextNode("\t"));
                });
                mat.prereqExtra.forEach(function (x) {
                    var s = document.createElement("a");
                    s.innerText = x;
                    s.classList.add("preReq");
                    s.classList.add("preReqExtra");
                    r_1.appendChild(s);
                    r_1.appendChild(document.createTextNode("\t"));
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
function createExcelWorkbookFromPensum(data, progress) {
    if (progress === void 0) { progress = []; }
    var currentProgress = new Set(progress);
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.book_append_sheet(wb, ws, "Pensum");
    ws["!ref"] = "A1:H300"; // Working range
    ws["!merges"] = [];
    function mergeCells(r1, c1, r2, c2) {
        ws["!merges"].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
    }
    var COL_CUAT = "A";
    var COL_CODIGO = "B";
    var COL_NOMBRE = "C";
    var COL_CREDITOS = "D";
    var COL_PREREQ = "EFG";
    var COL_APROB = "H";
    var COLS = "ABCDEFGH";
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
    var currentRow = 1;
    ws[COLS[0] + currentRow] = { v: data.carrera, t: "s" };
    mergeCells(0, 0, 0, 7);
    ++currentRow;
    // create the header
    var headers = [
        "Ct",
        "Codigo",
        "Asignatura",
        "Créditos",
        "Pre-req #1",
        "Pre-req #2",
        "Pre-req #3",
        "Aprobada?",
    ];
    for (var i = 0; i < headers.length; ++i) {
        ws[COLS[i] + currentRow] = { v: headers[i], t: "s" };
    }
    ++currentRow;
    // create the contents
    data.cuats.forEach(function (cuat, idxCuat) {
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
        filteredCuat.forEach(function (mat, idxMat, currentCuat) {
            var e_11, _a, e_12, _b;
            ws[COL_CUAT + currentRow] = { v: idxCuat + 1, t: "n" };
            if (idxMat === 0) {
                mergeCells(currentRow - 1, 0, currentRow - 1 + currentCuat.length - 1, 0);
            }
            // Codigo mat.
            ws[COL_CODIGO + currentRow] = { v: mat.codigo, t: "s" };
            // Asignatura
            ws[COL_NOMBRE + currentRow] = { v: mat.asignatura, t: "s" };
            // Creditos
            ws[COL_CREDITOS + currentRow] = { v: mat.creditos, t: "n" };
            // Prereqs
            var prereqCount = 0;
            try {
                for (var _c = __values(mat.prereq), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var x = _d.value;
                    ws[COL_PREREQ[prereqCount] + currentRow] = { v: x, t: "s" };
                    ++prereqCount;
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_11) throw e_11.error; }
            }
            try {
                for (var _e = __values(mat.prereqExtra), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var x = _f.value;
                    ws[COL_PREREQ[prereqCount] + currentRow] = { v: x, t: "s" };
                    ++prereqCount;
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_12) throw e_12.error; }
            }
            // Aprobada
            var aprobVal = currentProgress.has(mat.codigo) ? 1 : 0;
            ws[COL_APROB + currentRow] = { v: aprobVal, t: "n" };
            ++currentRow;
        });
    });
    try {
        var _a = __read(data.vigencia
            .split("/")
            .map(function (x) { return parseFloat(x); }), 3), cd_d = _a[0], cd_m = _a[1], cd_y = _a[2];
        var createDate = new Date(cd_y, cd_m, cd_d);
    }
    catch (_b) {
        var createDate = new Date();
    }
    wb.Props = {
        Title: "Pensum " + data.codigo + " " + titleCase(data.carrera),
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
    var blob = new Blob([buf], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, fileName);
}
function downloadCurrentPensumAsExcel() {
    var wb = createExcelWorkbookFromPensum(currentPensumData);
    var wb_out = writeExcelWorkbookAsXlsx(wb);
    downloadXlsx(wb_out, wb.Props.Title);
}
/** Extracts and separates the information on 'data.infoCarrera' */
function getInfoList(data) {
    return data.infoCarrera.map(function (x) {
        var splitOnFirstColon = [
            x.substring(0, x.indexOf(": ")),
            x.substring(x.indexOf(": ") + 2),
        ];
        if (splitOnFirstColon[0] == "")
            return { type: "simple", data: x };
        else {
            var splitOnDots = splitOnFirstColon[1].split(". ");
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
    var e_13, _a;
    /** @type {HTMLTableElement} */
    var out = document.createElement("ul");
    // Separate the text before outputting.
    var outTextArr = getInfoList(data);
    try {
        // Format the text as a list
        for (var outTextArr_1 = __values(outTextArr), outTextArr_1_1 = outTextArr_1.next(); !outTextArr_1_1.done; outTextArr_1_1 = outTextArr_1.next()) {
            var x = outTextArr_1_1.value;
            var li = document.createElement("li");
            switch (x.type) {
                case "simple":
                    li.innerText = x.data;
                    break;
                case "double":
                    li.innerHTML = "<b>" + sentenceCase(x.data[0]) + ":</b>\t" + x.data[1];
                    break;
                case "double_sublist":
                    li.innerHTML = "<b>" + sentenceCase(x.data[0]) + ": </b>";
                    var subul = document.createElement("ul");
                    x.data[1].forEach(function (elem) {
                        var subli = document.createElement("li");
                        subli.innerHTML = elem + ".";
                        subul.appendChild(subli);
                    });
                    li.appendChild(subul);
                    break;
            }
            out.appendChild(li);
        }
    }
    catch (e_13_1) { e_13 = { error: e_13_1 }; }
    finally {
        try {
            if (outTextArr_1_1 && !outTextArr_1_1.done && (_a = outTextArr_1.return)) _a.call(outTextArr_1);
        }
        finally { if (e_13) throw e_13.error; }
    }
    return out;
}
//#endregion
//#region Dialogs
function createAllDownloadsDialog() {
    var dialog = new DialogBox();
    var node = dialog.contentNode;
    createElement(node, "h3", "Descargar pensum");
    node.appendChild(createSecondaryButton("Descargar .xlsx (Excel)", downloadCurrentPensumAsExcel));
    node.appendChild(document.createElement("br"));
    node.appendChild(dialog.createCloseButton());
    return dialog;
}
function createImportExportDialog() {
    var dialog = new DialogBox();
    var node = dialog.contentNode;
    createElement(node, "h3", "Exportar/importar progreso");
    [
        "Las materias aprobadas seleccionadas se guardan localmente en la cache del navegador. ",
        "Al estar guardados en la cache, estos datos podrian borrarse en cualquier momento. ",
        "Para evitar la perdida de estos datos, se recomienda exportar la seleccion (<code>progreso.json</code>). ",
        "Luego, en caso de que se haya eliminado la selección, solo es necesario importarlo nuevamente.",
    ].forEach(function (x) { return createElement(node, "p", x); });
    node.appendChild(document.createElement("br"));
    node.appendChild(createSecondaryButton("Exportar progreso.json", downloadProgress));
    node.appendChild(createSecondaryButton("Importar progreso.json", uploadProgress));
    node.appendChild(document.createElement("br"));
    node.appendChild(dialog.createCloseButton());
    return dialog;
}
//#region LocalStorage Funcs
function saveToLocalStorage() {
    var out = {
        saveVer: saveVer,
        currentCodeAtInputForm: document.getElementById("codigoMateria").value,
        progress: __spread(currentProgress),
    };
    try {
        localStorage.setItem("saveData", JSON.stringify(out));
        return true;
    }
    catch (err) {
        console.warn("Could not save saveData to localStorage");
        console.warn(err);
        return false;
    }
}
function loadFromLocalStorage() {
    var saveData = localStorage.getItem("saveData");
    if (saveData === null)
        return false;
    var out = JSON.parse(saveData);
    document.getElementById("codigoMateria").value =
        out.currentCodeAtInputForm;
    if (out.progress)
        currentProgress = new Set(out.progress);
    // Version management and cache clearing.
    if (out.saveVer !== saveVer) {
        console.info("Updated to version " + saveVer + " and cleared localStorage.");
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
function fetchHtmlAsText(url, opts, forceProxy, currentProxyCallback) {
    if (opts === void 0) { opts = {}; }
    if (forceProxy === void 0) { forceProxy = -1; }
    if (currentProxyCallback === void 0) { currentProxyCallback = null; }
    return __awaiter(this, void 0, void 0, function () {
        var corsOverride, i, currProxy, controller, signal, timeoutId, sendDate, response, recieveDate, err_1, recieveDate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    corsOverride = [
                        "https://api.allorigins.win/raw?url=",
                        "https://yacdn.org/serve/",
                        "https://cors-anywhere.herokuapp.com/",
                        "https://crossorigin.me/",
                        "https://cors-proxy.htmldriven.com/?url=",
                        "https://thingproxy.freeboard.io/fetch/",
                        "http://www.whateverorigin.org/get?url=",
                    ];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < corsOverride.length)) return [3 /*break*/, 10];
                    currProxy = corsOverride[i];
                    if (forceProxy !== -1) {
                        if (typeof forceProxy == "number")
                            currProxy = corsOverride[forceProxy];
                        else
                            currProxy = forceProxy;
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, 8, 9]);
                    controller = new AbortController();
                    signal = controller.signal;
                    opts.signal = signal;
                    timeoutId = setTimeout(function () {
                        controller.abort();
                        console.warn("Timed out!");
                    }, 3e3);
                    sendDate = new Date().getTime();
                    return [4 /*yield*/, fetch(currProxy + url, opts)];
                case 3:
                    response = _a.sent();
                    if (currentProxyCallback)
                        currentProxyCallback("request", currProxy, i);
                    clearTimeout(timeoutId);
                    if (!response.ok) return [3 /*break*/, 5];
                    recieveDate = new Date().getTime();
                    console.info("CORS proxy '" + currProxy + "' succeeded in " + (recieveDate - sendDate) + "ms.'");
                    if (currentProxyCallback)
                        currentProxyCallback("success", currProxy, i);
                    return [4 /*yield*/, response.text()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: throw "Response was not OK!";
                case 6: return [3 /*break*/, 9];
                case 7:
                    err_1 = _a.sent();
                    clearTimeout(timeoutId);
                    recieveDate = new Date().getTime();
                    console.warn("CORS proxy '" + currProxy + "' failed in " + (recieveDate - sendDate) + "ms.'");
                    console.warn(err_1);
                    if (currentProxyCallback)
                        currentProxyCallback("error", currProxy, i);
                    return [3 /*break*/, 9];
                case 8:
                    ++i;
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 1];
                case 10: return [2 /*return*/, null];
            }
        });
    });
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
var DialogBox = /** @class */ (function () {
    function DialogBox() {
        this.wrapperNode = document.createElement("div");
        this.wrapperNode.classList.add("fullscreen");
        this.wrapperNode.classList.add("dialogWrapper");
        this.contentNode = document.createElement("div");
        this.contentNode.classList.add("dialogCard");
        this.wrapperNode.appendChild(this.contentNode);
        return this;
    }
    /** Sets the contentNode to a single <p> element with the given text. */
    DialogBox.prototype.setMsg = function (str) {
        createElement(this.contentNode, "p", str);
        this.contentNode.appendChild(this.createCloseButton());
        return this;
    };
    /** Adds the wrapperNode to the document, thus showing the DialogBox. */
    DialogBox.prototype.show = function () {
        document.body.appendChild(this.wrapperNode);
        return this;
    };
    /** Removes the wrapperNode from the document, thus hiding the DialogBox. */
    DialogBox.prototype.hide = function () {
        document.body.removeChild(this.wrapperNode);
        return this;
    };
    /** Creates a generic 'close' button that can be appended to contentNode. */
    DialogBox.prototype.createCloseButton = function () {
        var _this = this;
        var a = document.createElement("a");
        a.innerText = "Cerrar";
        a.addEventListener("click", function () { return _this.hide(); });
        a.classList.add("btn-primary");
        return a;
    };
    return DialogBox;
}());
function downloadObjectAsJson(exportObj, exportNameWithoutExt) {
    var blob = new Blob([JSON.stringify(exportObj)], {
        type: "data:text/json;charset=utf-8",
    });
    FileSaver.saveAs(blob, exportNameWithoutExt + ".json");
}
function createElement(parentNode, tag, innerHTML, classes) {
    if (tag === void 0) { tag = "div"; }
    if (innerHTML === void 0) { innerHTML = null; }
    if (classes === void 0) { classes = []; }
    var x = document.createElement(tag);
    parentNode.appendChild(x);
    if (innerHTML !== null)
        x.innerHTML = innerHTML;
    classes.forEach(function (clss) { return x.classList.add(clss); });
    return x;
}
function createSecondaryButton(text, callback) {
    var a = document.createElement("a");
    a.addEventListener("click", callback);
    a.innerHTML = text;
    a.classList.add("btn-secondary");
    return a;
}
function findAllpostreqs(code) {
    function subFindArr(code) {
        var e_14, _a;
        var hideList = [code];
        try {
            for (var _b = __values(currentPensumMats[code].postreq), _c = _b.next(); !_c.done; _c = _b.next()) {
                var x = _c.value;
                hideList.push.apply(hideList, __spread(subFindArr(x)));
            }
        }
        catch (e_14_1) { e_14 = { error: e_14_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_14) throw e_14.error; }
        }
        return hideList;
    }
    // Set to remove duplicates.
    return __spread(new Set(subFindArr(code)));
}
//#endregion
//#region Init
/** This function is called by the <search> button */
function loadPensum() {
    return __awaiter(this, void 0, void 0, function () {
        var infoWrap, codigoMateriaInput, clearInfoWrap, setInfoWrap_1, pensumNode, newCode, h, btnwrp, a, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    infoWrap = document.getElementById("infoWrapper");
                    codigoMateriaInput = document.getElementById("codigoMateria");
                    currentPensumCode = codigoMateriaInput.value.toUpperCase();
                    clearInfoWrap = function () {
                        infoWrap.innerHTML = "";
                    };
                    setInfoWrap_1 = function (str) {
                        infoWrap.innerHTML = str;
                    };
                    // try to check if its on localStorage, else check online and cache if successful.
                    setInfoWrap_1("Buscando " + currentPensumCode + " en cache local.");
                    currentPensumData = getPensumFromLocalStorage(currentPensumCode);
                    if (!(currentPensumData === null || !currentPensumData['version'] || currentPensumData.version < CURRENT_PENSUM_VERSION)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchPensumTable(currentPensumCode, function (returnCode, proxy, index) {
                            var n = index + 1;
                            switch (returnCode) {
                                case "success":
                                    setInfoWrap_1("Pensum encontrado en " + proxy + " (intento " + n + ")");
                                    break;
                                case "request":
                                    setInfoWrap_1("Buscando pensum en " + proxy + " (intento " + n + ")");
                                    break;
                                case "error":
                                    setInfoWrap_1("Error en " + proxy + " (intento " + n + ")");
                                    break;
                                default:
                                    setInfoWrap_1("??? (" + proxy + ") (intento " + n + ")");
                                    break;
                            }
                        })];
                case 1:
                    pensumNode = _a.sent();
                    currentPensumData = extractPensumData(pensumNode);
                    // Update cache and currentPensumCode if successfuly fetched.
                    if (currentPensumData) {
                        newCode = currentPensumData.codigo;
                        codigoMateriaInput.value = newCode;
                        currentPensumCode = newCode;
                        setPensumToLocalStorage(currentPensumData);
                    }
                    _a.label = 2;
                case 2:
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
                            h = document.createElement("h3");
                            h.innerText = "Detalles de la carrera: ";
                            infoWrap.appendChild(h);
                            infoWrap.appendChild(createInfoList(currentPensumData));
                            btnwrp = createElement(infoWrap, "div", "", [
                                "inline-btn-wrapper",
                            ]);
                            a = createElement(btnwrp, "a", "", [
                                "btn-secondary",
                            ]);
                            a.href = unapecPensumUrl + currentPensumCode;
                            a.target = "_blank";
                            a.innerText = "Ver pensum original";
                            btnwrp.appendChild(createSecondaryButton("Descargar...", function () {
                                return createAllDownloadsDialog().show();
                            }));
                            btnwrp.appendChild(createSecondaryButton("Guardar/Cargar selección", function () {
                                return createImportExportDialog().show();
                            }));
                        }
                    }
                    else {
                        infoWrap.innerText = "No se ha encontrado el pensum!";
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    alert(err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function drawPensumTable() {
    var wrapper = document.getElementById("pensumWrapper");
    var div = document.createElement("div");
    {
        var h = document.createElement("h1");
        h.innerText = currentPensumData.carrera;
        div.appendChild(h);
    }
    div.appendChild(createNewPensumTable(currentPensumData));
    if (wrapper.firstChild)
        wrapper.replaceChild(div, wrapper.firstChild);
    else
        wrapper.appendChild(div);
}
function setPensumToLocalStorage(data) {
    try {
        var code = "cache_" + data.codigo;
        var json = JSON.stringify(data);
        window.localStorage.setItem(code, json);
        return true;
    }
    catch (_a) {
        return false;
    }
}
function getPensumFromLocalStorage(matCode) {
    try {
        var code = "cache_" + matCode;
        var json = window.localStorage.getItem(code);
        return JSON.parse(json);
    }
    catch (_a) {
        return null;
    }
}
function downloadProgress() {
    var obj = __spread(currentProgress);
    var d = new Date();
    var date = "" + d.getFullYear() + d.getMonth() + d.getDate() + "_" + d.getHours() + "h" + d.getMinutes() + "m" + d.getSeconds() + "s";
    var name = "materias-aprobadas_" + date;
    downloadObjectAsJson(obj, name);
}
function uploadProgress() {
    var input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", function () {
        var ext = input.files[0]["name"]
            .substring(input.files[0]["name"].lastIndexOf(".") + 1)
            .toLowerCase();
        if (input.files && input.files[0] && ext == "json") {
            var reader = new FileReader();
            reader.onload = function (e) {
                try {
                    var txt = e.target.result;
                    var obj = JSON.parse(txt);
                    if (obj && Array.isArray(obj)) {
                        currentProgress = new Set(obj);
                        loadPensum();
                        alert("Se han seleccionado " + currentProgress.size + " materias de " + input.files[0].name + ".");
                        return;
                    }
                }
                catch (e) {
                    console.warn("Could not load progress.json file!");
                    console.warn(e);
                }
            };
            reader.readAsText(input.files[0]);
        }
        else {
            console.info("progress.json file could not be uploaded.");
        }
    });
}
function onWindowLoad() {
    return __awaiter(this, void 0, void 0, function () {
        var a, b, carr, input, list, _a, tempIgnored, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    {
                        a = document.getElementById('versionSpan');
                        b = document.getElementById('saveVersionSpan');
                        if (a)
                            a.innerText = jsVer.toString();
                        if (b)
                            b.innerText = saveVer.toString();
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("carreras.json")];
                case 2: return [4 /*yield*/, (_c.sent()).json()];
                case 3:
                    carr = _c.sent();
                    input = document.getElementById("codigoMateria");
                    list = carr.carreras.map(function (x) { return [
                        "(" + x.codigo + ") " + x.nombre,
                        x.codigo,
                    ]; });
                    // from awesomplete.min.js
                    new Awesomplete(input, { minChars: 0, list: list });
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    console.warn("carreras.json could not be loaded.\n Search autocomplete will not be available.");
                    return [3 /*break*/, 5];
                case 5:
                    _c.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, fetch("ignoredMats.json")];
                case 6: return [4 /*yield*/, (_c.sent()).json()];
                case 7:
                    tempIgnored = _c.sent();
                    if (tempIgnored)
                        allIgnored = tempIgnored;
                    return [3 /*break*/, 9];
                case 8:
                    _b = _c.sent();
                    console.warn("ignoredMats.json could not be loaded.");
                    return [3 /*break*/, 9];
                case 9:
                    // Associate input with Enter.
                    document.getElementById("codigoMateria").addEventListener("keyup", function (e) {
                        if (e.key === "Enter")
                            loadPensum();
                    });
                    // Try to get saved data
                    loadFromLocalStorage();
                    // Do first load
                    loadPensum();
                    return [2 /*return*/];
            }
        });
    });
}
window.addEventListener("load", onWindowLoad);
window.addEventListener("beforeunload", function (event) {
    saveToLocalStorage();
});
//#endregion
//# sourceMappingURL=main.js.map