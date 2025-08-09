'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeSlash } from 'iconsax-react';

const RegistComp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmationPassword: '',
  });

  const [formErrors, setFormErrors] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmationPassword: false,
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, confirmationPassword } = formData;

    const isValid = Object.values(formData).every((val) => val.trim() !== '');
    if (!isValid) {
      setFormErrors({
        fullName: !fullName,
        email: !email,
        password: !password,
        confirmationPassword: !confirmationPassword,
      });
      toast.error('Mohon isi semua field');
      return;
    }

    if (password !== confirmationPassword) {
      toast.error('Password dan konfirmasi tidak cocok');
      setFormErrors((prev) => ({
        ...prev,
        password: true,
        confirmationPassword: true,
      }));
      return;
    }

    if (!fullName || fullName.trim() === '') {
      toast.error('Nama lengkap tidak boleh kosong ya, Senpai~');
      return;
    }

    const toastId = toast.loading('Membuat akun...');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ fullName }),
        }
      );

      console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log(fullName);

      if (response.ok) {
        toast.dismiss(toastId);
        toast.success('Akun berhasil dibuat!');

        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        await user.delete();
        toast.dismiss(toastId);
        toast.error('Gagal daftar ke backend.');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <Toaster />
      <div className="w-full max-w-sm p-6 bg-white shadow-md rounded-xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Buat Akun
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block mb-1 text-sm text-gray-700"
            >
              Nama Pengguna
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                formErrors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Username"
            />
            {formErrors.fullName && (
              <p className="mt-1 text-sm text-red-500">
                Nama lengkap harus diisi
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-1 text-sm text-gray-700"
            >
              Password
            </label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your Password"
            />
            <div
              className="absolute text-gray-500 cursor-pointer right-3 top-9"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <Eye size="20" /> : <EyeSlash size="20" />}
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="relative">
            <label
              htmlFor="confirmationPassword"
              className="block mb-1 text-sm text-gray-700"
            >
              Konfirmasi Password
            </label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="confirmationPassword"
              id="confirmationPassword"
              value={formData.confirmationPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                formErrors.confirmationPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="Your Password"
            />
            <div
              className="absolute text-gray-500 cursor-pointer right-3 top-9"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <Eye size="20" /> : <EyeSlash size="20" />}
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white transition bg-orange-400 rounded-full hover:bg-orange-500"
          >
            Daftar
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <a
            href="/login"
            className="font-medium text-orange-500 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </section>
  );
};

export default RegistComp;
