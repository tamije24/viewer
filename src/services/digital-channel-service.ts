
import apiClient from "./api-client";

export interface DigitalChannel {
  channel_id: string;
  id: number;
  channel_name: string;
  normal_state: number;
  selected: boolean;
}
class DigitalChannelService {

    getAllDigitalChannels(file_id: number) {
        const controller = new AbortController();
        const endpoint = `/comtrade_reader/files/${file_id}/dchannels/`;
        const request = apiClient.get<DigitalChannel[]>(endpoint, {
        signal: controller.signal,
      })    
      return {request, cancel: ()=> controller.abort()}
    }

    deleteDigitalChannel(file_id: number, id: string) {
      const endpoint = `/comtrade_reader/files/${file_id}/dchannels/${id}/`;
      return apiClient.delete(endpoint)

    }

    updateDigitalChannel(file_id: number, digitalChannel: DigitalChannel) {
      const endpoint = `/comtrade_reader/files/${file_id}/dchannels/${digitalChannel.channel_id}/`;
     return apiClient.patch(endpoint, digitalChannel)
    }
}

export default new DigitalChannelService();
