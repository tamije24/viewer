import { useState } from "react";

// MUI Components
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

import {
  DataGridPro,
  GridPinnedColumnFields,
  GridRowSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  //  GridToolbarExport,
} from "@mui/x-data-grid-pro";
import { GridColDef } from "@mui/x-data-grid/models/colDef";

// MUI Icons
import DeviceHubSharpIcon from "@mui/icons-material/DeviceHubSharp";
import TableChartSharpIcon from "@mui/icons-material/TableChartSharp";
import BarChartIcon from "@mui/icons-material/BarChart";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";

// import SnowshoeingIcon from '@mui/icons-material/Snowshoeing';
//import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";

import Phasors from "./Phasors";
import Harmonics from "./Harmonics";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import {
  ColorOption,
  COLOR_OPTIONS,
  renderColor,
  renderEditColor,
} from "./PlotColors";

interface Props {
  selectedIndex: number;
  digitalChannelCount: number[];
  axisClick: {
    dataIndex: number;
    axisValue: number;
    timestamp: string;
    secondaryIndex: number;
    secondaryValue: number;
    secondaryTimestamp: string;
  };
  tableValues: {
    id: string;
    channel: string;
    unit: string;
    inst: number;
    phasor_mag: number;
    phasor_ang: number;
    true_rms: number;
    pos_peak: number;
    neg_peak: number;
  }[];
  tableValuesDigital: {
    id: string;
    channel: string;
    status: number;
  }[];
  tooltipStatus: boolean;
  onCursorMove: (cursor: string, step: number) => void;
  selectedFile: number[];
  projectId: number;
  rowSelectionModel: GridRowSelectionModel;
  digitalRowSelectionModel: GridRowSelectionModel;
  onRowSelectionModelChange: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
  onDigitalRowSelectionModelChange: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
}
const TOOLTIP_DELAY = 10000;

