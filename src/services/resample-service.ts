
import apiClient from "./api-client";

class ResampleService {
    
    doResample(project_id: number, new_samp_rate:number) {
        const endpoint = `/comtrade_reader/resample/${project_id}/${new_samp_rate}/`;
        return apiClient.get(endpoint)    
    }
}

export default new ResampleService();