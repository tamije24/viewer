import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomInSharp";
import { useState } from "react";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

interface Props {
  onToolTipStatusChange: (toolTipStatus: boolean) => void;
  zoomBoundary: { start: number; end: number };
  onZoomOutClick: () => void;
  onZoomInClick: (fromValue: number, toValue: number) => void;
}

const ChartFooter = ({
  onToolTipStatusChange,
  zoomBoundary,
  onZoomOutClick,
  onZoomInClick,
}: Props) => {
  const [isTooltip, setIsTooltip] = useState(false);

  const handleZoomInClick = () => {
    const fValue = document.getElementById("fromValue") as HTMLInputElement;
    const tValue = document.getElementById("toValue") as HTMLInputElement;

    const fromValue = parseFloat(fValue.value);
    const toValue = parseFloat(tValue.value);

    if (fromValue >= toValue) return;

    onZoomInClick(fromValue, toValue);
  };

  return (
    <Stack
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      direction="row"
      spacing={3}
      sx={{ mt: 0.5, mb: 0.5, mr: 2 }}
    >
      <Stack
        //   justifyContent="flex-start"
        direction="row"
        alignItems="center"
        spacing={2}
        //     sx={{ bgcolor: "red" }}
      >
        <TextField
          id="fromValue"
          label="From"
          margin="dense"
          sx={{
            width: "70px",
          }}
          type="number"
          size="small"
          defaultValue={zoomBoundary.start}
        />
        <TextField
          id="toValue"
          label="To"
          margin="dense"
          sx={{ width: "70px" }}
          type="number"
          size="small"
          defaultValue={zoomBoundary.end}
        />
        <Button
          variant="outlined"
          onClick={handleZoomInClick}
          sx={{ color: "", fontSize: "0.8rem", height: "28px", pt: 0.5 }}
          startIcon={<ZoomInIcon fontSize="large" />}
        >
          Zoom in
        </Button>
      </Stack>
      <Button
        variant="outlined"
        onClick={onZoomOutClick}
        sx={{ color: "", fontSize: "0.8rem", height: "28px", pt: 0.5 }}
        startIcon={<ZoomOutIcon fontSize="small" />}
      >
        Reset zoom
      </Button>
      <FormControlLabel
        control={
          <Switch
            checked={isTooltip}
            size="small"
            onChange={(event) => {
              setIsTooltip(event.target.checked);
              onToolTipStatusChange(event.target.checked);
            }}
            color="primary"
            sx={{ ml: 1 }}
          />
        }
        label="Show Tooltip"
        labelPlacement="end"
        sx={{ fontSize: "0.7rem", alignItems: "flex-start" }}
      />
    </Stack>
  );
};

export default ChartFooter;
