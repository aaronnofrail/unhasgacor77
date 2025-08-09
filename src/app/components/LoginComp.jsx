'use client';

import { useState } from 'react';
import { auth } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeSlash } from 'iconsax-react';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginComp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: false,
    password: false,
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: false });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setFormErrors({
        email: !email,
        password: !password,
      });
      toast.error('Mohon isi semua field');
      return;
    }

    const toastId = toast.loading('Sedang masuk...');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast.dismiss(toastId);
      toast.success('Login berhasil!');
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Login gagal:', error);
      toast.error('Email atau password salah.');
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Toaster />
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Masuk
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="Email"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">Email harus diisi.</p>
            )}
          </div>

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
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
            >
              {passwordVisible ? <Eye size="20" /> : <EyeSlash size="20" />}
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-500">Password harus diisi.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-full bg-orange-400 hover:bg-orange-500 text-white font-semibold transition"
          >
            Masuk
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <a
            href="/register"
            className="text-orange-500 font-medium hover:underline"
          >
            Daftar sekarang
          </a>
        </p>
      </div>
    </section>
  );
};

export default LoginComp;
