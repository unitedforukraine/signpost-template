import { useEffect, useRef, useState } from "react"
import { Button, Input, Modal, Select, SelectProps, Tabs } from "antd"
const { Search } = Input
import { MdSend } from "react-icons/md"
import { BsRobot } from "react-icons/bs"
import { FaThumbsUp } from "react-icons/fa"
import { FaThumbsDown } from "react-icons/fa"
import { BsEmojiSmile } from "react-icons/bs"
import { api } from "../api"
import { useForceUpdate, useMultiState } from "../components"
import { BotChatMessage } from './botmessage'
import type { TabsProps } from 'antd'

export function AIBot() {

  const [isSending, setIsSending] = useState(false)

  const [state, setState] = useMultiState({
    isSending: false,
    rebuilding: false,
    loadingBotList: false,
    // bots: [] as SelectProps['options'],
    bots: {} as { [index: number]: string },
    selectedBots: [] as number[],
  })

  useEffect(() => {
    api.getBots().then((sb) => {
      const bots = {}
      for (const value in sb) {
        bots[value] = sb[value]
      }
      setState({ bots })
    })
  }, [])

  const messages = useRef<ChatMessage[]>([
    {
      type: "bot",
      message: "Hello, I am Signpost Bot. How can I help you?",
    }
  ])

  const onSend = async (message: string) => {
    // message ||= "what is kobo forms?"
    // message ||= "how do I get a passport in Iraq?"
    message ||= "What documents do I need to work in Greece?"
    if (!message) return
    messages.current.unshift({ type: "human", message })
    setIsSending(true)
    const id = 1

    const response = await api.askbot({ id, message }, state.selectedBots.map(b => ({ label: state.bots[b], value: b })))

    response.rebuild = async () => {
      setIsSending(true)
      response.needsRebuild = false
      await onRebuild(id)
      setIsSending(false)
    }
    messages.current.unshift(response)
    setIsSending(false)
  }

  const onRebuild = async (id?: number) => {
    setIsSending(true)
    const response = await api.askbot({ command: "rebuild", id }, state.selectedBots.map(b => ({ label: state.bots[b], value: b })))
    messages.current.unshift(response)
    setIsSending(false)
  }

  const onSelectBot = (e: string[]) => {
    setState({ selectedBots: e.map(Number) })
  }

  const hasSelectedBots = state.selectedBots.length > 0

  return <div className="bg-white text-black grid grid-rows-3 grid-cols-1 p-4 relative" style={{ gridTemplateRows: "auto 1fr auto", }}>
    <div className="-mt-6 -mb-2 ml-1 flex items-center">
      <h2>Signpost Bot</h2>
      <div className="px-4 flex-grow flex">
        <div className="w-32 mt-1">Selected Bots</div>
        <Select
          mode="multiple"
          className="w-full"
          placeholder="Please select"
          onChange={onSelectBot}
          options={Object.keys(state.bots).map(k => ({ label: state.bots[k], value: k }))}
          loading={Object.values(state.bots).length == 0}
        />
      </div>
      <div>
        {/* <Button loading={isSending} onClick={onRebuild} type="primary">Rebuild KB</Button> */}
      </div>
    </div>
    <div className="relative">
      <div className="absolute top-0 right-0 left-0 bottom-0 overflow-y-auto border border-solid border-gray-300 p-4 flex flex-col-reverse" >
        {isSending &&
          <div className="flex mt-8">
            <BsRobot size={24} className="text-indigo-500" />
            <div className="whitedots h-4 w-4  ml-2 mt-1" />
          </div>
        }
        {messages.current.map((m, i) => <ChatMessage key={i} message={m} isWaiting={isSending} />)}
      </div>
    </div>
    {hasSelectedBots && <div className="mt-4">
      <SearchInput onSearch={onSend} disabled={isSending} />
    </div>}
    {!hasSelectedBots && <div className="mt-4 flex justify-center">
      Please Select one or more bots
    </div>}
  </div>

}

function SearchInput(props: { onSearch: (message: string) => void, disabled: boolean }) {

  const [value, setValue] = useState("")

  const onChange = (e: any) => {
    setValue(e.target.value)
  }
  const onSearch = (v) => {
    props.onSearch(v)
    setValue("")
  }

  return <Search
    value={value}
    onChange={onChange}
    className="w-full"
    size="large"
    disabled={props.disabled}
    placeholder="Ask me anything"
    enterButton={<MdSend className="mt-1" />}
    onSearch={onSearch}
  />

}


interface MessageProps {
  message: ChatMessage
  isWaiting?: boolean
}

function ChatMessage(props: MessageProps) {

  const { isWaiting } = props
  let { type, message, messages, needsRebuild, rebuild } = props.message
  messages = messages || []
  const items: TabsProps['items'] = []

  for (const m of messages) {
    items.push({
      key: m.id as any,
      label: m.botName,
      children: <BotChatMessage m={m} key={m.id} isWaiting={isWaiting} rebuild={rebuild} />
    })
  }

  const hasBots = messages.length > 0

  if (type == "bot") {


    return <div className="mt-8">
      <div className="flex">
        <div className="">
          <BsRobot size={24} className="text-indigo-500" />
        </div>
        {hasBots && <div className="-mt-3 ml-4 w-11/12">
          <Tabs className="w-full" items={items} />
        </div>}
        {!hasBots && <div className="">
          <div className="ml-2">{message}</div>
        </div>}
      </div>
    </div>


  }

  return <div className="mt-8">
    <div className="flex">
      <div>
        <BsEmojiSmile size={24} className="" />
      </div>
      <div>
        <div className="ml-2">{message}</div>
      </div>
      {!isWaiting && needsRebuild && <Button
        className="mx-2 -mt-1"
        type="primary"
        onClick={rebuild}
        loading={isWaiting}
        disabled={isWaiting}>
        Rebuild
      </Button>}
    </div>
  </div>

}


