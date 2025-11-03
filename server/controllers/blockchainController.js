import blockchain from '../models/Blockchain.js'

export const getBlockchain = async (req, res) => {
  const chain = blockchain.getChain()
  res.json({ blocks: chain })
}

export const verifyBlockchain = async (req, res) => {
  await blockchain.reload()
  const result = blockchain.isValidChain()
  res.json({ status: result.valid ? 'ok' : 'invalid', details: result })
}

export default {
  getBlockchain,
  verifyBlockchain,
}
