
import apiClient from "./api-client";

export interface AnalogSignal{
    name: string;
    signal: number[];
}

class AnalogSignalService {
    
    getAllAnalogSignals(file_id: number) {
        const endpoint = `/comtrade_reader/asignals/${file_id}/`;
        return apiClient.get<AnalogSignal[]>(endpoint)    
    }
}

export default new AnalogSignalService();