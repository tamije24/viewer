
import apiClient from "./api-client";

export interface AnalogSignal{
    name: string;
    signal: number[];
}

class AnalogSignalService {
    
    getAllAnalogSignals(file_id: number) {
        const endpoint = `/comtrade_reader/files/${file_id}/asignals/`;
        return apiClient.get<AnalogSignal[]>(endpoint)    
    }
}

export default new AnalogSignalService();