import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(path.dirname(fileURLToPath(import.meta.url))),
  },
};

export default nextConfig;
