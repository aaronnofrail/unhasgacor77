"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Modal from "../components/Modal";
import { Warning2 } from "iconsax-react";
import RewardVideoModal from "../components/home/RewardVideoModal";
import toast from "react-hot-toast";
import {
  formatNextEligibleLabel,
  getNextEligibleISOFromBonus,
} from "../helper/getTimeForDailyBonus";

const MIN_WITHDRAW = 50_000_000;

// const REWARD_VIDEO = ["9orGjtpbLQQ"];
const REWARD_VIDEO = ["iaeCKxpPoDc"];

const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [nextEligibleAt, setNextEligibleAt] = useState(null);
  const [infoKlaim, setInfoKlaim] = useState("");

  useEffect(() => {
    setIsClient(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (!user) {
        console.warn("No user found, redirecting to /login");
        router.push("/login");
        return;
      }

      try {
        const token = await user.getIdToken();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        console.log(res.body);
        if (!res.ok) throw new Error("Gagal fetch data");
        const result = await res.json();

        if (result?.data?.money) {
          result.data.money = Number(result.data.money);
        }

        setData(result.data || {});
        setError(null);

        checkBonusAvailability(token);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    });

    console.log(data);

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!nextEligibleAt) {
      setInfoKlaim("");
    } else {
      setInfoKlaim(formatNextEligibleLabel(nextEligibleAt));
    }
  }, [nextEligibleAt]);

  // Function for bonus logic
  const checkBonusAvailability = async (token) => {
    try {
      const bonusRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/bonus`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (bonusRes.ok) {
        const bonusResult = await bonusRes.json();
        const eligible = !!bonusResult.data?.eligible;
        const nextISO = getNextEligibleISOFromBonus(
          bonusResult.data?.nextEligibleAt
        );
        setBonusAvailable(eligible);
        setNextEligibleAt(nextISO);
      }
    } catch (err) {
      console.error("Error checking bonus:", err);
    }
  };

  const claimDailyBonus = async () => {
    setClaimingBonus(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken();
      const claimRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/bonus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const claimResult = await claimRes.json();

      if (claimRes.ok && claimResult.success) {
        setData((prev) => ({
          ...prev,
          money: claimResult.data.money,
        }));
        setBonusAvailable(false);

        toast.success(
          `Selamat! Anda mendapat bonus Rp${claimResult.data.bonus.toLocaleString(
            "id-ID"
          )}!`
        );
      } else {
        const errorMsg = claimResult.error?.message || "Gagal mengklaim bonus";
        console.error(errorMsg);
      }
    } catch (err) {
      console.error("Error claiming bonus:", err);
    } finally {
      setClaimingBonus(false);
    }
  };

  if (!isClient) return null;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log(data);

  // logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.log("Gagal logout");

      // ! only for debugging
      // console.error("Gagal logout:", err);
    }
  };

  // logic for wd
  const canWithdraw = data?.money >= MIN_WITHDRAW;

  const handleWithdrawClick = () => {
    if (canWithdraw) {
      return 0;
    } else {
      setShowModal(true);
    }
  };

  const handleClaimClick = () => {
    if (bonusAvailable) {
      setShowReward(true);
    } else {
      toast.error(
        "Bonus harian sudah diklaim hari ini. Silakan coba lagi besok!"
      );
    }
  };

  const handleVideoComplete = async () => {
    console.log("Video selesai, claiming bonus...");
    setShowReward(false);
    await claimDailyBonus();

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleMain = () => {
    setTimeout(() => {
      router.push("/slot2");
    }, 500);
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-xl">
        <h1 className="mb-2 text-2xl font-bold">Unhasgacor77</h1>
        <h2 className="mb-4 text-xl font-semibold">
          Hai, {data?.fullName || "User"}
        </h2>
        <p className="mb-4 font-semibold">
          Jumlah Saldo:{" "}
          <span className="font-bold">
            Rp
            {typeof data?.money === "number"
              ? data.money.toLocaleString("id-ID")
              : "0"}
          </span>
        </p>
        <div
          className={`mt-0 mb-6 rounded-lg px-3 py-2 text-xs ring-1
          ${
            bonusAvailable
              ? "bg-green-50 text-green-700 ring-green-200"
              : "bg-amber-50 text-amber-700 ring-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                bonusAvailable ? "bg-green-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <div className="flex-1">
              {bonusAvailable ? (
                <>
                  Bonus harian tersedia —{" "}
                  <span className="font-medium">klaim sekarang</span>.
                </>
              ) : (
                <>
                  Belum bisa klaim.{" "}
                  <span className="font-medium">{infoKlaim}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={handleMain}
            className="bg-[#FF9D23] hover:bg-orange-500 text-black py-2 rounded-full font-medium transition duration-200"
          >
            Bermain
          </button>
          <button
            onClick={handleWithdrawClick}
            className="bg-[#FF9D23] hover:bg-orange-500 text-black py-2 rounded-full font-medium transition duration-200"
          >
            Withdraw
          </button>

          <button
            onClick={handleClaimClick}
            disabled={!bonusAvailable || claimingBonus}
            className={`py-2 rounded-full font-medium transition duration-200 ${
              bonusAvailable && !claimingBonus
                ? "bg-[#FF9D23] hover:bg-orange-500 text-black"
                : "bg-[#EADBC8] text-gray-700 cursor-not-allowed"
            }`}
          >
            {claimingBonus
              ? "Mengklaim..."
              : bonusAvailable
              ? "Klaim Saldo Gratis Harian"
              : "Bonus Sudah Diklaim"}
          </button>

          <button
            onClick={handleLogout}
            className="bg-[#FF9D23] hover:bg-orange-500 text-black py-2 rounded-full font-medium transition duration-200"
          >
            Keluar
          </button>
        </div>

        <hr className="mb-2" />
        <p className="text-xs italic text-gray-500">
          Minimal withdraw saldo sebesar Rp50.000.000
        </p>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        title="Peringatan"
        message="Maaf saldo kamu tidak bisa ditarik karena belum sampai Rp50.000.000"
        icon={<Warning2 size="48" color="#F97316" />}
        onClose={() => setShowModal(false)}
      />

      <RewardVideoModal
        open={showReward}
        videoIds={REWARD_VIDEO}
        onComplete={handleVideoComplete}
        onClose={() => setShowReward(false)}
      />
    </main>
  );
};

export default Home;
