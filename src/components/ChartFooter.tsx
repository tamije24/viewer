import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomInSharp";
import Switch from "@mui/material/Switch";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import TextsmsIcon from "@mui/icons-material/Textsms";

import {
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  Input,
} from "@mui/material";
import { useState } from "react";

interface Props {
  zoomBoundary: {
    startTime: number;
    endTime: number;
  };
  onZoomOutClick: () => void;
  onZoomInClick: (fromValue: number, toValue: number) => void;
  onToolTipStatusChange: (toolTipStatus: boolean) => void;
}

const ChartFooter = ({
  zoomBoundary,
  onZoomOutClick,
  onZoomInClick,
  onToolTipStatusChange,
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

  const label = { inputProps: { "aria-label": "Tooltip" } };

  return (
    <Card
      sx={{
        mt: 0,
        mb: 0.5,
        mr: 0,
        ml: 2,
      }}
    >
      <CardContent
        sx={{
          bgcolor: "highlight",
          height: "70px",
          alignContent: "center",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
        >
          <Stack
            direction="row"
            alignItems="start"
            spacing={2}
            //     sx={{ bgcolor: "red" }}
          >
            <FormControl variant="standard" sx={{ width: "55px" }}>
              <Input
                id="fromValue"
                type="number"
                defaultValue={zoomBoundary.startTime}
                aria-describedby="x-from-text"
                inputProps={{
                  "aria-label": "from-x",
                }}
              />
              <FormHelperText id="x-from-text">from</FormHelperText>
            </FormControl>

            <FormControl
              variant="standard"
              sx={{ height: "30px", width: "55px" }}
            >
              <Input
                id="toValue"
                type="number"
                defaultValue={zoomBoundary.endTime}
                aria-describedby="x-to-text"
                inputProps={{
                  "aria-label": "to-x",
                }}
              />
              <FormHelperText id="x-to-text">to</FormHelperText>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleZoomInClick}
              sx={{ fontSize: "1 rem", pt: 0.5 }}
              startIcon={<ZoomInIcon fontSize="small" />}
            >
              Zoom
            </Button>

            <Button
              variant="contained"
              onClick={onZoomOutClick}
              sx={{ fontSize: "1 rem", pt: 0.5 }}
              startIcon={<ZoomOutIcon fontSize="small" />}
            >
              Reset
            </Button>
          </Stack>
          <Checkbox
            checked={isTooltip}
            icon={<TextsmsOutlinedIcon />}
            checkedIcon={<TextsmsIcon />}
            onChange={(event) => {
              setIsTooltip(event.target.checked);
              onToolTipStatusChange(event.target.checked);
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChartFooter;
