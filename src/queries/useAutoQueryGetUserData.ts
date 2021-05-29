import { useCallback, useMemo } from "react";
import { getUserData, saveUserData, UserData } from "../api/api";
import { useAutoSyncQuery } from "./helpers/useAutoSyncQuery";
import { useQueryStore } from "./queryStore/queryStore";

export const useAutoSyncQueryUserData = () => {
  const queryKey = useMemo(() => ["user", "data"], []);

  // getter and setter for local draft
  const { draft, setDraft } = useQueryStore(
    useCallback((state) => state.userData, [])
  );

  const getDraft = useMemo(
    () => () => useQueryStore.getState().userData.draft,
    []
  );
  return useAutoSyncQuery({
    getDraft,
    queryKey,
    setDraft,
    draft,
    auto_load_interval: 1 * 1000,
    debounce_save_delay: 3 * 1000,
    max_save_delay: 10 * 1000,
    mutateFn: useCallback((data: UserData) => saveUserData(data), []),
    queryFn: useCallback(() => getUserData(), []),
  });
};
