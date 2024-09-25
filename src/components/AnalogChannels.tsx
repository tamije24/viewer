import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import WavesIcon from "@mui/icons-material/Waves";
import { AnalogChannel } from "../services/analog-channel-service";
import Avatar from "@mui/material/Avatar";

interface Props {
  station_name: string;
  analogChannels: AnalogChannel[];
}

const AnalogChannels = ({ station_name, analogChannels }: Props) => {
  if (analogChannels === undefined)
    return (
      <Box sx={{ display: "flex-box", mt: 10, ml: 0.5, mb: 2 }}>
        <Typography
          variant="overline"
          component="div"
          color="firebrick"
          sx={{ flexGrow: 1 }}
        >
          "Reading data .. "
        </Typography>
      </Box>
    );

  // useEffect(() => {
  //   setIsLoading(true);
  //   const { request, cancel } =
  //     analogChannelService.getAllAnalogChannels(file_id);

  //   request
  //     .then((res) => {
  //       setAnalogChannels(res.data);
  //       setIsLoading(false);
  //     })
  //     .catch((err) => {
  //       if (err instanceof TypeError) return;
  //       setError(err.message);
  //       setIsLoading(false);
  //     });
  //   return () => cancel();
  // }, [file_id]);

  // const handleUpdateAnalogChannel = (id: string, selected: boolean) => {
  //   const originalChannels = [...analogChannels];
  //   const ac = analogChannels.filter((ac) => ac.channel_id === id)[0];
  //   const updatedAnalogChannel = { ...ac, selected: selected };

  //   analogChannelService
  //     .updateAnalogChannel(file_id, updatedAnalogChannel)
  //     .then(() => {
  //       setAnalogChannels(
  //         analogChannels.map((ac) =>
  //           ac.channel_id === updatedAnalogChannel.channel_id
  //             ? updatedAnalogChannel
  //             : ac
  //         )
  //       );
  //       onAnalogChannelListChange();
  //     })
  //     .catch((err) => {
  //       setError(err.message);
  //       setAnalogChannels(originalChannels);
  //     });
  // };

  // const handleEvent: GridEventListener<"cellEditStop"> = (
  //   params // GridCellEditStopParams
  //   //   event, // MuiEvent<MuiBaseEvent>
  //   //   details // GridCallbackDetails
  // ) => {
  //   let id = params.row.channel_id;
  //   let updatedStatus = !params.row.selected;
  //   handleUpdateAnalogChannel(id, updatedStatus);
  // };

  const rows = analogChannels;
  const columns: GridColDef<(typeof rows)[number]>[] = [
    // {
    //   field: "selected",
    //   headerName: "Selected ?",
    //   description: "Select to include for plotting",
    //   headerClassName: "super-app-theme--header",
    //   editable: true,
    //   type: "boolean",
    // },
    {
      field: "id",
      headerName: "Channel ID",
      headerClassName: "super-app-theme--header",
      align: "center",
    },
    {
      field: "channel_name",
      headerName: "Channel Name",
      headerClassName: "super-app-theme--header",
      width: 150,
    },
    {
      field: "phase",
      headerName: "Phase",
      headerClassName: "super-app-theme--header",
    },
    {
      field: "unit",
      headerName: "Unit",
      headerClassName: "super-app-theme--header",
    },
    {
      field: "primary",
      headerName: "Primary",
      sortable: false,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "secondary",
      headerName: "Secondary",
      sortable: false,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "pors",
      headerName: "P or S",
      description: "Value is in primary or secondary",
      sortable: false,
      headerClassName: "super-app-theme--header",
    },
    // {
    //   field: "channel_id",
    //   headerName: "Channel ID",
    //   width: 0,
    //   maxWidth: 0,
    // },
  ];

  return (
    <Card
      sx={{
        mt: 10,
        ml: 0.5,
        mb: 10,
        //height: `calc(100vh - 150px)`
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              m: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "light" ? "forestgreen" : "chartreuse",
            }}
          >
            <WavesIcon />
          </Avatar>
        }
        title="Selected Analog Channels"
        subheader={station_name}
        sx={{ paddingBottom: 0.5, height: 80 }}
      />
      <CardContent
        sx={{
          ml: 0,
          mb: 2,
          pb: 2,
          // height: `calc(100vh - 230px)`,
        }}
      >
        <DataGridPro
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          pagination={true}
          checkboxSelection={false}
          disableRowSelectionOnClick
          density={"compact"}
          // onCellEditStop={handleEvent}
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
export default AnalogChannels;
