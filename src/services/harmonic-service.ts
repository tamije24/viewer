
import apiClient from "./api-client";

export interface Harmonic{
    harmonic: number;
    ia: number;
    ib: number;
    ic: number;
    va: number;
    vb: number;
    vc: number;
}

class HarmonicService {
    
    getAllHarmonics(file_id: number, start_sample: number, end_sample: number) {
        const endpoint = `/comtrade_reader/harmonics/${file_id}/${start_sample}/${end_sample}/`;
        return apiClient.get<Harmonic[]>(endpoint)    
    }
}

export default new HarmonicService();