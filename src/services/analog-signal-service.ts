
import apiClient from "./api-client";

export interface AnalogSignal{
    name: string;
    signal: number[];
}

class AnalogSignalService {
    
    getAllAnalogSignals(file_id: number, src:number ) {
        // const endpoint = `/comtrade_reader/files/${file_id}/asignals/`;
        const endpoint = `/comtrade_reader/asignals/${file_id}/${src}/`;
        return apiClient.get<AnalogSignal[]>(endpoint)    
    }
}

export default new AnalogSignalService();

