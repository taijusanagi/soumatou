import { atom } from "recoil";

export const mapState = atom({
  key: "mapState",
  default: "3d",
});

export const isIntervalOn = atom({
  key: "isIntervalOn",
  default: false,
});

export const locationState = atom({
  key: "location",
  default: {
    lat: 0,
    lng: 0,
  },
});

export const currentLocationState = atom<{ lat?: number; lng?: number }>({
  key: "currentLocation",
  default: {
    lat: undefined,
    lng: undefined,
  },
});
