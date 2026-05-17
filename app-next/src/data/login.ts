import axios from 'axios';

export async function login(username: string, password: string) {
    const request = await axios.post(
        '/api/account/login',
        { username, password },
        { withCredentials: true }
    );
    return request.data;
}
