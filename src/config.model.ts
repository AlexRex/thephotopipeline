export type S3Params = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint: string;
  baseUrlResources: string;
};

export type Config = {
  imagesPath: string;
  resolution: number[];
  s3: S3Params
};
