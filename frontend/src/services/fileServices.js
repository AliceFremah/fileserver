import { client } from "./client";

// login logic
const getFiles = async () => {
  return await client
    .get("file")
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
};

// registration logic
const uploadFile = async (title, description, file) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("file", file);
  console.log(formData);
  console.log(formData.data);
  return await client
    .post("file/upload/", formData)
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

export { getFiles, uploadFile };
