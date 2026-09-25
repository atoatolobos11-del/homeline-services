import { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Order placed successfully!');
  const [toastType, setToastType] = useState('success');
  const [orderComplete, setOrderComplete] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderNotes, setOrderNotes] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [giftWrap, setGiftWrap] = useState('none');
  const [addressType, setAddressType] = useState('home');

  const shippingOptions = {
    standard: { label: 'Standard', price: 0, eta: '3-5 business days' },
    express: { label: 'Express', price: 12, eta: '2-3 business days' },
    priority: { label: 'Priority', price: 24, eta: '1-2 business days' }
  };

  const giftWrapOptions = {
    none: { label: 'No gift wrap', price: 0 },
    classic: { label: 'Classic wrap', price: 12 },
    premium: { label: 'Premium wrap', price: 18 }
  };

  const [formData, setFormData] = useState({
    // Shipping Information
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    
    // Payment Information
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitShipping = (e) => {
    e.preventDefault();
    if (formData.email && formData.firstName && formData.lastName && formData.address) {
      if (saveAddress) {
        localStorage.setItem('savedShippingAddress', JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        }));
      } else {
        localStorage.removeItem('savedShippingAddress');
      }
      setCurrentStep(2);
    }
  };

  const handleApplyPromo = () => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      setPromoMessage('Enter a promo code to continue.');
      setAppliedPromo('');
      return;
    }

    if (normalizedCode === 'SAVE10') {
      setAppliedPromo('SAVE10');
      setPromoMessage('Promo code applied successfully.');
      return;
    }

    setAppliedPromo('');
    setPromoMessage('That promo code is not valid.');
  };

  const shippingCost = shippingOptions[shippingMethod].price;
  const giftWrapCost = giftWrapOptions[giftWrap].price;
  const discountAmount = appliedPromo === 'SAVE10' ? cartTotal * 0.1 : 0;
  const taxAmount = (cartTotal + shippingCost + giftWrapCost - discountAmount) * 0.08;
  const totalAmount = cartTotal + shippingCost + giftWrapCost + taxAmount - discountAmount;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    const paymentValid =
      paymentMethod === 'paypal' || paymentMethod === 'cod' || paymentMethod === 'wallet'
        ? true
        : Boolean(
            formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv
          );

    if (!paymentValid) return;

    setShowToast(false);

    // Aggregate quantities by the real product id (custom items have baseProductId)
    const totals = {};
    for (const item of cartItems) {
      const productId = item.baseProductId || item.id;
      totals[productId] = (totals[productId] || 0) + (item.quantity || 1);
    }
    const items = Object.entries(totals).map(([id, quantity]) => ({ id, quantity }));

    try {
      const res = await fetch(`${apiBase}/inventory/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setToastType('error');
        setToastMessage(
          body.insufficient?.length
            ? 'Some items in your cart are out of stock. Please update your cart and try again.'
            : body.error || 'Could not complete your order. Please try again.'
        );
        setShowToast(true);
        return;
      }

      setToastType('success');
      setToastMessage('Order placed successfully!');
      setOrderComplete(true);
      setShowToast(true);
      setTimeout(() => {
        clearCart();
      }, 2000);
    } catch (err) {
      setToastType('error');
      setToastMessage('Network error — could not reach the order service. Please try again.');
      setShowToast(true);
    }
  };

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Your cart is empty</h1>
          <p className="text-muted mb-6">Add some items to your cart before checking out</p>
          <Button onClick={() => window.location.href = '/'}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-3">Order Confirmed!</h1>
          <p className="text-muted mb-2">Thank you for your purchase, {formData.firstName}!</p>
          <p className="text-sm text-muted mb-6">
            A confirmation email has been sent to {formData.email}
          </p>
          
          <div className="bg-cream rounded-2xl p-6 mb-6">
            <p className="text-sm text-muted mb-2">Order Total</p>
            <p className="text-4xl font-bold text-primary">₱{totalAmount.toFixed(2)}</p>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-charcoal">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 1 ? 'bg-primary text-white' : 'bg-beige text-muted'
                  }`}>
                    1
                  </div>
                  <span className="ml-3 font-semibold text-charcoal">Shipping</span>
                </div>
                
                <div className="flex-1 h-1 mx-4 bg-beige">
                  <div className={`h-full transition-all duration-500 ${
                    currentStep >= 2 ? 'bg-primary w-full' : 'bg-beige w-0'
                  }`} />
                </div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 2 ? 'bg-primary text-white' : 'bg-beige text-muted'
                  }`}>
                    2
                  </div>
                  <span className="ml-3 font-semibold text-charcoal">Payment</span>
                </div>
              </div>
            </div>

            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-charcoal mb-6">Shipping Information</h2>
                <form onSubmit={handleSubmitShipping} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-3">
                      Delivery Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(shippingOptions).map(([key, option]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setShippingMethod(key)}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            shippingMethod === key
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-beige bg-white hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-charcoal">{option.label}</span>
                            <span className="text-sm font-medium text-primary">
                              {option.price === 0 ? 'Free' : `₱${option.price.toFixed(2)}`}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted">{option.eta}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-3">
                      Save as
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['home', 'office', 'other'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddressType(type)}
                          className={`rounded-full border px-3 py-2 text-sm capitalize transition ${
                            addressType === type
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-beige bg-white text-charcoal hover:border-primary/60'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-3">
                      Order Notes
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows="3"
                      className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                      placeholder="Add delivery instructions, gift message, or special requests..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-3">
                      Gift wrapping
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(giftWrapOptions).map(([key, option]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setGiftWrap(key)}
                          className={`rounded-2xl border p-3 text-left transition-all ${
                            giftWrap === key
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-beige bg-white hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-charcoal">{option.label}</span>
                            <span className="text-xs font-semibold text-primary">
                              {option.price === 0 ? 'Free' : `₱${option.price.toFixed(2)}`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 mt-4 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="h-4 w-4 rounded border-beige text-primary focus:ring-primary"
                    />
                    Save shipping address for next time
                  </label>

                  <Button type="submit" variant="primary" size="lg" className="w-full mt-6">
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold text-charcoal">Secure Payment</h2>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-beige bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-charcoal">Card</span>
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-beige bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-charcoal">E-Wallet</span>
                      <span className="text-xs font-bold text-primary">GCash</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-beige bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-charcoal">COD</span>
                      <span className="text-xs font-bold text-primary">Cash</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-beige bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-charcoal">PayPal</span>
                      <span className="text-lg font-bold text-[#003087]">P</span>
                    </div>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  {paymentMethod === 'paypal' ? (
                    <div className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-charcoal">
                      You’ll be redirected to PayPal to securely complete this purchase.
                    </div>
                  ) : paymentMethod === 'wallet' ? (
                    <div className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-charcoal">
                      You’ll complete this order using your wallet payment method after review.
                    </div>
                  ) : paymentMethod === 'cod' ? (
                    <div className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-charcoal">
                      Cash on delivery will be collected when your order arrives.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            required
                            maxLength="19"
                            className="w-full px-4 py-3 pl-12 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                            placeholder="1234 5678 9012 3456"
                          />
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                          placeholder="Name on card"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                            maxLength="4"
                            placeholder="123"
                            className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button type="submit" variant="primary" size="lg" className="flex-1">
                      {paymentMethod === 'paypal'
                        ? 'Pay with PayPal'
                        : paymentMethod === 'cod'
                          ? 'Place Order'
                          : 'Complete Order'}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 p-4 bg-primary/5 rounded-xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-charcoal mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-beige bg-cream p-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary mt-1">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 rounded-2xl border border-beige bg-cream p-4">
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Promo code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="SAVE10"
                    className="w-full rounded-xl border border-beige bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="rounded-xl bg-charcoal px-3 py-2 text-sm font-medium text-white transition hover:bg-primary"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`mt-2 text-xs ${appliedPromo ? 'text-primary' : 'text-red-500'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              <div className="border-t border-beige pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-charcoal">₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-charcoal">
                    {shippingCost === 0 ? 'FREE' : `₱${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {giftWrap !== 'none' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Gift wrap</span>
                    <span className="font-semibold text-charcoal">₱{giftWrapCost.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Discount</span>
                    <span className="font-semibold text-primary">-₱{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tax</span>
                  <span className="font-semibold text-charcoal">₱{taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-beige mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-charcoal">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ₱{totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {shippingOptions[shippingMethod].label} delivery · {shippingOptions[shippingMethod].eta}
                </p>
                {orderNotes && (
                  <p className="mt-2 text-xs text-muted">Note: {orderNotes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Checkout;
