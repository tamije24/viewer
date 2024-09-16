import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { DataGridPro, GridEventListener } from "@mui/x-data-grid-pro";
import { GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import LineStyleSharpIcon from "@mui/icons-material/LineStyleSharp";

import digitalChannelService, {
  DigitalChannel,
} from "../services/digital-channel-service";
import Avatar from "@mui/material/Avatar";

interface Props {
  station_name: string;
  file_id: number;
  onDigitalChannelListChange: () => void;
}

const DigitalChannels = ({
  station_name,
  file_id,
  onDigitalChannelListChange,
}: Props) => {
  const [digitalChannels, setDigitalChannels] = useState<DigitalChannel[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const { request, cancel } =
      digitalChannelService.getAllDigitalChannels(file_id);
    request
      .then((res) => {
        setDigitalChannels(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof TypeError) return;
        setError(err.message);
        setIsLoading(false);
      });
    return () => cancel();
  }, [file_id]);

  const handleUpdateDigitalChannel = (id: string, selected: boolean) => {
    const originalChannels = [...digitalChannels];
    const dc = digitalChannels.filter((dc) => dc.channel_id === id)[0];
    const updatedDigitalChannel = { ...dc, selected: selected };

    digitalChannelService
      .updateDigitalChannel(file_id, updatedDigitalChannel)
      .then(() => {
        setDigitalChannels(
          digitalChannels.map((dc) =>
            dc.channel_id === updatedDigitalChannel.channel_id
              ? updatedDigitalChannel
              : dc
          )
        );
        onDigitalChannelListChange();
      })
      .catch((err) => {
        setError(err.message);
        setDigitalChannels(originalChannels);
      });
  };

  const handleEvent: GridEventListener<"cellEditStop"> = (
    params // GridCellEditStopParams
    // event, // MuiEvent<MuiBaseEvent>
    // details // GridCallbackDetails
  ) => {
    let id = params.row.channel_id;
    let updatedStatus = !params.row.selected;
    handleUpdateDigitalChannel(id, updatedStatus);
  };

  const rows = digitalChannels;
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
      width: 200,
    },
    {
      field: "normal_state",
      headerName: "Normal",
      description: "Normal State",
      sortable: false,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "channel_id",
      headerName: "Channel ID",
      width: 0,
      maxWidth: 0,
    },
  ];

  if (error) {
    return (
      <Box sx={{ display: "flex-box", mt: 10, ml: 1, mb: 2 }}>
        <Typography
          variant="overline"
          component="div"
          color="firebrick"
          sx={{ flexGrow: 1 }}
        >
          {error}
        </Typography>
      </Box>
    );
  } else if (!isLoading) {
    if (loading) setLoading(false);
  }

  return (
    <Card
      sx={{
        mt: 10,
        ml: 2,
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
                theme.palette.mode === "light"
                  ? "darkgoldenrod"
                  : "palegoldenrod",
            }}
          >
            <LineStyleSharpIcon />
          </Avatar>
        }
        title="Selected Digital Channels"
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
          // pageSizeOptions={[10]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          density={"compact"}
          onCellEditStop={handleEvent}
          loading={loading}
          pagination={true}
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
          pinnedRows={{
            top: [],
            bottom: [],
          }}
        />
      </CardContent>
    </Card>
  );
};

export default DigitalChannels;
