import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { paymentAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe('pk_test_51RDASLGghrco1QnNF5wtvbd8flMFR22kSRXcHP5xZiTN98oryUus9gU7BTSoBtCktCN2DzVJ5dNEUJsR22FyORlh00aoz20NPc');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

interface CardFormProps {
  amount: number;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const CardForm: React.FC<CardFormProps> = ({ 
  amount, 
  orderId, 
  onSuccess, 
  onCancel,
  isProcessing,
  setIsProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create a payment intent on the server
      const { clientSecret } = await paymentAPI.createPaymentIntent({ 
        amount, 
        orderId, 
        userId: user?._id 
      });

      // 2. Confirm the payment with the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name', // Ideally this would come from the form
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: stripeError.message || "There was an issue processing your payment.",
          variant: "destructive"
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 3. Confirm on our backend that payment was successful
        await paymentAPI.confirmPayment({
          paymentIntentId: paymentIntent.id,
          orderId
        });

        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully."
        });
        
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: "Payment Failed",
        description: err.message || "There was an issue processing your payment.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-element">Credit or Debit Card</Label>
        <div className="p-3 border rounded-md">
          <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-foodix-600 hover:bg-foodix-700"
        >
          {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

interface StripePaymentFormProps {
  amount: number;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CardForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
