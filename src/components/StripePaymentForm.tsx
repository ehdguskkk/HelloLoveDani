'use client';

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const StripePaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // 결제 성공시 이동할 페이지(원하는 경로로 변경 가능)
        return_url: window.location.origin + "/success",
      },
    });

    if (error) {
      setMessage(error.message || "결제에 실패했습니다.");
    } else {
      setMessage("결제가 성공적으로 완료되었습니다.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <PaymentElement />
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        style={{
          width: "100%",
          marginTop: "16px",
          padding: "12px",
          background: "#196f3d",
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {isLoading ? "Processing..." : "Pay now"}
      </button>
      {message && (
        <div style={{ color: "red", marginTop: 12 }}>{message}</div>
      )}
    </form>
  );
};

export default StripePaymentForm;