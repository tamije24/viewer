import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

// import AbcIcon from "@mui/icons-material/Abc";
//import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
// import CategoryIcon from "@mui/icons-material/Category";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import {
  DataGridPro,
  GridCallbackDetails,
  GridColDef,
  GridRowParams,
  // GridToolbarContainer,
  // GridToolbarExport,
  MuiEvent,
} from "@mui/x-data-grid-pro";

import Plot from "react-plotly.js";
import { useState } from "react";

import { complex, pi, add, multiply } from "mathjs";
import Divider from "@mui/material/Divider";

interface phasorProps {
  passed_magnitudes: number[];
  angles: number[];
  unit: string[];
  onTabChange: (tab: number) => void;
}

const Phasors = ({
  passed_magnitudes,
  angles,
  unit,
  onTabChange,
}: phasorProps) => {
  const [value, setValue] = useState(0);
  const [magnitudes, setMagnitudes] = useState<number[]>(passed_magnitudes);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    onTabChange(newValue);
  };

  const calculate_sequence_phasors = (
    magnitudes: number[],
    angles: number[]
  ) => {
    // console.log(magnitudes);
    // console.log(angles);
    let sequence_magnitudes: number[] = [0, 0, 0, 0, 0, 0];
    let sequence_angles: number[] = [0, 0, 0, 0, 0, 0];

    let a = complex({ r: 1, phi: (120 * pi) / 90 });
    let a2 = complex({ r: 1, phi: (-120 * pi) / 90 });
    let Ia = complex({ r: magnitudes[0], phi: angles[0] });
    let Ib = complex({ r: magnitudes[1], phi: angles[1] });
    let Ic = complex({ r: magnitudes[2], phi: angles[2] });
    let Va = complex({ r: magnitudes[3], phi: angles[3] });
    let Vb = complex({ r: magnitudes[4], phi: angles[4] });
    let Vc = complex({ r: magnitudes[5], phi: angles[5] });

    let I1 = complex(
      multiply(add(Ia, multiply(a2, Ib), multiply(a, Ic)), 1 / 3).toString()
    );
    let I2 = complex(
      multiply(add(Ia, multiply(a, Ib), multiply(a2, Ic)), 1 / 3).toString()
    );
    let I0 = complex(multiply(add(Ia, Ib, Ic), 1 / 3).toString());

    let V1 = complex(
      multiply(add(Va, multiply(a2, Vb), multiply(a, Vc)), 1 / 3).toString()
    );
    let V2 = complex(
      multiply(add(Va, multiply(a, Vb), multiply(a2, Vc)), 1 / 3).toString()
    );
    let V0 = complex(multiply(add(Va, Vb, Vc), 1 / 3).toString());

    sequence_magnitudes = [
      I1.toPolar().r,
      I2.toPolar().r,
      I0.toPolar().r,
      V1.toPolar().r,
      V2.toPolar().r,
      V0.toPolar().r,
    ];
    sequence_angles = [
      I1.toPolar().phi,
      I2.toPolar().phi,
      I0.toPolar().phi,
      V1.toPolar().phi,
      V2.toPolar().phi,
      V0.toPolar().phi,
    ];

    return [sequence_magnitudes, sequence_angles];
  };

  if (passed_magnitudes === undefined) return <></>;

  let sequence_magnitudes: number[] = [];
  let sequence_angles: number[] = [];
  [sequence_magnitudes, sequence_angles] = calculate_sequence_phasors(
    passed_magnitudes,
    angles
  );
  if (passed_magnitudes !== magnitudes) {
    setMagnitudes(passed_magnitudes);
  }

  return (
    <Box sx={{ width: "100%", height: "100%", border: 0, mt: 0 }}>
      <Divider />
      <Box sx={{ borderBottom: 0, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="phasor tabs"
          centered
        >
          <Tab
            icon={
              <Tooltip title="Phase values" placement="bottom">
                <Diversity2Icon fontSize="medium" />
              </Tooltip>
            }
            {...a11yProps(0)}
            iconPosition="top"
          />
          <Tab
            icon={
              <Tooltip title="Sequence values" placement="bottom">
                <Diversity3Icon fontSize="medium" />
              </Tooltip>
            }
            {...a11yProps(1)}
            iconPosition="top"
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <PolarPlotAndTable
          magnitudes={magnitudes}
          angles_original={angles}
          unit={unit}
          plotType="phase"
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <PolarPlotAndTable
          magnitudes={sequence_magnitudes}
          angles_original={sequence_angles}
          unit={unit}
          plotType="sequence"
        />
      </CustomTabPanel>
    </Box>
  );
};

export default Phasors;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface plotProps {
  magnitudes: number[];
  angles_original: number[];
  unit: string[];
  plotType: string;
}

const PolarPlotAndTable = ({
  magnitudes,
  angles_original,
  unit,
  plotType,
}: plotProps) => {
  // STATE VARIABLES
  const [selectedRow, setSelectedRow] = useState(-1);

  // OTHER VARAIBLES
  let signal =
    plotType === "phase"
      ? ["IA", "IB", "IC", "VA", "VB", "VC"]
      : ["I1", "I2", "I0", "V1", "V2", "V0"];

  let angles: number[] = [];
  // rotate angle if row is selected
  if (selectedRow === -1) {
    // no rotation
    angles = [...angles_original];
  } else {
    let refAngle = angles_original[selectedRow];
    angles = angles_original.map((angle) => angle - refAngle);
  }

  const rows = [];
  for (let i = 0; i < 6; i++) {
    let temp = unit[i] === undefined ? "" : unit[i];
    rows.push({
      id: i,
      Signal: signal[i],
      Mag: `${(Math.round(magnitudes[i] * 1000) / 1000).toFixed(3)} ${temp}`,
      Ang: `${(Math.round(((angles[i] * 180) / Math.PI) * 100) / 100).toFixed(
        2
      )}˚`,
    });
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "Mag",
      headerName: "MAGNITUDE",
      description: "DFT magnitude",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      //   width: 90,
    },
    {
      field: "Ang",
      headerName: "ANGLE",
      description: "DFT angle",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Signal",
      headerName: "SIGNAL",
      description: "Signal",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      // width: 30,
    },
  ];

  // normalize magnitudes
  let I_max = Math.max(magnitudes[0], magnitudes[1], magnitudes[2]);
  let V_max = Math.max(magnitudes[3], magnitudes[4], magnitudes[5]);

  let r_values = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 3; i++) {
    r_values[i] = magnitudes[i] / I_max;
    r_values[i + 3] = magnitudes[i + 3] / V_max;
  }
  const CURRENT_MARKER = "square";
  const VOLTAGE_MARKER = "circle";
  const MARKER_SIZE = 5;

  const LINE_COLOR =
    plotType === "phase"
      ? [
          "crimson",
          "goldenrod",
          "deepskyblue",
          "crimson",
          "goldenrod",
          "deepskyblue",
        ]
      : ["blue", "magenta", "green", "blue", "magenta", "green"];

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => {
    if (selectedRow === params.row.id) setSelectedRow(-1);
    else setSelectedRow(params.row.id);
    //  console.log(params.row.id);
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          border: 0,
          height: `calc((100vh - 350px)*0.63)`,
          bgcolor: "",
          m: 0,
          p: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
            width: "100%",
            m: 0,
            p: 0,
            bgcolor: "",
          }}
        >
          <Plot
            data={[
              {
                name: signal[0],
                type: "scatterpolar",
                mode: "lines",
                r: [0, r_values[0]],
                theta: [
                  (angles[0] * 180) / Math.PI,
                  (angles[0] * 180) / Math.PI,
                ],
                line: {
                  color: LINE_COLOR[0],
                },
                marker: {
                  color: LINE_COLOR[0],
                  symbol: CURRENT_MARKER,
                  size: MARKER_SIZE,
                },
                hoverinfo: "name",
              },
              {
                name: signal[1],
                type: "scatterpolar",
                mode: "lines",
                r: [0, r_values[1]],
                theta: [
                  (angles[1] * 180) / Math.PI,
                  (angles[1] * 180) / Math.PI,
                ],
                line: {
                  color: LINE_COLOR[1],
                },
                marker: {
                  color: LINE_COLOR[1],
                  symbol: CURRENT_MARKER,
                  size: MARKER_SIZE,
                },
                hoverinfo: "name",
              },
              {
                name: signal[2],
                type: "scatterpolar",
                mode: "lines",
                r: [0, r_values[2]],
                theta: [
                  (angles[2] * 180) / Math.PI,
                  (angles[2] * 180) / Math.PI,
                ],
                line: {
                  color: LINE_COLOR[2],
                },
                marker: {
                  color: LINE_COLOR[2],
                  symbol: CURRENT_MARKER,
                  size: MARKER_SIZE,
                },
                hoverinfo: "name",
              },
              {
                name: signal[3],
                type: "scatterpolar",
                mode: "lines",
                r: [0, r_values[3]],
                theta: [
                  (angles[3] * 180) / Math.PI,
                  (angles[3] * 180) / Math.PI,
                ],
                line: {
                  color: LINE_COLOR[3],
                  dash: "dot",
                },
                marker: {
                  color: LINE_COLOR[3],
                  symbol: VOLTAGE_MARKER,
                  size: MARKER_SIZE,
                },
                hoverinfo: "name",
              },
              {
                name: signal[4],
                type: "scatterpolar",
                mode: "lines",
                r: [0, r_values[4]],
                theta: [
                  (angles[4] * 180) / Math.PI,
                  (angles[4] * 180) / Math.PI,
                ],
                line: {
                  color: LINE_COLOR[4],
                  dash: "dot",
                },
                marker: {
                  color: LINE_COLOR[4],
                  symbol: VOLTAGE_MARKER,
                  size: MARKER_SIZE,
                },
                hoverinfo: "name",
              },
              {
                name: signal[5],
                type: "scatterpolar",
                mode: "lines",
                r: [0, r_values[5]],
                theta: [
                  (angles[5] * 180) / Math.PI,
                  (angles[5] * 180) / Math.PI,
                ],
                line: {
                  color: LINE_COLOR[5],
                  dash: "dot",
                },
                marker: {
                  color: LINE_COLOR[5],
                  symbol: VOLTAGE_MARKER,
                  size: MARKER_SIZE,
                },
                hoverinfo: "name",
              },
            ]}
            layout={{
              //autosize: true,
              width: 290,
              height: 350,
              margin: {
                b: 50,
                l: 30,
                pad: 0,
                r: 20,
                t: 20,
              },
              paper_bgcolor: "",
              showlegend: true,
              legend: {
                orientation: "h",
                font: {
                  size: 7,
                },
                xref: "paper",
                xanchor: "left",
              },
              polar: {
                domain: {
                  x: [0, 1],
                  y: [0, 1],
                },
                radialaxis: {
                  showticklabels: false,
                },
                angularaxis: {
                  tickfont: {
                    size: 8,
                  },
                  rotation: 0,
                  direction: "counterclockwise",
                },
              },

              modebar: {
                remove: ["lasso2d", "zoom2d", "select2d"],
              },
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              // scrollZoom: true,
            }}
          />
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          mt: 0.2,
          height: `calc((100vh - 350px)*0.3)`,
          bgcolor: "",
        }}
      >
        <DataGridPro
          rows={rows}
          columns={columns}
          hideFooterRowCount
          checkboxSelection={false}
          showCellVerticalBorder={true}
          showColumnVerticalBorder={true}
          disableColumnMenu={true}
          density={"compact"}
          columnHeaderHeight={35}
          rowHeight={33}
          // slots={{ toolbar: CustomToolbar }}
          sx={{
            fontSize: "0.7rem",
            //  width: "100%",
            "&.Mui-selected": { backgroundColor: "red" },
            //  "&:hover": { backgroundColor: "green" },
          }}
          slotProps={{
            row: {
              style: {
                cursor: "pointer",
                // backgroundColor: (params.id) "red"
              },
            },
          }}
          hideFooter={true}
          onRowClick={handleRowClick}
        />
      </Grid>
    </Grid>
  );
};

// function CustomToolbar() {
//   return (
//     <GridToolbarContainer
//       sx={{
//         borderBottom: 0.2,
//         borderColor: "divider",
//         justifyContent: "left",
//         height: "30px",
//         mt: 0,
//         pt: 0,
//       }}
//     >
//       <GridToolbarExport />
//     </GridToolbarContainer>
//   );
// }
