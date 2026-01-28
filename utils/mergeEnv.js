function mergeEnv(newEnv, oldEnv) {
  console.log(newEnv);
  console.log(oldEnv);
  const incomingMap = new Map();
  newEnv.forEach((env) => {
    let [key, ...rest] = env.split("=");
    if (incomingMap.has(key)) {
      throw new Error(`Duplicate env key: ${key}`);
    }
    incomingMap.set(key, rest.join("="));
  });

  const result = oldEnv
    .map((old) => {
      let [key, ...oldRest] = old.split("=");
      let oldVal = oldRest.join("=");

      if (!incomingMap.has(key)) {
        return old;
      }

      let newVal = incomingMap.get(key);

      if (newVal === "DELETE") {
        if (key.toLowerCase().includes("const")) {
          return `${key}=${oldVal}`;
        }
        return null;
      }

      if (key.toLowerCase().includes("secret") && newVal === "**********") {
        return old;
      }

      if (key.toLowerCase().includes("const") && newVal !== oldVal) {
        return `${key}=${oldVal}`;
      }

      return `${key}=${newVal}`;
    })
    .filter(Boolean);
    console.log(result);

  incomingMap.forEach((value, key) => {
    const exist = oldEnv.some((env) => env.startsWith(key + "="));
    if (!exist) {
      result.push(`${key}=${value}`);
    }
  });
  console.log("on Function :",result)
  return result;
}

export default mergeEnv;
