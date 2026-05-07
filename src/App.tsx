import './App.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/home'
import NotFoundPage from './pages/notFoundPage'
import NavBar from './components/global/NavBar'
import { CartPage } from './pages/cartPage'
import type { CartItem, Concert } from './types'
import { useState } from 'react'
import LoginPage from './pages/loginPage'
import SignupPage from './pages/signupPage'

function App() {
  // let cart2: CartItem[] = [];
  // variable cart
  const [cart, setCart] = useState<CartItem[]>([]);
  // addToCart
  function addToCart(concert: Concert) {
    // edge cases
    if (concert.status === "SOLD_OUT") return;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === concert.id);
      if (existing) {
        return prev.map((i) => i.id === concert.id ?
          { ...i, qty: i.qty + 1 }
          : i);
      }
      return [...prev, { ...concert, qty: 1 }];
    })
  }

  // removeFrom Cart
  function removeFromCart(concertId: number) {
    // filter
    setCart((prev) => {
      return prev.filter((i) => i.id !== concertId)
    })
  }
  // updateQty
  function updateQty(concertId: number, quantity: number) {
    // edge cases
    if (!Number.isFinite(quantity)) return;
    setCart((prev) => prev.map((i) => i.id === concertId ? { ...i, qty: quantity } : i))
  }
  // clearCart
  function clearCart() {
    setCart([]);
  }
  return (
    <>
      <div>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                cart={cart}
                onAddToCart={addToCart}
                onQtyChange={updateQty}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
              ></HomePage>}
          />
          <Route path='/login' element={<LoginPage></LoginPage>}></Route>
          <Route path='/signup' element={<SignupPage></SignupPage>}></Route>
          {/* Route cart path="/cart" */}
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                onRemoveFromCart={removeFromCart}
                onQtyChange={updateQty}
                onClearCart={clearCart}
              ></CartPage>}
          />
          <Route path='*' element={<NotFoundPage></NotFoundPage>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
