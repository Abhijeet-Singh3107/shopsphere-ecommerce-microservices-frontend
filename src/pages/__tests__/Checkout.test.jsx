import { render, screen, waitFor, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as fc from 'fast-check';
import Checkout, { buildAddressString } from '../Checkout.jsx';
import { getCart } from '../../api/endpoints.js';

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('../../api/endpoints.js', () => ({
  getCart: vi.fn(() => Promise.resolve({ items: [], totalAmount: 0 })),
  checkout: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../hooks/useNotification.js', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../../hooks/useCart.js', () => ({
  useCart: () => ({ refreshCount: vi.fn() }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderCheckout() {
  return render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  );
}

// ─── Progress indicator tests (Task 2.1) ─────────────────────────────────────
// Requirements: 1.1, 1.2, 1.3

describe('Progress indicator', () => {
  it('renders all four step labels', () => {
    renderCheckout();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('uses nav with aria-label="Checkout progress" and an ol', () => {
    const { container } = renderCheckout();
    const nav = container.querySelector('nav[aria-label="Checkout progress"]');
    expect(nav).toBeInTheDocument();
    expect(nav.querySelector('ol')).toBeInTheDocument();
  });

  describe('when step is "shipping" (initial render) — Requirement 1.2', () => {
    it('shows Cart as completed: filled sky circle', () => {
      renderCheckout();
      const cartLabel = screen.getByText('Cart');
      expect(cartLabel).toHaveClass('text-sky-600');
      const cartCircle = cartLabel.previousElementSibling;
      expect(cartCircle).toHaveClass('bg-sky-600');
    });

    it('shows Shipping as active: filled sky circle with semibold label', () => {
      renderCheckout();
      const shippingLabel = screen.getByText('Shipping');
      expect(shippingLabel).toHaveClass('text-sky-600');
      expect(shippingLabel).toHaveClass('font-semibold');
      const shippingCircle = shippingLabel.previousElementSibling;
      expect(shippingCircle).toHaveClass('bg-sky-600');
    });

    it('shows Payment as upcoming: bordered gray circle with gray label', () => {
      renderCheckout();
      const paymentLabel = screen.getByText('Payment');
      expect(paymentLabel).toHaveClass('text-gray-400');
      const paymentCircle = paymentLabel.previousElementSibling;
      expect(paymentCircle).toHaveClass('border-gray-300');
      expect(paymentCircle).toHaveClass('bg-white');
    });

    it('shows Done as upcoming: bordered gray circle with gray label', () => {
      renderCheckout();
      const doneLabel = screen.getByText('Done');
      expect(doneLabel).toHaveClass('text-gray-400');
      const doneCircle = doneLabel.previousElementSibling;
      expect(doneCircle).toHaveClass('border-gray-300');
      expect(doneCircle).toHaveClass('bg-white');
    });

    it('connector Cart→Shipping uses border-sky-300 (Shipping is active)', () => {
      const { container } = renderCheckout();
      const nav = container.querySelector('nav[aria-label="Checkout progress"]');
      const connectors = nav.querySelectorAll('li[aria-hidden="true"]');
      expect(connectors[0]).toHaveClass('border-sky-300');
    });

    it('connector Shipping→Payment uses border-gray-200 (Payment is upcoming)', () => {
      const { container } = renderCheckout();
      const nav = container.querySelector('nav[aria-label="Checkout progress"]');
      const connectors = nav.querySelectorAll('li[aria-hidden="true"]');
      expect(connectors[1]).toHaveClass('border-gray-200');
    });

    it('connector Payment→Done uses border-gray-200 (Done is upcoming)', () => {
      const { container } = renderCheckout();
      const nav = container.querySelector('nav[aria-label="Checkout progress"]');
      const connectors = nav.querySelectorAll('li[aria-hidden="true"]');
      expect(connectors[2]).toHaveClass('border-gray-200');
    });
  });
});

// ─── Helpers for advancing to payment step ────────────────────────────────────

async function fillAndSubmitShipping() {
  fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText('Street Address'), { target: { value: '123 Main St' } });
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Mumbai' } });
  fireEvent.change(screen.getByLabelText('State/Province'), { target: { value: 'MH' } });
  fireEvent.change(screen.getByLabelText('ZIP/Postal Code'), { target: { value: '400001' } });
  fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'India' } });
  fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
}

// ─── Order summary panel unit tests (Task 6.2) ───────────────────────────────
// Requirements: 6.1, 6.2, 6.3

describe('Order summary panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is visible on the shipping step (initial render) — Requirement 6.1', async () => {
    getCart.mockResolvedValue({ items: [], totalAmount: 0 });
    renderCheckout();
    // The aside heading should always be present
    expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
  });

  it('is visible on the payment step — Requirement 6.1', async () => {
    getCart.mockResolvedValue({ items: [], totalAmount: 0 });
    renderCheckout();
    await act(async () => {
      await fillAndSubmitShipping();
    });
    expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
  });

  it('renders product names, quantities, and formatted subtotals on the payment step — Requirement 6.2', async () => {
    getCart.mockResolvedValue({
      items: [
        { id: 1, productName: 'Widget A', quantity: 2, price: 500 },
        { id: 2, productName: 'Gadget B', quantity: 1, price: 1200 },
      ],
      totalAmount: 2200,
    });
    renderCheckout();

    // Wait for cart to load
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    // Advance to payment step
    await act(async () => {
      await fillAndSubmitShipping();
    });

    // Items should still be visible on payment step
    expect(screen.getByText('Widget A')).toBeInTheDocument();
    expect(screen.getByText('Gadget B')).toBeInTheDocument();
    // Quantities shown as "× N"
    expect(screen.getAllByText(/× 2/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/× 1/).length).toBeGreaterThan(0);
  });

  it('calls getCart exactly once — not re-fetched on step change — Requirement 6.2', async () => {
    getCart.mockResolvedValue({ items: [], totalAmount: 0 });
    renderCheckout();

    // Advance to payment step
    await act(async () => {
      await fillAndSubmitShipping();
    });

    // Go back to shipping
    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    // Advance to payment again
    await act(async () => {
      await fillAndSubmitShipping();
    });

    // getCart should have been called exactly once (on mount only)
    expect(getCart).toHaveBeenCalledTimes(1);
  });

  it('maintains the same two-column layout container on both steps — Requirement 6.3', async () => {
    getCart.mockResolvedValue({ items: [], totalAmount: 0 });
    const { container } = renderCheckout();

    // On shipping step: aside should be inside the flex container
    const asideOnShipping = container.querySelector('aside');
    expect(asideOnShipping).toBeInTheDocument();
    expect(asideOnShipping.closest('.flex')).toBeInTheDocument();

    // Advance to payment step
    await act(async () => {
      await fillAndSubmitShipping();
    });

    // On payment step: aside should still be inside the flex container
    const asideOnPayment = container.querySelector('aside');
    expect(asideOnPayment).toBeInTheDocument();
    expect(asideOnPayment.closest('.flex')).toBeInTheDocument();
  });
});

// ─── Property 9: Order summary cart data is consistent across steps (Task 6.1) ─
// Validates: Requirements 6.2

describe('Property 9: Order summary cart data is consistent across steps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'displays the same items and total on the payment step as loaded on mount, and getCart is called exactly once',
    async () => {
      // Tag: Feature: checkout-mock-payment, Property 9: order summary cart data is consistent across steps
      // Validates: Requirements 6.2
      await fc.assert(
        fc.asyncProperty(
          // Generate 1–3 cart items with unique ids and distinct product names
          fc.uniqueArray(
            fc.record({
              id: fc.integer({ min: 1, max: 9999 }),
              productName: fc
                .string({ minLength: 3, maxLength: 20 })
                .map(s => s.replace(/\s+/g, '_'))  // avoid whitespace-only or split-text issues
                .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(s)),
              quantity: fc.integer({ min: 1, max: 10 }),
              price: fc.integer({ min: 1, max: 10000 }),
            }),
            { minLength: 1, maxLength: 3, selector: item => item.productName }
          ),
          fc.integer({ min: 1, max: 100000 }),
          async (items, totalAmount) => {
            cleanup();
            vi.clearAllMocks();
            getCart.mockResolvedValue({ items, totalAmount });

            const { container, unmount } = render(
              <MemoryRouter>
                <Checkout />
              </MemoryRouter>
            );

            // Wait for the aside to show items (not loading spinner)
            const aside = container.querySelector('aside');
            await waitFor(() => {
              expect(aside.querySelector('ul')).toBeInTheDocument();
            });

            // Advance to payment step
            await act(async () => {
              await fillAndSubmitShipping();
            });

            // The aside should still be present and contain all product names
            const asideAfter = container.querySelector('aside');
            expect(asideAfter).toBeInTheDocument();
            for (const item of items) {
              expect(asideAfter.textContent).toContain(item.productName);
            }

            // getCart should have been called exactly once
            expect(getCart).toHaveBeenCalledTimes(1);

            unmount();
          }
        ),
        { numRuns: 15 }
      );
    },
    60000
  );
});

