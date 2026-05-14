import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { CartItem } from "../types";
import { formatPriceCOP } from "../lib/formats";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useAuth } from "../context/AuthContext";

const CHECKOUT_LOGIN_ERROR =
  "You cannot buy tickets without log in. if you want to checkout, please login first and then try again";

type Props = {
  cart: CartItem[];
  onClearCart: () => void;
};

export default function CheckoutPage({ cart, onClearCart }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);

  const totalTickets = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-6">
        <StateMessage
          type="error"
          title="Checkout unavailable"
          description={CHECKOUT_LOGIN_ERROR}
          actionText="Log in"
          onAction={() => navigate("/login")}
        />
        <p className="mt-4 text-center text-sm">
          <Link to="/cart" className="font-medium text-brand-600 hover:text-brand-700">
            Back to cart
          </Link>
        </p>
      </main>
    );
  }

  if (cart.length === 0 && !completed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-6">
        <StateMessage
          type="empty"
          title="Your cart is empty"
          description="Add tickets before checking out."
          actionText="Browse concerts"
          onAction={() => navigate("/")}
        />
      </main>
    );
  }

  if (completed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-6">
        <div className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-600/15 text-2xl text-success-600">
            ✓
          </div>
          <h1 className="mt-4 m-0 text-2xl font-semibold text-text">Purchase confirmed</h1>
          <p className="mt-2 text-sm text-muted">
            Thank you. Your tickets are reserved for this demo — no payment was processed.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate("/")}>
              Back to home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-6">
      <h1 className="m-0 text-2xl font-semibold text-text">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Review your order and confirm your purchase.</p>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="m-0 text-base font-semibold text-text">Order summary</h2>
        <p className="mt-1 text-xs text-muted">{user.email ?? "Signed in"}</p>

        <ul className="mt-4 divide-y divide-border border-t border-border text-sm">
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-3">
              <span className="text-text">
                <span className="font-medium">{item.title}</span>
                <span className="text-muted"> × {item.qty}</span>
              </span>
              <span className="shrink-0 font-medium text-text">{formatPriceCOP(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Total tickets</span>
            <span className="font-semibold text-text">{totalTickets}</span>
          </div>
          <div className="flex justify-between text-text">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatPriceCOP(totalPrice)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" fullWidth onClick={() => navigate("/cart")}>
            Back to cart
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              onClearCart();
              setCompleted(true);
            }}
          >
            Confirm purchase
          </Button>
        </div>
      </div>
    </main>
  );
}
