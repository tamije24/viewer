import apiClient from "./api-client";

export interface Signal{
    name: string;
    signal: number[];
}

class ResampleSignalService {
    
    getAllResampledSignals(file_id: number, new_samp_rate:number, old_samp_rate:number) {
        // const endpoint = `/comtrade_reader/files/${file_id}/asignals/`;
        const endpoint = `/comtrade_reader/resample/${file_id}/${new_samp_rate}/${old_samp_rate}`;
        return apiClient.get<Signal[]>(endpoint)    
    }
}

export default new ResampleSignalService();