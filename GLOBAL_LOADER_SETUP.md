# Global Loader Integration Guide

## Overview

A global loading overlay that displays during data fetching, authentication operations, and async operations. The loader shows across the entire application with a backdrop blur effect and optional loading message.

## ✅ What's Already Integrated

### 1. **Sign In Form** ✨

- Automatically shows loader during login with "Signing in..." message
- File: `src/components/refine-ui/form/sign-in-form.tsx`

### 2. **Sign Up Form** ✨

- Automatically shows loader during registration with "Creating account..." message
- File: `src/components/refine-ui/form/sign-up-form.tsx`

### 3. **Global Loader Component**

- Fixed position overlay that appears across the entire app
- Shows centered spinner with optional message
- Semi-transparent dark background with backdrop blur
- Z-index: 9999 (highest layer)

## 🚀 How to Use

### Option 1: Automatic Integration with Mutations (Recommended)

For **create**, **update**, **delete** operations, use the `useGlobalLoaderWithMutation` hook:

```typescript
import { useCreate } from "@refinedev/core";
import { useGlobalLoaderWithMutation } from "@/hooks/use-global-loader";

export const MyComponent = () => {
  const { mutate, isPending } = useCreate();

  // Hook will automatically manage the global loader
  useGlobalLoaderWithMutation(isPending, "Creating item...");

  const handleCreate = () => {
    mutate({ resource: "items", values: { name: "Test" } });
  };

  return <button onClick={handleCreate}>Create</button>;
};
```

### Option 2: Manual Control

For custom async operations, use the `useManualGlobalLoader` hook:

```typescript
import { useManualGlobalLoader } from "@/hooks/use-global-loader";

export const MyComponent = () => {
  const { show, hide } = useManualGlobalLoader();

  const handleCustomAsync = async () => {
    show("Processing your request...");

    try {
      // Your async operation
      await someAsyncOperation();
    } finally {
      hide();
    }
  };

  return <button onClick={handleCustomAsync}>Process</button>;
};
```

### Option 3: Without Message

Show loader without a message:

```typescript
const { show, hide } = useManualGlobalLoader();

show(); // Shows loader without message
```

## 📁 File Structure

```
src/
├── context/
│   └── global-loader-context.tsx       # Context & Provider
├── components/
│   └── global-loader.tsx               # Global Loader UI
├── hooks/
│   └── use-global-loader.ts            # Hooks for integration
└── App.tsx                             # Wrapped with GlobalLoaderProvider
```

## 🔧 Integration Steps

The app is already set up with:

1. **GlobalLoaderProvider** wraps the entire app in `App.tsx`
2. **GlobalLoader** component renders the UI inside the Refine component
3. **Hooks** available for use in any component

## 💡 Common Use Cases

### Create/Update/Delete Operations

```typescript
import { useCreate, useUpdate, useDelete } from "@refinedev/core";
import { useGlobalLoaderWithMutation } from "@/hooks/use-global-loader";

export const ClassesCreate = () => {
  const { mutate: createClass, isPending } = useCreate();
  useGlobalLoaderWithMutation(isPending, "Creating class...");

  const onSubmit = (values) => {
    createClass({ resource: "classes", values });
  };

  // Component JSX
};
```

### Delete Operations

```typescript
const { mutate: deleteItem, isPending } = useDelete();
useGlobalLoaderWithMutation(isPending, "Deleting item...");
```

### List Operations

For list operations, you typically don't need a global loader (use local loading state), but if needed:

```typescript
const { query } = useList<Item>({
  resource: "items",
});

// Manual control for complex scenarios
const { show, hide } = useManualGlobalLoader();

useEffect(() => {
  if (query.isLoading) {
    show("Loading items...");
  } else {
    hide();
  }
}, [query.isLoading]);
```

## 🎨 Customization

### Change Loader Appearance

Edit `src/components/global-loader.tsx`:

