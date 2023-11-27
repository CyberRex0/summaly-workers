export async function streamToArrayBuffer(stream) {
    const chunks = [];
    const reader = stream.getReader();
  
    try {
      while (true) {
        const { done, value } = await reader.read();
  
        if (done) {
          break;
        }
  
        chunks.push(value);
      }
  
      const arrayBuffer = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
  
      let offset = 0;
      for (const chunk of chunks) {
        arrayBuffer.set(chunk, offset);
        offset += chunk.length;
      }
  
      return arrayBuffer;
    } finally {
      reader.releaseLock();
    }
}

export async function streamToString(stream) {
  const textDecoder = new TextDecoder('utf-8');
  const reader = stream.getReader();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      result += textDecoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}