import { Config } from './config.model';

const config: Config = {
  imagesPath: `${process.env.PWD}/images`,
  resolution: [
    256,
    1080
  ],
  s3: {
    accessKeyId: '**',
    secretAccessKey: '**',
    region: '**',
    endpoint: '**',
    baseUrlResources: '**'
  }
}

export default config;
