import React, { useCallback } from "react";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "./queries/queryClient";
import { useAutoSyncQueryUserData } from "./queries/useAutoQueryGetUserData";

const UserDataEditor = () => {
  const { value, setValue, save } = useAutoSyncQueryUserData();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue({ ...value, name: e.target.value });
    },
    [setValue, value]
  );

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue({ ...value, note: e.target.value });
    },
    [setValue, value]
  );

  const handleSave = useCallback(() => {
    save();
  }, [save]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <span>Name</span>
      <input
        type={"text"}
        value={value?.name ?? ""}
        onChange={handleNameChange}
      ></input>
      <span>Note</span>
      <textarea
        rows={5}
        value={value?.note ?? ""}
        onChange={handleNoteChange}
      ></textarea>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserDataEditor />
      <UserDataEditor />
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}

export default App;
