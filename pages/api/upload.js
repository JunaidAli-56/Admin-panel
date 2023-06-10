import multiparty from 'multiparty';
import cloudinary from 'cloudinary';
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const links = [];
  for (const file of files.file) {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'your_folder_name', // Specify the folder where you want to upload the files
      resource_type: 'auto', // Automatically determine the type of resource being uploaded
      overwrite: true, // Overwrite file if it already exists
    });
    links.push(result.secure_url);
  }

  return res.json({ links });
}

export const config = {
  api: { bodyParser: false },
};
