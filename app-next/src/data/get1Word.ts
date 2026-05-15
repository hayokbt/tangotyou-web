import axios from 'axios';
import { requests } from '@/data/access';

export async function get1Word(): Promise<[string, string]> {
    let wordSet: [string, string] = ["None", ""]

    const request = await axios(requests.get1Word);
    wordSet = [request.data.term, request.data.meaning];
    return wordSet;
}