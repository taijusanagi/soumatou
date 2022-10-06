import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { clearInterval } from "timers";

const apiKey = "3dd9ce614395cd3322afa6b2908b529e2ed3f2a4";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { text } = req.body;
  const { data } = await axios.post(
    "https://api.replicate.com/v1/predictions",
    {
      version:
        "a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef",
      input: { prompt: text },
    },
    {
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    }
  );
  let i = 0;
  const resolved = await new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      const getResult = await axios.get(data.urls.get, {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      });
      if (getResult.data.status === "succeeded") {
        clearInterval(intervalId);
        resolve(getResult.data.output[0]);
      }
      if (i >= 5) {
        clearInterval(intervalId);
        reject();
      }
      console.log(i);
    }, 5000);
  });
  res.status(200).json({ image: resolved });
};

export default handler;
