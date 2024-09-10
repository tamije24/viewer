
import apiClient from "./api-client";

export interface AnalogChannel {
    channel_id: string;
    id: number;
    channel_name: string;
    phase: string;
    unit: string;
    primary: number;
    secondary: number;
    pors: string;
    selected: boolean;
  }

class AnalogChannelService {

    getAllAnalogChannels(file_id: number) {
        const controller = new AbortController();
        const endpoint = `/comtrade_reader/files/${file_id}/achannels/`;
        const request = apiClient.get<AnalogChannel[]>(endpoint, {
        signal: controller.signal,
      })    
      return {request, cancel: ()=> controller.abort()}
    }

    deleteAnalogChannel(file_id: number, id: string) {
      const endpoint = `/comtrade_reader/files/${file_id}/achannels/${id}/`;
      return apiClient.delete(endpoint)

    }

    updateAnalogChannel(file_id: number, analogChannel: AnalogChannel) {
      const endpoint = `/comtrade_reader/files/${file_id}/achannels/${analogChannel.channel_id}/`;
     return apiClient.patch(endpoint, analogChannel)
    }
}

export default new AnalogChannelService();
