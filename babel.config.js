module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          envName: "APP_ENV",
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true
        }
      ],
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            /**
             * Regular expression is used to match all files inside `./src` directory and map each `.src/folder/[..]` to `~folder/[..]` path
             */
            "~assets": "./assets",
            "^~(.+)": "./src/\\1"
          },
          extensions: [
            ".ios.js",
            ".android.js",
            ".js",
            ".jsx",
            ".json",
            ".tsx",
            ".ts",
            ".native.js"
          ]
        }
      ],
      "@babel/plugin-proposal-export-namespace-from",
      [
        "react-native-reanimated/plugin",
        {
          relativeSourceLocation: true
        }
      ]
    ]
  };
};
