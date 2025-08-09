"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { auth } from "../firebase"; // pastikan pathnya bener sesuai struktur proyekmu
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

// Height of each icon in the sprite sheet
const ICON_HEIGHT = 100;
const ICON_COUNT = 9;

const WinningSound = () => (
  <audio autoPlay className="player" preload="none">
    <source src="https://andyhoffman.codes/random-assets/img/slots/winning_slot.wav" />
  </audio>
);
const Spinner = forwardRef(({ onFinish }, ref) => {
  const [position, setPosition] = useState(0);
  const timerRef = useRef(null);

  const spin = useCallback(
    (finalPosition, timer) => {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const startPosition =
        -Math.floor(Math.random() * ICON_COUNT) * ICON_HEIGHT;
      setPosition(startPosition);

      const speed = ICON_HEIGHT * Math.floor(Math.random() * (4 - 1) + 1);

      // Start a new interval for the spinning animation
      timerRef.current = setInterval(() => {
        setPosition((prevPos) => {
          let newPos = prevPos - speed;
          if (newPos <= -ICON_HEIGHT * ICON_COUNT) {
            newPos = 0;
          }
          return newPos;
        });
      }, 100);

      // Set a timeout to stop the animation and set the final position
      setTimeout(() => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        const targetPosition = -finalPosition * ICON_HEIGHT;
        setPosition(targetPosition);
        if (typeof onFinish === "function") {
          onFinish(finalPosition);
        }
      }, timer);
    },
    [onFinish]
  );

  useImperativeHandle(
    ref,
    () => ({
      spin,
    }),
    [spin]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="w-[100px] h-[900px] overflow-hidden bg-white bg-[url('https://github.com/antibland/codes/blob/gh-pages/random-assets/img/slots/sprite5.png?raw=true')] bg-repeat-y"
      style={{
        backgroundPosition: `0px ${position}px`,
        backgroundSize: `100px ${ICON_HEIGHT * ICON_COUNT}px`,
      }}
    />
  );
});
Spinner.displayName = "Spinner";

