export default function StorefrontPage() {
  const cart = useCartState() as any;

  const dispatch =
    useCartDispatch() as any;

  const itemCount =
    cart?.count ?? 0;

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [category, setCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [
    activeTags,
    setActiveTags,
  ] = useState<string[]>([]);

  const [maxPrice, setMaxPrice] =
    useState(250);

  const [viewMode, setViewMode] =
    useState<
      "4" | "3" | "2" | "list"
    >("4");

  const [toast, setToast] =
    useState<string | null>(null);

  const sentinelRef =
    useRef<HTMLDivElement>(null);

  const CATEGORIES = [
    "all",
    "Tops",
    "Bottoms",
    "Outerwear",
    "Accessories",
  ];

  const TAG_OPTIONS = [
    "new",
    "sale",
    "bestseller",
    "limited",
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(t);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: [
      "storefront-products",
      {
        search: debouncedSearch,
        category,
        sortBy,
        tags: activeTags,
      },
    ],

    queryFn: ({ pageParam }) =>
      fetchProducts({
        pageParam:
          pageParam as number,
        search: debouncedSearch,
        category,
        sortBy,
        tags: activeTags,
      }),

    getNextPageParam: (last) =>
      last.nextPage,

    initialPageParam: 0,
  });

  useEffect(() => {
    const el = sentinelRef.current;

    if (!el) return;

    const obs =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "300px",
        }
      );

    obs.observe(el);

    return () => obs.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const allProducts =
    data?.pages.flatMap(
      (p) => p.products
    ) ?? [];

  const total =
    data?.pages[0]?.total ?? 0;

  const handleAddToCart =
    useCallback(
      (product: Product) => {
        dispatch.addItem({
          id: product.id,
          title: product.title,
          price: Math.round(
            product.price * 100
          ),
          thumbnail:
            product.thumbnail,
          quantity: 1,
        });

        setToast(
          `${product.title} added to cart`
        );

        setTimeout(() => {
          setToast(null);
        }, 2200);
      },
      [dispatch]
    );

  const toggleTag = (
    tag: string
  ) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter(
            (t) => t !== tag
          )
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setActiveTags([]);
    setMaxPrice(250);
    setSortBy("newest");
  };

  const hasFilters =
    search ||
    category !== "all" ||
    activeTags.length > 0 ||
    maxPrice < 250;

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <Link
          to="/"
          className="nav-logo"
        >
          commit&conquer
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className="nav-link active"
          >
            Shop
          </Link>

          <Link
            to="/collections"
            className="nav-link"
          >
            Collections
          </Link>

          <Link
            to="/about"
            className="nav-link"
          >
            About
          </Link>
        </div>

        <div className="nav-actions">
          <button
            className="cart-btn"
            onClick={() =>
              dispatch.toggleCart(true)
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
              />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>

            Cart

            {itemCount > 0 && (
              <span className="cart-badge">
                {itemCount > 9
                  ? "9+"
                  : itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle
              cx="12"
              cy="12"
              r="8"
            />
          </svg>

          New Season — Drop 01
        </div>

        <h1 className="hero-title">
          Minimal. Functional.
          <br />
          Uncompromising.
        </h1>

        <p className="hero-sub">
          Clothing built for people
          who move with purpose. No
          logos, no excess — just
          craft.
        </p>

        <div className="hero-cta">
          <a
            href="#products"
            className="btn-cta-primary"
          >
            Shop the Collection

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <Link
            to="/about"
            className="btn-cta-ghost"
          >
            Our Story
          </Link>
        </div>
      </section>

      <div className="cat-strip">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`cat-pill${
              category === c
                ? " active"
                : ""
            }`}
            onClick={() =>
              setCategory(c)
            }
          >
            {c === "all"
              ? "All Products"
              : c}
          </button>
        ))}
      </div>

      <div
        className="shop-layout"
        id="products"
      >
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">
              Sort by
            </div>

            {[
              {
                v: "newest",
                l: "Newest",
              },
              {
                v: "price-lo",
                l: "Price: Low → High",
              },
              {
                v: "price-hi",
                l: "Price: High → Low",
              },
              {
                v: "rating",
                l: "Top Rated",
              },
            ].map(({ v, l }) => (
              <label
                key={v}
                className="filter-check"
              >
                <input
                  type="radio"
                  name="sort"
                  checked={
                    sortBy === v
                  }
                  onChange={() =>
                    setSortBy(v)
                  }
                  style={{
                    accentColor:
                      "var(--accent)",
                  }}
                />

                {l}
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">
              Tags
            </div>

            {TAG_OPTIONS.map(
              (tag) => (
                <label
                  key={tag}
                  className="filter-check"
                >
                  <input
                    type="checkbox"
                    checked={activeTags.includes(
                      tag
                    )}
                    onChange={() =>
                      toggleTag(tag)
                    }
                  />

                  {tag
                    .charAt(0)
                    .toUpperCase() +
                    tag.slice(1)}
                </label>
              )
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">
              Max price: $
              {maxPrice}
            </div>

            <div className="price-range">
              <input
                type="range"
                min={0}
                max={250}
                step={5}
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    +e.target.value
                  )
                }
              />

              <div className="price-range-labels">
                <span>$0</span>
                <span>$250</span>
              </div>
            </div>
          </div>

          {hasFilters && (
            <button
              className="clear-filters"
              onClick={
                clearFilters
              }
            >
              Clear all filters
            </button>
          )}
        </aside>

        <div className="grid-col">
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                  />

                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>

              <input
                className="search-input"
                placeholder="Search products…"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-lo">
                Price ↑
              </option>

              <option value="price-hi">
                Price ↓
              </option>

              <option value="rating">
                Top rated
              </option>
            </select>

            <span className="result-count">
              {isFetching &&
              !isLoading
                ? "…"
                : `${total} products`}
            </span>

            <div className="view-btns">
              {(
                [
                  "4",
                  "3",
                  "list",
                ] as const
              ).map((v) => (
                <button
                  key={v}
                  className={`view-btn${
                    viewMode === v
                      ? " active"
                      : ""
                  }`}
                  onClick={() =>
                    setViewMode(v)
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`product-grid grid-${viewMode}`}
          >
            {isLoading ? (
              Array.from(
                { length: 12 },
                (_, i) => (
                  <div key={i}>
                    Loading...
                  </div>
                )
              )
            ) : allProducts.length ===
              0 ? (
              <div
                className="empty-state"
                style={{
                  gridColumn:
                    "1/-1",
                }}
              >
                <div className="empty-icon">
                  ◈
                </div>

                <div className="empty-title">
                  No products found
                </div>

                <div className="empty-sub">
                  Try adjusting your
                  filters or search
                  terms
                </div>
              </div>
            ) : (
              allProducts
                .filter(
                  (p) =>
                    p.price <=
                    maxPrice
                )
                .map((product) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    listView={
                      viewMode ===
                      "list"
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                  />
                ))
            )}

            {isFetchingNextPage &&
              Array.from(
                { length: 4 },
                (_, i) => (
                  <div
                    key={`sk-${i}`}
                  >
                    Loading...
                  </div>
                )
              )}
          </div>

          <div
            ref={sentinelRef}
            className="sentinel"
          />

          {!hasNextPage &&
            allProducts.length >
              0 && (
              <div className="end-msg">
                — All {total} products
                loaded —
              </div>
            )}
        </div>
      </div>

      {toast && (
        <div className="toast">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>

          {toast}
        </div>
      )}
    </>
  );
}