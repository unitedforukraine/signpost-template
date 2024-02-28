import { Button, Input, Select, SelectProps } from "antd"
const { Search } = Input
import { MdSend } from "react-icons/md"
import { BsRobot } from "react-icons/bs"
import { BsEmojiSmile } from "react-icons/bs"
import { useRef, useState } from "react"
import { useForceUpdate, useMultiState } from "."
import { api } from "../api"

export function AIBot() {

  const [isSending, setIsSending] = useState(false)

  const [state, setState] = useMultiState({
    isSending: false,
    rebuilding: false,
    loadingBotList: false
  })

  const options: SelectProps['options'] = [
    {
      label: 'Rebuild',
      value: 'rebuild'
    },
    {
      label: 'Kobo Forms',
      value: 'kobo'
    }
  ]

  const messages = useRef<ChatMessage[]>([
    {
      type: "bot",
      message: "Hello, I am Signpost Bot. How can I help you?",
    }
  ])

  const onSend = async (message: string) => {
    message ||= "what is kobo forms?"
    if (!message) return
    messages.current.unshift({ type: "human", message })
    setIsSending(true)
    const response = await api.askbot({
      id: 1,
      message
    })
    messages.current.unshift(response)
    setIsSending(false)
  }

  const onRebuild = async () => {
    setIsSending(true)
    const response = await api.askbot({ command: "rebuild", id: 1 })
    messages.current.unshift(response)
    setIsSending(false)
    console.log(response)
  }

  const onSelectBot = (e: any) => {
    console.log(e)
  }


  const canSend = !state.isSending && !state.rebuilding

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
          options={options}
        />
      </div>
      <div>
        <Button loading={isSending} onClick={onRebuild} type="primary">Rebuild KB</Button>
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
        {messages.current.map((m, i) => <ChatMessage key={i} {...m} />)}
      </div>
    </div>
    <div className="mt-4">
      <SearchInput onSearch={onSend} disabled={isSending} />
    </div>
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


interface MessageProps extends ChatMessage {
  isWaiting?: boolean
}

function ChatMessage(props: MessageProps) {

  const { type, message, isWaiting, docs } = props

  let refs = null

  if (docs && docs.length) {
    refs = <div className="text-xs mt-4 ml-2 uppercase">
      Reference: <span className="font-medium no-underline">
        <a href={docs[0].metadata.source} target="_blank" className="font-medium no-underline text-blue-500">
          {docs[0].metadata.title}
        </a>
      </span>
    </div>
  }


  return <div>
    <div className="flex mt-8">
      <div>
        {type == "bot" && <BsRobot size={24} className="text-indigo-500" />}
        {type == "human" && <BsEmojiSmile size={24} className="" />}
      </div>
      {!isWaiting && <div className="ml-2">{message}</div>}
    </div>
    {refs}
  </div>
}


