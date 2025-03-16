import JSEncrypt from 'jsencrypt'

export function encryptPassword(password) {
  const publicKey = `30819f300d06092a864886f70d010101050003818d0030818902818100e3b6b057fbc4dab156c364b57ed0474c48781caf2e653c1b7a81a8372c69bd91c176188fcc4e785c40d6b44adfd0f8e17808e08da09d8f62fcf4a1a741bb6009efc18ed42309e4465b4d3d285d0af80c966b6a2a83a016ca5f467f182c1aa209d763f6076f5ce4c1991f9cdc623a7a54ed21595a69ecd3dd9ce1932a28b1931d0203010001`
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(password)
}
