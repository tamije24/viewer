
import apiClient from "./api-client";

class SigninService {
  SignIn(user: {
    username: FormDataEntryValue | null,
    password: FormDataEntryValue | null,
  }) {
       const endpoint = `/auth/jwt/create`;
       return apiClient.post(endpoint, user);     
}
}

export default new SigninService();
