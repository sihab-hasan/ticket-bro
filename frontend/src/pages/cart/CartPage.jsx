// pages/cart/CartPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { cartService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      setCart(await cartService.getCart());
    } catch { toast.error('Failed to load cart'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQty = async (itemId, newQty) => {
    setUpdating((u) => ({ ...u, [itemId]: true }));
    try {
      if (newQty <= 0) {
        await cartService.removeItem(itemId);
      } else {
        await cartService.updateItem(itemId, { quantity: newQty });
      }
      await fetchCart();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update'));
    } finally {
      setUpdating((u) => ({ ...u, [itemId]: false }));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    try {
      await cartService.applyPromo(promoCode);
      toast.success('Promo code applied!');
      fetchCart();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Invalid promo code'));
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    try {
      await cartService.removePromo();
      setPromoCode('');
      fetchCart();
    } catch {}
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      fetchCart();
      toast.success('Cart cleared');
    } catch {}
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = cart?.discount || 0;
  const serviceFee = subtotal * 0.05;
  const total = subtotal - discount + serviceFee;

  if (loading) return <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto">{[1,2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>;

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold font-heading flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />Cart
          {items.length > 0 && <span className="text-sm font-normal text-muted-foreground">({items.length} item{items.length > 1 ? 's' : ''})</span>}
        </h1>
        {items.length > 0 && <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={handleClearCart}>Clear all</Button>}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground mb-4">Your cart is empty</p>
            <Link to={ROUTES.BROWSE.ROOT}>
              <Button className="font-bold">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    {item.event?.coverImage && <img src={item.event.coverImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.event?.title}</p>
                    <p className="text-xs text-muted-foreground">{item.ticketType?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.event?.startDate, { dateStyle: 'medium', timeStyle: undefined })}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQty(item._id, item.quantity - 1)} disabled={updating[item._id]}>
                          {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3" />}
                        </Button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQty(item._id, item.quantity + 1)} disabled={updating[item._id]}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-bold text-primary">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Promo */}
          <Card>
            <CardContent className="p-4">
              {cart.promoCode ? (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-green-600">"{cart.promoCode}" applied</span>
                    <span className="text-xs text-muted-foreground ml-2">— {formatPrice(discount)} off</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRemovePromo}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Promo code" className="h-8 pl-8 text-xs font-mono" onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()} />
                  </div>
                  <Button size="sm" variant="outline" className="h-8 font-semibold shrink-0" onClick={handleApplyPromo} disabled={applyingPromo || !promoCode.trim()}>
                    {applyingPromo ? '…' : 'Apply'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Service fee (5%)</span><span>{formatPrice(serviceFee)}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => navigate(ROUTES.CART.CHECKOUT)} className="w-full h-12 font-bold text-base">
            Proceed to Checkout <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </>
      )}
    </div>
  );
};

export default CartPage;
