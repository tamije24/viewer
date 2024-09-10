import { useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";

interface Props {
  onSearch: (searchText: string) => void;
}

const SearchInput = ({ onSearch }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (ref.current) onSearch(ref.current.value);
      }}
    >
      <FormControl variant="standard">
        <InputLabel htmlFor="projectSearch">Search Projects</InputLabel>
        <Input
          inputRef={ref}
          id="projectSearch"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          sx={{ border: 0.5, borderRadius: 1, paddingLeft: 0.5 }}
        />
      </FormControl>
    </form>
  );
};

export default SearchInput;
