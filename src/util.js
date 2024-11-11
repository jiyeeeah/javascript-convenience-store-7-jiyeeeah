import fs from "fs";
import { ERROR_MESSAGE } from "./constant/message.js";

export const isNumber = (num) => !Number.isNaN(Number(num));

export const splitString = (input, separator) => input.split(separator);

export const isInputWrappedWith = (input, wrapper) =>
  input[0] === wrapper[0] && input[input.length - 1] === wrapper[1];

export const getPromotionCount = (productCount, promoBundleSize, restCount = null) => {
  if (restCount) return Math.floor((productCount + restCount) / promoBundleSize);
  return Math.floor(productCount / promoBundleSize);
};

export const isPromotionShortage = ({ buy, get, promoBundleSize, productCount, restCount }) =>
  productCount % promoBundleSize === buy && restCount > get;

export const getDataFromFile = async (filePath) =>
  fs.readFileSync(filePath, "utf8", (err, data) => {
    if (err) {
      throw new Error(ERROR_MESSAGE.fileReadError);
    }
    return data;
  });

const parseValueInData = (value) => {
  if (isNumber(value)) return Number(value);
  return value;
};

export const parseDataToObjects = (data) => {
  const [keys, ...lines] = data
    .trim()
    .split("\n")
    .map((line) => line.split(","));

  return lines.map((values) =>
    Object.fromEntries(keys.map((key, i) => [key, parseValueInData(values[i])])),
  );
};
