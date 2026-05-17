import axios from 'axios';

export async function login(username: string, password: string) {
    const request = await axios.post('/api/login', { username, password });
    return request.data;
}
