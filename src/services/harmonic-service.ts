
import apiClient from "./api-client";

export interface Harmonic{
    harmonic: number;
    ia: number;
    ib: number;
    ic: number;
    in: number;
    va: number;
    vb: number;
    vc: number;
}

class HarmonicService {
    
    getAllHarmonics(file_id: number, start_sample: number, end_sample: number, src: number) {
        const endpoint = `/comtrade_reader/harmonics/${file_id}/${start_sample}/${end_sample}/${src}/`;
        return apiClient.get<Harmonic[]>(endpoint)    
    }
}

export default new HarmonicService();