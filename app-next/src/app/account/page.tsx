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
    // 成功メッセージかエラーメッセージかを判定するためのフラグ
    const [ isSuccess, setIsSuccess ] = useState(false);
    const router = useRouter();

    const validateCredentials = () => {
        if (username === "") {
            setInputError("ユーザー名を入力してください");
            setIsSuccess(false);
            return false;
        }
        if (password.length < 6) {
            setInputError("パスワードは6文字以上で入力してください");
            setIsSuccess(false);
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
                setIsSuccess(true);
                router.push('/');
            } else {
                setInputError(res?.error || 'ログインに失敗しました');
                setIsSuccess(false);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = axios.isAxiosError(err) && err.response?.data?.error
                ? String(err.response.data.error)
                : 'ログインに失敗しました';
            setInputError(errorMessage);
            setIsSuccess(false);
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
                setInputError('アカウントの登録に成功しました！');
                setIsSuccess(true);
                setUsername("");
                setPassword("");
            } else {
                setInputError(res?.error || '登録に失敗しました');
                setIsSuccess(false);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = axios.isAxiosError(err) && err.response?.data?.error
                ? String(err.response.data.error)
                : '登録に失敗しました';
            setInputError(errorMessage);
            setIsSuccess(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
                
                {/* ヘッダー部分 */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        アカウント
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        ログインまたは新規登録を行ってください
                    </p>
                </div>

                {/* フォーム部分 */}
                <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ユーザー名
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ユーザー名を入力"
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                パスワード
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6文字以上"
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            />
                        </div>
                    </div>

                    {/* メッセージ表示（成功は緑、エラーは赤） */}
                    {inputError !== "" && (
                        <div className={`p-3 rounded-md text-sm font-medium ${
                            isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {inputError}
                        </div>
                    )}

                    {/* ボタンエリア */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            ログイン
                        </button>
                        <button
                            type="button"
                            onClick={handleNewAccount}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            新規登録
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}