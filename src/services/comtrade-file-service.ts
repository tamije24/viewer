import apiClient from "./api-client";

export interface ComtradeFile {
    file_id: number;
    cfg_file: string;
    dat_file: string;
    station_name: string;
    analog_channel_count: number;
    digital_channel_count: number;
    start_time_stamp: Date;
    trigger_time_stamp: Date;
    line_frequency: number;
    sampling_frequency: number; 
}

class ComtradeFileService {
    getComtradeFiles(project_id: number) {
        const controller = new AbortController();
        const endpoint = `/comtrade_reader/projects/${project_id}/files/`;
        const request = apiClient.get<ComtradeFile>(endpoint, {
        signal: controller.signal,
      })    
      return {request, cancel: ()=> controller.abort()}
    }

    getComtradeFile(project_id: number, file_id: number) {
        const controller = new AbortController();
        const endpoint = `/comtrade_reader/projects/${project_id}/files/${file_id}/`;
        const request = apiClient.get<ComtradeFile>(endpoint, {
        signal: controller.signal,
      })    
      return {request, cancel: ()=> controller.abort()}
    }

    deleteComtradeFile(project_id: number, file_id: number) {
        const endpoint = `/comtrade_reader/projects/${project_id}/files/${file_id}/`;
        return apiClient.delete(endpoint)
      }
  
    createComtradeFile(project_id: number, cfgFile: Object, datFile: File) {
        const newFile = {cfg_file: cfgFile, dat_file: datFile}
        const endpoint = `/comtrade_reader/projects/${project_id}/files/`;
        return apiClient.post(endpoint, newFile, {headers: {
          'content-type': 'multipart/form-data'
        }})     
      
        
    }
}
export default new ComtradeFileService();
