import fs from "fs";

export const isNumber = (num) => !Number.isNaN(Number(num));

export const splitString = (input, separator) => input.split(separator);

export const isInputWrappedWith = (input, wrapper) =>
  input[0] === wrapper[0] && input[input.length - 1] === wrapper[1];

export const getDataFromFile = async (filePath) =>
  fs.readFileSync(filePath, "utf8", (err, data) => {
    if (err) {
      throw new Error("[ERROR] 파일을 불러오는 과정에서 문제가 생겼습니다. 다시 시도해주세요");
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
