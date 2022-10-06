import { File, NFTStorage } from "nft.storage";

const client = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGIyNTFlMzc5NDQ0ZTgwNDg1ZWY2MEM1NEZkOGVGMGMxMzUyOGRBYTYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MDcxOTQ5MTg2NSwibmFtZSI6IldlYjNJbmlmaW5pdHlIYWNrYXRob24ifQ.RyQLZnrOLQILqW9ApOufGyvcB-nj3sW0QkLPxQlmG4U",
});

const toBuffer = async (imgurl: string) => {
  const data = await fetch(imgurl);
  return data.blob();
};

export const file = async (
  data: string,
  file: string,
  type: "image/png" | "model/gltf+json"
) => {
  const _file = type === "image/png" ? await toBuffer(data) : data;
  return new File([_file], file, { type });
};

export const metadata = async (
  name: string,
  description: string,
  image: File,
  animation_url: File,
  latitude: number,
  longitude: number
) => {
  const data = await client.store({
    name,
    description,
    image,
    animation_url,
    attributes: [
      {
        trait_type: "Latitude",
        value: latitude.toString(),
      },
      {
        trait_type: "Longitude",
        value: longitude.toString(),
      },
    ],
  });

  return {
    uri: data.url as string,
    imageURI: data.data.image.href,
    modelURI: data.data.animation_url.href,
  };
};
