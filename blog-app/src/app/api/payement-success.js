import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/Superbase';

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: session_id }),
        });

        if (response.ok) {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.auth.updateUser({
            data: { is_premium: true }
          });
          router.push('/?payment=success');
        } else {
          router.push('/?payment=failed');
        }
      } catch (err) {
        console.error(err);
        router.push('/?payment=error');
      }
    };

    if (session_id) verifyPayment();
  }, [session_id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing your payment...</h1>
        <p>Please wait while we verify your premium subscription.</p>
      </div>
    </div>
  );
}