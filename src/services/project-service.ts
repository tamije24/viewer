

import apiClient from "./api-client";
import { ComtradeFile } from "./comtrade-file-service";

export interface Project {
  project_id: number;
  project_name: string;
  afa_case_id: string;
  line_name: string;
  no_of_terminals: number;
  favorite: boolean;
  notes: string;
  user: number;
  files: ComtradeFile[];
}

export interface ProjectMin {
  afa_case_id: string;
  line_name: string;
  no_of_terminals: number;
  notes: string;
}

class ProjectService {

    getAllProjects() {
        const controller = new AbortController();
        const endpoint = "/comtrade_reader/projects/";
        const request = apiClient.get<Project[]>(endpoint, {
        signal: controller.signal,
      })    
      return {request, cancel: ()=> controller.abort()}
    }

    getProject(id: number) {
      const endpoint = `/comtrade_reader/projects/${id}/`;
      return apiClient.get<Project>(endpoint)    
  }

    deleteProject(id: number) {
      const endpoint = `/comtrade_reader/projects/${id}/`; 
      return apiClient.delete(endpoint)
    }

    createProject(project: ProjectMin) {
      const endpoint = `/comtrade_reader/projects/`; 
      return apiClient.post(endpoint, project)
    }

    updateProject(project: Project) {
      const endpoint = `/comtrade_reader/projects/${project.project_id}/`; 
      return apiClient.put(endpoint, project)
    }
}

export default new ProjectService();
