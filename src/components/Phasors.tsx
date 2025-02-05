import { useState } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";

import {
  DataGridPro,
  GridCallbackDetails,
  GridColDef,
  GridRowParams,
  GridRowSelectionModel,
  // GridToolbarContainer,
  // GridToolbarExport,
  MuiEvent,
} from "@mui/x-data-grid-pro";

// import AbcIcon from "@mui/icons-material/Abc";
//import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import ListAltIcon from "@mui/icons-material/ListAlt";

import Plot from "react-plotly.js";
import { Dash, Data } from "plotly.js";

import { complex, pi, add, multiply } from "mathjs";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";

interface phasorProps {
  signal_id: string[];
  passed_magnitudes: number[];
  angles: number[];
  unit: string[];
  onTabChange: (tab: number) => void;
  rowSelectionModel: GridRowSelectionModel;
  onRowSelectionModelChange: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
}

const Phasors = ({
  signal_id,
  passed_magnitudes,
  angles,
  unit,
  onTabChange,
  rowSelectionModel,
  onRowSelectionModelChange,
}: phasorProps) => {
  const [value, setValue] = useState(0);
  const [magnitudes, setMagnitudes] = useState<number[]>(passed_magnitudes);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    onTabChange(newValue);
  };

  if (passed_magnitudes === undefined) return <></>;
  if (passed_magnitudes !== magnitudes) {
    setMagnitudes(passed_magnitudes);
  }

  if (
    passed_magnitudes === undefined ||
    passed_magnitudes.length === 0 ||
    passed_magnitudes[0] === undefined
  ) {
    return (
      <Box sx={{ display: "flex-box", mt: 10, ml: 2, mb: 2 }}>
        <Typography variant="body2" component="div" color="forestgreen">
          Please select a cursor to view phasor values.
        </Typography>
      </Box>
    );
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
        <PhasePolarPlotAndTable
          signal_id={signal_id}
          magnitudes_original={magnitudes}
          angles_original={angles}
          unit={unit}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={onRowSelectionModelChange}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <SequencePolarPlotAndTable
          signal_id={signal_id}
          magnitudes_original={magnitudes}
          angles_original={angles}
          unit={unit}
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

interface phasePlotProps {
  signal_id: string[];
  magnitudes_original: number[];
  angles_original: number[];
  unit: string[];
  rowSelectionModel: GridRowSelectionModel;
  onRowSelectionModelChange: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
}

const PhasePolarPlotAndTable = ({
  signal_id,
  magnitudes_original,
  angles_original,
  unit,
  rowSelectionModel,
  onRowSelectionModelChange,
}: phasePlotProps) => {
  // STATE VARIABLES
  const [selectedRow, setSelectedRow] = useState(-1);
  const [legendSelected, setLegendSelected] = useState(true);

  // OTHER VARAIBLES
  const rows = [];
  let refAngle = 0;

  // rotate angle if row is selected
  if (selectedRow !== -1) {
    refAngle = angles_original[selectedRow];
  }

  let temp = "";
  let ang;
  for (let i = 0; i < signal_id.length; i++) {
    temp = unit[i] === undefined ? "" : unit[i];
    ang = ((angles_original[i] - refAngle) * 180) / Math.PI;
    if (ang < 0) ang = ang + 360;

    // Data for table
    rows.push({
      id: signal_id[i],
      rowid: i,
      Mag: magnitudes_original[i]
        ? `${(Math.round(magnitudes_original[i] * 1000) / 1000).toFixed(
            3
          )} ${temp}`
        : `-`,
      Ang:
        angles_original[i] || refAngle
          ? `${(Math.round(ang * 100) / 100).toFixed(2)}˚`
          : `-`,
    });
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "id",
      headerName: "SIGNAL",
      description: "Signal",
      sortable: false,
      // headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      headerClassName: "super-app-theme--header",
      align: "center",
      headerAlign: "center",
      // width: 30,
    },
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
  ];

  // normalize magnitudes
  let current_magnitudes: number[] = [];
  let voltage_magnitudes: number[] = [];

  for (let i = 0; i < signal_id.length; i++) {
    let toDisplay = rowSelectionModel.some((waveform: any) => {
      return waveform === signal_id[i];
    });

    if (toDisplay) {
      if (signal_id[i].slice(0, 1) === "I") {
        current_magnitudes.push(magnitudes_original[i]);
      } else {
        voltage_magnitudes.push(magnitudes_original[i]);
      }
    }
  }
  let I_max = Math.max(...current_magnitudes);
  let V_max = Math.max(...voltage_magnitudes);

  let r_values: number = 0;
  const data: Data[] = [];
  const CURRENT_MARKER = "square";
  const VOLTAGE_MARKER = "circle";
  const MARKER_SIZE = 5;
  const LINE_COLOR = [
    "crimson",
    "goldenrod",
    "deepskyblue",
    "black",
    "crimson",
    "goldenrod",
    "deepskyblue",
    "blue",
    "magenta",
    "green",
    "black",
    "blue",
    "magenta",
    "green",
  ];

  for (let i = 0; i < signal_id.length; i++) {
    let toDisplay = rowSelectionModel.some((waveform: any) => {
      return waveform === signal_id[i];
    });

    if (toDisplay) {
      let marker;
      let dash: Dash = "solid";
      if (signal_id[i].slice(0, 1) === "I") {
        r_values = magnitudes_original[i] / I_max;
        marker = CURRENT_MARKER;
        dash = "solid";
      } else {
        r_values = magnitudes_original[i] / V_max;
        marker = VOLTAGE_MARKER;
        dash = "dot";
      }

      let temp_angle = ((angles_original[i] - refAngle) * 180) / Math.PI;
      data.push({
        name: signal_id[i],
        type: "scatterpolar",
        mode: "lines",
        r: [0, r_values],
        theta: [temp_angle, temp_angle],
        line: {
          color: LINE_COLOR[i],
          dash: dash,
        },
        marker: {
          color: LINE_COLOR[i],
          symbol: marker,
          size: MARKER_SIZE,
        },
        hoverinfo: "name",
      });
    }
  }

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => {
    if (selectedRow === params.row.rowid) setSelectedRow(-1);
    else setSelectedRow(params.row.rowid);
    //  console.log(params.row.id);
  };

  return (
    <Grid container sx={{ bgcolor: "" }}>
      <Grid
        item
        xs={12}
        sx={{
          alignContent: "flex-start",
          justifyContent: "flex-end",
          justifyItems: "right",
          mb: -10,
          ml: 1,
        }}
      >
        <Fab
          size="small"
          //  color={legendSelected ? "info" : "default"}
          onClick={() => {
            setLegendSelected(!legendSelected);
          }}
          sx={{
            height: 25,
            minHeight: 25,
            width: 25,
            bgcolor: "white",
            border: 0,
            boxShadow: "none",
            color: "white",
          }}
        >
          <Tooltip
            title={legendSelected ? "Hide Legend" : "Show Legend"}
            placement="top"
          >
            <ListAltIcon
              fontSize="small"
              sx={{
                color: legendSelected ? "info.main" : "grey",
                height: 16,
                width: 16,
              }}
            />
          </Tooltip>
        </Fab>
      </Grid>
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
            data={data}
            layout={{
              //autosize: true,
              width: 290,
              height: 350,
              margin: {
                b: 0,
                l: 30,
                pad: 0,
                r: 20,
                t: 20,
              },
              paper_bgcolor: "",
              showlegend: legendSelected,
              legend: {
                orientation: "h",
                font: {
                  size: 7,
                },
                xref: "paper",
                xanchor: "left",
                x: 0,
                //valign: "bottom",
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
          checkboxSelection={true}
          showCellVerticalBorder={true}
          showColumnVerticalBorder={true}
          disableColumnMenu={true}
          density={"compact"}
          columnHeaderHeight={35}
          rowHeight={33}
          // slots={{ toolbar: CustomToolbar }}
          sx={{
            border: 0.2,
            borderRadius: 0,
            borderColor: "olivedrab",
            fontSize: "0.7rem",
            //  width: "100%",
            "&.Mui-selected": { backgroundColor: "red" },
            //  "&:hover": { backgroundColor: "green" },
            "& .super-app-theme--header": {
              // backgroundColor: "rgba(0, 100, 80, 0.7)",
              backgroundColor: "olivedrab",
              color: "white",
            },
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
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            onRowSelectionModelChange(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
        />
      </Grid>
    </Grid>
  );
};

interface sequencePlotProps {
  signal_id: string[];
  magnitudes_original: number[];
  angles_original: number[];
  unit: string[];
}

const SequencePolarPlotAndTable = ({
  signal_id,
  magnitudes_original,
  angles_original,
  unit,
}: sequencePlotProps) => {
  // STATE VARIABLES
  const [selectedRow, setSelectedRow] = useState(-1);
  const [legendSelected, setLegendSelected] = useState(true);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([
      "I1-1",
      "I2-1",
      "I0-1",
      "I1-2",
      "I2-2",
      "I0-2",
    ]);

  // OTHER VARAIBLES
  const sequence_signal: string[] = [];
  const sequence_magnitudes: number[] = [];
  const sequence_angles: number[] = [];
  const sequence_units: { current: string; voltage: string }[] = [];

  const rows = [];

  let refAngle = 0;

  const a = complex({ r: 1, phi: (120 * pi) / 90 });
  const a2 = complex({ r: 1, phi: (-120 * pi) / 90 });

  let stationCount = Math.round(signal_id.length / 7);

  if (magnitudes_original.length === 0) return <></>;

  for (let station = 0; station < stationCount; station++) {
    // units
    sequence_units.push({
      current: unit[station * 7 + 0],
      voltage: unit[station * 7 + 4],
    });

    // extract phase values
    let temp_suffix = signal_id[station * 7 + 0].at(-1);
    let Ia = complex({
      r: magnitudes_original[station * 7 + 0],
      phi: angles_original[station * 7 + 0],
    });
    let Ib = complex({
      r: magnitudes_original[station * 7 + 1],
      phi: angles_original[station * 7 + 1],
    });
    let Ic = complex({
      r: magnitudes_original[station * 7 + 2],
      phi: angles_original[station * 7 + 2],
    });
    // SKIP IN
    let Va = complex({
      r: magnitudes_original[station * 7 + 4],
      phi: angles_original[station * 7 + 4],
    });
    let Vb = complex({
      r: magnitudes_original[station * 7 + 5],
      phi: angles_original[station * 7 + 5],
    });
    let Vc = complex({
      r: magnitudes_original[station * 7 + 6],
      phi: angles_original[station * 7 + 6],
    });

    // Calculate sequence phasors
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

    sequence_magnitudes.push(I1.toPolar().r);
    sequence_magnitudes.push(I2.toPolar().r);
    sequence_magnitudes.push(I0.toPolar().r);
    sequence_magnitudes.push(V1.toPolar().r);
    sequence_magnitudes.push(V2.toPolar().r);
    sequence_magnitudes.push(V0.toPolar().r);

    sequence_angles.push(I1.toPolar().phi);
    sequence_angles.push(I2.toPolar().phi);
    sequence_angles.push(I0.toPolar().phi);
    sequence_angles.push(V1.toPolar().phi);
    sequence_angles.push(V2.toPolar().phi);
    sequence_angles.push(V0.toPolar().phi);

    sequence_signal.push(`I1-${temp_suffix}`);
    sequence_signal.push(`I2-${temp_suffix}`);
    sequence_signal.push(`I0-${temp_suffix}`);
    sequence_signal.push(`V1-${temp_suffix}`);
    sequence_signal.push(`V2-${temp_suffix}`);
    sequence_signal.push(`V0-${temp_suffix}`);
  }

  // rotate angle if row is selected
  if (selectedRow !== -1) {
    refAngle = sequence_angles[selectedRow];
  }
  let temp = "";
  let ang = 0;
  for (let station = 0; station < stationCount; station++) {
    for (let i = 0; i < 6; i++) {
      if (i < 3)
        temp =
          sequence_units[station].current === undefined
            ? ""
            : sequence_units[station].current;
      else
        temp =
          sequence_units[station].voltage === undefined
            ? ""
            : sequence_units[station].voltage;

      ang = ((sequence_angles[station * 6 + i] - refAngle) * 180) / Math.PI;
      if (ang < 0) ang = ang + 360;
      // Data for table
      rows.push({
        id: sequence_signal[station * 6 + i],
        rowid: station * 6 + i,
        Mag: sequence_magnitudes[station * 6 + i]
          ? `${(
              Math.round(sequence_magnitudes[station * 6 + i] * 1000) / 1000
            ).toFixed(3)} ${temp}`
          : `-`,
        Ang:
          sequence_angles[station * 6 + i] || refAngle
            ? `${(Math.round(ang * 100) / 100).toFixed(2)}˚`
            : `-`,
      });
    }
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "id",
      headerName: "SIGNAL",
      description: "Signal",
      sortable: false,
      //headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      headerClassName: "super-app-theme--header",
      align: "center",
      headerAlign: "center",
      // width: 30,
    },
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
  ];

  // normalize magnitudes
  let current_magnitudes: number[] = [];
  let voltage_magnitudes: number[] = [];

  for (let i = 0; i < sequence_signal.length; i++) {
    let toDisplay = rowSelectionModel.some((waveform: any) => {
      return waveform === sequence_signal[i];
    });

    if (toDisplay) {
      if (sequence_signal[i].slice(0, 1) === "I") {
        current_magnitudes.push(sequence_magnitudes[i]);
      } else {
        voltage_magnitudes.push(sequence_magnitudes[i]);
      }
    }
  }
  let I_max = Math.max(...current_magnitudes);
  let V_max = Math.max(...voltage_magnitudes);

  let r_values: number = 0;
  const data: Data[] = [];
  const CURRENT_MARKER = "square";
  const VOLTAGE_MARKER = "circle";
  const MARKER_SIZE = 5;
  const LINE_COLOR = [
    "crimson",
    "goldenrod",
    "deepskyblue",
    "black",
    "crimson",
    "goldenrod",
    "deepskyblue",
    "blue",
    "magenta",
    "green",
    "black",
    "blue",
    "magenta",
    "green",
  ];

  for (let i = 0; i < sequence_signal.length; i++) {
    let toDisplay = rowSelectionModel.some((waveform: any) => {
      return waveform === sequence_signal[i];
    });

    if (toDisplay) {
      let marker;
      let dash: Dash = "solid";
      if (sequence_signal[i].slice(0, 1) === "I") {
        r_values = sequence_magnitudes[i] / I_max;
        marker = CURRENT_MARKER;
        dash = "solid";
      } else {
        r_values = sequence_magnitudes[i] / V_max;
        marker = VOLTAGE_MARKER;
        dash = "dot";
      }

      let temp_angle = ((sequence_angles[i] - refAngle) * 180) / Math.PI;
      data.push({
        name: sequence_signal[i],
        type: "scatterpolar",
        mode: "lines",
        r: [0, r_values],
        theta: [temp_angle, temp_angle],
        line: {
          color: LINE_COLOR[i],
          dash: dash,
        },
        marker: {
          color: LINE_COLOR[i],
          symbol: marker,
          size: MARKER_SIZE,
        },
        hoverinfo: "name",
      });
    }
  }

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => {
    if (selectedRow === params.row.rowid) setSelectedRow(-1);
    else setSelectedRow(params.row.rowid);
    //  console.log(params.row.id);
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          alignContent: "flex-start",
          justifyContent: "flex-end",
          justifyItems: "right",
          mb: -10,
          ml: 1,
        }}
      >
        <Fab
          size="small"
          //  color={legendSelected ? "info" : "default"}
          onClick={() => {
            setLegendSelected(!legendSelected);
          }}
          sx={{
            height: 25,
            minHeight: 25,
            width: 25,
            bgcolor: "white",
            border: 0,
            boxShadow: "none",
            color: "white",
          }}
        >
          <Tooltip
            title={legendSelected ? "Hide Legend" : "Show Legend"}
            placement="top"
          >
            <ListAltIcon
              fontSize="small"
              sx={{
                color: legendSelected ? "info.main" : "grey",
                height: 16,
                width: 16,
              }}
            />
          </Tooltip>
        </Fab>
      </Grid>
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
            data={data}
            layout={{
              //autosize: true,
              width: 290,
              height: 350,
              margin: {
                b: 0,
                l: 30,
                pad: 0,
                r: 20,
                t: 20,
              },
              paper_bgcolor: "",
              showlegend: legendSelected,
              legend: {
                orientation: "h",
                font: {
                  size: 7,
                },
                xref: "paper",
                xanchor: "left",
                x: 0,
                //valign: "bottom",
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
          checkboxSelection={true}
          showCellVerticalBorder={true}
          showColumnVerticalBorder={true}
          disableColumnMenu={true}
          density={"compact"}
          columnHeaderHeight={35}
          rowHeight={33}
          // slots={{ toolbar: CustomToolbar }}
          sx={{
            border: 0.2,
            borderRadius: 0,
            borderColor: "olivedrab",
            fontSize: "0.7rem",
            //  width: "100%",
            "&.Mui-selected": { bgcolor: "red" },
            //"&:hover": { backgroundColor: "green" },
            "& .super-app-theme--header": {
              // backgroundColor: "rgba(0, 100, 80, 0.7)",
              backgroundColor: "olivedrab",
              color: "white",
            },
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
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            if (rowSelectionModel !== newRowSelectionModel) {
              setRowSelectionModel(newRowSelectionModel);
            }
          }}
          rowSelectionModel={rowSelectionModel}
        />
      </Grid>
    </Grid>
  );
};