const SlotMachine = () => {
  const [winner, setWinner] = useState(null);
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const spinnerRefs = useRef(Array.from({ length: 5 }, () => null));
  const [spinResults, setSpinResults] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [errorMessage, setErrorMessage] = useState("");
  const finishedCountRef = useRef(0);
  const spinResultsRef = useRef(spinResults);
  const timeoutRef = useRef(null); // Ref for the failsafe timeout

  // Keep ref updated with latest spinResults
  useEffect(() => {
    spinResultsRef.current = spinResults;
  }, [spinResults]);

  // Firebase auth init
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User terdeteksi:", user.uid);
        setFirebaseUser(user);
      } else {
        console.log("ℹ️ Mengautentikasi...");
        // Di lingkungan Canvas, kita akan menggunakan token kustom jika ada
        if (typeof __initial_auth_token !== "undefined") {
          signInWithCustomToken(auth, __initial_auth_token)
            .then((cred) => {
              console.log("✅ Login dengan token berhasil:", cred.user.uid);
              setFirebaseUser(cred.user);
            })
            .catch((err) => {
              console.error("❌ Gagal login dengan token:", err);
              setErrorMessage("Gagal autentikasi dengan Firebase.");
            });
        } else {
          // Jika tidak ada token, kita akan login secara anonim
          signInAnonymously(auth)
            .then((cred) => {
              console.log("✅ Login anonim berhasil:", cred.user.uid);
              setFirebaseUser(cred.user);
            })
            .catch((err) => {
              console.error("❌ Gagal login anonim:", err);
              setErrorMessage("Gagal autentikasi dengan Firebase.");
            });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // get saldo
  const fetchUserBalance = useCallback(async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (resp.status === 409) {
      const err = await resp.json();
      console.error("Error fetching profile:");

      // ! for debugging
      // console.error("Error fetching profile:", err);
      // setErrorMessage(err?.error?.message || "Profil belum lengkap.");
      return;
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    if (data?.success && typeof data?.data?.money === "number") {
      setBalance(data.data.money);
    } else {
      throw new Error("Response /profile tidak valid");
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchUserBalance();
  }, [fetchUserBalance]);

  // Spin button handler
  const handleSpin = async () => {
    if (isSpinning || balance < betAmount) {
      setErrorMessage("Saldo tidak cukup atau spin sedang berlangsung.");
      return;
    }
    if (!firebaseUser) {
      setErrorMessage("User belum terotentikasi.");
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setErrorMessage("");
    setBalance((prev) => prev - betAmount);
    setSpinResults([null, null, null, null, null]);
    finishedCountRef.current = 0;

    // Set a failsafe timeout to stop spinning after 5 seconds
    timeoutRef.current = setTimeout(() => {
      if (isSpinning) {
        setIsSpinning(false);
        setErrorMessage(
          "Terjadi kesalahan pada animasi putaran, silakan coba lagi."
        );
        console.error("Failsafe triggered: Spinners did not finish in time.");
      }
    }, 5000); // 5000 ms

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/spin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ betAmount }),
        }
      );

      if (!response.ok) {
        setErrorMessage(`HTTP Error: ${response.status}`);
        setIsSpinning(false);
        setBalance((prev) => prev + betAmount);
        clearTimeout(timeoutRef.current);
        return;
      }

      const data = await response.json();
      console.log("Response backend:", data);

      if (
        data?.success &&
        Array.isArray(data?.data?.result) &&
        data.data.result.length === 5
      ) {
        // Set hasil spin dan mulai animasinya
        setSpinResults(data.data.result);
        data.data.result.forEach((result, idx) => {
          spinnerRefs.current[idx]?.spin(result, 1000 + idx * 200);
        });
        setBalance(data.data.balance);
      } else {
        throw new Error("Respons backend tidak valid.");
      }
    } catch (err) {
      console.error("Gagal konek backend:", err);
      setErrorMessage("Gagal terhubung ke backend.");
      setIsSpinning(false);
      setBalance((prev) => prev + betAmount);
      clearTimeout(timeoutRef.current);
    }
  };

  // Called by each spinner when animation finishes
  const handleFinish = useCallback(() => {
    finishedCountRef.current += 1;
    console.log(`Spinner finished count: ${finishedCountRef.current}`);

    if (finishedCountRef.current === 5) {
      setIsSpinning(false);
      const results = spinResultsRef.current;
      const allSame = results.every((v) => v === results[0]);
      if (allSame) {
        setWinner(true);
        setTimeout(() => {
          setBalance((prev) => prev + betAmount * 10);
        }, 2230);
      } else {
        setWinner(false);
      }
      clearTimeout(timeoutRef.current); // Clear the failsafe timeout

      // Fetch profile again to update balance
      fetchUserBalance();
    }
  }, [betAmount]);

  return (
    <>
      {winner === true && <WinningSound />}
      <section
        className="flex items-center justify-center w-screen h-screen"
        style={{
          backgroundImage: "url('/asset/bgslot.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-[#8B0000] p-6 rounded-xl shadow-lg text-white w-[750px]">
          <div className="bg-[#5C0000] px-6 py-2 rounded mb-4 text-2xl font-bold text-center">
            UNHASGACOR77
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="relative flex gap-1 bg-[#222] p-2 rounded-lg">
              {[1000, 1200, 1400, 1600, 1800].map((timer, index) => (
                <div
                  key={index}
                  className="overflow-hidden w-[100px] h-[300px] bg-white rounded"
                >
                  <Spinner
                    onFinish={handleFinish}
                    finalPosition={spinResults[index]}
                    timer={timer}
                    ref={(el) => (spinnerRefs.current[index] = el)}
                  />
                </div>
              ))}
              <div className="absolute top-1/2 left-0 right-0 h-[100px] bg-red-500/20 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex flex-col items-center gap-3">
              <label className="text-lg font-bold">BET</label>
              <input
                type="number"
                placeholder="Masukkan Taruhanmu"
                className="px-3 py-2 rounded text-black w-[140px]"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={1}
              />
              <button
                onClick={handleSpin}
                disabled={isSpinning || !firebaseUser}
                className={`bg-orange-500 px-6 py-2 rounded text-white font-bold transition-all duration-200 ${
                  isSpinning || !firebaseUser
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-orange-600"
                }`}
              >
                {isSpinning
                  ? "SPINNING..."
                  : firebaseUser
                  ? "SPIN"
                  : "LOADING..."}
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm">
            Jumlah Saldo: Rp{balance.toLocaleString("id-ID")}
          </div>
          {errorMessage && (
            <div className="mt-4 text-center">
              <p className="font-semibold text-red-400">{errorMessage}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SlotMachine;
