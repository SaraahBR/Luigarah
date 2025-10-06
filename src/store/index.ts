import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

import { wishlistReducer } from "./wishlistSlice";
import { cartReducer } from "./cartSlice";

// RTK Query (endpoints bolsas/roupas/sapatos)
import { productsApi } from "./productsApi";

const rootReducer = combineReducers({
  wishlist: wishlistReducer,
  cart: cartReducer,
  // RTK Query reducer
  [productsApi.reducerPath]: productsApi.reducer,
});

const persistConfig = {
  key: "luigara:redux",
  storage,
  whitelist: ["wishlist", "cart"],
  blacklist: [productsApi.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(productsApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// Tipos
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
