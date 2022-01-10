import { Enabled, GroupByType, PageFitMode } from "basicprimitives"

export default function createOrgChartOptions(templates: any[] = [], onTemplateRender?: Function) {
  return {
    pageFitMode: PageFitMode.None,

    // Rendering
    arrowsDirection: GroupByType.Children,
    linesWidth: 3,
    linesColor: 'var(--bs-body-color, black)',
    normalLevelShift: 30,
    lineLevelShift: 20,
    dotLevelShift: 20,
    alignBylevels: true,
    hideGrandParentsConnectors: true,

    // templates
    templates,
    onItemRender: onTemplateRender,

    // Buttons
    hasButtons: Enabled.True,
    buttonsPanelSize: 38,

    // Extras
    hasSelectorCheckbox: Enabled.False,
    showCallout: false,
    highlightGravityRadius: 0,

  }
}


/** Used only for the PDF, since the web version uses React! */
export function getMatTemplate() {
  var result: any = {};
  result.name = "matTemplate";
  result.itemSize = { width: 200, height: 100 };
  result.minimizedItemSize = { width: 3, height: 3 };

  /* the following example demonstrates JSONML template see http://http://www.jsonml.org/ for details: */
  result.itemTemplate = ["div",
      {
          "style": {
              "width": result.itemSize.width + "px",
              "height": result.itemSize.height + "px"
          },
          "class": ["bp-item", "bp-corner-all", "c__", "preReq"]
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
              "class": ["bp-txt", "monospace"],
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
              "class": ["bp-title", "bp-head", "monospace"],
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