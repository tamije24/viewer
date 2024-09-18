import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import {
  DataGridPro,
  GridPinnedColumnFields,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid-pro";
import { GridColDef } from "@mui/x-data-grid/models/colDef";

import Typography from "@mui/material/Typography";

import DeviceHubSharpIcon from "@mui/icons-material/DeviceHubSharp";
import TableChartSharpIcon from "@mui/icons-material/TableChartSharp";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import { useState } from "react";
import CardActions from "@mui/material/CardActions";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";

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

  for (let i = 0; i < tableValues.length; i++) {
    tempTable.push({
      id: tableValues[i].id,
      channel: tableValues[i].channel,
      unit: tableValues[i].unit,
      inst: `${(Math.round(tableValues[i].inst * 100) / 100).toFixed(2)}`,
      phasor_mag: `${(
        Math.round(tableValues[i].phasor_mag * 100) / 100
      ).toFixed(2)}`,
      phasor_ang: `${(
        Math.round(((tableValues[i].phasor_ang * 180) / Math.PI) * 100) / 100
      ).toFixed(2)}`,
      true_rms: `${(Math.round(tableValues[i].true_rms * 100) / 100).toFixed(
        2
      )}`,
      pos_peak: `${(Math.round(tableValues[i].pos_peak * 100) / 100).toFixed(
        2
      )}`,
      neg_peak: `${(Math.round(tableValues[i].neg_peak * 100) / 100).toFixed(
        2
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
      headerName: "Channel",
      description: "COMTRADE file channel name",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignRight",
      headerAlign: "left",
      width: 90,
    },

    {
      field: "unit",
      headerName: "Units",
      description: "Units",
      sortable: false,
      headerClassName: "MuiDataGridPro-columnHeader--alignRight",
      headerAlign: "center",
      align: "center",
      width: 55,
    },

    {
      field: "phasor_mag",
      headerName: "Ph-Mag",
      description: "DFT Phasor magnitude - fundamental frequency",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "right",
      width: 70,
    },
    {
      field: "phasor_ang",
      headerName: "Ph-Ang",
      description: "DFT Phasor angle - fundamental frequency",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "right",
      width: 70,
    },
    {
      field: "true_rms",
      headerName: "RMS",
      description: "True RMS values",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "right",
      width: 70,
    },
    {
      field: "inst",
      headerName: "Inst.",
      description: "Instantaneous values",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "right",
      width: 70,
    },
    {
      field: "pos_peak",
      headerName: "+ peak",
      description: "Positive peak - between primary and secondary cursors",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "right",
      width: 70,
    },
    {
      field: "neg_peak",
      headerName: "- Peak",
      description: "Negative peak - between primary and secondary cursors",
      sortable: false,
      headerClassName: "super-app-theme--header",
      align: "right",
      headerAlign: "right",
      width: 70,
    },
  ];
  const pinnedColumns: GridPinnedColumnFields = { left: ["id"] };
  const [selectedTab, setSelectedTab] = useState("table");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    console.log(event.currentTarget);
    setSelectedTab(newValue);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          mt: 10,
          ml: 0.5,
          mr: 1,
          mb: 0.5,
          bgcolor: "",
          height: `calc(100vh - 260px)`,
        }}
      >
        <CardContent sx={{ mb: 0.5, height: `calc(100vh - 340px)` }}>
          {selectedTab === "table" && (
            <>
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
                //  rowHeight={100}
                density={"compact"}
                slots={{ toolbar: CustomToolbar }}
                sx={{
                  width: "100%",
                  mt: 1,
                  height: `calc(100vh - 390px)`,
                  border: 0.2,
                  borderColor: "primary",
                  fontSize: "0.8rem",
                }}
                hideFooter={true}
              />
              <Typography variant="caption" sx={{ mt: 1 }}>
                * all values are in primary
              </Typography>
            </>
          )}
          {selectedTab === "phasors" && <Typography>Phasors</Typography>}
          {selectedTab === "harmonics" && <Typography>Harmonics</Typography>}
          {selectedTab === "sequence" && <Typography>Sequence</Typography>}
        </CardContent>
        <CardActions
          sx={{
            bgcolor: "",
            mb: 0,
            height: "100px",
          }}
        >
          <BottomNavigation
            value={selectedTab}
            onChange={handleChange}
            sx={{
              pb: 0,
              width: "100%",
            }}
          >
            <BottomNavigationAction
              label="Values"
              value="table"
              icon={<TableChartSharpIcon />}
            />
            <BottomNavigationAction
              label="Phasors"
              value="phasors"
              icon={<DeviceHubSharpIcon />}
            />
            <BottomNavigationAction
              label="Harmonics"
              value="harmonics"
              icon={<BarChartIcon />}
            />
            <BottomNavigationAction
              label="Sequence"
              value="sequence"
              icon={<CategoryTwoToneIcon />}
            />
          </BottomNavigation>
        </CardActions>
      </Card>

      <Card
        variant="outlined"
        sx={{
          ml: 0.5,
          mr: 1,
          height: "110px",
        }}
      >
        <CardContent sx={{ mt: 0 }}>
          <Grid
            container
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignContent: "space-between",
              alignItems: "space-between",
            }}
          >
            <Grid
              item
              sx={{
                justifyContent: "space-between",
                borderRight: 0.5,
                paddingRight: 0.2,
              }}
            >
              <Typography variant="overline" component="p">
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
                  <Typography variant="subtitle2" component="p">
                    {`${(Math.round(axisClick.axisValue * 1000) / 1000).toFixed(
                      3
                    )} s`}
                  </Typography>
                  <Chip
                    size="small"
                    color="error"
                    label={axisClick.dataIndex}
                    sx={{ minWidth: "40px" }}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid item sx={{ justifyContent: "space-between" }}>
              <Typography variant="overline" component="p">
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
                  <Typography variant="subtitle2" component="p">
                    {`${(
                      Math.round(axisClick.secondaryValue * 1000) / 1000
                    ).toFixed(3)} s`}
                  </Typography>
                  <Chip
                    size="small"
                    color="success"
                    label={axisClick.secondaryIndex}
                    sx={{ minWidth: "40px" }}
                  />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
          <Typography variant="caption" sx={{ color: "crimson" }}>
            {axisClick.timestamp}
          </Typography>
        </CardContent>
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
