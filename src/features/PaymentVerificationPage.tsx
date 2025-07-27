//TODO:remove the tscheck
// @ts-nocheck

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiQuery } from "@lib/apiWrapper";
import Loader from "@components/layoutComponents/Loader";
import { CheckCircle2, XCircle } from "lucide-react";

const BookingVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const bookingId = searchParams.get("purchase_order_id");
    const pidx = searchParams.get("pidx");

    if (!bookingId || !pidx) {
      setStatus("error");
      setMessage("Missing booking ID or payment reference.");
      return;
    }

    // Detect bulk booking by prefix
    const isBulk = bookingId.startsWith("bulk_");

    let endpoint = "";
    if (isBulk) {
      endpoint = `/bookings/bulk/verify-payment?pidx=${pidx}`;
    } else {
      endpoint = `/bookings/${bookingId}/verify-payment?pidx=${pidx}`;
    }

    apiQuery(endpoint)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Payment verified. Booking confirmed.");
        setTimeout(() => navigate("/"), 4000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Payment verification failed.");
        setTimeout(() => navigate("/"), 4000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        {status === "loading" && (
          <>
            <Loader />
            <div className="mt-6 text-xl font-semibold text-gray-700">
              Verifying your payment...
            </div>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <div className="text-2xl font-bold text-green-700 mb-2">
              Payment Verified!
            </div>
            <div className="text-lg text-gray-700 mb-2">{message}</div>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <div className="text-2xl font-bold text-red-700 mb-2">
              Verification Failed
            </div>
            <div className="text-lg text-gray-700 mb-2">{message}</div>
          </>
        )}
        <div className="mt-4 text-muted-foreground text-sm text-center">
          You will be redirected shortly.
        </div>
      </div>
    </div>
  );
};

export default BookingVerify;
