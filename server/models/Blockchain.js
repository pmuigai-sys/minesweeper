import crypto from 'crypto'
import { all, run } from './db.js'
import config from '../config/config.js'

export class Blockchain {
  constructor(difficulty = config.powDifficulty) {
    this.chain = []
    this.difficulty = difficulty
  }

  async init() {
    const blocks = await all('SELECT * FROM blocks ORDER BY block_index ASC')
    if (blocks.length === 0) {
      const genesisBlock = this.createGenesisBlock()
      await this.persistBlock(genesisBlock)
      this.chain = [genesisBlock]
    } else {
      this.chain = blocks.map((block) => this.mapDbBlock(block))
    }
    return this
  }

  mapDbBlock(block) {
    return {
      index: block.block_index,
      timestamp: block.timestamp,
      hash: block.hash,
      previousHash: block.previous_hash,
      nonce: block.nonce,
      vote: JSON.parse(block.data),
    }
  }

  createGenesisBlock() {
    const genesis = {
      index: 0,
      timestamp: new Date().toISOString(),
      previousHash: '0'.repeat(64),
      nonce: 0,
      vote: { message: 'Genesis block' },
    }
    genesis.hash = this.calculateHash(genesis)
    return genesis
  }

  calculateHash({ index, previousHash, timestamp, vote, nonce }) {
    return crypto
      .createHash('sha256')
      .update(`${index}${previousHash}${timestamp}${JSON.stringify(vote)}${nonce}`)
      .digest('hex')
  }

  mineBlock(block) {
    let hashed = this.calculateHash(block)
    while (!hashed.startsWith('0'.repeat(this.difficulty))) {
      block.nonce += 1
      hashed = this.calculateHash(block)
    }
    block.hash = hashed
    return block
  }

  async addBlock(votePayload) {
    const previous = this.chain[this.chain.length - 1]
    const block = {
      index: previous.index + 1,
      timestamp: new Date().toISOString(),
      previousHash: previous.hash,
      nonce: 0,
      vote: votePayload,
    }
    this.mineBlock(block)
    await this.persistBlock(block)
    this.chain.push(block)
    return block
  }

  async persistBlock(block) {
    await run(
      `INSERT INTO blocks (block_index, timestamp, hash, previous_hash, nonce, data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [block.index, block.timestamp, block.hash, block.previousHash, block.nonce, JSON.stringify(block.vote)],
    )
  }

  isValidChain() {
    for (let i = 1; i < this.chain.length; i += 1) {
      const current = this.chain[i]
      const previous = this.chain[i - 1]
      const recalculatedHash = this.calculateHash(current)
      if (current.hash !== recalculatedHash) {
        return { valid: false, index: current.index, reason: 'Hash mismatch' }
      }
      if (current.previousHash !== previous.hash) {
        return { valid: false, index: current.index, reason: 'Broken chain link' }
      }
      if (!current.hash.startsWith('0'.repeat(this.difficulty))) {
        return { valid: false, index: current.index, reason: 'Difficulty threshold violated' }
      }
    }
    return { valid: true }
  }

  async reload() {
    const blocks = await all('SELECT * FROM blocks ORDER BY block_index ASC')
    this.chain = blocks.map((block) => this.mapDbBlock(block))
    return this.chain
  }

  getChain() {
    return this.chain
  }
}

const blockchain = new Blockchain()

export default blockchain
