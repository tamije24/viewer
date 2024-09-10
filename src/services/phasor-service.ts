
import apiClient from "./api-client";

export interface Phasor{
    name: string;
    phasors: number[];
}

class PhasorService {
    
    getAllAPhasors(file_id: number) {
        const endpoint = `/comtrade_reader/phasors/${file_id}/`;
        return apiClient.get<Phasor[]>(endpoint)    
    }
}

export default new PhasorService();