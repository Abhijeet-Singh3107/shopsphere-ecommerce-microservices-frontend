import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout, getCart } from '../api/endpoints.js';
import { useNotification } from '../hooks/useNotification.js';
import { useCart } from '../hooks/useCart.js';
import { formatINR } from '../utils/currency.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export const buildAddressString = (form) =>
  `${form.fullName}, ${form.streetAddress}, ${form.city}, ${form.stateProvince} ${form.zipPostalCode}, ${form.country}`;

export const validate = (form) => {
  const errs = {};
  const required = ['fullName', 'streetAddress', 'city', 'stateProvince', 'zipPostalCode', 'country'];
  required.forEach((key) => {
    if (!form[key].trim()) errs[key] = 'This field is required';
  });
  if (!errs.zipPostalCode && form.zipPostalCode.trim().length < 3) {
    errs.zipPostalCode = 'ZIP/Postal code is too short';
  }
  return errs;
};

export const validatePayment = (form) => {
  const errs = {};

  // Card number: exactly 16 digits ignoring spaces
  const digits = form.cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) {
    errs.cardNumber = 'Card number must be 16 digits';
  }

  // Cardholder name: required
  if (!form.cardholderName.trim()) {
    errs.cardholderName = 'This field is required';
  }

  // Expiry: MM/YY with month 01–12
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
    errs.expiry = 'Expiry must be in MM/YY format';
  }

  // CVV: 3 or 4 digits
  if (!/^\d{3,4}$/.test(form.cvv)) {
    errs.cvv = 'CVV must be 3 or 4 digits';
  }

  return errs;
};

export const validateUpi = (form) => {
  const errs = {};
  const parts = form.upiId.split('@');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    errs.upiId = 'UPI ID must be in user@upi format';
  }
  return errs;
};

