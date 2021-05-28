import { rest } from "msw";

export const handlers = [
  rest.post("/saveUserData", (req, res, ctx) => {
    localStorage.setItem("userData", JSON.stringify(req.body));
    return res(ctx.status(200));
  }),
  rest.get("/getUserData", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(JSON.parse(localStorage.getItem("userData") ?? "null") ?? {})
    );
  }),
];
