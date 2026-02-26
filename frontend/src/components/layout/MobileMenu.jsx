import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  Home,
  Calendar,
  Heart,
  Ticket,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileMenu = ({ onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const categories = [
    { name: "All", href: "/all" },
    { name: "Entertainment", href: "/entertainment" },
    { name: "Sports", href: "/sports" },
    { name: "Theater", href: "/theater" },
    { name: "Comedy", href: "/comedy" },
    { name: "Festivals", href: "/festivals" },
    { name: "Food & Drinks", href: "/food-drinks" },
    { name: "Business", href: "/business" },
  ];

  const userLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: Ticket, label: "My Tickets", href: "/tickets" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-lg font-semibold text-foreground">Menu</span>
        
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                {userLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md"
                    onClick={onClose}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              <Separator />

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center gap-3 px-3 py-2 w-full text-left text-destructive hover:bg-muted rounded-md"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full bg-primary text-primary-foreground"
                asChild
              >
                <Link to="?auth=signup" onClick={onClose}>
                  Sign Up
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="?auth=login" onClick={onClose}>
                  Sign In
                </Link>
              </Button>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Browse Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                  onClick={onClose}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <Link
              to="/help"
              className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
            >
              Help Center
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
            >
              About Us
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileMenu;
