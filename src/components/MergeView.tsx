import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import JoinLeftIcon from "@mui/icons-material/JoinLeft";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import Box from "@mui/system/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface Props {
  mergeError: boolean;
  mergeErrorMessage: string;
  onMergeErrorClose: () => void;
  selectedMergeType: string;
  onMergeTypeChange: (mergeType: string) => void;
}

const MergeView = ({
  mergeError,
  mergeErrorMessage,
  onMergeErrorClose,
  selectedMergeType,
  onMergeTypeChange,
}: Props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onMergeTypeChange(event.target.value);
  };

  const handleClose = () => {
    onMergeErrorClose();
  };

  const controlProps = (item: string) => ({
    checked: selectedMergeType === item,
    onChange: handleChange,
    value: item,
    name: "merge-view-selection",
  });

  return (
    <>
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
                bgcolor: "warning.main",
              }}
            >
              <JoinLeftIcon />
            </Avatar>
          }
          title="MERGE VIEW"
          subheader="Please select option for merging waveforms from different stations"
          sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
        />
        <CardContent
          sx={{
            ml: 0,
            mb: 2,
            pb: 2,
            //  height: `calc(100vh - 290px)`,
          }}
        >
          <Box sx={{ ml: 2.5, mb: 0 }}>
            <Typography
              variant="overline"
              sx={{ pl: 1, pr: 1, bgcolor: "white" }}
            >
              Merge By
            </Typography>
          </Box>
          <Grid
            container
            rowSpacing={2}
            sx={{ border: 0.2, borderRadius: 0.5, p: 2 }}
          >
            <Grid item xs={1}>
              <Radio {...controlProps("real")} color="info" />
            </Grid>
            <Grid item xs={11}>
              <Typography
                variant="subtitle1"
                //color="secondary.main"
              >
                Real Time
              </Typography>
              <Typography variant="caption">
                Merge waveforms based on real time. Real time is obtained from
                the start times in the COMTRADE files
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Radio {...controlProps("trigger")} color="info" />
            </Grid>
            <Grid item xs={11}>
              <Typography
                variant="subtitle1"
                //color="secondary.main"
              >
                Trigger Time
              </Typography>
              <Typography variant="caption">
                Merge waveforms based on the trigger time in the COMTRADE files.
                The trigger times of all stations are shall be considered as the
                same time instant.
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Radio {...controlProps("manual")} color="info" />
            </Grid>
            <Grid item xs={11}>
              <Typography
                variant="subtitle1"
                //color="secondary.main"
              >
                Manual Selection
              </Typography>
              <Typography variant="caption">
                Merge waveforms based on manual synchronization points. The
                times corresponding to the primary cursor points selected for
                each station shall be considered as the same time instant.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Dialog
        open={mergeError}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Merge Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {mergeErrorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default MergeView;
