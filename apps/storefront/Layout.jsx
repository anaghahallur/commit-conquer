import {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";

import {
  Outlet,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import CartDrawer from "./CartDrawer";

const CartStateCtx = createContext(null);
const CartDispatchCtx = createContext(null);

const API = "http://localhost:4000/api/store";

export function CartProvider({ children }) {
  const qc = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);

  const [cartId, setCartId] = useState(() =>
    localStorage.getItem("cart_id")
  );

  // ─────────────────────────────────────────────
  // Fetch cart
  // ─────────────────────────────────────────────
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart", cartId],

    queryFn: async () => {
      if (!cartId) return null;

      const res = await fetch(
        `${API}/carts/${cartId}`
      );

      if (!res.ok) {
        localStorage.removeItem("cart_id");
        setCartId(null);
        return null;
      }

      return (await res.json()).cart;
    },

    enabled: !!cartId,
    staleTime: 5000,
  });

  // ─────────────────────────────────────────────
  // Create cart
  // ─────────────────────────────────────────────
  const createCart = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API}/carts`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      return (await res.json()).cart;
    },

    onSuccess: (newCart) => {
      localStorage.setItem(
        "cart_id",
        newCart.id
      );

      setCartId(newCart.id);

      qc.setQueryData(
        ["cart", newCart.id],
        newCart
      );
    },
  });

  // ─────────────────────────────────────────────
  // Add item
  // ─────────────────────────────────────────────
  const addItemMut = useMutation({
    mutationFn: async ({
      id,
      variantId,
      quantity = 1,
    }) => {
      let activeCartId = cartId;

      // create cart if none exists
      if (!activeCartId) {
        const newCart =
          await createCart.mutateAsync();

        activeCartId = newCart.id;
      }

      let res = await fetch(
        `${API}/carts/${activeCartId}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            product_id: id,
            variant_id:
              variantId ?? "default",
            quantity,
          }),
        }
      );

      // retry if server restarted
      if (res.status === 404) {
        const newCart =
          await createCart.mutateAsync();

        res = await fetch(
          `${API}/carts/${newCart.id}/items`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              product_id: id,
              variant_id:
                variantId ?? "default",
              quantity,
            }),
          }
        );
      }

      if (!res.ok) {
        throw new Error(
          "Failed to add item"
        );
      }

      return (await res.json()).cart;
    },

    onSuccess: (updatedCart) => {
      qc.setQueryData(
        ["cart", updatedCart.id],
        updatedCart
      );

      qc.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });

  // ─────────────────────────────────────────────
  // Remove item
  // ─────────────────────────────────────────────
  const removeItemMut = useMutation({
    mutationFn: async ({ id }) => {
      const res = await fetch(
        `${API}/carts/${cartId}/items/${id}`,
        {
          method: "DELETE",
        }
      );

      return (await res.json()).cart;
    },

    onSuccess: (updatedCart) => {
      qc.setQueryData(
        ["cart", cartId],
        updatedCart
      );
    },
  });

  // ─────────────────────────────────────────────
  // Update quantity
  // ─────────────────────────────────────────────
  const updateQtyMut = useMutation({
    mutationFn: async ({
      id,
      quantity,
    }) => {
      const res = await fetch(
        `${API}/carts/${cartId}/items/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            quantity,
          }),
        }
      );

      return (await res.json()).cart;
    },

    onSuccess: (updatedCart) => {
      qc.setQueryData(
        ["cart", cartId],
        updatedCart
      );
    },
  });

  // ─────────────────────────────────────────────
  // Clear cart
  // ─────────────────────────────────────────────
  const clearCartMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API}/carts/${cartId}`,
        {
          method: "DELETE",
        }
      );

      return (await res.json()).cart;
    },

    onSuccess: (updatedCart) => {
      qc.setQueryData(
        ["cart", cartId],
        updatedCart
      );
    },
  });

  // ─────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────
  const state = useMemo(
    () => ({
      items: cartData?.items ?? [],

      total:
        Number(cartData?.total) || 0,

      count:
        cartData?.items?.reduce(
          (n, i) =>
            n +
            (Number(i.quantity) || 0),
          0
        ) ?? 0,

      isOpen,
      isLoading,
      cart_id: cartId,
    }),
    [
      cartData,
      isOpen,
      isLoading,
      cartId,
    ]
  );

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────
  const dispatch = useMemo(
    () => ({
      addItem: (item) =>
        addItemMut.mutate(item),

      removeItem: (payload) => {
        const item =
          cartData?.items.find(
            (i) =>
              i.variant_id ===
              (payload.variantId ??
                "default")
          );

        if (item) {
          removeItemMut.mutate({
            id: item.id,
          });
        }
      },

      updateQty: (payload) => {
        const item =
          cartData?.items.find(
            (i) =>
              i.variant_id ===
              (payload.variantId ??
                "default")
          );

        if (item) {
          updateQtyMut.mutate({
            id: item.id,
            quantity:
              payload.quantity,
          });
        }
      },

      clearCart: () =>
        clearCartMut.mutate(),

      toggleCart: (open) =>
        setIsOpen(
          open ?? !isOpen
        ),
    }),

    [
      addItemMut,
      removeItemMut,
      updateQtyMut,
      clearCartMut,
      isOpen,
      cartData,
    ]
  );

  return (
    <CartStateCtx.Provider
      value={state}
    >
      <CartDispatchCtx.Provider
        value={dispatch}
      >
        {children}
      </CartDispatchCtx.Provider>
    </CartStateCtx.Provider>
  );
}

export function useCartState() {
  return useContext(CartStateCtx);
}

export function useCartDispatch() {
  return useContext(
    CartDispatchCtx
  );
}