
const demuxChunk = (buffer) => {
  const messages = [];
  let offset = 0;
  while (offset < buffer.length) {
    const type = buffer[offset]; 
    const size = buffer.readUInt32BE(offset + 4); 

    const start = offset + 8;
    const end = start + size;
    const payload = buffer.slice(start, end).toString("utf8");

    if (type === 2) {
      messages.push(payload);
    }

    offset = end;
  }
  return messages;
};

export default demuxChunk