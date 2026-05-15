export default function CheckoutForm() {
  const { items, total } = useCartState() ?? {
    items: [],
    total: 0,
  };

  const dispatch = useCartDispatch();
  const clearCart = dispatch.clearCart;

  const [step, setStep] =
    useState<Step>("address");

  const [address, setAddress] =
    useState<AddressForm>(EMPTY_ADDRESS);

  const [shippingOption, setShippingOption] =
    useState(SHIPPING_OPTIONS[0]);

  const [payment, setPayment] =
    useState<PaymentForm>(EMPTY_PAYMENT);

  const [email, setEmail] = useState("");

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