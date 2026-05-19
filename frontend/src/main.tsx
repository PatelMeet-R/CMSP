import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { persistor, store } from "@/store/store.ts";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import { hydrationComplete } from "@/store/features/auth.slice";

const queryClient = new QueryClient();

/**
 * Called after redux-persist finishes rehydrating state from sessionStorage.
 * This tells our AuthGuard that the persisted state has been loaded and
 * it can stop showing the loading spinner.
 */
function onBeforeLift() {
  store.dispatch(hydrationComplete());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={onBeforeLift}
        >
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
          />
          <App />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
