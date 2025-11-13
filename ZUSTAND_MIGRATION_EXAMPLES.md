# Zustand Migration Examples

Quick reference for migrating your existing components from Context API to Zustand.

## Installation

```bash
npm install zustand
```

## Import Changes

### Before (Context API)

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useStore } from "@/contexts/StoreContext";
```

### After (Zustand)

```typescript
import { useAuthStore, useLocationStore, useStoreStore } from "@/stores";
```

---

## Example 1: Authentication Component

### Before

```typescript
import { useAuth } from "@/contexts/AuthContext";

function ProfileScreen() {
  const { user, loading, logout } = useAuth();

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### After

```typescript
import { useAuthStore } from "@/stores";

function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const logout = useAuthStore((state) => state.logout);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

---

## Example 2: Location Component

### Before

```typescript
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";

function LocationPicker() {
  const { location, loadingLocation, getLiveLocation } = useLocation();
  const { user } = useAuth();

  const handleGetLocation = async () => {
    await getLiveLocation(false, null, true);
  };

  return (
    <View>
      <Text>{location?.formatted_address || "No location"}</Text>
      <Button
        title="Get Location"
        onPress={handleGetLocation}
        disabled={loadingLocation}
      />
    </View>
  );
}
```

### After

```typescript
import { useLocationStore, useAuthStore } from "@/stores";
import { useToast } from "react-native-toast-notifications";

function LocationPicker() {
  const location = useLocationStore((state) => state.location);
  const loadingLocation = useLocationStore((state) => state.loadingLocation);
  const getLiveLocation = useLocationStore((state) => state.getLiveLocation);
  const user = useAuthStore((state) => state.user);
  const toast = useToast();

  const handleGetLocation = async () => {
    await getLiveLocation(false, null, true, user?.id, toast);
  };

  return (
    <View>
      <Text>{location?.formatted_address || "No location"}</Text>
      <Button
        title="Get Location"
        onPress={handleGetLocation}
        disabled={loadingLocation}
      />
    </View>
  );
}
```

---

## Example 3: Cart Component

### Before

```typescript
import { useStore } from "@/contexts/StoreContext";

function CartScreen() {
  const { cart, cartTotal, removeFromCart, updateCartQuantity } = useStore();

  return (
    <View>
      {cart.map((item) => (
        <View key={item.productId}>
          <Text>{item.name}</Text>
          <Text>₹{item.price}</Text>
          <Text>Qty: {item.quantity}</Text>
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

### After

```typescript
import { useStoreStore } from "@/stores";

function CartScreen() {
  const cart = useStoreStore((state) => state.cart);
  const cartTotal = useStoreStore((state) => state.cartTotal);
  const removeFromCart = useStoreStore((state) => state.removeFromCart);
  const updateCartQuantity = useStoreStore((state) => state.updateCartQuantity);

  return (
    <View>
      {cart.map((item) => (
        <View key={item.productId}>
          <Text>{item.name}</Text>
          <Text>₹{item.price}</Text>
          <Text>Qty: {item.quantity}</Text>
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

---

## Example 4: Vendor Selection

### Before

```typescript
import { useStore } from "@/contexts/StoreContext";

function VendorCard({ vendor }) {
  const { selectedVendor, setSelectedVendor } = useStore();

  return (
    <TouchableOpacity onPress={() => setSelectedVendor(vendor)}>
      <View>
        <Text>{vendor.shopName}</Text>
        {selectedVendor?.id === vendor.id && <Text>✓ Selected</Text>}
      </View>
    </TouchableOpacity>
  );
}
```

### After

```typescript
import { useStoreStore } from "@/stores";

function VendorCard({ vendor }) {
  const selectedVendor = useStoreStore((state) => state.selectedVendor);
  const setSelectedVendor = useStoreStore((state) => state.setSelectedVendor);

  return (
    <TouchableOpacity onPress={() => setSelectedVendor(vendor)}>
      <View>
        <Text>{vendor.shopName}</Text>
        {selectedVendor?.id === vendor.id && <Text>✓ Selected</Text>}
      </View>
    </TouchableOpacity>
  );
}
```

---

## Example 5: Auth Modal

### Before

```typescript
import { useAuth } from "@/contexts/AuthContext";

function AuthModal() {
  const { showAuthModal, setShowAuthModal, initiateLogin, verifyOTP } =
    useAuth();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = async () => {
    await initiateLogin(mobile);
  };

  const handleVerify = async () => {
    await verifyOTP(otp, mobile);
  };

  return (
    <Modal
      visible={showAuthModal}
      onRequestClose={() => setShowAuthModal(false)}
    >
      {/* Modal content */}
    </Modal>
  );
}
```

### After

```typescript
import { useAuthStore } from "@/stores";

function AuthModal() {
  const showAuthModal = useAuthStore((state) => state.showAuthModal);
  const setShowAuthModal = useAuthStore((state) => state.setShowAuthModal);
  const initiateLogin = useAuthStore((state) => state.initiateLogin);
  const verifyOTP = useAuthStore((state) => state.verifyOTP);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = async () => {
    await initiateLogin(mobile);
  };

  const handleVerify = async () => {
    await verifyOTP(otp, mobile);
  };

  return (
    <Modal
      visible={showAuthModal}
      onRequestClose={() => setShowAuthModal(false)}
    >
      {/* Modal content */}
    </Modal>
  );
}
```

---

## Example 6: Multiple Stores in One Component

### Before

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useStore } from "@/contexts/StoreContext";

function CheckoutScreen() {
  const { user } = useAuth();
  const { location } = useLocation();
  const { cart, cartTotal, selectedVendor } = useStore();

  return (
    <View>
      <Text>User: {user?.name}</Text>
      <Text>Deliver to: {location?.address.city}</Text>
      <Text>Vendor: {selectedVendor?.shopName}</Text>
      <Text>Items: {cart.length}</Text>
      <Text>Total: ₹{cartTotal}</Text>
    </View>
  );
}
```

### After

```typescript
import { useAuthStore, useLocationStore, useStoreStore } from "@/stores";

function CheckoutScreen() {
  const user = useAuthStore((state) => state.user);
  const location = useLocationStore((state) => state.location);
  const cart = useStoreStore((state) => state.cart);
  const cartTotal = useStoreStore((state) => state.cartTotal);
  const selectedVendor = useStoreStore((state) => state.selectedVendor);

  return (
    <View>
      <Text>User: {user?.name}</Text>
      <Text>Deliver to: {location?.address.city}</Text>
      <Text>Vendor: {selectedVendor?.shopName}</Text>
      <Text>Items: {cart.length}</Text>
      <Text>Total: ₹{cartTotal}</Text>
    </View>
  );
}
```

---

## Example 7: Header Component

### Before

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";

function Header() {
  const { user, setShowAuthModal } = useAuth();
  const { cartItemCount } = useStore();

  return (
    <View>
      <Text>{user ? user.name : "Guest"}</Text>
      {!user && <Button title="Login" onPress={() => setShowAuthModal(true)} />}
      <View>
        <Ionicons name="cart" size={24} />
        {cartItemCount > 0 && <Text>{cartItemCount}</Text>}
      </View>
    </View>
  );
}
```

### After

```typescript
import { useAuthStore, useStoreStore } from "@/stores";

function Header() {
  const user = useAuthStore((state) => state.user);
  const setShowAuthModal = useAuthStore((state) => state.setShowAuthModal);
  const cartItemCount = useStoreStore((state) => state.cartItemCount);

  return (
    <View>
      <Text>{user ? user.name : "Guest"}</Text>
      {!user && <Button title="Login" onPress={() => setShowAuthModal(true)} />}
      <View>
        <Ionicons name="cart" size={24} />
        {cartItemCount > 0 && <Text>{cartItemCount}</Text>}
      </View>
    </View>
  );
}
```

---

## Performance Optimization

### Group Related State (Avoid Multiple Subscriptions)

```typescript
// ❌ Less efficient (3 subscriptions)
const user = useAuthStore((state) => state.user);
const loading = useAuthStore((state) => state.loading);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// ✅ More efficient (1 subscription)
const { user, loading, isAuthenticated } = useAuthStore((state) => ({
  user: state.user,
  loading: state.loading,
  isAuthenticated: state.isAuthenticated,
}));
```

### Use Shallow Equality for Objects

```typescript
import { shallow } from "zustand/shallow";

const { user, loading } = useAuthStore(
  (state) => ({
    user: state.user,
    loading: state.loading,
  }),
  shallow
);
```

---

## Quick Migration Checklist

- [ ] Install Zustand: `npm install zustand`
- [ ] Create store files in `stores/` directory
- [ ] Update `app/_layout.tsx` to remove Context Providers
- [ ] Add `<StoreInitializer />` to `_layout.tsx`
- [ ] Update imports in all components
- [ ] Replace `useAuth()` with `useAuthStore((state) => ...)`
- [ ] Replace `useLocation()` with `useLocationStore((state) => ...)`
- [ ] Replace `useStore()` with `useStoreStore((state) => ...)`
- [ ] Add `toast` parameter to `getLiveLocation()` calls
- [ ] Test all functionality
- [ ] Remove old Context files (optional, keep as backup initially)

---

## Common Gotchas

### 1. Toast Instance Required for Location

```typescript
// ❌ Old way
await getLiveLocation(false, null, true);

// ✅ New way
const toast = useToast();
const user = useAuthStore((state) => state.user);
await getLiveLocation(false, null, true, user?.id, toast);
```

### 2. State Updates are Async

```typescript
// ❌ Wrong
addToCart(item);
console.log(cart); // Still old value!

// ✅ Correct
await addToCart(item);
const updatedCart = useStoreStore.getState().cart;
console.log(updatedCart);
```

### 3. Don't Destructure Store Directly

```typescript
// ❌ Wrong (won't re-render)
const store = useAuthStore();
const { user } = store;

// ✅ Correct
const user = useAuthStore((state) => state.user);
```

---

## Testing Your Migration

1. **Auth Flow**: Login, logout, refresh user
2. **Location**: Get location, handle permissions, display address
3. **Cart**: Add items, remove items, update quantities, clear cart
4. **Vendor Selection**: Select vendor, verify cart clears on vendor change
5. **Persistence**: Close app, reopen, verify state is restored
6. **Performance**: Check that components only re-render when needed

---

## Need Help?

Refer to `ZUSTAND.md` for complete documentation and advanced patterns.
