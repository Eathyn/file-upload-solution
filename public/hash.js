// 导入脚本
// import script for encrypted computing
self.importScripts('/spark-md5.min.js')

// 生成文件 hash
// create file hash
self.onmessage = (e) => {
  const { fileChunkList } = e.data
  generateHashValue(fileChunkList)
}

function generateHashValue(fileChunkList) {
  // SparkMD5 is a fast md5 implementation of the MD5 algorithm.
  // 使用 MD5 算法根据文件生成哈希值
  const spark = new self.SparkMD5.ArrayBuffer()
  let percentage = 0
  let count = 0
  const loadNext = (index) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(fileChunkList[index].file)
    reader.onload = () => {
      count++
      // 每个切片都调用 `append` 可以使占用内存空间更小：
      // Incremental md5 performs a lot better for hashing large amounts of data, such as files.
      // Append each chunk for md5 hashing while keeping memory usage low.
      spark.append(reader.result)
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,
          // Finishes the computation of the md5, returning the hex result.
          hash: spark.end(),
        })
        self.close()
      } else {
        percentage += 100 / fileChunkList.length
        self.postMessage({
          percentage,
        })
        loadNext(count)
      }
    }
  }
  loadNext(0)
}
