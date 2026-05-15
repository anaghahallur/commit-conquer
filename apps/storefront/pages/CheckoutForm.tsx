export default function CheckoutForm() {
  const { items, total } = useCartState() ?? {
    items: [],
    total: 0,
  };

  const dispatch = useCartDispatch();

  const clearCart: () => void =
    dispatch?.clearCart ?? (() => {});

  const [step, setStep] =
    useState<Step>("address");

  const [address, setAddress] =
    useState<AddressForm>(EMPTY_ADDRESS);

  const [shippingOption, setShippingOption] =
    useState(SHIPPING_OPTIONS[0]);

  const [payment, setPayment] =
    useState<PaymentForm>(EMPTY_PAYMENT);

  const [email, setEmail] =
    useState("");

  const [discountCode, setDiscountCode] =
    useState("");

  const [discountApplied, setDiscountApplied] =
    useState(false);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [isPlacing, setIsPlacing] =
    useState(false);

  const [orderId, setOrderId] =
    useState<string | null>(null);

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);

  const [discountError, setDiscountError] =
    useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Totals
  // ─────────────────────────────────────────────
  const TAX_RATE = 0.08;

  const subtotal =
    Number(total) || 0;

  const discountAmt = discountApplied
    ? Math.round(subtotal * 0.1)
    : 0;

  const shipping =
    subtotal > 0
      ? Number(shippingOption?.price || 0)
      : 0;

  const tax = Math.round(
    (subtotal - discountAmt) *
      TAX_RATE
  );

  const grandTotal =
    subtotal -
    discountAmt +
    shipping +
    tax;

  // ─────────────────────────────────────────────
  // Step helpers
  // ─────────────────────────────────────────────
  const stepIdx = STEPS.findIndex(
    (s) => s.key === step
  );

  const goTo = useCallback(
    (target: Step) => {
      const targetIdx =
        STEPS.findIndex(
          (s) => s.key === target
        );

      if (targetIdx < stepIdx) {
        setStep(target);
      }
    },
    [stepIdx]
  );

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  const validateAddress = () => {
    const errs: Record<
      string,
      string
    > = {};

    if (!email.trim()) {
      errs.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      errs.email =
        "Invalid email";
    }

    if (!address.first_name.trim())
      errs.first_name = "Required";

    if (!address.last_name.trim())
      errs.last_name = "Required";

    if (!address.address_1.trim())
      errs.address_1 = "Required";

    if (!address.city.trim())
      errs.city = "Required";

    if (!address.state.trim())
      errs.state = "Required";

    if (!address.postal_code.trim())
      errs.postal_code = "Required";

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  const validatePayment = () => {
    const errs: Record<
      string,
      string
    > = {};

    const raw =
      payment.card_number.replace(
        /\s/g,
        ""
      );

    if (raw.length < 16) {
      errs.card_number =
        "Enter a valid 16-digit card number";
    }

    if (
      !payment.expiry.match(
        /^\d{2}\/\d{2}$/
      )
    ) {
      errs.expiry =
        "MM/YY format";
    }

    if (payment.cvc.length < 3) {
      errs.cvc = "3-digit CVC";
    }

    if (
      !payment.name_on_card.trim()
    ) {
      errs.name_on_card =
        "Required";
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  // ─────────────────────────────────────────────
  // Navigation handlers
  // ─────────────────────────────────────────────
  const handleAddressContinue =
    () => {
      if (validateAddress()) {
        setErrors({});
        setStep("shipping");
      }
    };

  const handlePaymentContinue =
    () => {
      if (validatePayment()) {
        setErrors({});
        setStep("review");
      }
    };

  // ─────────────────────────────────────────────
  // Place order
  // ─────────────────────────────────────────────
  const handlePlaceOrder =
    async () => {
      setIsPlacing(true);
      setCheckoutError(null);

      try {
        // fake request delay
        await new Promise((r) =>
          setTimeout(r, 1800)
        );

        const mockOrderId = `ORD-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`;

        setOrderId(mockOrderId);

        clearCart();

        setStep("confirmed");
      } catch (err) {
        setCheckoutError(
          "Something went wrong. Please try again."
        );
      } finally {
        setIsPlacing(false);
      }
    };

  // ─────────────────────────────────────────────
  // Discount code
  // ─────────────────────────────────────────────
  const handleDiscount = () => {
    const code =
      discountCode
        .trim()
        .toUpperCase();

    if (code === "HACKATHON10") {
      const usedCodes =
        JSON.parse(
          localStorage.getItem(
            "used_discount_codes"
          ) || "{}"
        );

      if (!email) {
        setDiscountError(
          "Please enter your email first."
        );

        return;
      }

      if (
        usedCodes[email] === code
      ) {
        setDiscountError(
          "Coupon already used."
        );

        return;
      }

      setDiscountError(null);
      setDiscountApplied(true);
    } else if (code) {
      setDiscountError(
        "Invalid discount code"
      );
    }
  };

  // ─────────────────────────────────────────────
  // Form handlers
  // ─────────────────────────────────────────────
  const addr =
    (
      field: keyof AddressForm
    ) =>
    (
      e: React.ChangeEvent<
        | HTMLInputElement
        | HTMLSelectElement
      >
    ) => {
      setAddress((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      setErrors((prev) => {
        const next = {
          ...prev,
        };

        delete next[field];

        return next;
      });
    };

  const pay =
    (
      field: keyof PaymentForm,
      formatter?: (
        v: string
      ) => string
    ) =>
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const val = formatter
        ? formatter(
            e.target.value
          )
        : e.target.value;

      setPayment((prev) => ({
        ...prev,
        [field]: val,
      }));

      setErrors((prev) => {
        const next = {
          ...prev,
        };

        delete next[field];

        return next;
      });
    };

  // rest of component continues below...
}