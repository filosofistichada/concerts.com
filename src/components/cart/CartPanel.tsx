import { useEffect, useState } from "react";
import { formatPriceCOP } from "../../lib/formats";
import type { CartItem } from "../../types";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import CartItemRow from "./CartItemRow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CHECKOUT_LOGIN_ERROR =
  "You cannot buy tickets without log in. if you want to checkout, please login first and then try again";

type Props = {
  items: CartItem[];
  width: string;
  onRemoveFromCart: (concertId: number) => void;
  onQtyChange: (concertId: number, qty: number) => void;
  onClearCart: () => void;
};

export default function CartPanel({ items, width, onRemoveFromCart, onClearCart, onQtyChange }: Props) {
  // const [totaTickets, setTotalTickets] = useState<number>(0);
  // function totalTicketsSum() {
  //     setTotalTickets(...)
  // }
  const totalTickets = items.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setCheckoutError(null);
  }, [items]);

  function handleCheckout() {
    if (!user) {
      setCheckoutError(CHECKOUT_LOGIN_ERROR);
      return;
    }
    setCheckoutError(null);
    navigate("/checkout");
  }

  return (
    <aside className={`rounded-card border lg:${width} top-0 border-border sticky h-fit bg-surface p-4 shadow-card`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-text">
          <h2 className="m-0 text-base font-semibold">Cart</h2>
        </div>

        <Button variant="secondary" onClick={onClearCart} disabled={items.length === 0}>
          Clear
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <StateMessage type="empty" title="Your cart is empty" description="Add tickets from the concerts list." />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col overflow-y-auto h-96 gap-3">
            {items.map((item) => (
              <CartItemRow
                key={`cart-item-row-${item.id}`}
                item={item}
                onRemoveFromCart={onRemoveFromCart}
                onQtyChange={onQtyChange}
              />
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-3 text-sm text-text">
            <div className="flex items-center justify-between">
              <span className="text-muted">Total tickets</span>
              <span className="font-semibold">{totalTickets}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted">Total</span>
              <span className="font-semibold">{formatPriceCOP(totalPrice)}</span>
            </div>
          </div>
          {checkoutError ? (
            <div className="mt-4">
              <StateMessage
                type="error"
                extraCss="bg-red-200"
                title="Cannot checkout"
                description={checkoutError}
                actionText="Log in"
                onAction={() => navigate("/login")}
              />
            </div>
          ) : null}
          <div className="mt-4">
            <Button variant="primary" fullWidth onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        </>
      )}
    </aside>
  )
}