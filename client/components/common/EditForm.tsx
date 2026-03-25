"use client"
import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Message from "./Message"

interface MessageType {
  status: string
  message: string
}

interface FieldType {
  id: string
  label: string
  type: string
}

interface EditFormProps {
  Fields: FieldType[]
}

const EditForm = ({ Fields }: EditFormProps) => {

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [msg, setMsg] = useState<MessageType | null>(null)

  const SubmitHandle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const body = {
      firstname: inputRefs.current["firstname"]?.value,
      lastname: inputRefs.current["lastname"]?.value,
      phonenumber: inputRefs.current["phonenumber"]?.value,
      location: inputRefs.current["location"]?.value,
      farmsize: inputRefs.current["farmsize"]?.value,
      farmtype: inputRefs.current["farmtype"]?.value,
      experiance: inputRefs.current["experiance"]?.value,
    }

    const res = await fetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data: MessageType = await res.json()
    setMsg(data)
  }

  return (
    <>
      {msg && <Message status={msg.status} message={msg.message} />}

      <form onSubmit={SubmitHandle} className="pt-6 px-7">
        <div className="grid grid-cols-2 gap-4">

          {Fields.map((one) => (
            <div className="space-y-2" key={one.id}>
              <Label>{one.label}</Label>

              <Input
                // ref={(el) => (inputRefs.current[one.id] = el)}
                className="shadow-none focus-visible:ring-0 bg-black/5 focus-visible:ring-offset-0 focus:outline-none"
                id={one.id}
                type={one.type}
              />

            </div>
          ))}

          <Button
            type="submit"
            className="bg-[rgb(172,197,167)] text-lg rounded-4xl mt-5 w-40 py-7 ml-65 transition duration-300 ease-in-out hover:bg-[#2A5A2A]"
          >
            Save
          </Button>

        </div>
      </form>
    </>
  )
}

export default EditForm