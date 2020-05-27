# The Photo Pipeline

The idea behind this project is to have a processing pipeline for publishing pictures to my own gallery at [Photos](https://alextorres.me/photos). 

## Pipeline steps

1. Read (jpg, jpeg, png) files in directory /pictures
2. Extract metadata (camera settings, date, etc)
3. Resize in configured resolutions
4. Export JSON with details

## Usage

If you need to push the results to an S3 compatible storage you must need to copy `src/config.example.ts` to `src/config.ts` and update the s3 variables. 
