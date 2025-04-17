const transformPackages = [
    "react-native",
    "@react-native",
    "@react-navigation",
    "@expo",
    "expo",
    "expo-asset",
    "expo-constants", // ✅ NEW
    "expo-router",
    "expo-modules-core",
    "react-native-google-places-autocomplete",
    "uuid"
  ];
  
  module.exports = {
    preset: "jest-expo",
    setupFiles: ["./jestSetup.js"],
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest"
    },
    transformIgnorePatterns: [
      `node_modules/(?!((${transformPackages.join("|")})/))`
    ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
  };
  