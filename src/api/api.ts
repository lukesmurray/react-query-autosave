export interface UserData {
  name?: string;
  note?: string;
}

export const saveUserData = (userData: UserData) =>
  fetch("/saveUserData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }).then((res) => res.ok);

export const getUserData = () =>
  fetch("/getUserData").then((res) => res.json() as UserData);
