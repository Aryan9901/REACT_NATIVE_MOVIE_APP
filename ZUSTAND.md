# Zustand State Management Guide

## What is Zustand?

Zustand is a lightweight, fast, and scalable state management library for React. Unlike Context API, it doesn't require providers wrapping your components and causes fewer re-renders, making your app faster and cleaner.

## Why Zustand Over Context API?

✅ **No Provider Hell** - No nested providers cluttering your component tree
✅ **Better Performance** - Components only re-render when the specific state they use changes
✅ **Simpler API** - Less boilerplate code
✅ **TypeScript First** - Excellent TypeScript support out of the box
✅ **DevTools Support** - Easy debugging with Redux DevTools
✅ **Async Actions Built-in** - No need for useEffect gymnastics

## Installation

```bash
npm install zustand
```

## Project Structure

```
stores/
├── index.ts              # Export all stores
├── useAuthStore.ts       # Authentication state
├── useLocationStore.ts   # Location & GPS state
└── useStoreStore.ts      # Vendor, cart, delivery state
```

---

## Store 1: Authentication Store (`useAuthStore`)

### State

```typescript
{
  user: User | null; // Current logged-in user
  loading: boolean; // Loading state for auth operations
  showAuthModal: boolean; // Control auth modal visibility
  isGuestMode: boolean; // Whether user is in guest mode
  isAuthenticated: boolean; // Computed: true if user exists
}
```

### Actions

- `setUser(user)` - Set the current user
- `setLoading(loading)` - Set loading state
- `setShowAuthModal(show)` - Show/hide auth modal
- `setIsGuestMode(isGuest)` - Toggle guest mode
- `loadUser()` - Load user from AsyncStorage on app start
- `initiateLogin(mobile)` - Send OTP to mobile number
- `verifyOTP(otp, mobile)` - Verify OTP and login
- `logout()` - Logout user and clear storage
- `refreshUser()` - Refresh user data from API

### Usage Examples

#### Basic Usage

```typescript
import { useAuthStore } from "@/stores";

function MyComponent() {
  // Subscribe to specific state (component only re-renders when user changes)
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Get actions
  const logout = useAuthStore((state) => state.logout);

  return (
    <View>
      {isAuthenticated ? (
        <>
          <Text>Welcome, {user?.name}</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Text>Please login</Text>
      )}
    </View>
  );
}
```

#### Multiple State Values

