// frontend/src/components/events/sections/TicketSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  CreditCard,
  Shield,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Info,
  Zap,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TicketSection = ({ event, ticketTypes = [], onTicketSelect }) => {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState({});
  const [activeTab, setActiveTab] = useState('regular');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Default ticket types if none provided
  const defaultTickets = [
    {
      id: 'ga',
      name: 'General Admission',
      price: 49.99,
      description: 'Standard admission ticket',
      available: 150,
      maxPerOrder: 8,
      type: 'regular',
      benefits: ['General entry', 'First come first served seating']
    },
    {
      id: 'vip',
      name: 'VIP Experience',
      price: 199.99,
      description: 'Premium VIP package',
      available: 50,
      maxPerOrder: 4,
      type: 'vip',
      benefits: [
        'VIP early entry',
        'Premium seating',
        'Exclusive merch item',
        'VIP lounge access'
      ]
    },
    {
      id: 'group',
      name: 'Group Package (4+)',
      price: 44.99,
      description: 'Discounted group tickets',
      available: 100,
      maxPerOrder: 20,
      type: 'group',
      benefits: ['Group discount', 'Seated together', 'Group coordinator support'],
      minQuantity: 4
    },
    {
      id: 'early',
      name: 'Early Bird',
      price: 39.99,
      description: 'Limited early bird special',
      available: 25,
      maxPerOrder: 4,
      type: 'special',
      benefits: ['Best price', 'Early entry option'],
      originalPrice: 49.99
    }
  ];

  const tickets = ticketTypes.length > 0 ? ticketTypes : defaultTickets;

  // Group tickets by type
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const type = ticket.type || 'regular';
    if (!acc[type]) acc[type] = [];
    acc[type].push(ticket);
    return acc;
  }, {});

  const handleQuantityChange = (ticketId, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: quantity
    }));
  };

  const calculateSubtotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = tickets.find(t => t.id === ticketId);
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const calculateFees = () => {
    return calculateSubtotal() * 0.15; // 15% service fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateFees();
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const handleContinue = () => {
    if (totalTickets === 0) {
      setError('Please select at least one ticket');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (onTicketSelect) {
        onTicketSelect(selectedTickets);
      }
      navigate(`/checkout?event=${event?.id}`, {
        state: { selectedTickets, event }
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Ticket className="h-4 w-4 mr-2" />
            Secure Your Seats
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Get Your Tickets</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our available ticket options. All tickets are 100% guaranteed.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {[
            { icon: Shield, text: 'Secure Checkout' },
            { icon: Clock, text: 'Instant Download' },
            { icon: Users, text: '10M+ Fans' },
            { icon: CreditCard, text: 'Pay Later Options' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Tickets</CardTitle>
                <CardDescription>
                  Choose your ticket type and quantity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="regular">Regular</TabsTrigger>
                    <TabsTrigger value="vip">VIP</TabsTrigger>
                    <TabsTrigger value="group">Group</TabsTrigger>
                    <TabsTrigger value="special">Special</TabsTrigger>
                  </TabsList>

                  {Object.entries(groupedTickets).map(([type, typeTickets]) => (
                    <TabsContent key={type} value={type} className="space-y-4">
                      {typeTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                        >
                          <div className="flex-1 mb-4 md:mb-0">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Ticket className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                  {ticket.name}
                                  {ticket.originalPrice && (
                                    <Badge variant="secondary" className="text-xs">
                                      Save {Math.round((1 - ticket.price/ticket.originalPrice) * 100)}%
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {ticket.description}
                                </p>
                                
                                {/* Benefits */}
                                <div className="mt-2 space-y-1">
                                  {ticket.benefits?.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span>{benefit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 ml-12 md:ml-0">
                            <div className="text-right">
                              <div className="font-bold text-lg">${ticket.price}</div>
                              {ticket.originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">
                                  ${ticket.originalPrice}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {ticket.available} left
                              </div>
                            </div>

                            <Select
                              value={selectedTickets[ticket.id]?.toString() || '0'}
                              onValueChange={(val) => handleQuantityChange(ticket.id, parseInt(val))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="0" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(Math.min(ticket.available, ticket.maxPerOrder) + 1).keys()].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Availability Warning */}
                {totalTickets > 0 && (
                  <Alert className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tickets are limited. Complete your purchase within 10 minutes to secure your seats.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tickets */}
                <div className="space-y-2">
                  {Object.entries(selectedTickets)
                    .filter(([_, qty]) => qty > 0)
                    .map(([ticketId, qty]) => {
                      const ticket = tickets.find(t => t.id === ticketId);
                      return (
                        <div key={ticketId} className="flex justify-between text-sm">
                          <span>{ticket?.name} x{qty}</span>
                          <span>${((ticket?.price || 0) * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                </div>

                {totalTickets > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Subtotal</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1">
                          Service Fee
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Includes processing and handling fees</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span>${calculateFees().toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Promo Code */}
                <div className="pt-4">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <Gift className="h-4 w-4" />
                    Apply Promo Code
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleContinue}
                  disabled={totalTickets === 0 || isLoading}
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Continue to Checkout
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Payment Icons */}
                <div className="flex justify-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Secure Payment</span>
                </div>

                {/* Guarantee */}
                <p className="text-xs text-center text-muted-foreground">
                  ⚡ 100% Guaranteed tickets. Prices may be above face value.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">FanProtect Guarantee</h4>
            <p className="text-sm text-muted-foreground">
              Your tickets will be valid or we'll refund you 100%
            </p>
          </div>
          <div className="p-6">
            <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Instant Download</h4>
            <p className="text-sm text-muted-foreground">
              Get your tickets immediately after purchase
            </p>
          </div>
          <div className="p-6">
            <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Group Discounts</h4>
            <p className="text-sm text-muted-foreground">
              Special pricing for groups of 4 or more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketSection;