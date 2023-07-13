import React, { useEffect, useState } from "react";
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiLogOut,
  FiUpload,
  FiMail,
  FiDownload,
  FiX,
} from "react-icons/fi";
import { getFiles, uploadFile } from "../services/fileServices";

const Dashboard = () => {
  const [files, setFiles] = useState({
    images: [],
    audio: [],
    video: [],
    pdf: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await getFiles();
      if (res?.success) {
        const { data } = res;
        console.log(data);
        const imageFiles = data.filter((file) =>
          file.contentType.startsWith("image/")
        );
        const audioFiles = data.filter((file) =>
          file.contentType.startsWith("audio/")
        );
        const videoFiles = data.filter((file) =>
          file.contentType.startsWith("video/")
        );
        const pdfFiles = data.filter((file) =>
          file.contentType.startsWith("application/pdf")
        );
        setFiles((prevFiles) => ({
          ...prevFiles,
          images: imageFiles,
          audio: audioFiles,
          video: videoFiles,
          pdf: pdfFiles,
        }));
        console.log(files);
      }
    };
    fetchFiles();
  }, []);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
  };

  const handleFileUpload = (event) => {
    const newFile = event.target.files[0];
    setSelectedFile(newFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const res = await uploadFile(title, description, selectedFile);

    alert(res);
    // Clear the form fields and close the modal
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    closeModal();
  };

  return (
    <>
      <aside className="fixed top-0 left-0 z-40 w-56 h-screen transition-transform sm:translate-x-0">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <p className="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <FiHome className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ml-3">Dashboard</span>
              </p>
            </li>
            <li>
              <p className="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <FiUsers className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ml-3 whitespace-nowrap">Users</span>
              </p>
            </li>
            <li>
              <p className="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <FiLogOut className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ml-3 whitespace-nowrap">Sign Out</span>
              </p>
            </li>
          </ul>
        </div>
      </aside>

      {localStorage.getItem("role") === "admin" ? (
        <div className="flex justify-end mt-4 mr-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium leading-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            onClick={openModal}
          >
            <FiUpload className="mr-2" />
            Upload Files
          </button>
        </div>
      ) : null}
      <div className="w-4/5 float-right gap-4 mt-8 mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
        {Object.entries(files).map(([fileType, fileList]) => (
          <div key={fileType}>
            <h2 className="text-xl font-medium mb-4">
              {fileType.toUpperCase()}
            </h2>

            {fileList.map((file, index) => (
              <div key={index} className="shadow-lg rounded-lg mb-7">
                {file.contentType.includes("image") && (
                  <div>
                    <img
                      src={file.url}
                      alt={`File ${index}`}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <h1>{file.title}</h1>
                    <p>{file.description}</p>
                    <div className="flex items-center gap-2">
                      <FiMail />
                      <span>{file.emailCount} emailed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiDownload />
                      <span>{file.downloadCount} downloaded</span>
                    </div>
                  </div>
                )}
                {file.contentType.includes("audio") && (
                  <div className="p-4">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-white">
                      Audio File
                    </h3>
                    <audio
                      src={file.url}
                      controls
                      className="w-full mt-2"
                    ></audio>
                  </div>
                )}
                {file.contentType.includes("video") && (
                  <div className="p-4 mb-7">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-white">
                      Video File
                    </h3>
                    <video
                      src={file.url}
                      controls
                      className="w-full mt-2"
                    ></video>
                  </div>
                )}
                {file.contentType.includes("application/pdf") && (
                  <div className="p-4 mb-7">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-white">
                      PDF File
                    </h3>
                    <iframe
                      src={file.url}
                      title={`File ${index}`}
                      className="w-full h-64 mt-2"
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mx-4 md:mx-auto">
            <button
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={closeModal}
              type="button"
            >
              <FiX className="w-3 h-3" />
              <span className="sr-only">Close modal</span>
            </button>
            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
              Upload File
            </h3>
            <form
              className="space-y-6"
              encType="multipart/form-data"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="file"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  id="file"
                  onChange={handleFileUpload}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={handleSubmit}
              >
                Upload
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
