import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useCartState, useCartDispatch } from "../Layout";

interface Product {
  id: string;
  handle: string;
  title: string;
  category: string;
  status: "published" | "draft";
  thumbnail: string;
  price: number;
  originalPrice?: number;
  inventory: number;
  tags: string[];
  rating: number;
  reviewCount: number;
}

interface FetchResult {
  products: Product[];
  nextPage: number | undefined;
  total: number;
}

const PRODUCT_DATA: Product[] = Array.from(
  { length: 60 },
  (_, i) => {
    const titles = [
      "Obsidian Crew Neck",
      "Slate Cargo Pant",
      "Onyx Hoodie",
      "Granite Bomber",
      "Ash Trench Coat",
      "Carbon Jogger",
      "Basalt Windbreaker",
      "Charcoal Denim",
      "Iron Fleece",
      "Flint Overshirt",
      "Coal Polo",
      "Cinder Vest",
    ];

    const categories = [
      "Tops",
      "Bottoms",
      "Outerwear",
      "Accessories",
    ];

    const tags = [
      ["new"],
      ["sale"],
      [],
      ["bestseller"],
      ["limited"],
    ][i % 5];

    const price = parseFloat(
      (29 + ((i * 17) % 200)).toFixed(2)
    );

    return {
      id: `prod_${String(i + 1).padStart(
        3,
        "0"
      )}`,

      handle:
        titles[i % 12]
          .toLowerCase()
          .replace(/\s+/g, "-") + `-${i + 1}`,

      title: titles[i % 12],

      category: categories[i % 4],

      status:
        i % 5 === 1 ? "draft" : "published",

      thumbnail: `https://picsum.photos/seed/${
        i + 10
      }/400/500`,

      price,

      originalPrice: tags.includes("sale")
        ? parseFloat((price * 1.3).toFixed(2))
        : undefined,

      inventory: 200 - ((i * 13) % 180),

      tags,

      rating: parseFloat(
        (
          3.5 +
          ((i * 7) % 15) / 10
        ).toFixed(1)
      ),

      reviewCount:
        4 + ((i * 11) % 120),
    };
  }
).filter((p) => p.status === "published");

async function fetchProducts({
  pageParam = 0,
  search,
  category,
  sortBy,
  tags,
}: {
  pageParam?: number;
  search: string;
  category: string;
  sortBy: string;
  tags: string[];
}): Promise<FetchResult> {
  await new Promise((r) =>
    setTimeout(r, 400)
  );

  const LIMIT = 12;

  let result = [...PRODUCT_DATA];

  if (search) {
    result = result.filter(
      (p) =>
        p.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        p.category
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }

  if (category !== "all") {
    result = result.filter(
      (p) => p.category === category
    );
  }

  if (tags.length) {
    result = result.filter((p) =>
      tags.some((t) =>
        p.tags.includes(t)
      )
    );
  }

  if (sortBy === "price-lo") {
    result.sort(
      (a, b) => a.price - b.price
    );
  } else if (sortBy === "price-hi") {
    result.sort(
      (a, b) => b.price - a.price
    );
  } else if (sortBy === "rating") {
    result.sort(
      (a, b) => b.rating - a.rating
    );
  }

  const start = pageParam * LIMIT;

  return {
    products: result.slice(
      start,
      start + LIMIT
    ),

    nextPage:
      start + LIMIT < result.length
        ? pageParam + 1
        : undefined,

    total: result.length,
  };
}

function Stars({
  rating,
}: {
  rating: number;
}) {
  return (
    <span className="stars">
      {Array.from(
        { length: 5 },
        (_, i) => (
          <span
            key={i}
            style={{
              opacity:
                i < Math.round(rating)
                  ? 1
                  : 0.25,
            }}
          >
            ★
          </span>
        )
      )}
    </span>
  );
}

function ProductCard({
  product,
  listView,
  onAddToCart,
}: {
  product: Product;
  listView: boolean;
  onAddToCart: (p: Product) => void;
}) {
  const [added, setAdded] =
    useState(false);

  const [localInv, setLocalInv] =
    useState(product.inventory);

  const handleAdd = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (localInv <= 0) return;

    onAddToCart(product);

    setLocalInv((n) => n - 1);

    setAdded(true);

    setTimeout(
      () => setAdded(false),
      1400
    );
  };

  const isLow =
    localInv > 0 && localInv <= 10;

  const isOut = localInv <= 0;

  return (
    <div
      className={`product-card${
        listView ? " list-card" : ""
      }`}
    >
      <div className="card-img-wrap">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="card-img"
          loading="lazy"
        />

        {product.tags.length > 0 && (
          <div className="card-badges">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`card-badge badge-${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {!listView && (
          <div className="card-quick-add">
            <button
              className={`btn-quick-add${
                added ? " added" : ""
              }`}
              disabled={isOut}
              onClick={handleAdd}
            >
              {added
                ? "✓ Added"
                : isOut
                ? "Out of stock"
                : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-category">
          {product.category}
        </div>

        <div className="card-title">
          {product.title}
        </div>

        <div className="card-rating">
          <Stars rating={product.rating} />

          <span className="rating-count">
            ({product.reviewCount})
          </span>
        </div>

        <div className="card-price-row">
          <span className="card-price">
            ${product.price.toFixed(2)}
          </span>

          {product.originalPrice && (
            <span className="card-price-orig">
              $
              {product.originalPrice.toFixed(
                2
              )}
            </span>
          )}
        </div>

        {isOut ? (
          <div className="card-inv low">
            Out of stock
          </div>
        ) : isLow ? (
          <div className="card-inv low">
            Only {localInv} left
          </div>
        ) : (
          <div className="card-inv">
            {localInv} in stock
          </div>
        )}

        {listView && (
          <button
            className={`btn-quick-add${
              added ? " added" : ""
            }`}
            disabled={isOut}
            onClick={handleAdd}
          >
            {added
              ? "✓ Added"
              : isOut
              ? "Out of stock"
              : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  const cart = useCartState() as any;

  const dispatch =
    useCartDispatch() as any;

  const itemCount = cart?.count ?? 0;

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

  return (
    <>
      <nav className="nav">
        <Link
          to="/"
          className="nav-logo"
        >
          commit&conquer
        </Link>

        <button
          className="cart-btn"
          onClick={() =>
            dispatch.toggleCart(true)
          }
        >
          Cart

          {itemCount > 0 && (
            <span className="cart-badge">
              {itemCount}
            </span>
          )}
        </button>
      </nav>

      <div className="product-grid">
        {isLoading
          ? Array.from(
              { length: 8 },
              (_, i) => (
                <div key={i}>
                  Loading...
                </div>
              )
            )
          : allProducts
              .filter(
                (p) =>
                  p.price <= maxPrice
              )
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  listView={
                    viewMode === "list"
                  }
                  onAddToCart={
                    handleAddToCart
                  }
                />
              ))}
      </div>

      <div
        ref={sentinelRef}
      />

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </>
  );
}