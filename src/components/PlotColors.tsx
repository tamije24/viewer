import { memo, useCallback } from "react";

import {
  GridRenderCellParams,
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import type { AutocompleteProps } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";

const PlotColors = () => {
  return <div>PlotColors</div>;
};

export default PlotColors;

export interface ColorOption {
  value: string;
  code: number;
  label: string;
  //  suggested?: boolean;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { value: "crimson", code: 1, label: "Crimson" },
  { value: "goldenrod", code: 2, label: "Golden Rod" },
  { value: "deepskyblue", code: 3, label: "Deep Sky Blue" },
  { value: "black", code: 4, label: "Black" },
  { value: "#4e79a7", code: 5, label: "4e79a7" },
  { value: "#f28e2c", code: 6, label: "f28e2c" },
  { value: "#e15759", code: 7, label: "e15759" },
  { value: "#76b7b2", code: 8, label: "76b7b2" },
  { value: "#59a14f", code: 9, label: "59a14f" },
  { value: "#edc949", code: 10, label: "edc949" },
  { value: "#af7aa1", code: 11, label: "af7aa1" },
  { value: "#ff9da7", code: 12, label: "ff9da7" },
  { value: "#9c755f", code: 13, label: "9c755f" },
  { value: "red", code: 14, label: "red" },
];

interface ColorProps {
  value: ColorOption;
}

const Color = memo(function Color(props: ColorProps) {
  const { value } = props;
  return <Chip sx={{ width: 20, height: 10, bgcolor: String(value) }} />;
});

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  height: "100%",
  [`& .${autocompleteClasses.inputRoot}`]: {
    ...theme.typography.body2,
    padding: "1px 0",
    height: "100%",
    "& input": {
      padding: "0 16px",
      height: "100%",
    },
  },
})) as typeof Autocomplete;

function EditColor(props: GridRenderEditCellParams<ColorOption>) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  const handleChange = useCallback<
    NonNullable<AutocompleteProps<ColorOption, false, true, false>["onChange"]>
  >(
    async (event, newValue) => {
      console.log("handle change", newValue);
      await apiRef.current.setEditCellValue(
        { id, field, value: newValue },
        event
      );
      apiRef.current.stopCellEditMode({ id, field });
    },
    [apiRef, field, id]
  );

  return (
    <StyledAutocomplete<ColorOption, false, true, false>
      value={value}
      onChange={handleChange}
      options={COLOR_OPTIONS}
      getOptionLabel={(option: any) => option.value}
      autoHighlight
      fullWidth
      open
      disableClearable
      renderOption={(optionProps, option: any) => (
        <Box component="li" {...optionProps} key={option.code}>
          <Chip
            component="span"
            sx={{ width: 20, height: 10, bgcolor: option.value }}
          />
        </Box>
      )}
      renderInput={(params) => (
        <InputBase
          autoFocus
          fullWidth
          id={params.id}
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password", // disable autocomplete and autofill
          }}
          {...params.InputProps}
        />
      )}
    />
  );
}

export function renderColor(
  params: GridRenderCellParams<ColorOption, any, any>
) {
  if (params.value == null) {
    return "";
  }
  return <Color value={params.value} />;
}

export function renderEditColor(params: GridRenderEditCellParams<ColorOption>) {
  return <EditColor {...params} />;
}
