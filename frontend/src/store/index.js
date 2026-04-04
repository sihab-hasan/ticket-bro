import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import messagingReducer from "./slices/messagingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    messaging: messagingReducer,
  },
  middleware: (g) => g({ serializableCheck: false }),
});
