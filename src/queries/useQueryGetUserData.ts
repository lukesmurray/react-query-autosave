import { debounce } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getUserData, saveUserData, UserData } from "../api/api";
import { useQueryStore } from "./queryStore/queryStore";

const AUTO_SAVE_TIME = 3 * 1000;
const MAX_AUTO_SAVE_TIME = 10 * 1000;
const AUTO_LOAD_TIME = 1 * 1000;

export const useQueryGetUserData = () => {
  const queryKey = ["user", "data", "get"];

  // getter and setter for local draft
  const { draft, setDraft } = useQueryStore(
    useCallback((state) => state.userData, [])
  );

  const queryClient = useQueryClient();

  // request current value from the server
  const queryInfo = useQuery(
    queryKey,
    useCallback(() => getUserData(), []),
    {
      enabled: draft === undefined,
      staleTime: Infinity,
      refetchInterval: AUTO_LOAD_TIME,
    }
  );

  // mutation for updating the server value
  const mutation = useMutation(
    useCallback((userData: UserData) => saveUserData(userData), []),
    {
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
    }
  );

  // create a wrapper function which saves the draft value to the server
  const { mutate } = mutation; // extracted for use in the dependency array
  const save = useCallback(() => {
    // get the draft value directly from the store to avoid stale closure issues
    // while also making the save callback stable across renders
    const draft = useQueryStore.getState().userData.draft;
    if (draft !== undefined) {
      console.log("saving draft", draft);
      mutate(draft);
    }
  }, [mutate]);

  // create a debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce(
        () => {
          save();
        },
        AUTO_SAVE_TIME,
        {
          leading: false,
          trailing: true,
          maxWait: MAX_AUTO_SAVE_TIME,
        }
      ),
    [save]
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