```typescript
// Change spinner size
<Loader2 className="h-12 w-12 animate-spin text-white" />

// Change background color/opacity
<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">

// Change spinner color
<Loader2 className="h-12 w-12 animate-spin text-white" />

// Change message styling
{message && (
  <p className="text-white text-center text-sm font-medium max-w-xs">
    {message}
  </p>
)}
```

### Change Message Text

Simply pass different text to the hook:

```typescript
useGlobalLoaderWithMutation(isPending, "Your custom message here");
```

## ⚠️ Important Notes

- **Don't use for page transitions** - Use the browser's native loading or page-level loaders
- **Message is optional** - Can call `show()` without message
- **Automatic cleanup** - Always wrapped in try/finally to ensure loader stops
- **Multiple loaders** - Only one loader shows at a time (last one takes precedence)
- **Z-index** - Set to 9999, ensure no other elements have higher z-index

## 📝 Examples

### Authentication (Already Integrated)

```typescript
// Login - auto-managed via form
const { mutate: login, isPending } = useLogin();
useGlobalLoaderWithMutation(isPending, "Signing in...");
```

### Class Creation

```typescript
export const ClassesCreate = () => {
  const { mutate, isPending } = useCreate();
  useGlobalLoaderWithMutation(isPending, "Creating class...");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({ resource: "classes", values: formData });
      }}
    >
      {/* Form fields */}
    </form>
  );
};
```

### Attendance Marking

```typescript
export const MarkAttendance = () => {
  const { mutate: createAttendance, isPending } = useCreate();
  useGlobalLoaderWithMutation(isPending, "Marking attendance...");

  return (
    <button
      onClick={() => {
        createAttendance({
          resource: "attendance",
          values: attendanceData,
        });
      }}
    >
      Mark Attendance
    </button>
  );
};
```

## 🐛 Troubleshooting

### Loader doesn't appear

1. Check if `GlobalLoaderProvider` wraps the app in `App.tsx`
2. Verify `GlobalLoader` component is inside the `Refine` component
3. Check browser console for errors
4. Verify hook is imported correctly

### Loader doesn't disappear

1. Check if `isPending` state is properly connected to the hook
2. Ensure the async operation completes (check for hanging promises)
3. Check browser console for errors

### Multiple loaders stacking

- The context manages one global loader
- Only the latest call updates the state
- Ensure proper cleanup with try/finally

## 📚 API Reference

### useGlobalLoaderWithMutation

```typescript
useGlobalLoaderWithMutation(isLoading: boolean, message?: string)
```

**Parameters:**

- `isLoading` - Boolean state from mutation hook (isPending)
- `message` - Optional loading message to display

**Example:**

```typescript
useGlobalLoaderWithMutation(isPending, "Processing...");
```

### useManualGlobalLoader

```typescript
const { show, hide } = useManualGlobalLoader();
```

**Methods:**

- `show(message?: string)` - Show loader with optional message
- `hide()` - Hide loader

**Example:**

```typescript
show("Loading data...");
// ... async operation
hide();
```

### useGlobalLoader (Context Hook)

```typescript
const {
  isLoading,
  setIsLoading,
  message,
  setMessage,
  startLoading,
  stopLoading,
} = useGlobalLoader();
```

**Properties:**

- `isLoading` - Current loader state
- `setIsLoading` - Set loading state
- `message` - Current message
- `setMessage` - Set message
- `startLoading()` - Start loading
- `stopLoading()` - Stop loading

## 🎯 Best Practices

1. ✅ Always use `useGlobalLoaderWithMutation` for refine mutations
2. ✅ Use `useManualGlobalLoader` for custom async operations
3. ✅ Always wrap with try/finally to ensure cleanup
4. ✅ Provide meaningful messages for better UX
5. ❌ Don't use for non-blocking operations
6. ❌ Don't disable the loader manually without reason
7. ❌ Don't show multiple messages (use one clear message)
