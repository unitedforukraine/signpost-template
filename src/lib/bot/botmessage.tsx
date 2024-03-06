import type { TabsProps } from 'antd'
import { Button, Input, Modal } from "antd"
import { useEffect, useState } from "react"
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa"
import { useMultiState } from '..'
import { api } from '../api'
const { TextArea } = Input

export function BotChatMessage(props: { m: ChatMessage, isWaiting: boolean, rebuild: () => void }) {

  let { isWaiting, rebuild, m } = props
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [state, setState] = useMultiState({
    open: false,
    positivie: false,
  })

  const showModalPositive = () => {
    setState({ open: true, positivie: true })
  }
  const showModalNegative = () => {
    setState({ open: true, positivie: false })
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setState({ open: false, positivie: false })
  }

  const linklist = []

  if (m.docs && m.docs.length) {
    for (const doc of m.docs) {
      linklist.push(
        <div>
          <a href={doc.metadata.source} key={doc.metadata.source} target="_blank" className="font-medium no-underline text-blue-500">
            {doc.metadata.title}
          </a>
        </div>
      )
    }
  }

  return <div>
    <div className="flex">
      <div className="">{m.message}</div>
      {!isWaiting && m.needsRebuild && <Button
        className="mx-2 -mt-1"
        type="primary"
        onClick={rebuild}
        loading={isWaiting}
        disabled={isWaiting}>
        Rebuild
      </Button>}
    </div>
    {m.isAnswer && <div className="text-gray-400 flex gap-2 mt-2">
      <FaThumbsUp className="cursor-pointer" onClick={showModalPositive} />
      <FaThumbsDown className="mt-1 cursor-pointer" onClick={showModalNegative} />
    </div>}
    {linklist.length > 0 && <div className="text-xs mt-4 uppercase">
      <div className="font-medium no-underline">
        <div className="mb-2">References:</div>
        {linklist}
      </div>
    </div>}
    <BotScoreModal m={m} open={state.open} close={handleClose} positive={state.positivie} />
  </div>

}


type Inputs = {
  reporter: string
  expectedResult: string
}


function BotScoreModal(props: { m: ChatMessage, open: boolean, close: () => void, positive?: boolean }) {

  const { m, open, close, positive } = props
  const { botName, id } = m
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { register, handleSubmit, clearErrors, formState: { errors }, trigger, control, resetField } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await api.qualifyBot(id, positive, data.reporter, data.expectedResult, m.question, m.message)
  }

  const handleOk = async () => {

    setConfirmLoading(true)
    const isOk = await trigger()

    if (isOk) {
      await handleSubmit(onSubmit)()
      setConfirmLoading(false)
      close()
    }

    setConfirmLoading(false)
  }

  const onCloseForm = () => {
    clearErrors()
    resetField("expectedResult")
  }

  return <Modal
    title={`${botName} - ${positive ? 'Qualify Positive' : 'Qualify Negative'}`}
    open={open}
    onOk={handleOk}
    onCancel={close}
    afterClose={onCloseForm}
    confirmLoading={confirmLoading}
    destroyOnClose>

    <div className='flex flex-col gap-4 p-4'>

      <div >
        <div className='font-medium mb-1'>Reporter</div>
        <Controller
          name="reporter"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <Input {...field} />}
        />
        {errors.reporter && <span className='text-red-500'>This field is required</span>}
      </div>

      <div>
        <div className='font-medium mb-1'>Expected Result</div>
        <Controller
          name="expectedResult"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <TextArea {...field} />}
        />
        {errors.expectedResult && <span className='text-red-500'>This field is required</span>}
      </div>

    </div>

  </Modal>

}