
import apiClient from "./api-client";

// export interface Phasor{
//     name: string;
//     phasors: number[];
// }

class ResampleService {
    
    doResample(file_id: number, new_samp_rate:number) {
        const endpoint = `/comtrade_reader/resample/${file_id}/${new_samp_rate}/`;
        return apiClient.get(endpoint)    
    }
}

export default new ResampleService();