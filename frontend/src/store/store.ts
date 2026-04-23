import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/features/auth.slice";
import { persistStore, persistReducer } from "redux-persist";
import sessionStorage from "redux-persist/es/storage/session";

const rootReducer = combineReducers({
  auth: authSlice,
});

const persistConfig = {
  key: "root",
  storage: sessionStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
