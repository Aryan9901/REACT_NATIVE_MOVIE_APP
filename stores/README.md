# Stores Directory

This directory contains all Zustand state management stores for the application.

## 📁 Files

- **`useAuthStore.ts`** - Authentication and user management
- **`useLocationStore.ts`** - Location, GPS, and address management
- **`useStoreStore.ts`** - Shopping cart, vendor, and delivery management
- **`index.ts`** - Central export file for all stores

## 🚀 Quick Usage

```typescript
import { useAuthStore, useLocationStore, useStoreStore } from "@/stores";

// In your component
const user = useAuthStore((state) => state.user);
const location = useLocationStore((state) => state.location);
const cart = useStoreStore((state) => state.cart);
```

## 📚 Documentation

- **Quick Start**: See `../ZUSTAND_QUICK_START.md`
- **Migration Guide**: See `../ZUSTAND_MIGRATION_EXAMPLES.md`
- **Full Documentation**: See `../ZUSTAND.md`
- **Visual Guide**: See `../ZUSTAND_VISUAL_GUIDE.md`

## 🔧 Store Details

### useAuthStore

Manages user authentication and session.

**State:**

- `user` - Current user object
- `loading` - Loading state
- `showAuthModal` - Auth modal visibility
- `isGuestMode` - Guest mode flag
- `isAuthenticated` - Computed authentication status

**Actions:**

- `loadUser()` - Load user from storage
- `initiateLogin(mobile)` - Send OTP
- `verifyOTP(otp, mobile)` - Verify OTP and login
- `logout()` - Logout user
- `refreshUser()` - Refresh user data

### useLocationStore

Manages location, GPS, and address data.

**State:**

- `location` - Current location with address
- `loadingLocation` - Loading state
- `isLocationTurnedOff` - Location services status
- `locationErrorType` - Error type
- `permissionState` - Permission status

**Actions:**

- `getLiveLocation()` - Get current GPS location
- `updateAddress(address)` - Update address
- `checkPermissionStatus()` - Check permissions
- `setLocation(location)` - Set location manually

### useStoreStore

Manages shopping cart, vendor selection, and delivery.

**State:**

- `selectedVendor` - Currently selected vendor
- `deliveryLocation` - Delivery address
- `cart` - Cart items array
- `cartTotal` - Computed total price
- `cartItemCount` - Computed item count
- `isLoading` - Loading state

**Actions:**

- `setSelectedVendor(vendor)` - Select vendor
- `addToCart(item)` - Add item to cart
- `removeFromCart(productId)` - Remove item
- `updateCartQuantity(productId, quantity)` - Update quantity
- `clearCart()` - Clear entire cart
- `setDeliveryLocation(location)` - Set delivery address

## 💡 Best Practices

### 1. Subscribe to Specific State

```typescript
// ✅ Good - Only re-renders when user changes
const user = useAuthStore((state) => state.user);

// ❌ Bad - Re-renders on any auth state change
const authStore = useAuthStore();
```

### 2. Group Related State

```typescript
// ✅ Good - Single subscription
const { user, loading, logout } = useAuthStore((state) => ({
  user: state.user,
  loading: state.loading,
  logout: state.logout,
}));

// ❌ Less efficient - Multiple subscriptions
const user = useAuthStore((state) => state.user);
const loading = useAuthStore((state) => state.loading);
const logout = useAuthStore((state) => state.logout);
```

### 3. Use Optional Chaining

```typescript
// ✅ Good - Safe access
const userName = useAuthStore((state) => state.user?.name);

// ❌ Bad - Can throw error
const userName = useAuthStore((state) => state.user.name);
```

### 4. Handle Async Actions

```typescript
// ✅ Good - Error handling
try {
  await logout();
} catch (error) {
  console.error("Logout failed:", error);
}

// ❌ Bad - No error handling
await logout();
```

## 🔍 Debugging

### Log State Changes

```typescript
import { useEffect } from "react";

function DebugComponent() {
  const authStore = useAuthStore();

  useEffect(() => {
    console.log("Auth state changed:", authStore);
  }, [authStore]);

  return null;
}
```

### Access State Outside Components

```typescript
// Get current state
const currentUser = useAuthStore.getState().user;

// Subscribe to changes
const unsubscribe = useAuthStore.subscribe((state) => {
  console.log("State changed:", state);
});

// Unsubscribe when done
unsubscribe();
```

## 🛠️ Extending Stores

### Adding New State

```typescript
// In useAuthStore.ts
interface AuthState {
  // ... existing state
  newField: string; // Add new field

  // ... existing actions
  setNewField: (value: string) => void; // Add new action
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing state
  newField: "",

  // ... existing actions
  setNewField: (value) => set({ newField: value }),
}));
```

### Adding New Actions

```typescript
// In useStoreStore.ts
export const useStoreStore = create<StoreState>((set, get) => ({
  // ... existing code

  // Add new action
  getCartItem: (productId: string) => {
    const { cart } = get();
    return cart.find((item) => item.productId === productId);
  },
}));
```

## 📦 Dependencies

- `zustand` - State management library
- `@react-native-async-storage/async-storage` - Persistent storage
- `expo-location` - Location services (for LocationStore)

## 🔗 Related Files

- `../components/StoreInitializer.tsx` - Initializes stores on app start
- `../app/_layout.tsx` - App layout with StoreInitializer
- `../lib/constants.ts` - Storage keys constants

## 📝 Notes

- All stores automatically persist to AsyncStorage
- Stores are initialized on app startup via StoreInitializer
- No providers needed - stores are globally accessible
- TypeScript types are fully supported
- All actions are async-safe

## 🎯 Common Patterns

### Pattern 1: Conditional Rendering

```typescript
function MyComponent() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <LoginPrompt />;
  }

  return <UserProfile user={user} />;
}
```

### Pattern 2: Computed Values

```typescript
function CartSummary() {
  const cartTotal = useStoreStore((state) => state.cartTotal);
  const cartItemCount = useStoreStore((state) => state.cartItemCount);

  return (
    <View>
      <Text>{cartItemCount} items</Text>
      <Text>Total: ₹{cartTotal}</Text>
    </View>
  );
}
```

### Pattern 3: Action Callbacks

```typescript
function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login screen
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
```

## 🚨 Common Mistakes

### Mistake 1: Destructuring Store

```typescript
// ❌ Wrong - Won't re-render
const store = useAuthStore();
const { user } = store;

// ✅ Correct
const user = useAuthStore((state) => state.user);
```

### Mistake 2: Mutating State

```typescript
// ❌ Wrong - Direct mutation
const cart = useStoreStore((state) => state.cart);
cart.push(newItem);

// ✅ Correct - Use action
const addToCart = useStoreStore((state) => state.addToCart);
addToCart(newItem);
```

### Mistake 3: Missing Error Handling

```typescript
// ❌ Wrong - No error handling
const handleLogin = async () => {
  await initiateLogin(mobile);
};

// ✅ Correct - With error handling
const handleLogin = async () => {
  try {
    await initiateLogin(mobile);
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

## 📞 Support

For questions or issues:

1. Check the documentation files in the root directory
2. Review the migration examples
3. Look at the visual guide for comparisons
4. Check the official Zustand docs: https://docs.pmnd.rs/zustand