const CursorValues = ({
  selectedIndex,
  digitalChannelCount,
  axisClick,
  tableValues,
  tableValuesDigital,
  tooltipStatus,
  onCursorMove,
  selectedFile,
  projectId,
  rowSelectionModel,
  digitalRowSelectionModel,
  onRowSelectionModelChange,
  onDigitalRowSelectionModelChange,
}: Props) => {
  // set data rows
  let tempTable: {
    id: string;
    channel: string;
    unit: string;
    inst: string;
    phasor_mag: string;
    phasor_ang: string;
    true_rms: string;
    pos_peak: string;
    neg_peak: string;
    color: string;
  }[] = [];

  let tempTableDigital: {
    id: string;
    channel: string;
    status: number;
  }[] = [];

  const ColorList = [
    "crimson",
    "goldenrod",
    "deepskyblue",
    "black",
    "crimson",
    "goldenrod",
    "deepskyblue",
    "#4e79a7",
    "#f28e2c",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949",
    "#af7aa1",
    "#ff9da7",
    "#9c755f",
    "#bab0ab",
  ];

  let magnitudes: number[] = [];
  let angles: number[] = [];
  let unit: string[] = [];
  let signal_id: string[] = [];

  // ANALOG VALUE TABLE
  for (let i = 0; i < tableValues.length; i++) {
    magnitudes.push(tableValues[i].phasor_mag);
    angles.push(tableValues[i].phasor_ang);
    unit.push(tableValues[i].unit);
    signal_id.push(tableValues[i].id);

    tempTable.push({
      id: tableValues[i].id,
      channel: tableValues[i].channel,
      unit: tableValues[i].unit,
      inst: `${(Math.round(tableValues[i].inst * 1000) / 1000).toFixed(3)}`,
      phasor_mag:
        tableValues[i].phasor_mag !== undefined
          ? `${(Math.round(tableValues[i].phasor_mag * 1000) / 1000).toFixed(
              3
            )}`
          : `-`,
      phasor_ang:
        tableValues[i].phasor_ang !== undefined
          ? `${(
              Math.round(((tableValues[i].phasor_ang * 180) / Math.PI) * 100) /
              100
            ).toFixed(2)}`
          : `-`,
      true_rms: tableValues[i].true_rms
        ? `${(Math.round(tableValues[i].true_rms * 1000) / 1000).toFixed(3)}`
        : `-`,
      pos_peak: tableValues[i].pos_peak
        ? `${(Math.round(tableValues[i].pos_peak * 1000) / 1000).toFixed(3)}`
        : "-",
      neg_peak: tableValues[i].neg_peak
        ? `${(Math.round(tableValues[i].neg_peak * 1000) / 1000).toFixed(3)}`
        : `-`,
      color: ColorList[i],
    });
  }
  const rows = tempTable;
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "id",
      headerName: "-",
      sortable: false,
      //headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      headerClassName: "super-app-theme--header",
      align: "center",
      headerAlign: "center",
      width: 40,
    },

    {
      field: "channel",
      headerName: "SIGNAL",
      description: "COMTRADE file channel name",
      sortable: false,
      // headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      //   minWidth: 70,
      width: 70,
    },
    {
      field: "true_rms",
      headerName: "RMS",
      description: "True RMS values",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },
    {
      field: "inst",
      headerName: "INST.",
      description: "Instantaneous values",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },
    {
      field: "phasor_mag",
      headerName: "DFT-Rms",
      description: "DFT Phasor magnitude - fundamental frequency",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },
    {
      field: "phasor_ang",
      headerName: "DFT-Ang",
      description: "DFT Phasor angle - fundamental frequency",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },

    {
      field: "pos_peak",
      headerName: "+ PEAK",
      description: "Positive peak - between primary and secondary cursors",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },
    {
      field: "neg_peak",
      headerName: "- PEAK",
      description: "Negative peak - between primary and secondary cursors",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },
    {
      field: "unit",
      headerName: "UNIT",
      description: "Units",
      sortable: false,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      width: 55,
    },
    {
      field: "color",
      headerName: "COLOR",
      description: "Plot Color",
      type: "singleSelect",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      valueOptions: COLOR_OPTIONS,
      valueFormatter: (value: ColorOption) => value?.value,
      renderCell: renderColor,
      renderEditCell: renderEditColor,
      sortable: false,
      width: 80,
      editable: true,
    } as GridColDef<any, ColorOption, string>,
  ];
  const pinnedColumns: GridPinnedColumnFields = { left: ["id"] };

  // DIGITAL VALUE TABLE
  if (selectedIndex === -1) {
    let offset = 0;
    let stationCount = Math.round(tableValues.length / 7);
    for (let station = stationCount - 1; station >= 0; station--) {
      for (let i = digitalChannelCount[station] - 1; i >= 0; i--) {
        tempTableDigital.push({
          id: tableValuesDigital[i - offset].id,
          channel: tableValuesDigital[i - offset].channel,
          status: tableValuesDigital[i - offset].status,
        });
      }
      offset = offset - digitalChannelCount[station];
    }
  } else {
    for (let i = digitalChannelCount[selectedIndex] - 1; i >= 0; i--) {
      if (tableValuesDigital[i] !== undefined) {
        tempTableDigital.push({
          id: tableValuesDigital[i].id,
          channel: tableValuesDigital[i].channel,
          status: tableValuesDigital[i].status,
        });
      }
    }
  }

  const rowsDigital = tempTableDigital;
  const columnsDigital: GridColDef<(typeof rowsDigital)[number]>[] = [
    {
      field: "id",
      headerName: "-",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "center",
      headerAlign: "center",
      width: 40,
    },

    {
      field: "channel",
      headerName: "SIGNAL",
      description: "COMTRADE file channel name",
      sortable: false,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      //   minWidth: 70,
      width: 170,
    },
    {
      field: "status",
      headerName: "STATUS",
      description: "Status at selected instant",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "center",
      width: 70,
    },
  ];

  const [selectedTab, setSelectedTab] = useState("table");
  const [titleText, setTitleText] = useState("ANALOG PARAMETERS");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    //   console.log(event.currentTarget);
    setSelectedTab(newValue);
    if (newValue === "table") setTitleText("ANALOG PARAMETERS");
    else if (newValue === "phasors") setTitleText("PHASORS - Phase Values");
    else setTitleText("HARMONICS");
  };

  const handleCursorMove = (cursor: string, step: number) => {
    onCursorMove(cursor, step);
  };
  return (
    <>
      <Card
        //      variant="outlined"
        sx={{
          pt: 0,
          ml: 0,
          mr: 0,
          height: "85px",
          bgcolor: "",
        }}
      >
        <CardContent sx={{ mt: 1, ml: 1, bgcolor: "", p: 0 }}>
          <Grid container sx={{ bgcolor: "", p: 0, m: 0 }}>
            <Grid
              item
              xs={5.8}
              sx={{
                justifyContent: "space-between",
                borderRight: 1.5,
                borderRightStyle: "dashed",
                borderColor: "secondary.main",
                marginRight: 0.5,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Tooltip
                  title="Primary cursor from trigger time"
                  placement="top"
                  enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                >
                  <Chip
                    size="small"
                    color="secondary"
                    label={`${(
                      Math.round(axisClick.axisValue * 1000) / 1000
                    ).toFixed(3)} s`}
                    sx={{ minWidth: "40px", fontSize: "0.7rem" }}
                  />
                </Tooltip>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    mr: 2,
                    width: "40px",
                    bgcolor: "",
                  }}
                >
                  <IconButton
                    color="secondary"
                    aria-label="View"
                    onClick={() => handleCursorMove("primary", -1)}
                    sx={{ width: "20px", height: "10px", bgcolor: "" }}
                  >
                    <Tooltip
                      title="move primary cursor left"
                      placement="top"
                      enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                    >
                      <FirstPageIcon />
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    color="secondary"
                    aria-label="View"
                    onClick={() => handleCursorMove("primary", 1)}
                    sx={{ width: "20px", height: "10px", bgcolor: "" }}
                  >
                    <Tooltip
                      title="move primary cursor right"
                      placement="top"
                      enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                    >
                      <LastPageIcon />
                    </Tooltip>
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
            <Grid
              item
              xs={5.8}
              sx={{
                justifyContent: "space-between",
                borderRight: 2,
                borderRightStyle: "dotted",
                borderColor: "success.main",
                marginRight: 0.5,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Tooltip
                  title="Secondary cursor from trigger time"
                  placement="top"
                  enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                >
                  <Chip
                    size="small"
                    color="success"
                    label={`${(
                      Math.round(axisClick.secondaryValue * 1000) / 1000
                    ).toFixed(3)} s`}
                    sx={{ minWidth: "40px", fontSize: "0.7rem" }}
                  />
                </Tooltip>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    width: "40px",
                    bgcolor: "",
                    mr: 2,
                  }}
                >
                  <IconButton
                    color="success"
                    aria-label="View"
                    onClick={() => handleCursorMove("secondary", -1)}
                    sx={{ width: "20px", height: "10px", bgcolor: "" }}
                  >
                    <Tooltip
                      title="move secondary cursor left"
                      placement="top"
                      enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                    >
                      <FirstPageIcon />
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    color="success"
                    aria-label="View"
                    onClick={() => handleCursorMove("secondary", 1)}
                    sx={{ width: "20px", height: "10px", bgcolor: "" }}
                  >
                    <Tooltip
                      title="move secondary cursor right"
                      placement="top"
                      enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                    >
                      <LastPageIcon />
                    </Tooltip>
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={5.8}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "flex-end",
                  pr: 1,
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0,
                    color: "secondary.main",
                    fontSize: "0.6rem",
                    paddingTop: 0.5,
                  }}
                >
                  {axisClick.timestamp}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sx={{ ml: 0 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "flex-end",
                  pr: 1,
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0,
                    color: "success.main",
                    fontSize: "0.6rem",
                    paddingTop: 0.5,
                  }}
                >
                  {axisClick.secondaryTimestamp}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "right",
                  mr: 2,
                }}
              >
                <Tooltip
                  title="Time difference between primary and secondary cursors"
                  placement="bottom"
                  enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mt: 0.5,
                      color: "primary.main",
                      bgcolor: "",
                      alignItems: "center",
                      fontSize: "0.7rem",
                    }}
                  >
                    ∆ t:{" "}
                    {Math.round(
                      (axisClick.axisValue - axisClick.secondaryValue) * 1000000
                    ) / 1000000}{" "}
                    s
                  </Typography>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card
        // variant="outlined"
        sx={{
          mt: 0.5,
          ml: 0,
          mr: 0,
          mb: 0.5,
          bgcolor: "",
          height: `calc(100vh - 228px)`,
        }}
      >
        <CardContent
          sx={{ m: 0, p: 0, height: `calc(100vh - 300px)`, bgcolor: "" }}
        >
          <Box
            display="flex"
            justifyContent="space-around"
            alignItems="center"
            height="31px"
            width="100%"
            sx={{
              b: 0.5,
              m: 0,
              p: 0,
            }}
          >
            <Typography
              variant="overline"
              sx={{ fontSize: "0.8rem", fontWeight: "bold" }}
              color=""
            >
              {titleText}
            </Typography>
          </Box>
          {selectedTab === "table" && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                border: 0,
                mt: 0,
                mr: 0,
                ml: 0.5,
                pr: 1,
              }}
            >
              <Divider />
              <Grid container>
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 0,
                    height: `calc((100vh - 375px)*0.6)`,
                    bgcolor: "",
                    m: 0,
                    p: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <DataGridPro
                      rows={rows}
                      columns={columns}
                      pinnedColumns={pinnedColumns}
                      checkboxSelection={true}
                      disableRowSelectionOnClick
                      onRowSelectionModelChange={(newRowSelectionModel) => {
                        onRowSelectionModelChange(newRowSelectionModel);
                      }}
                      rowSelectionModel={rowSelectionModel}
                      showCellVerticalBorder={true}
                      showColumnVerticalBorder={true}
                      disableColumnMenu={true}
                      rowHeight={35}
                      columnHeaderHeight={40}
                      density={"compact"}
                      slots={{ toolbar: CustomToolbar }}
                      sx={{
                        border: 0.2,
                        borderRadius: 0,
                        borderColor: "olivedrab",
                        width: "100%",
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
                      hideFooter={true}
                      hideFooterRowCount
                    />
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 0,
                    height: `calc((100vh - 375px)*0.4)`,
                    bgcolor: "",
                    mt: 1.5,
                    p: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        pl: 2,
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                      color=""
                    >
                      DIGITAL PARAMETERS
                    </Typography>
                    <DataGridPro
                      rows={rowsDigital}
                      columns={columnsDigital}
                      pinnedColumns={pinnedColumns}
                      checkboxSelection={true}
                      // disableRowSelectionOnClick
                      onRowSelectionModelChange={(newRowSelectionModel) => {
                        onDigitalRowSelectionModelChange(newRowSelectionModel);
                      }}
                      rowSelectionModel={digitalRowSelectionModel}
                      showCellVerticalBorder={true}
                      showColumnVerticalBorder={true}
                      disableColumnMenu={true}
                      rowHeight={35}
                      columnHeaderHeight={40}
                      density={"compact"}
                      // slots={{ toolbar: CustomToolbar }}
                      sx={{
                        border: 0.2,
                        borderRadius: 0,
                        borderColor: "olivedrab",
                        width: "100%",
                        maxWidth: "350px",
                        fontSize: "0.7rem",
                        "& .super-app-theme--header": {
                          // backgroundColor: "rgba(0, 100, 80, 0.7)",
                          backgroundColor: "olivedrab",
                          color: "white",
                        },
                      }}
                      hideFooter={true}
                      hideFooterRowCount
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {selectedTab === "phasors" && (
            <Phasors
              signal_id={signal_id}
              passed_magnitudes={magnitudes}
              angles={angles}
              unit={unit}
              onTabChange={(tab: number) => {
                if (tab === 0) setTitleText("PHASORS - Phase Values");
                else setTitleText("PHASORS - Sequence Values");
              }}
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={onRowSelectionModelChange}
            />
          )}
          {selectedTab === "harmonics" && (
            <Harmonics
              selectedFile={selectedFile}
              projectId={projectId}
              dataIndex={axisClick.dataIndex}
              secondaryIndex={axisClick.secondaryIndex}
            />
          )}
        </CardContent>

        <CardActions
          sx={{
            bgcolor: "dodgerblue",
            p: 0,
            mb: 0,
            mt: 0.4,
            height: "70px",
            borderTop: 0.2,
            borderColor: "dodgerblue",
          }}
        >
          <BottomNavigation
            // showLabels
            value={selectedTab}
            onChange={handleChange}
            sx={{
              p: 0,
              m: 0,
              height: "100%",
              width: "100%",
              bgcolor: "",
            }}
          >
            <BottomNavigationAction
              label="VALUES"
              sx={{
                "& .MuiBottomNavigationAction-label": { fontSize: "0.7rem" },
              }}
              value="table"
              icon={
                <Tooltip
                  title="Values"
                  placement="top"
                  enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                >
                  <TableChartSharpIcon fontSize="medium" />
                </Tooltip>
              }
            />
            <BottomNavigationAction
              label="PHASORS"
              sx={{
                "& .MuiBottomNavigationAction-label": { fontSize: "0.7rem" },
              }}
              value="phasors"
              icon={
                <Tooltip
                  title="Phasors"
                  placement="top"
                  enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                >
                  <DeviceHubSharpIcon fontSize="medium" />
                </Tooltip>
              }
            />
            {selectedIndex > -1 && (
              <BottomNavigationAction
                label="HARMONICS"
                sx={{
                  "& .MuiBottomNavigationAction-label": { fontSize: "0.7rem" },
                }}
                value="harmonics"
                icon={
                  <Tooltip
                    title="Harmonics"
                    placement="top"
                    enterDelay={tooltipStatus ? 0 : TOOLTIP_DELAY}
                  >
                    <BarChartIcon fontSize="medium" />
                  </Tooltip>
                }
              />
            )}
          </BottomNavigation>
        </CardActions>
      </Card>
    </>
  );
};

export default CursorValues;

function CustomToolbar() {
  return (
    <GridToolbarContainer
      sx={{
        borderBottom: 0.2,
        borderColor: "primary.main",
        // justifyContent: "space-evenly",
        justifyContent: "right",
      }}
    >
      {/* <GridToolbarExport /> */}
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );
}
