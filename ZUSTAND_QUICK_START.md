# Zustand Quick Start Guide

Get started with Zustand state management in 5 minutes!

## Step 1: Install Zustand

```bash
npm install zustand
```

## Step 2: Your Stores Are Ready!

All stores are already created in the `stores/` directory:

- `stores/useAuthStore.ts` - Authentication
- `stores/useLocationStore.ts` - Location & GPS
- `stores/useStoreStore.ts` - Vendor, Cart, Delivery
- `stores/index.ts` - Export all stores

## Step 3: App is Already Configured

The `app/_layout.tsx` has been updated to use Zustand with `<StoreInitializer />`.

## Step 4: Start Using in Your Components

### Authentication

```typescript
import { useAuthStore } from "@/stores";

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### Location

```typescript
import { useLocationStore, useAuthStore } from "@/stores";
import { useToast } from "react-native-toast-notifications";

function MyComponent() {
  const location = useLocationStore((state) => state.location);
  const getLiveLocation = useLocationStore((state) => state.getLiveLocation);
  const user = useAuthStore((state) => state.user);
  const toast = useToast();

  const handleGetLocation = async () => {
    await getLiveLocation(false, null, true, user?.id, toast);
  };

  return (
    <View>
      <Text>{location?.formatted_address}</Text>
      <Button title="Get Location" onPress={handleGetLocation} />
    </View>
  );
}
```

### Cart

```typescript
import { useStoreStore } from "@/stores";

function MyComponent() {
  const cart = useStoreStore((state) => state.cart);
  const cartTotal = useStoreStore((state) => state.cartTotal);
  const addToCart = useStoreStore((state) => state.addToCart);

  return (
    <View>
      <Text>Items: {cart.length}</Text>
      <Text>Total: ₹{cartTotal}</Text>
    </View>
  );
}
```

## Step 5: Migrate Your Components

Replace Context API hooks with Zustand:

| Old (Context API)                    | New (Zustand)                                         |
| ------------------------------------ | ----------------------------------------------------- |
| `useAuth()`                          | `useAuthStore((state) => state.user)`                 |
| `useLocation()`                      | `useLocationStore((state) => state.location)`         |
| `useStore()`                         | `useStoreStore((state) => state.cart)`                |
| `const { user } = useAuth()`         | `const user = useAuthStore((state) => state.user)`    |
| `const { cart } = useStore()`        | `const cart = useStoreStore((state) => state.cart)`   |
| `getLiveLocation(false, null, true)` | `getLiveLocation(false, null, true, user?.id, toast)` |

## What's Different?

### Before (Context API)

```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, logout } = useAuth();
```

### After (Zustand)

```typescript
import { useAuthStore } from "@/stores";

const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);
```

## Benefits You Get

✅ **No Provider Hell** - Removed 3 nested providers from `_layout.tsx`
✅ **Better Performance** - Components only re-render when their specific state changes
✅ **Cleaner Code** - Less boilerplate, more readable
✅ **Same Functionality** - Everything works exactly as before
✅ **TypeScript Support** - Full type safety out of the box

## Available State & Actions

### Auth Store

**State:** `user`, `loading`, `showAuthModal`, `isGuestMode`, `isAuthenticated`

**Actions:** `loadUser()`, `initiateLogin()`, `verifyOTP()`, `logout()`, `refreshUser()`, `setShowAuthModal()`

### Location Store

**State:** `location`, `loadingLocation`, `isLocationTurnedOff`, `locationErrorType`, `permissionState`

**Actions:** `getLiveLocation()`, `updateAddress()`, `checkPermissionStatus()`, `setLocation()`

### Store Store (Cart/Vendor)

**State:** `selectedVendor`, `deliveryLocation`, `cart`, `cartTotal`, `cartItemCount`, `isLoading`

**Actions:** `setSelectedVendor()`, `addToCart()`, `removeFromCart()`, `updateCartQuantity()`, `clearCart()`, `setDeliveryLocation()`

## Common Patterns

### Get Single Value

```typescript
const user = useAuthStore((state) => state.user);
```

### Get Multiple Values

```typescript
const { user, loading, logout } = useAuthStore((state) => ({
  user: state.user,
  loading: state.loading,
  logout: state.logout,
}));
```

### Call Actions

```typescript
const logout = useAuthStore((state) => state.logout);
await logout();
```

### Combine Multiple Stores

```typescript
const user = useAuthStore((state) => state.user);
const location = useLocationStore((state) => state.location);
const cart = useStoreStore((state) => state.cart);
```

## Next Steps

1. ✅ Install Zustand: `npm install zustand`
2. ✅ Stores are already created
3. ✅ App layout is configured
4. 📝 Update your components (see `ZUSTAND_MIGRATION_EXAMPLES.md`)
5. 📚 Read full documentation (`ZUSTAND.md`)

## Need Help?

- **Quick Examples**: See `ZUSTAND_MIGRATION_EXAMPLES.md`
- **Full Documentation**: See `ZUSTAND.md`
- **Troubleshooting**: Check the "Troubleshooting" section in `ZUSTAND.md`

## Files Created

```
stores/
├── index.ts                    # Export all stores
├── useAuthStore.ts            # Authentication state
├── useLocationStore.ts        # Location & GPS state
└── useStoreStore.ts           # Vendor, cart, delivery state

components/
└── StoreInitializer.tsx       # Initialize stores on app start

Documentation:
├── ZUSTAND.md                 # Complete documentation
├── ZUSTAND_MIGRATION_EXAMPLES.md  # Migration examples
└── ZUSTAND_QUICK_START.md     # This file
```

## Files Updated

- ✅ `app/_layout.tsx` - Removed Context Providers, added StoreInitializer
- ✅ `app/(tabs)/index.tsx` - Updated to use Zustand stores

## Files to Keep (Optional)

You can keep the old Context files as backup:

- `contexts/AuthContext.tsx`
- `contexts/LocationContext.tsx`
- `contexts/StoreContext.tsx`

Once you've migrated all components and tested everything, you can delete them.

---

**That's it! You're ready to use Zustand. Start migrating your components one by one.**
