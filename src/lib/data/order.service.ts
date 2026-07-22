import { getState, setState, useAppState } from "./store";
import type { Order, OrderStatus } from "./types";

export function useOrders() {
  return useAppState((s) => s.orders);
}

export function listOrders() {
  return getState().orders;
}

export function createOrder(order: Order) {
  setState((s) => ({ ...s, orders: [order, ...s.orders] }));
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  setState((s) => ({
    ...s,
    orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  }));
}

export function deleteOrder(id: string) {
  setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) }));
}