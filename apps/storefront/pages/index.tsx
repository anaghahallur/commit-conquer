import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useCartState,
  useCartDispatch,
} from "../Layout";

import CartDrawer from "../CartDrawer";

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

const PRODUCT_DATA: Product[] =
  Array.from(
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
        [
          "new",
          "sale",
          "limited",
          "bestseller",
        ],
        ["sale"],
        [],
        ["bestseller"],
        ["limited"],
      ][i % 5];

      const price = parseFloat(
        (
          29 +
          ((i * 17) % 200)
        ).toFixed(2)
      );

      return {
        id: `prod_${String(
          i + 1
        ).padStart(3, "0")}`,

        handle:
          titles[i % 12]
            .toLowerCase()
            .replace(/\s+/g, "-") +
          `-${i + 1}`,

        title: titles[i % 12],

        category:
          categories[i % 4],

        status:
          i % 5 === 1
            ? "draft"
            : "published",

        thumbnail: `https://picsum.photos/seed/${
          i + 10
        }/400/500`,

        price,

        originalPrice:
          tags.includes("sale")
            ? parseFloat(
                (
                  price * 1.3
                ).toFixed(2)
              )
            : undefined,

        inventory:
          200 -
          ((i * 13) % 180),

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
  ).filter(
    (p) =>
      p.status === "published"
  );

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
          .includes(
            search.toLowerCase()
          ) ||
        p.category
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );
  }

  if (category !== "all") {
    result = result.filter(
      (p) =>
        p.category === category
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
      (a, b) =>
        a.price - b.price
    );
  } else if (
    sortBy === "price-hi"
  ) {
    result.sort(
      (a, b) =>
        b.price - a.price
    );
  } else if (
    sortBy === "rating"
  ) {
    result.sort(
      (a, b) =>
        b.rating - a.rating
    );
  } else if (
    sortBy === "newest"
  ) {
    result.sort(
      (a, b) =>
        parseInt(
          b.id.split("_")[1]
        ) -
        parseInt(
          a.id.split("_")[1]
        )
    );
  }

  const start = pageParam * LIMIT;

  return {
    products: result.slice(
      start,
      start + LIMIT
    ),

    nextPage:
      start + LIMIT <
      result.length
        ? pageParam + 1
        : undefined,

    total: result.length,
  };
}

