import ExifReader from 'exifreader';
import { readFileSync, readdirSync, writeJsonSync } from 'fs-extra';
import config from './config';
import { Metadata, ImageFile, ImageOutputs, Resolution, Image } from './image.model';
import sharp from 'sharp';
import { S3 } from 'aws-sdk';
import { S3Params } from './config.model';
import { parse } from 'path';

const getMetadataOfImage = (buffer: Buffer): Metadata => {
  const {
    FocalLength,
    DateTimeOriginal,
    Make,
    Model,
    LensModel,
    ExposureTime,
    FNumber,
    ISOSpeedRatings
  } = ExifReader.load(buffer);

  const date = DateTimeOriginal.description.split(' ')[0].replace(/:/g, '-')

  return {
    focal: FocalLength.description,
    date: new Date(date).toLocaleDateString(),
    cameraBrand: Make.description,
    cameraModel: Model.description,
    lensModel: LensModel.description,
    exposure: ExposureTime.description,
    aperture: FNumber.description,
    iso: ISOSpeedRatings.description
  }
};

const resizeImage = async (image: Buffer, resolution?: number, ) => ({
  jpeg: await sharp(image).resize(resolution).jpeg().toBuffer(),
  webp: await sharp(image).resize(resolution).webp().toBuffer()
})

const processImage = async (s3Config: S3Params, resolutions: number[], { file, buffer }: ImageFile): Promise<ImageOutputs> => {
  const s3client = new S3(s3Config);

  const { jpeg, webp } = await resizeImage(buffer);

  const jpegName = `${parse(file).name}/original.jpeg`;
  const webpName = `${parse(file).name}/original.webp`;

  await Promise.all([
    s3client.putObject({
      Bucket: 'photos',
      Key: jpegName,
      Body: jpeg,
      ContentType: 'image/jpeg'
    }).promise(),

    s3client.putObject({
      Bucket: 'photos',
      Key: webpName,
      Body: webp,
      ContentType: 'image/webp'
    }).promise()
  ]);

  const originalOne: Resolution = {
    jpgFile: `${s3Config.baseUrlResources}/${jpegName}`,
    webpFile: `${s3Config.baseUrlResources}/${webpName}`
  }

  let outputs: ImageOutputs = {
    original: originalOne
  };

  for (const res of resolutions) {
    const { jpeg, webp } = await resizeImage(buffer, res);

    const jpegName = `${parse(file).name}/${res}.jpeg`;
    const webpName = `${parse(file).name}/${res}.webp`;

    await Promise.all([
      s3client.putObject({
        Bucket: 'photos',
        Key: jpegName,
        Body: jpeg,
        ContentType: 'image/jpeg'
      }).promise(),

      s3client.putObject({
        Bucket: 'photos',
        Key: webpName,
        Body: webp,
        ContentType: 'image/webp'
      }).promise()
    ]);

    const output: Resolution = {
      jpgFile: `${s3Config.baseUrlResources}/${jpegName}`,
      webpFile: `${s3Config.baseUrlResources}/${webpName}`
    };

    outputs = {
      ...outputs,
      [res]: output
    }
  }

  return outputs;
};

(async () => {
  const dir = readdirSync(config.imagesPath)
    .filter((el) => el !== '.gitkeep');

  const files: ImageFile[] = dir.map((entry) => ({
    buffer: readFileSync(`${config.imagesPath}/${entry}`),
    file: entry
  }));

  const images: Image[] = await Promise.all(files.map(async (file) => {
    const metadata = getMetadataOfImage(file.buffer);

    const resolutions = await processImage(config.s3, config.resolution, file);

    return {
      metadata,
      resolutions,
      id: parse(file.file).name
    }
  }));

  writeJsonSync('./outputs.json', images, {
    spaces: 2
  });

  console.log('Output written in ./outputs.json');

  return images;
})();
