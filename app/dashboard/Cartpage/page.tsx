"use client";

import { useCartStore } from "@/app/stores/useAppStore";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
export default function CartPage() {
  const {
    items,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    totalPrice,
    clearCart,
  } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/dashboard/user/checkout');
  
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center"
      >
        <ShoppingCart className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-500">Looks like you haven't added any items yet</p>
        <Button onClick={()=>router.push('/dashboard/user')} variant="outline" className="mt-4">
          Continue Shopping
        </Button>
      </motion.div>
    );
  }


  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h1>
        <Button
          variant="ghost"
          onClick={clearCart}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring" }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 sm:flex-row">
                      <div className="relative overflow-hidden rounded-lg aspect-square w-36">
                        <img
                          src={item.imageUrls[0]}
                          alt={`${item.make} ${item.model}`}
                          className="object-cover w-full h-full"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2"
                        >
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {item.make} {item.model} ({item.year})
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.transmission} • {item.fuelType}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => decrementQuantity(item.id)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                  // For direct quantity input
                                  const diff = value - item.quantity;
                                  if (diff > 0) {
                                    Array(diff).fill(0).forEach(() => incrementQuantity(item.id));
                                  } else if (diff < 0) {
                                    Array(Math.abs(diff)).fill(0).forEach(() => decrementQuantity(item.id));
                                  }
                                }
                              }}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => incrementQuantity(item.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-lg font-semibold">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>

                        {item.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.features.slice(0, 3).map((feature) => (
                              <Badge
                                key={feature}
                                variant="outline"
                                className="text-xs"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {item.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${
                  Math.round(totalPrice() * 0.1).toLocaleString()
                }</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${(totalPrice() * 1.1).toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Free Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Enjoy free shipping on all orders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}