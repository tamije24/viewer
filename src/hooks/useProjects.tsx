import { CanceledError } from "axios";
import { useEffect, useState } from "react";
import apiClient from "../services/api-client";

interface Project {
  project_id: number;
  project_name: string;
}

// [("project_id",
//   "project_name",
//   "afa_case_id",
//   "line_name",
//   "no_of_terminals",
//   "notes",
//   "user",
//   "files")]

const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<Project[]>("/comtrade_reader/projects", {
        signal: controller.signal,
      })
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        if (err instanceof TypeError) return;
        setError(err.message);
      });
    return () => controller.abort();
  }, []);

  return { projects, error };
};

export default useProjects;
