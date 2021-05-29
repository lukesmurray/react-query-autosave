import { debounce } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { QueryKey, useMutation, useQuery, useQueryClient } from "react-query";

interface useAutoSyncQueryOptions<D> {
  /**
   * the query key for the query
   */
  queryKey: QueryKey;
  /**
   * debounced delay between saves, passed to lodash debounce wait parameter
   */
  debounce_save_delay?: number;
  /**
   * max save between debounced saves
   */
  max_save_delay?: number;
  /**
   * refetch interval for loading the query when the user doesn't have local changes
   */
  auto_load_interval?: number;
  /**
   * the current draft
   */
  draft: D | undefined;
  /**
   * setter for the current draft
   */
  setDraft: (data?: D) => void;
  /**
   * this should be a stable function that gets the current draft.
   * It should not update when the draft changes.
   */
  getDraft: () => D | undefined;

  /**
   * function called to load the data from the server
   */
  queryFn: () => Promise<D | undefined>;

  /**
   * function called to save the data to the server
   */
  mutateFn: (data: D) => Promise<unknown>;
}

/**
 * Create a react query which allows the user to auto load and auto save data
 * from the server
 * @param options
 * @returns
 */
export const useAutoSyncQuery = <D>(options: useAutoSyncQueryOptions<D>) => {
  const {
    queryKey,
    auto_load_interval = 1000,
    debounce_save_delay = 500,
    max_save_delay = Infinity,
    draft,
    setDraft,
    getDraft,
    queryFn,
    mutateFn,
  } = options;

  const queryClient = useQueryClient();

  // request current value from the server
  const queryInfo = useQuery(queryKey, queryFn, {
    enabled: draft === undefined,
    staleTime: Infinity,
    refetchInterval: auto_load_interval,
  });

  // mutation for updating the server value
  const mutation = useMutation(mutateFn, {
    onMutate: async (data) => {
      // cancel outgoing refetches
      await queryClient.cancelQueries(queryKey);

      // snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // optimistically set the new value
      queryClient.setQueryData(queryKey, data);
      // clear the draft
      setDraft(undefined);

      return { previousData };
    },
    onError: (err, data, context) => {
      // reset the server state to the last known state
      queryClient.setQueryData(queryKey, (context as any).previousData);
      // reset the draft to the last known draft unless the user made more changes
      if (draft !== undefined) {
        setDraft(data);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  // create a wrapper function which saves the draft value to the server
  const { mutate } = mutation; // extracted for use in the dependency array
  const save = useCallback(() => {
    // get the draft value directly from the store to avoid stale closure issues
    // while also making the save callback stable across renders
    const draft = getDraft();
    if (draft !== undefined) {
      mutate(draft);
    }
  }, [getDraft, mutate]);

  // create a debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce(
        () => {
          save();
        },
        debounce_save_delay,
        {
          leading: false,
          trailing: true,
          maxWait: max_save_delay,
        }
      ),
    [debounce_save_delay, max_save_delay, save]
  );

  // debounce the save whenever the draft changes
  useEffect(() => {
    debouncedSave();
  }, [debouncedSave, draft]);

  return {
    // user just sees value and setValue similar to useState
    value: draft ?? queryInfo.data,
    setValue: setDraft,
    // user can manually trigger a save
    save,
    queryInfo,
    mutation,
  };
};