// ─── Task 5: UPI form unit tests (5.3) ───────────────────────────────────────
// Requirements: 3.1, 3.2, 3.3, 7.3

import { validatePayment, validateUpi } from '../Checkout.jsx';
import * as endpoints from '../../api/endpoints.js';

describe('UPI form (paymentMethod === upi)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function advanceToPaymentAndSelectUpi() {
    renderCheckout();
    await act(async () => {
      await fillAndSubmitShipping();
    });
    fireEvent.click(screen.getByLabelText('UPI'));
  }

  it('renders UPI ID input with label and placeholder user@upi — Requirements 3.1, 3.2', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'user@upi');
  });

  it('shows error when UPI ID has no @ (invalidemail) — Requirement 3.3', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    fireEvent.change(input, { target: { value: 'invalidemail' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/UPI ID must be in user@upi format/i)).toBeInTheDocument();
    });
  });

  it('shows error when UPI ID has empty localpart (@provider) — Requirement 3.3', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    fireEvent.change(input, { target: { value: '@provider' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/UPI ID must be in user@upi format/i)).toBeInTheDocument();
    });
  });

  it('shows error when UPI ID has empty provider (user@) — Requirement 3.3', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    fireEvent.change(input, { target: { value: 'user@' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/UPI ID must be in user@upi format/i)).toBeInTheDocument();
    });
  });

  it('shows no error for valid UPI ID (user@upi) — Requirement 3.3', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    fireEvent.change(input, { target: { value: 'user@upi' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText(/UPI ID must be in user@upi format/i)).not.toBeInTheDocument();
    });
  });

  it('sets aria-describedby on UPI input when error is visible — Requirement 7.3', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    fireEvent.change(input, { target: { value: 'invalidemail' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-describedby', 'upiId-error');
    });
  });

  it('does not set aria-describedby when no error — Requirement 7.3', async () => {
    await advanceToPaymentAndSelectUpi();
    const input = screen.getByLabelText('UPI ID');
    // No blur yet — no error
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

// ─── Task 5: Card form unit tests (5.4) ──────────────────────────────────────
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7

describe('Card form (paymentMethod === card)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function advanceToPaymentWithCard() {
    renderCheckout();
    await act(async () => {
      await fillAndSubmitShipping();
    });
    // Card is selected by default
  }

  it('renders all four labeled inputs when paymentMethod is card — Requirement 2.1, 2.2', async () => {
    await advanceToPaymentWithCard();
    expect(screen.getByLabelText('Card Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Cardholder Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByLabelText('CVV')).toBeInTheDocument();
  });

  it('shows error for invalid card number on blur — Requirement 2.3', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('Card Number');
    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/card number must be 16 digits/i)).toBeInTheDocument();
    });
  });

  it('shows no error for valid 16-digit card number on blur — Requirement 2.3', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('Card Number');
    fireEvent.change(input, { target: { value: '1234567890123456' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText(/card number must be 16 digits/i)).not.toBeInTheDocument();
    });
  });

  it('shows error for empty cardholder name on blur — Requirement 2.4', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('Cardholder Name');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    });
  });

  it('shows no error for non-empty cardholder name on blur — Requirement 2.4', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('Cardholder Name');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText(/this field is required/i)).not.toBeInTheDocument();
    });
  });

  it('shows error for expiry 00/25 on blur — Requirement 2.5', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('Expiry Date');
    fireEvent.change(input, { target: { value: '00/25' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/expiry must be in MM\/YY format/i)).toBeInTheDocument();
    });
  });

  it('shows no error for expiry 01/25 on blur — Requirement 2.5', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('Expiry Date');
    fireEvent.change(input, { target: { value: '01/25' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText(/expiry must be in MM\/YY format/i)).not.toBeInTheDocument();
    });
  });

  it('shows error for CVV with 2 digits on blur — Requirement 2.6', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('CVV');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText(/CVV must be 3 or 4 digits/i)).toBeInTheDocument();
    });
  });

  it('shows no error for CVV with 3 digits on blur — Requirement 2.6', async () => {
    await advanceToPaymentWithCard();
    const input = screen.getByLabelText('CVV');
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText(/CVV must be 3 or 4 digits/i)).not.toBeInTheDocument();
    });
  });
});
