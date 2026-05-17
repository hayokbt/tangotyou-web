import axios from 'axios';

export async function newAccount(username: string, password: string) {
    const request = await axios.post('/api/account', { username, password });
    return request.data;
}