```typescript
function ProfileScreen() {
  // Get multiple values at once
  const { user, loading, logout } = useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
    logout: state.logout,
  }));

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{user?.name}</Text>
      <Text>{user?.emailId}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

#### Login Flow

```typescript
function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const { initiateLogin, verifyOTP, loading } = useAuthStore((state) => ({
    initiateLogin: state.initiateLogin,
    verifyOTP: state.verifyOTP,
    loading: state.loading,
  }));

  const handleSendOTP = async () => {
    try {
      await initiateLogin(mobile);
      setOtpSent(true);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP(otp, mobile);
      // User is now logged in, navigate to home
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View>
      {!otpSent ? (
        <>
          <TextInput value={mobile} onChangeText={setMobile} />
          <Button title="Send OTP" onPress={handleSendOTP} disabled={loading} />
        </>
      ) : (
        <>
          <TextInput value={otp} onChangeText={setOtp} />
          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}
```

---

## Store 2: Location Store (`useLocationStore`)

### State

```typescript
{
  location: PreparedLocation | null; // Current location with address
  loadingLocation: boolean; // Loading state for location operations
  isLocationTurnedOff: boolean; // Whether location services are off
  locationErrorType: string; // Type of location error
  permissionState: string; // Permission status: 'granted' | 'denied' | 'prompt'
  shouldOpenDrawer: boolean; // iOS specific: should open settings
  hasRetriedLocation: boolean; // Internal retry flag
}
```

### Actions

- `setLocation(location)` - Set current location
- `setLoadingLocation(loading)` - Set loading state
- `checkPermissionStatus()` - Check location permission status
- `getLiveLocation(isModal, func, showToast, userId, toastInstance)` - Get current GPS location
- `updateAddress(address)` - Update address manually
- `prepareLocationData(locationData, savedAddress)` - Format location data

### Usage Examples

#### Get Current Location

```typescript
import { useLocationStore } from "@/stores";
import { useToast } from "react-native-toast-notifications";

function LocationButton() {
  const location = useLocationStore((state) => state.location);
  const loadingLocation = useLocationStore((state) => state.loadingLocation);
  const getLiveLocation = useLocationStore((state) => state.getLiveLocation);

  const toast = useToast();
  const user = useAuthStore((state) => state.user);

  const handleGetLocation = async () => {
    const success = await getLiveLocation(false, null, true, user?.id, toast);
    if (success) {
      console.log("Location obtained:", location);
    }
  };

  return (
    <TouchableOpacity onPress={handleGetLocation} disabled={loadingLocation}>
      <Text>{loadingLocation ? "Getting location..." : "Get My Location"}</Text>
    </TouchableOpacity>
  );
}
```

#### Display Current Address

```typescript
function AddressDisplay() {
  const location = useLocationStore((state) => state.location);

  if (!location) {
    return <Text>No location set</Text>;
  }

  return (
    <View>
      <Text>{location.formatted_address}</Text>
      <Text>
        {location.address.city}, {location.address.state}
      </Text>
      <Text>PIN: {location.address.pinCode}</Text>
    </View>
  );
}
```

#### Handle Location Errors

```typescript
function LocationErrorHandler() {
  const isLocationTurnedOff = useLocationStore(
    (state) => state.isLocationTurnedOff
  );
  const locationErrorType = useLocationStore(
    (state) => state.locationErrorType
  );
  const permissionState = useLocationStore((state) => state.permissionState);

  if (!isLocationTurnedOff) return null;

  return (
    <View>
      {locationErrorType === "permission-denied" && (
        <Text>Please enable location permissions in settings</Text>
      )}
      {locationErrorType === "timeout" && (
        <Text>Location request timed out. Please try again.</Text>
      )}
      {locationErrorType === "position-unavailable" && (
        <Text>Unable to determine location. Please try again.</Text>
      )}
    </View>
  );
}
```

---

## Store 3: Store/Cart Store (`useStoreStore`)

### State

```typescript
{
  selectedVendor: Vendor | null      // Currently selected vendor/store
  deliveryLocation: DeliveryLocation | null  // Delivery address
  cart: CartItem[]                   // Shopping cart items
  isLoading: boolean                 // Loading state
  cartTotal: number                  // Computed: total cart value
  cartItemCount: number              // Computed: total items in cart
}
```

### Actions

- `setSelectedVendor(vendor)` - Select a vendor (clears cart if vendor changes)
- `setDeliveryLocation(location)` - Set delivery location
- `addToCart(item)` - Add item to cart (or increase quantity if exists)
- `removeFromCart(productId)` - Remove item from cart
- `updateCartQuantity(productId, quantity)` - Update item quantity
- `clearCart()` - Clear entire cart
- `loadStoredData()` - Load cart/vendor from AsyncStorage on app start

### Usage Examples

#### Display Cart

```typescript
import { useStoreStore } from "@/stores";

function CartScreen() {
  const cart = useStoreStore((state) => state.cart);
  const cartTotal = useStoreStore((state) => state.cartTotal);
  const cartItemCount = useStoreStore((state) => state.cartItemCount);
  const removeFromCart = useStoreStore((state) => state.removeFromCart);
  const updateCartQuantity = useStoreStore((state) => state.updateCartQuantity);

  return (
    <View>
      <Text>Cart ({cartItemCount} items)</Text>

      {cart.map((item) => (
        <View key={item.productId}>
          <Text>{item.name}</Text>
          <Text>₹{item.price}</Text>

          <View>
            <Button
              title="-"
              onPress={() =>
                updateCartQuantity(item.productId, item.quantity - 1)
              }
            />
            <Text>{item.quantity}</Text>
            <Button
              title="+"
              onPress={() =>
                updateCartQuantity(item.productId, item.quantity + 1)
              }
            />
          </View>

          <Button
            title="Remove"
            onPress={() => removeFromCart(item.productId)}
          />
        </View>
      ))}

      <Text>Total: ₹{cartTotal}</Text>
    </View>
  );
}
```

#### Add to Cart

```typescript
function ProductCard({ product }) {
  const addToCart = useStoreStore((state) => state.addToCart);
  const selectedVendor = useStoreStore((state) => state.selectedVendor);

  const handleAddToCart = () => {
    addToCart({
      id: `${selectedVendor?.id}-${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  };

  return (
    <View>
      <Text>{product.name}</Text>
      <Text>₹{product.price}</Text>
      <Button title="Add to Cart" onPress={handleAddToCart} />
    </View>
  );
}
```

#### Cart Badge

```typescript
function CartBadge() {
  const cartItemCount = useStoreStore((state) => state.cartItemCount);

  return (
    <View>
      <Ionicons name="cart" size={24} />
      {cartItemCount > 0 && (
        <View style={styles.badge}>
          <Text>{cartItemCount}</Text>
        </View>
      )}
    </View>
  );
}
```

#### Vendor Selection

```typescript
function VendorCard({ vendor }) {
  const setSelectedVendor = useStoreStore((state) => state.setSelectedVendor);
  const selectedVendor = useStoreStore((state) => state.selectedVendor);

  const isSelected = selectedVendor?.id === vendor.id;

  const handleSelectVendor = () => {
    setSelectedVendor(vendor);
    // Navigate to vendor products page
  };

  return (
    <TouchableOpacity onPress={handleSelectVendor}>
      <View style={isSelected && styles.selected}>
        <Text>{vendor.shopName}</Text>
        <Text>{vendor.address?.city}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

---

## Advanced Patterns

### 1. Combining Multiple Stores

```typescript
function CheckoutScreen() {
  // Get data from multiple stores
  const user = useAuthStore((state) => state.user);
  const location = useLocationStore((state) => state.location);
  const { cart, cartTotal, selectedVendor } = useStoreStore((state) => ({
    cart: state.cart,
    cartTotal: state.cartTotal,
    selectedVendor: state.selectedVendor,
  }));

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert("Please login to continue");
      return;
    }

    if (!location) {
      Alert.alert("Please set delivery location");
      return;
    }

    // Process checkout with all data
    const orderData = {
      userId: user.id,
      vendorId: selectedVendor?.id,
      items: cart,
      total: cartTotal,
      deliveryAddress: location.formatted_address,
    };

    // Submit order...
  };

  return (
    <View>
      <Text>Order Summary</Text>
      <Text>Vendor: {selectedVendor?.shopName}</Text>
      <Text>Items: {cart.length}</Text>
      <Text>Total: ₹{cartTotal}</Text>
      <Text>Deliver to: {location?.address.city}</Text>
      <Button title="Place Order" onPress={handleCheckout} />
    </View>
  );
}
```

### 2. Selective Re-renders (Performance Optimization)

```typescript
// ❌ BAD: Component re-renders on ANY auth state change
function BadExample() {
  const authStore = useAuthStore();
  return <Text>{authStore.user?.name}</Text>;
}

// ✅ GOOD: Component only re-renders when user.name changes
function GoodExample() {
  const userName = useAuthStore((state) => state.user?.name);
  return <Text>{userName}</Text>;
}

// ✅ BETTER: Use shallow equality for objects
import { shallow } from "zustand/shallow";

function BetterExample() {
  const { user, loading } = useAuthStore(
    (state) => ({
      user: state.user,
      loading: state.loading,
    }),
    shallow
  );

  return (
    <View>{loading ? <ActivityIndicator /> : <Text>{user?.name}</Text>}</View>
  );
}
```

### 3. Actions Outside Components

```typescript
// You can call store actions from anywhere, not just components!

// In a service file
import { useAuthStore } from "@/stores";

export async function apiCall() {
  const token = useAuthStore.getState().user?.sessionToken;

  const response = await fetch("/api/data", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// In a utility function
import { useStoreStore } from "@/stores";

export function getCartItemCount() {
  return useStoreStore.getState().cartItemCount;
}
```

### 4. Subscribing to Changes

```typescript
import { useEffect } from "react";
import { useStoreStore } from "@/stores";

function CartWatcher() {
  useEffect(() => {
    // Subscribe to cart changes
    const unsubscribe = useStoreStore.subscribe(
      (state) => state.cart,
      (cart, prevCart) => {
        console.log("Cart changed from", prevCart, "to", cart);

        // Send analytics event
        if (cart.length > prevCart.length) {
          analytics.track("Item Added to Cart");
        }
      }
    );

    return unsubscribe;
  }, []);

  return null;
}
```

---

## Migration from Context API

### Before (Context API)

```typescript
// Provider hell in _layout.tsx
<AuthProvider>
  <LocationProvider>
    <StoreProvider>
      <App />
    </StoreProvider>
  </LocationProvider>
</AuthProvider>;

// Usage in component
const { user, logout } = useAuth();
const { location, getLiveLocation } = useLocation();
const { cart, addToCart } = useStore();
```

### After (Zustand)

```typescript
// Clean _layout.tsx
<StoreInitializer />
<App />

// Usage in component (same API!)
const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);
const location = useLocationStore((state) => state.location);
const getLiveLocation = useLocationStore((state) => state.getLiveLocation);
const cart = useStoreStore((state) => state.cart);
const addToCart = useStoreStore((state) => state.addToCart);
```

---

## Debugging

### 1. Log State Changes

```typescript
import { useEffect } from "react";
import { useAuthStore } from "@/stores";

function DebugAuth() {
  const authStore = useAuthStore();

  useEffect(() => {
    console.log("Auth state:", authStore);
  }, [authStore]);

  return null;
}
```

### 2. Redux DevTools (Optional)

```bash
npm install zustand-devtools
```

```typescript
import { devtools } from "zustand/middleware";

export const useAuthStore = create(
  devtools((set, get) => ({
    // ... your store
  }))
);
```

---

## Common Patterns & Best Practices

### ✅ DO

```typescript
// 1. Subscribe to specific values
const userName = useAuthStore((state) => state.user?.name);

// 2. Group related actions
const { login, logout, refreshUser } = useAuthStore((state) => ({
  login: state.initiateLogin,
  logout: state.logout,
  refreshUser: state.refreshUser,
}));

// 3. Use async/await in actions
const addToCart = useStoreStore((state) => state.addToCart);
await addToCart(item);

// 4. Handle errors in components
try {
  await verifyOTP(otp, mobile);
} catch (error) {
  Alert.alert("Error", error.message);
}
```

### ❌ DON'T

```typescript
// 1. Don't subscribe to entire store
const authStore = useAuthStore(); // Re-renders on ANY change

// 2. Don't mutate state directly
const cart = useStoreStore((state) => state.cart);
cart.push(item); // ❌ Wrong!
// Use actions instead:
addToCart(item); // ✅ Correct

// 3. Don't forget error handling
await logout(); // ❌ No error handling
// Better:
try {
  await logout();
} catch (error) {
  console.error(error);
}
```

---

## Troubleshooting

### Issue: State not persisting after app restart

**Solution:** Make sure `StoreInitializer` is mounted in `_layout.tsx` and `loadStoredData()` / `loadUser()` are called.

### Issue: Component not re-rendering

**Solution:** Make sure you're subscribing to the specific state value:

```typescript
// ❌ Wrong
const store = useStoreStore();
const cart = store.cart;

// ✅ Correct
const cart = useStoreStore((state) => state.cart);
```

### Issue: "Cannot read property of undefined"

**Solution:** Add optional chaining when accessing nested properties:

```typescript
const userName = useAuthStore((state) => state.user?.name);
const city = useLocationStore((state) => state.location?.address?.city);
```

---

## Summary

Zustand provides a cleaner, faster, and more maintainable way to manage state compared to Context API:

- **3 stores** replace 3 context providers
- **No provider nesting** in your component tree
- **Better performance** with selective re-renders
- **Simpler API** with less boilerplate
- **TypeScript support** out of the box
- **Async actions** built-in
- **Persistent storage** with AsyncStorage integration

All your existing functionality (auth, location, cart) works exactly the same, just with better performance and cleaner code!
