export type Metadata = {
  focal: string;
  date: string;
  cameraBrand: string;
  cameraModel: string;
  lensModel: string;
  exposure: string;
  aperture: string;
  iso: string;
};

export type Resolution = {
  jpgFile: string;
  webpFile: string;
};

export type ImageOutputs = {
  [res: string]: Resolution;
  original: Resolution
};

export type Image = {
  metadata: Metadata;
  resolutions: ImageOutputs;
  id: string;
};

export type ImageFile = {
  buffer: Buffer;
  file: string;
}
