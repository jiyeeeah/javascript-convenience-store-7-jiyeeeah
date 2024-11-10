/* eslint-disable no-param-reassign */
import fs from "fs";

const isNumber = (num) => !Number.isNaN(Number(num));

export const getDataFromFile = async (filePath) => {
  const result = fs.readFileSync(filePath, "utf8", (err, data) => {
    if (err) {
      throw new Error("[ERROR] 파일을 불러오는 과정에서 문제가 생겼습니다. 다시 시도해주세요");
    }
    return data;
  });

  const lines = result.trim().split("\n"); // 파일 내용을 줄 단위로 분리
  const keys = lines[0].split(","); // 첫 줄에서 키 추출
  const products = lines.slice(1).map((line) => {
    const values = line.split(","); // 각 줄을 ','로 분리
    return keys.reduce((object, key, index) => {
      if (isNumber(values[index])) object[key] = Number(values[index]);
      else object[key] = values[index];
      return object;
    }, {});
  });

  return products;
};
