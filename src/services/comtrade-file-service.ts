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
    ia_channel: string;
    ib_channel: string;
    ic_channel: string;
    va_channel: string;
    vb_channel: string;
    vc_channel: string;
    d1_channel: string;
    d2_channel: string;
    d3_channel: string;
    d4_channel: string;
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

    createComtradeFile(project_id: number, cfgFile: Object, datFile: File,
                        ia_channel:string, ib_channel:string, ic_channel:string, va_channel: string, vb_channel:string, vc_channel: string,
                        d1_channel:string, d2_channel:string, 
                        d3_channel:string, d4_channel:string) 
    {
        const newFile = { cfg_file: cfgFile, 
                          dat_file: datFile, 
                          ia_channel: ia_channel, 
                          ib_channel: ib_channel, 
                          ic_channel: ic_channel,
                          va_channel: va_channel, 
                          vb_channel: vb_channel, 
                          vc_channel: vc_channel,
                          d1_channel: d1_channel, 
                          d2_channel: d2_channel, 
                          d3_channel: d3_channel, 
                          d4_channel: d4_channel
                        }              
        const endpoint = `/comtrade_reader/projects/${project_id}/files/`;
        return apiClient.post(endpoint, newFile, {headers: {
          'content-type': 'multipart/form-data'
        }})     
      
        
    }
}
export default new ComtradeFileService();
