"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface Props {
  methods: any[];
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function AddFundsForm({ methods }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("10");
  const [method, setMethod] = useState(methods[0]?.key || "paypal");
  const [txnId, setTxnId] = useState("");

  const selectedMethod = methods.find((m) => m.key === method);
  const minAmount = selectedMethod?.minAmount || 5;

  const handleManualSubmit = async () => {
    if (!txnId) return toast.error("Please enter Transaction ID or Proof");

    const res = await fetch("/api/invoices/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), method, txnId }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.error || "Unable to submit request");
    }

    toast.success("Deposit request submitted! Waiting for admin approval.");
    router.push("/invoices");
    router.refresh();
  };

  const handleRazorpaySubmit = async () => {
    if (parseFloat(amount) < minAmount)
      return toast.error(
        `Minimum deposit for ${selectedMethod?.name || "this method"} is $${minAmount}`
      );

    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Unable to load Razorpay checkout");

    const res = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });

    const data = await res.json();
    if (!res.ok || !data.orderId) {
      throw new Error(data?.error || "Unable to create Razorpay order");
    }

    const options = {
      key: data.key,
      amount: Math.round(parseFloat(amount) * 100),
      currency: data.currency,
      name: "Linksite",
      description: "Account top-up",
      order_id: data.orderId,
      handler: async (paymentResult: any) => {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: paymentResult.razorpay_order_id,
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpaySignature: paymentResult.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok)
            throw new Error(verifyData?.error || "Payment verification failed");

          toast.success("Payment completed and balance updated.");
          router.push("/invoices");
          router.refresh();
        } catch (err) {
          console.error(err);
          toast.error("Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (error: any) => {
      console.error("Razorpay payment failed", error);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    });

    razorpay.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) < minAmount) {
      return toast.error(
        `Minimum deposit for ${selectedMethod?.name || "this method"} is $${minAmount}`
      );
    }

    setLoading(true);

    try {
      if (selectedMethod?.key === "razorpay") {
        await handleRazorpaySubmit();
      } else {
        await handleManualSubmit();
      }
    } catch (error) {
      console.error(error);
      toast.error((error as Error)?.message || "Failed to submit request");
    } finally {
      if (selectedMethod?.key !== "razorpay") {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Deposit Amount (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={minAmount}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7 glass border-border/50 h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="glass border-border/50 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass border-border/50">
            {methods.map((m) => (
              <SelectItem key={m.id} value={m.key}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMethod?.details && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
          <p className="text-[10px] font-bold uppercase text-primary">
            Instructions
          </p>
          <div
            className="text-xs text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMethod.details) }}
          />
        </div>
      )}

      {selectedMethod?.key !== "razorpay" ? (
        <div className="space-y-2">
          <Label>
            {selectedMethod?.inputLabel || "Transaction ID / Proof Details"}
          </Label>
          <Input
            placeholder="Enter details here..."
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            className="glass border-border/50 h-11"
          />
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-emerald-700">
          Razorpay payments are processed instantly. After checkout, your
          account balance will be credited automatically.
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-glow gradient-bg-primary text-primary-foreground h-11"
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />{" "}
            {selectedMethod?.key === "razorpay"
              ? "Pay with Razorpay"
              : "Submit Request"}
          </>
        )}
      </Button>
    </form>
  );
}
