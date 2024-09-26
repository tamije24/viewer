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
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid-pro";
import { GridColDef } from "@mui/x-data-grid/models/colDef";

// MUI Icons
import DeviceHubSharpIcon from "@mui/icons-material/DeviceHubSharp";
import TableChartSharpIcon from "@mui/icons-material/TableChartSharp";
import BarChartIcon from "@mui/icons-material/BarChart";
//import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";

import Phasors from "./Phasors";
import Harmonics from "./Harmonics";

interface Props {
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
}

const CursorValues = ({ axisClick, tableValues }: Props) => {
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
  }[] = [];

  let magnitudes: number[] = [];
  let angles: number[] = [];
  let unit: string[] = [];

  for (let i = 0; i < tableValues.length; i++) {
    magnitudes.push(tableValues[i].phasor_mag);
    angles.push(tableValues[i].phasor_ang);
    unit.push(tableValues[i].unit);

    tempTable.push({
      id: tableValues[i].id,
      channel: tableValues[i].channel,
      unit: tableValues[i].unit,
      inst: `${(Math.round(tableValues[i].inst * 1000) / 1000).toFixed(3)}`,
      phasor_mag: `${(
        Math.round(tableValues[i].phasor_mag * 1000) / 1000
      ).toFixed(3)}`,
      phasor_ang: `${(
        Math.round(((tableValues[i].phasor_ang * 180) / Math.PI) * 100) / 100
      ).toFixed(2)}`,
      true_rms: `${(Math.round(tableValues[i].true_rms * 1000) / 1000).toFixed(
        3
      )}`,
      pos_peak: `${(Math.round(tableValues[i].pos_peak * 1000) / 1000).toFixed(
        3
      )}`,
      neg_peak: `${(Math.round(tableValues[i].neg_peak * 1000) / 1000).toFixed(
        3
      )}`,
    });
  }

  const rows = tempTable;

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "id",
      headerName: "-",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
      align: "center",
      headerAlign: "center",
      width: 40,
    },

    {
      field: "channel",
      headerName: "SIGNAL",
      description: "COMTRADE file channel name",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignCenter",
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
      headerClassName: "MuiDataGridPro-columnHeader--alignRight",
      headerAlign: "center",
      align: "center",
      width: 55,
    },
  ];
  const pinnedColumns: GridPinnedColumnFields = { left: ["id"] };

  const [selectedTab, setSelectedTab] = useState("table");
  const [titleText, setTitleText] = useState("PARAMETERS");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    //   console.log(event.currentTarget);
    setSelectedTab(newValue);
    if (newValue === "table") setTitleText("PARAMETERS");
    else if (newValue === "phasors") setTitleText("PHASORS - Phase Values");
    else setTitleText("HARMONICS");
  };

  // console.log(tableValues.length, tableValues[0].channel);
  // console.log(tempTable.length, tempTable[0].channel);
  // console.log(magnitudes);
  // console.log(angles);
  return (
    <>
      <Card
        //      variant="outlined"
        sx={{
          pt: 0,
          ml: 0.5,
          mr: 0,
          height: "85px",
          bgcolor: "",
        }}
      >
        <CardContent sx={{ mt: 1, ml: 1, bgcolor: "", p: 0 }}>
          <Grid container sx={{ bgcolor: "", p: 0, m: 0 }}>
            <Grid
              item
              xs={6}
              sx={{
                justifyContent: "space-between",
                borderLeft: 0.5,
                paddingLeft: 0.5,
              }}
            >
              <Typography
                variant="overline"
                component="p"
                sx={{ fontSize: "0.6rem" }}
              >
                Primary Cursor
              </Typography>
              <Stack sx={{ justifyContent: "space-between" }}>
                <Stack
                  direction="row"
                  sx={{
                    alignContent: { xs: "center", sm: "flex-start" },
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="p"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {`${(Math.round(axisClick.axisValue * 1000) / 1000).toFixed(
                      3
                    )} s`}
                  </Typography>
                  <Chip
                    size="small"
                    color="secondary"
                    label={axisClick.dataIndex}
                    sx={{ minWidth: "40px", fontSize: "0.7rem" }}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid
              item
              xs={6}
              sx={{
                justifyContent: "space-between",
                borderLeft: 0.5,
                paddingLeft: 0.5,
              }}
            >
              <Typography
                variant="overline"
                component="p"
                sx={{ fontSize: "0.6rem" }}
              >
                Secondary Cursor
              </Typography>
              <Stack sx={{ justifyContent: "space-between" }}>
                <Stack
                  direction="row"
                  sx={{
                    alignContent: { xs: "center", sm: "flex-start" },
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="p"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {`${(
                      Math.round(axisClick.secondaryValue * 1000) / 1000
                    ).toFixed(3)} s`}
                  </Typography>
                  <Chip
                    size="small"
                    color="success"
                    label={axisClick.secondaryIndex}
                    sx={{ minWidth: "40px", fontSize: "0.7rem" }}
                  />
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={6}>
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
            </Grid>
            <Grid item xs={5.5} sx={{ ml: 0.5 }}>
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card
        // variant="outlined"
        sx={{
          mt: 0.5,
          ml: 0.5,
          mr: 0,
          mb: 0.5,
          bgcolor: "",
          height: `calc(100vh - 218px)`,
        }}
      >
        <CardContent
          sx={{ m: 0, p: 0, height: `calc(100vh - 290px)`, bgcolor: "" }}
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
            <>
              <Box
                sx={{
                  mt: 0,
                  // ml: 2,
                  mr: 2,
                  width: "100%",
                  height: "100%",
                  border: 0.2,
                  borderColor: "divider",
                  fontSize: "0.7rem",
                }}
              >
                <DataGridPro
                  rows={rows}
                  columns={columns}
                  pinnedColumns={pinnedColumns}
                  hideFooterRowCount
                  checkboxSelection={false}
                  disableRowSelectionOnClick
                  showCellVerticalBorder={true}
                  showColumnVerticalBorder={true}
                  disableColumnMenu={true}
                  // rowHeight={60}
                  density={"compact"}
                  slots={{ toolbar: CustomToolbar }}
                  sx={{
                    width: "100%",
                    height: "85%",
                    fontSize: "0.7rem",
                  }}
                  hideFooter={true}
                />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  * all values are in primary
                </Typography>
              </Box>
            </>
          )}
          {selectedTab === "phasors" && (
            <Phasors
              passed_magnitudes={magnitudes}
              angles={angles}
              unit={unit}
              onTabChange={(tab: number) => {
                if (tab === 0) setTitleText("PHASORS - Phase Values");
                else setTitleText("PHASORS - Sequence Values");
              }}
            />
          )}
          {selectedTab === "harmonics" && <Harmonics />}
        </CardContent>

        <CardActions
          sx={{
            bgcolor: "",
            p: 0,
            mb: 0.5,
            height: "70px",
            borderTop: 0.2,
            borderColor: "GrayText",
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
                <Tooltip title="Values" placement="top">
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
                <Tooltip title="Phasors" placement="top">
                  <DeviceHubSharpIcon fontSize="medium" />
                </Tooltip>
              }
            />
            <BottomNavigationAction
              label="HARMONICS"
              sx={{
                "& .MuiBottomNavigationAction-label": { fontSize: "0.7rem" },
              }}
              value="harmonics"
              icon={
                <Tooltip title="Harmonics" placement="top">
                  <BarChartIcon fontSize="medium" />
                </Tooltip>
              }
            />
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
        justifyContent: "space-evenly",
      }}
    >
      <GridToolbarExport />
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );
}
