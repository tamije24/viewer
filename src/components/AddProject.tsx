import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddHomeIcon from "@mui/icons-material/AddHome";
import Grid from "@mui/material/Grid";
import projectService, {
  Project,
  ProjectMin,
} from "../services/project-service";

interface Props {
  onAddProject: (project: Project) => void;
}

const AddProject = ({ onAddProject }: Props) => {
  const [error, setError] = useState(false);
  // const [afacaseidError, setAfacaseidError] = useState(false);
  // const [afacaseidErrorMessage, setAfacaseidErrorMessage] = useState("");
  const [linenameError, setLinenameError] = useState(false);
  const [linenameErrorMessage, setLinenameErrorMessage] = useState("");
  const [terminalsError, setTerminalsError] = useState(false);
  const [terminalsErrorMessage, setTerminalsErrorMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const project: ProjectMin = {
      afa_case_id: "Direct",
      line_name: String(data.get("linename")),
      no_of_terminals: Number(data.get("terminals")),
      notes: String(data.get("notes")),
    };

    // if (afacaseidError || linenameError || terminalsError) return;
    if (linenameError || terminalsError) return;

    projectService
      .createProject(project)
      .then(({ data: savedProject }) => onAddProject(savedProject))
      .catch((err) => {
        setError(err.message);
      });
  };

  const validateInputs = () => {
    // const afacaseid = document.getElementById("afacaseid") as HTMLInputElement;
    const linename = document.getElementById("linename") as HTMLInputElement;
    const terminals = document.getElementById("terminals") as HTMLInputElement;

    let isValid = true;

    // if (!afacaseid.value) {
    //   setAfacaseidError(true);
    //   setAfacaseidErrorMessage("AFA id required");
    //   isValid = false;
    // } else {
    //   setAfacaseidError(false);
    //   setAfacaseidErrorMessage("");
    // }

    if (!linename.value) {
      setLinenameError(true);
      setLinenameErrorMessage("Line name required");
      isValid = false;
    } else {
      setLinenameError(false);
      setLinenameErrorMessage("");
    }

    if (!terminals.value) {
      setTerminalsError(true);
      setTerminalsErrorMessage("No of terminals required");
      isValid = false;
    } else {
      setTerminalsError(false);
      setTerminalsErrorMessage("");
    }
    return isValid;
  };

  return (
    <Card
      sx={{
        mt: 10,
        ml: 2,
        mb: 10,
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <AddHomeIcon />
          </Avatar>
        }
        title="Add New Analysis"
        subheader="Fill in the details and click on the Add Analysis button"
        sx={{ paddingBottom: 0.5, height: 80, borderBottom: 0.5 }}
      />
      <CardContent>
        <Grid
          container
          component="form"
          onSubmit={handleSubmit}
          noValidate
          spacing={2}
          sx={{ mt: 1 }}
        >
          {/* <Grid item xs={3}>
            <TextField
              error={afacaseidError}
              helperText={afacaseidErrorMessage}
              margin="normal"
              required
              id="afacaseid"
              type="text"
              label="AFA Case ID"
              name="afacaseid"
              autoComplete="afacaseid"
              fullWidth
              autoFocus
              color={afacaseidError ? "error" : "primary"}
              sx={{ ariaLabel: "afacaseid" }}
            />
          </Grid> */}
          <Grid item xs={9}>
            <TextField
              error={linenameError}
              helperText={linenameErrorMessage}
              margin="normal"
              required
              id="linename"
              type="text"
              label="Line Name"
              name="linename"
              autoComplete="linename"
              fullWidth
              autoFocus
              color={linenameError ? "error" : "primary"}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              error={terminalsError}
              helperText={terminalsErrorMessage}
              margin="normal"
              required
              id="terminals"
              type="number"
              label="No of Terminals"
              name="terminals"
              autoComplete="terminals"
              defaultValue={2}
              fullWidth
              autoFocus
              color={terminalsError ? "error" : "primary"}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              margin="normal"
              required
              id="notes"
              type="text"
              multiline={true}
              label="Notes"
              name="notes"
              autoComplete="notes"
              fullWidth
              autoFocus
              color="primary"
              sx={{ ariaLabel: "notes" }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              //justifyContent: "space-around",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{ ml: 0 }}
              onClick={validateInputs}
            >
              Add Analysis
            </Button>
          </Grid>
        </Grid>
        {error && (
          <Typography
            component="h1"
            variant="overline"
            align="left"
            sx={{ color: "red" }}
          >
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AddProject;
