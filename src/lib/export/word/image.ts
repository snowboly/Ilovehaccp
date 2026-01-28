type ImageDimensions = { width: number; height: number };

const toBuffer = (data: ArrayBuffer | Buffer) => (Buffer.isBuffer(data) ? data : Buffer.from(new Uint8Array(data)));

const readUInt24LE = (buffer: Buffer, offset: number) =>
  buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);

const getPngSize = (buffer: Buffer): ImageDimensions | null => {
  if (buffer.length < 24) return null;
  const signature = buffer.readUInt32BE(0);
  if (signature !== 0x89504e47) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

const getJpegSize = (buffer: Buffer): ImageDimensions | null => {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const blockLength = buffer.readUInt16BE(offset + 2);
    const isSOF =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isSOF && offset + 7 < buffer.length) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + blockLength;
  }
  return null;
};

const getWebpSize = (buffer: Buffer): ImageDimensions | null => {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8X") {
    const width = 1 + readUInt24LE(buffer, 24);
    const height = 1 + readUInt24LE(buffer, 27);
    return { width, height };
  }
  if (chunkType === "VP8L") {
    const width = 1 + ((buffer[21] | ((buffer[22] & 0x3f) << 8)) & 0x3fff);
    const height = 1 + ((((buffer[22] & 0xc0) >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x0f) << 10)) & 0x3fff);
    return { width, height };
  }
  return null;
};

export const getImageDimensions = (data: ArrayBuffer | Buffer): ImageDimensions | null => {
  const buffer = toBuffer(data);
  return getPngSize(buffer) || getJpegSize(buffer) || getWebpSize(buffer);
};

export const scaleToFit = (
  dimensions: ImageDimensions,
  maxWidth: number,
  maxHeight: number
): ImageDimensions => {
  const widthRatio = maxWidth / dimensions.width;
  const heightRatio = maxHeight / dimensions.height;
  const scale = Math.min(widthRatio, heightRatio, 1);
  return {
    width: Math.max(1, Math.round(dimensions.width * scale)),
    height: Math.max(1, Math.round(dimensions.height * scale)),
  };
};
