'use client';

import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../firebase';

const InputName = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.trim() === '') {
      setError(true);
      toast.error('Nama pengguna tidak boleh kosong!');
      return;
    }

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: username,
        });

        toast.success('Username berhasil disimpan!');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1000);
      } else {
        toast.error('User tidak ditemukan!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan username.');
    }
  };

  return (
    <>
      <section className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <Toaster />
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Masukkan Nama Pengguna
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block mb-1 text-sm text-gray-700"
              >
                Nama Pengguna
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Username"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600 transition"
            >
              Simpan Username
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default InputName;
