import msgpack from "msgpack-lite";

const serialize = (json) => {
  let str = null;

  try {
    const packed = msgpack.encode(json);
    str = packed.reduce((arr, b) => {
      arr.push(Number(b).toString(16).padStart(2, "0"));
      return arr;
    }, []).join("");
  } catch (e) {
  }

  return str;
};

const deserialize = (str) => {
  let json = null;

  try {
    const arr = str.split("").reduce((arr, b, i) => {
      if (i%2) {
        arr[arr.length-1] += b;
      } else {
        arr.push(b);
      }
      return arr;
    }, []).map((b) => parseInt(b, 16));
    json = msgpack.decode(arr);
  } catch (e) {
  }

  return json;
};

export default {
  serialize,
  deserialize,
}
