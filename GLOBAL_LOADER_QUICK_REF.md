# Global Loader - Quick Reference

## 🎯 Quick Start

### 1. For Login/Registration (Auto - Already Setup ✅)
Login and Registration forms automatically show the loader!

### 2. For Create/Update/Delete Operations

```typescript
import { useCreate } from "@refinedev/core";
import { useGlobalLoaderWithMutation } from "@/hooks/use-global-loader";

export const MyComponent = () => {
  const { mutate, isPending } = useCreate();
  useGlobalLoaderWithMutation(isPending, "Creating...");

  return (
    <button onClick={() => mutate({ resource: "items", values: data })}>
      Create
    </button>
  );
};
```

### 3. For Logout

```typescript
import { LogoutButton } from "@/components/refine-ui/buttons/logout";

// Use anywhere in your app
<LogoutButton />
```

### 4. For Custom Async Operations

```typescript
import { useManualGlobalLoader } from "@/hooks/use-global-loader";

const { show, hide } = useManualGlobalLoader();

const handleAsync = async () => {
  show("Processing...");
  try {
    await myAsyncFunction();
  } finally {
    hide();
  }
};
```

## 📦 What's Available

| Component/Hook | Purpose | Usage |
|---|---|---|
| `GlobalLoader` | UI Component | Auto - renders in App.tsx |
| `GlobalLoaderProvider` | Context Provider | Auto - wraps app in App.tsx |
| `useGlobalLoaderWithMutation` | Auto loader hook | Use with mutations |
| `useManualGlobalLoader` | Manual loader hook | Use for custom async |
| `LogoutButton` | Logout with loader | Use in navbar/menu |

## 🎨 What It Looks Like

```
┌─────────────────────────────────────────┐
│                                         │
│       [Dark Semi-Transparent Overlay]   │
│                                         │
│              ⟳ Spinner                  │
│          "Signing in..."                │
│                                         │
└─────────────────────────────────────────┘
```

## ⚡ Features

✅ Global coverage (entire app)
✅ Optional custom messages
✅ Smooth backdrop blur effect
✅ Auto-cleanup with mutations
✅ Works with all HTTP methods (GET, POST, PUT, DELETE)
✅ No conflicts with existing loading states
✅ Zero-config for auth operations

## 🔗 Files Modified

- ✅ `src/App.tsx` - Added GlobalLoaderProvider & GlobalLoader
- ✅ `src/components/refine-ui/form/sign-in-form.tsx` - Added hook
- ✅ `src/components/refine-ui/form/sign-up-form.tsx` - Added hook

## 🆕 Files Created

- ✨ `src/context/global-loader-context.tsx` - Context & provider
- ✨ `src/components/global-loader.tsx` - Loader UI
- ✨ `src/hooks/use-global-loader.ts` - Integration hooks
- ✨ `src/components/refine-ui/buttons/logout.tsx` - Logout button
- 📚 `GLOBAL_LOADER_SETUP.md` - Full documentation
- 📚 `GLOBAL_LOADER_QUICK_REF.md` - This file

## 🎓 Examples

### Example 1: Create Class with Loader
```typescript
const ClassesCreate = () => {
  const { mutate, isPending } = useCreate();
  useGlobalLoaderWithMutation(isPending, "Creating class...");

  const onSubmit = (data) => {
    mutate({ resource: "classes", values: data });
  };
};
```

### Example 2: Delete with Loader
```typescript
const { mutate: delete, isPending } = useDelete();
useGlobalLoaderWithMutation(isPending, "Deleting...");

button.onClick = () => delete({ resource: "items", id: 123 });
```

### Example 3: Update with Loader
```typescript
const { mutate: update, isPending } = useUpdate();
useGlobalLoaderWithMutation(isPending, "Updating...");

update({ resource: "items", id: 123, values: newData });
```

### Example 4: Custom Async
```typescript
const { show, hide } = useManualGlobalLoader();

const importData = async (file) => {
  show("Importing data...");
  try {
    await uploadFile(file);
  } finally {
    hide();
  }
};
```

### Example 5: Logout
```typescript
import { LogoutButton } from "@/components/refine-ui/buttons/logout";

// In navbar
<LogoutButton />
```

## 🚀 Next Steps

1. Use `useGlobalLoaderWithMutation` in all create/update/delete operations
2. Use `useManualGlobalLoader` for custom async operations
3. Replace logout buttons with `LogoutButton` component
4. Test the loader in sign-in, sign-up, and other operations

## 💻 No Changes Needed To:

- ✅ API calls (handled automatically)
- ✅ Data fetching with useList (optional, local loading better)
- ✅ Page navigation (handled by router)
- ✅ Existing components (unless you want to add loader)

## 📞 Support

For detailed setup and customization, see `GLOBAL_LOADER_SETUP.md`
