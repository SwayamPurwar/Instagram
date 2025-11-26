import ImageKit from "imagekit";
import config from "../config/config.js";

var imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadFile(file, filename) {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.buffer, // required
        fileName: filename, // required
        folder: "Instagram", // optional
      },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}
