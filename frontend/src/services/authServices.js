import { client } from "./client";

// login logic
const login = async (email, password) => {
  return await client
    .post("auth/login", { email, password })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
};

// registration logic
const register = async (fullname, email, password) => {
  return await client
    .post("auth/register", {
      fullname,
      email,
      password,
    })
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

export { login, register };
