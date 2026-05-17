import axios from 'axios';

export async function newAccount(username: string, password: string) {
    const request = await axios.post(
        '/api/account/create',
        { username, password },
        { withCredentials: true }
    );
    return request.data;
}
