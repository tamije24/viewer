import apiClient from "./api-client";

export interface DigitalSignal{
    name: string;
    signal: number[];
}

class DigitalSignalService {
    
    getAllDigitalSignals(file_id: number, src: number) {
        // const endpoint = `/comtrade_reader/files/${file_id}/dsignals/`;     
        const endpoint = `/comtrade_reader/dsignals/${file_id}/${src}/`;
        return apiClient.get<DigitalSignal[]>(endpoint)    
    }
}

export default new DigitalSignalService();