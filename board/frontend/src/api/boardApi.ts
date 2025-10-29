import api from './client'

export interface BoardPayload {
  boardWriter: string
  boardPass: string
  boardTitle: string
  boardContents: string
}

export const getBoards = async () => {
  const { data } = await api.get('/api/boards')
  return data
}

export const getBoard = async (id: number) => {
  const { data } = await api.get(`/api/boards/${id}`)
  return data
}

export const createBoard = async (payload: BoardPayload) => {
  const { data } = await api.post('/api/boards', payload)
  return data
}

export const createBoardWithFiles = async (payload: BoardPayload, files: File[]) => {
  const formData = new FormData()

  // Add board data as JSON string
  const boardJson = JSON.stringify(payload)
  formData.append('board', boardJson)

  // Add files
  files.forEach((file) => {
    formData.append('files', file)
  })

  const { data } = await api.post('/api/boards/with-files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const updateBoard = async (id: number, payload: Partial<BoardPayload>) => {
  const { data } = await api.put(`/api/boards/${id}`, payload)
  return data
}

export const deleteBoard = async (id: number) => {
  const { data } = await api.delete(`/api/boards/${id}`)
  return data
}

