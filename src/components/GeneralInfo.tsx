import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/Inbox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import AssignmentSharpIcon from "@mui/icons-material/AssignmentSharp";
import WavesIcon from "@mui/icons-material/Waves";
import LineStyleSharpIcon from "@mui/icons-material/LineStyleSharp";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import HourglassTopSharpIcon from "@mui/icons-material/HourglassTopSharp";

import comtradeFileService, {
  ComtradeFile,
} from "../services/comtrade-file-service";
import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";

interface Props {
  file_id: number | null;
  project_id: number | null;
}

const GeneralInfo = ({ file_id, project_id }: Props) => {
  const [comtradeFile, setComtrade] = useState<ComtradeFile>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const { request, cancel } = comtradeFileService.getComtradeFile(
      project_id ? project_id : 0,
      file_id ? file_id : 0
    );
    request
      .then((res) => {
        setComtrade(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof TypeError) return;
        setError(err.message);
        setIsLoading(false);
      });
    return () => cancel();
  }, [file_id]);

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
  }

  if (!isLoading && comtradeFile !== undefined) {
    return (
      <Card
        sx={{
          mt: 10,
          ml: 0.5,
          mb: 10,
          maxWidth: "700px",
          //height: `calc(100vh - 150px)`
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                m: 1,
                bgcolor: (theme) =>
                  theme.palette.mode === "light" ? "salmon" : "lightsalmon",
              }}
            >
              <AssignmentSharpIcon />
            </Avatar>
          }
          title="General Information"
          subheader={comtradeFile.station_name}
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent
          sx={{
            ml: 0,
            mb: 2,
            pb: 2,
            // height: `calc(100vh - 230px)`,
          }}
        >
          <Grid container spacing={1} sx={{ p: 2 }}>
            <Grid item xs={1}>
              <InboxIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Station Name</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.station_name}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <WavesIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">No. of Analog Channels</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.analog_channel_count}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <LineStyleSharpIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">
                No. of Digital Channels
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.digital_channel_count}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <InboxIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Line Frequency</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.line_frequency}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <InboxIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Sampling Frequency</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.sampling_frequency}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <InboxIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Resampled Frequency</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.resampled_frequency === 0
                  ? "-"
                  : comtradeFile.resampled_frequency}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <HourglassFullIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Start Time Stamp</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.start_time_stamp.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <HourglassTopSharpIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Trigger Time Stamp</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: 17, color: "dodgerblue" }}
              >
                {comtradeFile.trigger_time_stamp.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card
        sx={{
          mt: 10,
          ml: 2,
          mb: 10,
          maxWidth: "700px",
          //height: `calc(100vh - 150px)`
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                m: 1,
                bgcolor: (theme) =>
                  theme.palette.mode === "light" ? "salmon" : "lightsalmon",
              }}
            >
              <AssignmentSharpIcon />
            </Avatar>
          }
          title="General Information"
          subheader="Please select project to view details"
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent
          sx={{
            ml: 0,
            mb: 2,
            pb: 2,
            height: `calc(100vh - 230px)`,
          }}
        ></CardContent>
      </Card>
    );
  }
};

export default GeneralInfo;
