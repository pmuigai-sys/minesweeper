import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, endpoints } from '../services/api'
import { disconnectSocket, getSocket } from '../services/socket'
import { useAuth } from './AuthContext'

const BlockchainContext = createContext(null)

export const BlockchainProvider = ({ children }) => {
  const { token } = useAuth()
  const [blocks, setBlocks] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  const fetchInitialData = useCallback(async () => {
    if (!token) {
      setBlocks([])
      setStats({})
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [blockchainRes, statsRes] = await Promise.all([
        api.get(endpoints.blockchain.root),
        api.get(endpoints.votes.stats),
      ])
      setBlocks(blockchainRes.data.blocks || [])
      setStats(statsRes.data || {})
    } catch (error) {
      console.error('Failed to load blockchain data', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  const refreshBlockchain = useCallback(async () => {
    if (!token) {
      setBlocks([])
      return { blocks: [] }
    }
    try {
      const { data } = await api.get(endpoints.blockchain.root)
      setBlocks(data.blocks || [])
      return data
    } catch (error) {
      console.error('Failed to refresh blockchain', error)
      throw error
    }
  }, [token])

  const verifyBlockchain = useCallback(async () => {
    if (!token) {
      return { status: 'unauthorized' }
    }
    const { data } = await api.get(endpoints.blockchain.verify)
    return data
  }, [token])

  const setupSocket = useCallback(() => {
    if (!token) {
      disconnectSocket()
      setConnected(false)
      return
    }

    const socket = getSocket(token)

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    const handleVoteUpdate = (payload) => {
      setStats((prev) => ({ ...prev, ...payload }))
    }
    const handleBlockMined = (block) => {
      setBlocks((prev) => [block, ...prev])
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('voteUpdate', handleVoteUpdate)
    socket.on('blockMined', handleBlockMined)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('voteUpdate', handleVoteUpdate)
      socket.off('blockMined', handleBlockMined)
    }
  }, [token])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  useEffect(() => {
    const cleanup = setupSocket()
    return () => {
      if (cleanup) cleanup()
    }
  }, [setupSocket])

  const value = useMemo(
    () => ({ blocks, stats, loading, connected, refreshBlockchain, verifyBlockchain }),
    [blocks, stats, loading, connected, refreshBlockchain, verifyBlockchain],
  )

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>
}

export const useBlockchain = () => {
  const ctx = useContext(BlockchainContext)
  if (!ctx) {
    throw new Error('useBlockchain must be used within a BlockchainProvider')
  }
  return ctx
}

export default BlockchainContext
