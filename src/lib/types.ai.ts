export { }

interface DocumentReference {
  pageContent?: string
  metadata: {
    source?: string
    title?: string
    id?: number
    loc?: {
      lines?: {
        from?: number
        to?: number
      }
    }
  }
}

declare global {

  interface ChatMessage {
    type?: "human" | "bot"
    id?: number
    message?: string
    botName?: string
    isAnswer?: boolean
    isContacts?: boolean
    messages?: ChatMessage[]
    docs?: DocumentReference[]
    error?: string
    command?: "rebuild" | null
    needsRebuild?: boolean
    rebuild?(): void
    question?: string
  }

  type AI_SCORES = "pass" | "fail" | "redflag"
  interface BotHistory {
    isHuman: boolean
    message: string
  }

}
