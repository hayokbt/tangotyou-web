"use client"

import { useState } from 'react';
import axios from 'axios';
import { newAccount } from '@/data/newAccount';
import { login as apiLogin } from '@/data/login';
import { useRouter } from 'next/navigation';

export default function Account() {
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ inputError, setInputError ] = useState("");
    const router = useRouter();

    const validateCredentials = () => {
        if (username === "") {
            setInputError("Username is empty");
            return false;
        }
        if (password.length < 6) {
            setInputError("Passwords shorter than 6 characters");
            return false;
        }
        setInputError("");
        return true;
    }

    const handleLogin = async () => {
        if (!validateCredentials()) {
            return;
        }

        try {
            const res = await apiLogin(username, password);
            console.log('login response', res);
            if (res && res.success) {
                setInputError('ログインに成功しました');
                router.push('/');
            } else {
                setInputError(res?.error || 'ログインに失敗しました');
            }
        } catch (err) {
            console.error(err);
            const errorMessage = axios.isAxiosError(err) && err.response?.data?.error
                ? String(err.response.data.error)
                : 'ログインに失敗しました';
            setInputError(errorMessage);
        }
    }

    const handleNewAccount = async () => {
        if (!validateCredentials()) {
            return;
        }

        try {
            const res = await newAccount(username, password);
            console.log('new account response', res);
            if (res && res.success) {
                setInputError('登録に成功しました');
                setUsername("");
                setPassword("");
            } else {
                setInputError(res?.error || '登録に失敗しました');
            }
        } catch (err) {
            console.error(err);
            const errorMessage = axios.isAxiosError(err) && err.response?.data?.error
                ? String(err.response.data.error)
                : '登録に失敗しました';
            setInputError(errorMessage);
        }
    }

    return (
        <div>
            <h1>account</h1>
            <div className="form-container">
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                </label>

                {inputError !== "" && (
                    <div className="error-text">
                        {inputError}
                    </div>
                )}

                <button type="button" onClick={handleLogin} className="button">ログイン</button>
                <button type="button" onClick={handleNewAccount} className="button">新規登録</button>
            </div>
        </div>
    )
}