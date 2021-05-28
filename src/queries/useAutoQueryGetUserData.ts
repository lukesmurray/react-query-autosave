import { useCallback, useMemo } from "react";
import { useQueryStore } from "./queryStore/queryStore";
import { useAutoLoadQuery } from "./useAutoloadQuery";

export const useAutoQueryGetUserData = () => {
  const queryKey = useMemo(() => ["user", "data"], []);

  // getter and setter for local draft
  const { draft, setDraft } = useQueryStore(
    useCallback((state) => state.userData, [])
  );

  const getDraft = useMemo(
    () => () => useQueryStore.getState().userData.draft,
    []
  );
  return useAutoLoadQuery({
    getDraft,
    queryKey,
    setDraft,
    draft,
    auto_load_interval: 1 * 1000,
    debounce_save_delay: 3 * 1000,
    max_save_delay: 10 * 1000,
  });
};
