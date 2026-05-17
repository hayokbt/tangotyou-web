import axios from 'axios';

export async function get1Word(): Promise<[string, string]> {
    const request = await axios.get('/api/word');
    return [request.data.term, request.data.meaning];
}