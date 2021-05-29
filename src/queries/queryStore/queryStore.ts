import { UserData } from "../../api/api";
import { createStoreWithImmerMiddleware } from "./helpers/createStoreWithImmerMiddleware";

/**
 * Interface for data which supports useAutoLoadQuery
 */
interface AutoLoadQueryDraft<D> {
  draft?: D;
  setDraft: (data?: D) => void;
}

/**
 * The query store state
 */
interface QueryStoreState {
  userData: AutoLoadQueryDraft<UserData>;
}

/**
 * create the query store for the application
 */
export const useQueryStore = createStoreWithImmerMiddleware<QueryStoreState>(
  (set) => ({
    userData: {
      setDraft: (data) => set((state) => void (state.userData.draft = data)),
    },
  })
);
