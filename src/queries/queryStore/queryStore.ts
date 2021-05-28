import { UserData } from "../../api/api";
import { createStoreWithImmerMiddleware } from "./createStoreWithImmerMiddleware";

// get data from server
// make changes (now we're modifying the draft)
// save
// now we're displaying the server value
// user keeps editing, now we're displaying/modifying the draft
// server errors
// notify the user

interface QueryStoreState {
  userData: {
    draft?: UserData;
    setDraft: (data?: UserData) => void;
  };
}

export const useQueryStore = createStoreWithImmerMiddleware<QueryStoreState>(
  (set) => ({
    userData: {
      setDraft: (data) => set((state) => void (state.userData.draft = data)),
    },
  })
);