export default function Checkout() {
  const [form, setForm] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    zipPostalCode: '',
    country: '',
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState('shipping');
  const [addressString, setAddressString] = useState('');
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', cardholderName: '', expiry: '', cvv: '' });
  const [paymentTouched, setPaymentTouched] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'cod'
  const [upiForm, setUpiForm] = useState({ upiId: '' });
  const [upiTouched, setUpiTouched] = useState({});
  const [upiErrors, setUpiErrors] = useState({});

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);

  const { notify } = useNotification();
  const { refreshCount } = useCart();
  const navigate = useNavigate();

  // Fetch cart on mount for the order summary panel
  useEffect(() => {
    getCart()
      .then((data) => {
        setCart(data);
        setCartLoading(false);
      })
      .catch((err) => {
        setCartError(err.message ?? 'Failed to load cart');
        setCartLoading(false);
      });
  }, []);

  const handleBlur = (fieldKey) => {
    setTouched((prev) => ({ ...prev, [fieldKey]: true }));
    setErrors(validate({ ...form }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Mark all fields touched and validate
    const allTouched = {
      fullName: true,
      streetAddress: true,
      city: true,
      stateProvince: true,
      zipPostalCode: true,
      country: true,
    };
    setTouched(allTouched);
    const currentErrors = validate(form);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setAddressString(buildAddressString(form));
    setStep('payment');
  };

  const handlePaymentBlur = (fieldKey) => {
    setPaymentTouched((prev) => ({ ...prev, [fieldKey]: true }));
    setPaymentErrors(validatePayment({ ...paymentForm }));
  };

  const handleMethodChange = (method) => {
    // Clear errors for the method being left
    if (paymentMethod === 'card') {
      setPaymentErrors({});
      setPaymentTouched({});
    } else if (paymentMethod === 'upi') {
      setUpiErrors({});
      setUpiTouched({});
    }
    setPaymentMethod(method);
  };

  const handleUpiBlur = (fieldKey) => {
    setUpiTouched((prev) => ({ ...prev, [fieldKey]: true }));
    setUpiErrors(validateUpi({ ...upiForm }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      const allTouched = { cardNumber: true, cardholderName: true, expiry: true, cvv: true };
      setPaymentTouched(allTouched);
      const currentErrors = validatePayment(paymentForm);
      setPaymentErrors(currentErrors);
      if (Object.keys(currentErrors).length > 0) return;
    } else if (paymentMethod === 'upi') {
      setUpiTouched({ upiId: true });
      const currentErrors = validateUpi(upiForm);
      setUpiErrors(currentErrors);
      if (Object.keys(currentErrors).length > 0) return;
    }
    // COD: no validation needed

    setLoading(true);
    try {
      await checkout(addressString);
      await refreshCount();
      notify('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      notify(err.message ?? 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Field config ────────────────

  const fields = [
    { key: 'fullName',       label: 'Full Name',        id: 'fullName',       colSpan: 'col-span-2' },
    { key: 'streetAddress',  label: 'Street Address',   id: 'streetAddress',  colSpan: 'col-span-2' },
    { key: 'city',           label: 'City',             id: 'city',           colSpan: '' },
    { key: 'stateProvince',  label: 'State/Province',   id: 'stateProvince',  colSpan: '' },
    { key: 'zipPostalCode',  label: 'ZIP/Postal Code',  id: 'zipPostalCode',  colSpan: '' },
    { key: 'country',        label: 'Country',          id: 'country',        colSpan: '' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Complete your order</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* ── Progress indicator ── */}
        {(() => {
          // Derive visual state for each step based on `step` state
          // Cart: always completed
          // Shipping: completed when step==='payment', active when step==='shipping'
          // Payment: active when step==='payment', upcoming when step==='shipping'
          // Done: always upcoming
          const shippingCompleted = step === 'payment';
          const shippingActive = step === 'shipping';
          const paymentActive = step === 'payment';

          const checkmark = (
            <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );

          return (
            <nav aria-label="Checkout progress" className="mb-8">
              <ol className="flex items-center">
                {/* Step 1: Cart — always completed */}
                <li className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600">
                    {checkmark}
                  </span>
                  <span className="ml-2 text-sm text-sky-600">Cart</span>
                </li>

                {/* Connector: Cart → Shipping (always sky since Shipping is always active or completed) */}
                <li className="flex-1 border-t-2 border-sky-300 mx-3" aria-hidden="true" />

                {/* Step 2: Shipping — active or completed */}
                <li className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600">
                    {shippingCompleted ? checkmark : <span className="text-sm font-semibold text-white">2</span>}
                  </span>
                  <span className={`ml-2 text-sm ${shippingActive ? 'font-semibold text-sky-600' : 'text-sky-600'}`}>
                    Shipping
                  </span>
                </li>

                {/* Connector: Shipping → Payment (sky when Payment is active or completed, gray when upcoming) */}
                <li className={`flex-1 border-t-2 ${paymentActive ? 'border-sky-300' : 'border-gray-200'} mx-3`} aria-hidden="true" />

                {/* Step 3: Payment — active or upcoming */}
                <li className="flex items-center">
                  {paymentActive ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600">
                      <span className="text-sm font-semibold text-white">3</span>
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="text-sm text-gray-400">3</span>
                    </span>
                  )}
                  <span className={`ml-2 text-sm ${paymentActive ? 'font-semibold text-sky-600' : 'text-gray-400'}`}>
                    Payment
                  </span>
                </li>

                {/* Connector: Payment → Done (always gray since Done is always upcoming) */}
                <li className="flex-1 border-t-2 border-gray-200 mx-3" aria-hidden="true" />

                {/* Step 4: Done — always upcoming */}
                <li className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                    <span className="text-sm text-gray-400">4</span>
                  </span>
                  <span className="ml-2 text-sm text-gray-400">Done</span>
                </li>
              </ol>
            </nav>
          );
        })()}

        {/* ── Two-column layout: form + summary ── */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order summary panel — order-first so it appears above form on mobile */}
          <aside className="order-first lg:order-last lg:w-80 shrink-0">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6">
                {cartLoading ? (
                  <LoadingSpinner />
                ) : cartError ? (
                  <p className="text-sm text-red-500">{cartError}</p>
                ) : !cart?.items?.length ? (
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                ) : (
                  <>
                    <ul className="space-y-3 mb-4">
                      {cart.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.productName}{' '}
                            <span className="text-gray-400">× {item.quantity}</span>
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatINR(cart.totalAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Address form — rendered when step === 'shipping' */}
          {step === 'shipping' && (
            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">Shipping Information</h2>
              </div>
              <form onSubmit={handleShippingSubmit} className="p-6 space-y-5" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map(({ key, label, id, colSpan }) => {
                    const hasError = errors[key] && touched[key];
                    return (
                      <div key={key} className={colSpan || undefined}>
                        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <input
                          id={id}
                          value={form[key]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          onBlur={() => handleBlur(key)}
                          disabled={loading}
                          aria-describedby={hasError ? `${id}-error` : undefined}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                        />
                        {hasError && (
                          <p id={`${id}-error`} className="text-red-500 text-xs mt-1">
                            {errors[key]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-sky-600 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-sky-700 hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? 'Placing order…' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          )}

          {/* Payment form — rendered when step === 'payment' */}
          {step === 'payment' && (
            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>
              </div>
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5" noValidate>
                {/* ── Method Selector ── */}
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-gray-700">Payment Method</legend>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: 'card', label: 'Card' },
                      { value: 'upi',  label: 'UPI' },
                      { value: 'cod',  label: 'Cash on Delivery' },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        htmlFor={`method-${value}`}
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                      >
                        <input
                          type="radio"
                          id={`method-${value}`}
                          name="paymentMethod"
                          value={value}
                          checked={paymentMethod === value}
                          onChange={() => handleMethodChange(value)}
                          disabled={loading}
                          className="accent-sky-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* ── Card Form ── */}
                {paymentMethod === 'card' && (
                  <>
                    {/* Card Number */}
                    <div>
                      <label htmlFor="cardNumber" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input
                        id="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, cardNumber: e.target.value }))}
                        onBlur={() => handlePaymentBlur('cardNumber')}
                        disabled={loading}
                        aria-describedby={paymentErrors.cardNumber && paymentTouched.cardNumber ? 'cardNumber-error' : undefined}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                        placeholder="1234 5678 9012 3456"
                      />
                      {paymentErrors.cardNumber && paymentTouched.cardNumber && (
                        <p id="cardNumber-error" className="text-red-500 text-xs mt-1">{paymentErrors.cardNumber}</p>
                      )}
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label htmlFor="cardholderName" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Cardholder Name
                      </label>
                      <input
                        id="cardholderName"
                        value={paymentForm.cardholderName}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, cardholderName: e.target.value }))}
                        onBlur={() => handlePaymentBlur('cardholderName')}
                        disabled={loading}
                        aria-describedby={paymentErrors.cardholderName && paymentTouched.cardholderName ? 'cardholderName-error' : undefined}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                        placeholder="Name as it appears on card"
                      />
                      {paymentErrors.cardholderName && paymentTouched.cardholderName && (
                        <p id="cardholderName-error" className="text-red-500 text-xs mt-1">{paymentErrors.cardholderName}</p>
                      )}
                    </div>

                    {/* Expiry and CVV side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry */}
                      <div>
                        <label htmlFor="expiry" className="mb-1.5 block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input
                          id="expiry"
                          value={paymentForm.expiry}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, expiry: e.target.value }))}
                          onBlur={() => handlePaymentBlur('expiry')}
                          disabled={loading}
                          aria-describedby={paymentErrors.expiry && paymentTouched.expiry ? 'expiry-error' : undefined}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                          placeholder="MM/YY"
                        />
                        {paymentErrors.expiry && paymentTouched.expiry && (
                          <p id="expiry-error" className="text-red-500 text-xs mt-1">{paymentErrors.expiry}</p>
                        )}
                      </div>

                      {/* CVV */}
                      <div>
                        <label htmlFor="cvv" className="mb-1.5 block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, cvv: e.target.value }))}
                          onBlur={() => handlePaymentBlur('cvv')}
                          disabled={loading}
                          aria-describedby={paymentErrors.cvv && paymentTouched.cvv ? 'cvv-error' : undefined}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                          placeholder="123"
                        />
                        {paymentErrors.cvv && paymentTouched.cvv && (
                          <p id="cvv-error" className="text-red-500 text-xs mt-1">{paymentErrors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ── UPI Form ── */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label htmlFor="upiId" className="mb-1.5 block text-sm font-medium text-gray-700">
                      UPI ID
                    </label>
                    <input
                      id="upiId"
                      value={upiForm.upiId}
                      onChange={(e) => setUpiForm({ upiId: e.target.value })}
                      onBlur={() => handleUpiBlur('upiId')}
                      disabled={loading}
                      placeholder="user@upi"
                      aria-describedby={upiErrors.upiId && upiTouched.upiId ? 'upiId-error' : undefined}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                    />
                    {upiErrors.upiId && upiTouched.upiId && (
                      <p id="upiId-error" className="text-red-500 text-xs mt-1">{upiErrors.upiId}</p>
                    )}
                  </div>
                )}

                {/* ── COD Confirmation ── */}
                {paymentMethod === 'cod' && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">
                      You will pay in cash at the time of delivery. No payment details are required.
                    </p>
                  </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    disabled={loading}
                    className="flex-1 rounded-full border border-gray-300 py-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-full bg-sky-600 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-sky-700 hover:shadow-lg disabled:opacity-60"
                  >
                    {loading ? 'Placing order…' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
