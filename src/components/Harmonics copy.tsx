import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import {
  DataGridPro,
  GridCallbackDetails,
  GridColDef,
  GridColumnHeaderParams,
  GridRowParams,
  GridPinnedColumnFields,
  // GridToolbarContainer,
  // GridToolbarExport,
  MuiEvent,
} from "@mui/x-data-grid-pro";
import { BarChart } from "@mui/x-charts/BarChart";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

import harmonicService, { Harmonic } from "../services/harmonic-service";
import comtradeFileService, {
  ComtradeFile,
} from "../services/comtrade-file-service";

import { Typography } from "@mui/material";

interface harmonicsProps {
  selectedFile: number[];
  projectId: number;
  dataIndex: number;
  secondaryIndex: number;
}

let dataset: Harmonic[] = [];
//let sampling_frequency: number = 0;
let line_frequency: number = 0;
let N: number = 0;

const Harmonics = ({
  selectedFile,
  projectId,
  dataIndex,
  secondaryIndex,
}: harmonicsProps) => {
  // STATE VARIABLES
  const [samplingFrequency, setSamplingFrequency] = useState(0);
  const [harmonicsLoading, setHarmonicsLoading] = useState(false);
  const [harmonicsError, setHarmonicsError] = useState("");
  const [maxHarmonic, setMaxHarmonic] = useState(5);
  const [selectedSignals, setSelectedSignals] = useState([
    true,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => {
    setMaxHarmonic(params.row.id);
    // console.log(params.row.id);
  };

  const handleColumnClick = (
    params: GridColumnHeaderParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => {
    let a = [...selectedSignals];
    if (params.field == "Ia") a[0] = !a[0];
    else if (params.field == "Ib") a[1] = !a[1];
    else if (params.field == "Ic") a[2] = !a[2];
    else if (params.field == "In") a[3] = !a[3];
    else if (params.field == "Va") a[4] = !a[4];
    else if (params.field == "Vb") a[5] = !a[5];
    else if (params.field == "Vc") a[6] = !a[6];

    const isAllZero = a.every((item) => item === false);
    if (isAllZero) a[0] = true;

    setSelectedSignals(a);
  };

  // Determine one cycle length
  if (line_frequency > 0) N = Math.round(samplingFrequency / line_frequency);

  useEffect(() => {
    const { request, cancel } = comtradeFileService.getComtradeFile(
      projectId ? projectId : 0,
      selectedFile ? selectedFile[0] : 0
    );
    request
      .then((res) => {
        let comtradeFile: ComtradeFile = res.data;
        line_frequency = comtradeFile.line_frequency;
        setSamplingFrequency(comtradeFile.sampling_frequency);
      })
      .catch((err) => {
        if (err instanceof TypeError) return;
      });
    return () => cancel();
  }, [selectedFile]);

  useEffect(() => {
    // reset all data
    dataset = [];
    if (dataIndex - secondaryIndex >= N && N > 0) {
      setHarmonicsLoading(true);
      // get harmonics from backend

      // let results = JSON.parse(String(res.data));
      //       let m = 0;
      //       let returned_fileid = results.file;

      //       for (let k = 0; k < project.files.length; k++) {
      //         if (returned_fileid === project.files[k].file_id) m = k;
      //       }

      harmonicService
        .getAllHarmonics(selectedFile[0], secondaryIndex, dataIndex)
        .then((res) => {
          dataset = JSON.parse(String(res.data)).harmonics;
          setHarmonicsLoading(false);
          setHarmonicsError("");
          // setMaxHarmonic(5);
        })
        .catch((err) => {
          if (err instanceof TypeError) return;
          setHarmonicsError(err.message);
          setHarmonicsLoading(false);
          console.log("Error .. ", err.message);
        });
    }
  }, [selectedFile, secondaryIndex, dataIndex, samplingFrequency]);

  // console.log(harmonicsLoading);
  // console.log(dataset);
  // console.log(dataset.length);

  if (harmonicsLoading || N === 0) {
    return <LoadingPage />;
  }

  if (harmonicsError !== "") {
    return <Typography>Error: harmonicsError</Typography>;
  }

  // Check if window size is more than one cycle
  if (dataIndex - secondaryIndex < N && N > 0) {
    return <OneCyclePage />;
  }

  if (dataset.length > 0) {
    return (
      <Box sx={{ width: "100%", height: "100%", border: 0, mt: 0 }}>
        <Divider />
        <Grid container>
          <Grid
            item
            xs={12}
            sx={{
              border: 0,
              height: `calc((100vh - 330px)*0.7)`,
              bgcolor: "",
              m: 0,
              p: 0,
            }}
          >
            <HarmonicsPlot
              maxHarmonic={maxHarmonic}
              selectedSignals={selectedSignals}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              mt: 0.2,
              height: `calc((100vh - 330px)*0.3)`,
              bgcolor: "",
            }}
          >
            <HarmonicsTable
              onRowClick={handleRowClick}
              onColumnClick={handleColumnClick}
              selectedSignals={selectedSignals}
            />
          </Grid>
        </Grid>
      </Box>
    );
  } else {
    return <LoadingPage />;
  }
};

export default Harmonics;

interface TableProps {
  onRowClick: (
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => void;
  onColumnClick: (
    params: GridColumnHeaderParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ) => void;
  selectedSignals: boolean[];
}

function HarmonicsTable({
  onRowClick,
  onColumnClick,
  selectedSignals,
}: TableProps) {
  const [valueType, setValueType] = useState("percent");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueType((event.target as HTMLInputElement).value);
  };

  let mySelectedSignals = [];
  if (selectedSignals === undefined)
    mySelectedSignals = [true, false, false, false, false, false, false];
  else mySelectedSignals = [...selectedSignals];

  let signal = ["0", "0", "0", "0", "0", "0", "0"];
  const rows = [];
  for (let i = 0; i < dataset.length; i++) {
    if (valueType == "percent") {
      signal[0] = `${Math.round((dataset[i].ia / dataset[1].ia) * 100).toFixed(
        0
      )}%`;
      signal[1] = `${Math.round((dataset[i].ib / dataset[1].ib) * 100).toFixed(
        0
      )}%`;
      signal[2] = `${Math.round((dataset[i].ic / dataset[1].ic) * 100).toFixed(
        0
      )}%`;
      signal[3] = `${Math.round((dataset[i].in / dataset[1].in) * 100).toFixed(
        0
      )}%`;
      signal[4] = `${Math.round((dataset[i].va / dataset[1].va) * 100).toFixed(
        0
      )}%`;
      signal[5] = `${Math.round((dataset[i].vb / dataset[1].vb) * 100).toFixed(
        0
      )}%`;
      signal[6] = `${Math.round((dataset[i].vc / dataset[1].vc) * 100).toFixed(
        0
      )}%`;
    } else {
      signal[0] = (Math.round(dataset[i].ia * 100) / 100).toFixed(2);
      signal[1] = (Math.round(dataset[i].ib * 100) / 100).toFixed(2);
      signal[2] = (Math.round(dataset[i].ic * 100) / 100).toFixed(2);
      signal[3] = (Math.round(dataset[i].in * 100) / 100).toFixed(2);
      signal[4] = (Math.round(dataset[i].va * 100) / 100).toFixed(2);
      signal[5] = (Math.round(dataset[i].vb * 100) / 100).toFixed(2);
      signal[6] = (Math.round(dataset[i].vc * 100) / 100).toFixed(2);
    }
    rows.push({
      id: i,
      Harmonic: dataset[i].harmonic,
      Frequency: dataset[i].harmonic * 50,
      Ia: signal[0],
      Ib: signal[1],
      Ic: signal[2],
      In: signal[3],
      Va: signal[4],
      Vb: signal[5],
      Vc: signal[6],
    });
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "Harmonic",
      headerName: "No.",
      description: "Harmonic Number",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 10,
    },
    {
      field: "Frequency",
      headerName: "Freq.",
      description: "Harmonic frequency",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 30,
    },
    {
      field: "Ia",
      headerName: "Ia",
      description: "RMS value of Ia",
      sortable: false,
      headerClassName:
        mySelectedSignals[0] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
    {
      field: "Ib",
      headerName: "Ib",
      description: "RMS value of Ib",
      sortable: false,
      headerClassName:
        mySelectedSignals[1] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
    {
      field: "Ic",
      headerName: "Ic",
      description: "RMS value of Ic",
      sortable: false,
      headerClassName:
        mySelectedSignals[2] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
    {
      field: "In",
      headerName: "In",
      description: "RMS value of In",
      sortable: false,
      headerClassName:
        mySelectedSignals[3] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
    {
      field: "Va",
      headerName: "Va",
      description: "RMS value of Va",
      sortable: false,
      headerClassName:
        mySelectedSignals[4] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
    {
      field: "Vb",
      headerName: "Vb",
      description: "RMS value of Vb",
      sortable: false,
      headerClassName:
        mySelectedSignals[5] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
    {
      field: "Vc",
      headerName: "Vc",
      description: "RMS value of Vc",
      sortable: false,
      headerClassName:
        mySelectedSignals[6] === true
          ? "super-app-theme--header"
          : "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },
  ];

  const pinnedColumns: GridPinnedColumnFields = { left: ["Harmonic"] };

  return (
    <Grid
      container
      sx={{
        border: 0,
        height: "100%",
        bgcolor: "",
        m: 0,
        p: 0,
      }}
    >
      <Grid
        item
        xs={12}
        sx={{
          border: 0,
          height: "20%",
          bgcolor: "",
          paddingLeft: 1,
          backgroundColor: "",
          alignItems: "center",
        }}
      >
        <RadioGroup
          row
          color="secondary"
          name="harmonics-value-type"
          value={valueType}
          onChange={handleChange}
          sx={{
            backgroundColor: "",
          }}
        >
          <FormControlLabel
            value="rms"
            control={<Radio size="small" />}
            label="Rms"
            slotProps={{
              typography: {
                fontSize: 14,
              },
            }}
          />
          <FormControlLabel
            value="percent"
            control={<Radio size="small" />}
            label="Percentage"
            slotProps={{
              typography: {
                fontSize: 14,
              },
            }}
          />
        </RadioGroup>
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          border: 0,
          m: 0,
          p: 0,
          height: "80%",
        }}
      >
        <DataGridPro
          rows={rows}
          columns={columns}
          pinnedColumns={pinnedColumns}
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
            border: 0.2,
            borderRadius: 0,
            borderColor: "olivedrab",
            fontSize: "0.7rem",
            //  width: "100%",
            "&.Mui-selected": { backgroundColor: "red" },
            //  "&:hover": { backgroundColor: "green" },
            "& .super-app-theme--header": {
              backgroundColor: "olivedrab",
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
          onRowClick={onRowClick}
          onColumnHeaderClick={onColumnClick}
        />
      </Grid>
    </Grid>
  );
}

interface PlotProps {
  maxHarmonic: number;
  selectedSignals: boolean[];
}

function HarmonicsPlot({ maxHarmonic, selectedSignals }: PlotProps) {
  const chartSetting = {
    xAxis: [
      {
        label: "% age of fundamental",
        labelStyle: { fontSize: 11 },
        tickLabelStyle: { fontSize: 10 },
      },
    ],
  };

  let plotDataSet = [];

  for (let i = 0; i <= maxHarmonic; i++) {
    plotDataSet.push({
      ia: (dataset[i].ia / dataset[1].ia) * 100,
      ib: (dataset[i].ib / dataset[1].ib) * 100,
      ic: (dataset[i].ic / dataset[1].ic) * 100,
      in: (dataset[i].in / dataset[1].in) * 100,
      va: (dataset[i].va / dataset[1].va) * 100,
      vb: (dataset[i].vb / dataset[1].vb) * 100,
      vc: (dataset[i].vc / dataset[1].vc) * 100,
      harmonic: dataset[i].harmonic,
    });
  }

  let mySeries = [];
  if (selectedSignals[0])
    mySeries.push({ dataKey: "ia", label: "Ia", valueFormatter });
  if (selectedSignals[1])
    mySeries.push({ dataKey: "ib", label: "Ib", valueFormatter });
  if (selectedSignals[2])
    mySeries.push({ dataKey: "ic", label: "Ic", valueFormatter });
  if (selectedSignals[3])
    mySeries.push({ dataKey: "in", label: "In", valueFormatter });
  if (selectedSignals[4])
    mySeries.push({ dataKey: "va", label: "Va", valueFormatter });
  if (selectedSignals[5])
    mySeries.push({ dataKey: "vb", label: "Vb", valueFormatter });
  if (selectedSignals[6])
    mySeries.push({ dataKey: "vc", label: "Vc", valueFormatter });

  return (
    <BarChart
      dataset={plotDataSet}
      yAxis={[
        {
          scaleType: "band",
          dataKey: "harmonic",
          label: "Harmonic",
          labelStyle: { fontSize: 11 },
          tickLabelStyle: { fontSize: 10 },
        },
      ]}
      series={mySeries}
      layout="horizontal"
      slotProps={{
        legend: {
          itemMarkHeight: 5,
          labelStyle: {
            fontSize: 10,
          },
          padding: 0,
        },
      }}
      grid={{ vertical: true }}
      {...chartSetting}
      sx={{ bgcolor: "" }}
      margin={{
        right: 10,
        top: 30,
      }}
    />
  );
}

function LoadingPage() {
  return (
    <Box sx={{ width: "100%", height: "100%", border: 0, mt: 0 }}>
      <Divider />
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            m: 0,
            padding: 5,
          }}
        >
          <Typography fontSize={12}>Loading ... please wait</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

function OneCyclePage() {
  return (
    <Box sx={{ width: "100%", height: "100%", border: 0, mt: 0 }}>
      <Divider />
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            m: 0,
            padding: 5,
          }}
        >
          <Typography fontSize={12}>
            Select a window size of 1 cycle or more to view harmonics
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

function valueFormatter(value: number | null) {
  let text = value === null ? "" : Math.round(value).toFixed(0);
  return `${text}%`;
}