const css = `
.product-grid{
  display:grid;
  gap:20px;
  padding:24px;
}

.product-grid.grid-4{
  grid-template-columns:repeat(4,1fr);
}

.product-grid.grid-3{
  grid-template-columns:repeat(3,1fr);
}

.product-grid.grid-list{
  grid-template-columns:1fr;
}

.product-card{
  border:1px solid #2a2a2a;
  border-radius:18px;
  overflow:hidden;
  background:#111;
  color:#fff;
  cursor:pointer;
  transition:0.25s;
}

.product-card:hover{
  transform:translateY(-3px);
}

.product-card.list-card{
  display:flex;
}

.card-img-wrap{
  position:relative;
  overflow:hidden;
}

.card-img{
  width:100%;
  height:320px;
  object-fit:cover;
  display:block;
}

.list-card .card-img{
  width:220px;
}

.card-badges{
  position:absolute;
  top:10px;
  left:10px;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.card-badge{
  padding:4px 8px;
  border-radius:999px;
  font-size:10px;
  font-weight:700;
  text-transform:uppercase;
  background:#222;
}

.badge-more{
  background:#333;
}

.card-quick-add{
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  padding:12px;
}

.btn-quick-add{
  width:100%;
  padding:10px;
  border:none;
  border-radius:10px;
  background:#7c6aff;
  color:#fff;
  cursor:pointer;
  font-weight:700;
}

.btn-quick-add.added{
  background:#16a34a;
}

.card-body{
  padding:16px;
}

.card-category{
  font-size:11px;
  opacity:0.7;
  text-transform:uppercase;
}

.card-title{
  font-size:16px;
  font-weight:700;
  margin:6px 0;
}

.card-rating{
  display:flex;
  align-items:center;
  gap:6px;
  margin-bottom:10px;
}

.stars{
  color:gold;
}

.rating-count{
  font-size:12px;
  opacity:0.7;
}

.card-price-row{
  display:flex;
  gap:8px;
  align-items:center;
}

.card-price{
  font-size:16px;
  font-weight:700;
  color:#22c55e;
}

.card-price-orig{
  text-decoration:line-through;
  opacity:0.6;
}

.card-inv{
  margin-top:8px;
  font-size:12px;
}

.card-inv.low{
  color:#ef4444;
}

.toast{
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  background:#111;
  color:#22c55e;
  border:1px solid #22c55e;
  padding:12px 18px;
  border-radius:12px;
  z-index:999;
}

.skeleton-card{
  border-radius:18px;
  overflow:hidden;
  background:#1a1a1a;
}

.skeleton{
  background:#2a2a2a;
  animation: pulse 1.5s infinite;
}

.skeleton-img{
  height:320px;
}

.skeleton-body{
  padding:16px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.skeleton-line{
  height:12px;
  border-radius:6px;
}

@keyframes pulse{
  0%{opacity:0.5}
  50%{opacity:1}
  100%{opacity:0.5}
}

@media(max-width:1100px){
  .product-grid.grid-4{
    grid-template-columns:repeat(3,1fr);
  }
}

@media(max-width:800px){
  .product-grid.grid-4,
  .product-grid.grid-3{
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:540px){
  .product-grid{
    grid-template-columns:1fr !important;
  }
}
`;

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
                i <
                Math.round(
                  rating
                )
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
  onAddToCart: (
    p: Product
  ) => void;
}) {
  const navigate =
    useNavigate();

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

    setLocalInv(
      (n) => n - 1
    );

    setAdded(true);

    setTimeout(
      () =>
        setAdded(false),
      1400
    );
  };

  const isLow =
    localInv > 0 &&
    localInv <= 10;

  const isOut =
    localInv <= 0;

  return (
    <div
      className={`product-card${
        listView
          ? " list-card"
          : ""
      }`}
      onClick={() =>
        navigate(
          `/products/${product.handle}`
        )
      }
    >
      <div className="card-img-wrap">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="card-img"
          loading="lazy"
        />

        {product.tags.length >
          0 && (
          <div className="card-badges">
            {product.tags
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className={`card-badge badge-${tag}`}
                >
                  {tag}
                </span>
              ))}

            {product.tags
              .length > 3 && (
              <span className="card-badge badge-more">
                +
                {product.tags
                  .length - 3}
              </span>
            )}
          </div>
        )}

        {!listView && (
          <div className="card-quick-add">
            <button
              className={`btn-quick-add${
                added
                  ? " added"
                  : ""
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
          <Stars
            rating={
              product.rating
            }
          />

          <span className="rating-count">
            (
            {
              product.reviewCount
            }
            )
          </span>
        </div>

        <div className="card-price-row">
          <span className="card-price">
            $
            {product.price.toFixed(
              2
            )}
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
              added
                ? " added"
                : ""
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

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />

      <div className="skeleton-body">
        <div
          className="skeleton skeleton-line"
          style={{
            width: "50%",
          }}
        />

        <div
          className="skeleton skeleton-line"
          style={{
            width: "75%",
          }}
        />

        <div
          className="skeleton skeleton-line"
          style={{
            width: "40%",
          }}
        />
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  const {
    count: itemCount,
  } = useCartState() as any;

  const { addItem } =
    useCartDispatch() as any;

  const [cartOpen, setCartOpen] =
    useState(false);

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
    const t = setTimeout(
      () =>
        setDebouncedSearch(
          search
        ),
      350
    );

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
        search:
          debouncedSearch,
        category,
        sortBy,
        tags: activeTags,
      },
    ],

    queryFn: ({ pageParam }) =>
      fetchProducts({
        pageParam:
          pageParam as number,
        search:
          debouncedSearch,
        category,
        sortBy,
        tags: activeTags,
      }),

    getNextPageParam: (
      last
    ) => last.nextPage,

    initialPageParam: 0,
  });

  useEffect(() => {
    const el =
      sentinelRef.current;

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

    return () =>
      obs.disconnect();
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
        addItem({
          id: product.id,
          title:
            product.title,
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

        setTimeout(
          () =>
            setToast(null),
          2200
        );
      },
      [addItem]
    );

  return (
    <>
      <style>{css}</style>

      <div
        className={`product-grid grid-${viewMode}`}
      >
        {isLoading
          ? Array.from(
              { length: 12 },
              (_, i) => (
                <SkeletonCard
                  key={i}
                />
              )
            )
          : allProducts
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
              ))}

        {isFetchingNextPage &&
          Array.from(
            { length: 4 },
            (_, i) => (
              <SkeletonCard
                key={`sk-${i}`}
              />
            )
          )}
      </div>

      <div ref={sentinelRef} />

      {cartOpen && (
        <CartDrawer />
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </>
  );
}