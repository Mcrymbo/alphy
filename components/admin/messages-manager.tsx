"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { getMessages, deleteMessage } from "@/lib/supabase/contact"
import type { ContactMessage } from "@/lib/types"

export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const messagesData = await getMessages()
      console.log(messagesData)
      setMessages(messagesData)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      await deleteMessage(id)

      toast.success('',{
        description: "Message deleted successfully.",
      })

      // Refresh messages list
      await loadMessages()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading messages...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Messages</h2>

      {messages.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No messages received yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{message.subject}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      From: {message.name} ({message.email})
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(message.id)}>
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
